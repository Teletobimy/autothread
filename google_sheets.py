import gspread
from google.oauth2.service_account import Credentials
import os
import streamlit as st

# Constants
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
SERVICE_ACCOUNT_FILE = os.path.join(BASE_DIR, 'autosavingprojectforemails-c21ae4b88ab5.json')
SPREADSHEET_ID = '1AFkVyDTZ5QHk-pzrTY5OGZB5-aM24Esq-PU8cRpADWM'
SHEET_NAME = '쓰레드'

SCOPES = [
    'https://www.googleapis.com/auth/spreadsheets',
    'https://www.googleapis.com/auth/drive'
]

def get_worksheet(sheet_name=SHEET_NAME):
    """Authenticates and returns the worksheet object."""
    credentials = None
    
    # 1. Try Streamlit Secrets (Best for Cloud)
    if "gcp_service_account" in st.secrets:
        try:
            # st.secrets returns a AttrDict, convert to standard dict for google-auth
            creds_dict = dict(st.secrets["gcp_service_account"])
            credentials = Credentials.from_service_account_info(
                creds_dict, scopes=SCOPES
            )
        except Exception as e:
            st.error(f"Secrets 로드 중 오류: {e}")
            
    # 2. Fallback to Local File
    if not credentials and os.path.exists(SERVICE_ACCOUNT_FILE):
        credentials = Credentials.from_service_account_file(
            SERVICE_ACCOUNT_FILE, scopes=SCOPES
        )
        
    if not credentials:
         raise FileNotFoundError(
            "GCP 자격 증명을 찾을 수 없습니다. "
            "Streamlit Secrets에 'gcp_service_account'를 설정하거나 "
            "로컬에 JSON 키 파일이 있는지 확인해주세요."
        )

    gc = gspread.authorize(credentials)
    sh = gc.open_by_key(SPREADSHEET_ID)
    try:
        worksheet = sh.worksheet(sheet_name)
    except gspread.WorksheetNotFound:
        # Try to create if not found, or list available
        try:
            worksheet = sh.add_worksheet(title=sheet_name, rows=1000, cols=26)
        except Exception:
            available_sheets = [s.title for s in sh.worksheets()]
            raise ValueError(f"Worksheet '{sheet_name}' not found and could not be created. Available sheets: {available_sheets}")
        
    return worksheet

def append_to_sheet(text: str, sheet_name=SHEET_NAME):
    """Appends the given text to the next available row in Column A of the specified sheet."""
    ws = get_worksheet(sheet_name)
    ws.append_row([text])

def get_all_from_queue():
    """Reads all items from Column A of the default Thread sheet."""
    ws = get_worksheet(SHEET_NAME)
    col_a = ws.col_values(1)
    return col_a

def pop_from_queue(sheet_name=SHEET_NAME):
    """
    Reads the top item from Column A of the specified sheet, 
    moves it to the bottom of Column C,
    and shifts Column A up (deleting the processed item from A).
    
    Returns:
        tuple: (text, row_index_in_C) or (None, None)
    """
    ws = get_worksheet(sheet_name)
    
    # 1. Read all values from Column A
    col_a = ws.col_values(1)
    
    if not col_a:
        return None, None
        
    text = col_a[0]
    
    # 2. Append to Column C
    # Find the first empty row in Column C
    col_c = ws.col_values(3)
    next_row_c = len(col_c) + 1
    ws.update_cell(next_row_c, 3, text)
    
    # 3. Shift Column A up
    new_col_a = col_a[1:]
    
    # Prepare the update data. We need a list of lists for update.
    update_data = [[val] for val in new_col_a]
    
    # If new_col_a is empty, we just clear A1.
    if not update_data:
        ws.update(range_name="A1", values=[[""]])
    else:
        # Update A1:A{len}
        ws.update(range_name=f"A1:A{len(update_data)}", values=update_data)
        # Clear the cell that was previously the last one
        ws.update_cell(len(col_a), 1, "")
        
    return text, next_row_c

def mark_as_failed(sheet_name, row_index):
    """Marks the cell at Column C, row_index as failed (Red background)."""
    try:
        ws = get_worksheet(sheet_name)
        # Light red background
        fmt = {
            "backgroundColor": {
                "red": 1.0,
                "green": 0.8,
                "blue": 0.8
            }
        }
        # Check if format method exists (gspread v6+)
        if hasattr(ws, 'format'):
            ws.format(f"C{row_index}", fmt)
        else:
            # Fallback or ignore if not supported
            pass
    except Exception as e:
        print(f"Failed to format cell: {e}")
