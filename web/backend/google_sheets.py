import gspread
from google.oauth2.service_account import Credentials
import os
import json
import streamlit as st
from dotenv import load_dotenv

# Load .env file
load_dotenv()

# Constants
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
SERVICE_ACCOUNT_FILE = os.path.join(BASE_DIR, 'autosavingprojectforemails-c21ae4b88ab5.json')
SPREADSHEET_ID = '1AFkVyDTZ5QHk-pzrTY5OGZB5-aM24Esq-PU8cRpADWM'
SHEET_NAME = '쓰레드'

SCOPES = [
    'https://www.googleapis.com/auth/spreadsheets',
    'https://www.googleapis.com/auth/drive'
]

def _get_credentials_from_env():
    """Try to build GCP credentials from environment variables."""
    try:
        # Check if all required env vars exist
        required_keys = [
            'GCP_TYPE',
            'GCP_PROJECT_ID',
            'GCP_PRIVATE_KEY_ID',
            'GCP_PRIVATE_KEY',
            'GCP_CLIENT_EMAIL',
            'GCP_CLIENT_ID'
        ]
        
        # Check if at least the essential ones exist
        if not all(os.getenv(key) for key in ['GCP_PROJECT_ID', 'GCP_PRIVATE_KEY', 'GCP_CLIENT_EMAIL']):
            return None
        
        # Build credentials dict from env vars
        creds_dict = {
            'type': os.getenv('GCP_TYPE', 'service_account'),
            'project_id': os.getenv('GCP_PROJECT_ID'),
            'private_key_id': os.getenv('GCP_PRIVATE_KEY_ID', ''),
            'private_key': os.getenv('GCP_PRIVATE_KEY', '').replace('\\n', '\n'),
            'client_email': os.getenv('GCP_CLIENT_EMAIL'),
            'client_id': os.getenv('GCP_CLIENT_ID', ''),
            'auth_uri': os.getenv('GCP_AUTH_URI', 'https://accounts.google.com/o/oauth2/auth'),
            'token_uri': os.getenv('GCP_TOKEN_URI', 'https://oauth2.googleapis.com/token'),
            'auth_provider_x509_cert_url': os.getenv('GCP_AUTH_PROVIDER_CERT_URL', 
                                                     'https://www.googleapis.com/oauth2/v1/certs'),
            'client_x509_cert_url': os.getenv('GCP_CLIENT_CERT_URL', '')
        }
        
        return Credentials.from_service_account_info(creds_dict, scopes=SCOPES)
    except Exception as e:
        print(f"환경 변수에서 GCP 인증 정보 로드 실패: {e}")
        return None

def get_worksheet(sheet_name=SHEET_NAME):
    """Authenticates and returns the worksheet object."""
    credentials = None
    
    # 1. Try Environment Variables (.env file) - NEW!
    credentials = _get_credentials_from_env()
    if credentials:
        print("✅ .env 파일에서 GCP 인증 정보 로드 성공")
    
    # 2. Try Streamlit Secrets (Best for Cloud)
    if not credentials and "gcp_service_account" in st.secrets:
        try:
            # st.secrets returns a AttrDict, convert to standard dict for google-auth
            creds_dict = dict(st.secrets["gcp_service_account"])
            credentials = Credentials.from_service_account_info(
                creds_dict, scopes=SCOPES
            )
            print("✅ Streamlit Secrets에서 GCP 인증 정보 로드 성공")
        except Exception as e:
            st.error(f"Secrets 로드 중 오류: {e}")
            
    # 3. Fallback to Local File
    if not credentials and os.path.exists(SERVICE_ACCOUNT_FILE):
        credentials = Credentials.from_service_account_file(
            SERVICE_ACCOUNT_FILE, scopes=SCOPES
        )
        print("✅ JSON 파일에서 GCP 인증 정보 로드 성공")
        
    if not credentials:
         raise FileNotFoundError(
            "GCP 자격 증명을 찾을 수 없습니다. "
            "다음 중 하나를 설정해주세요:\n"
            "1. .env 파일에 GCP_* 환경 변수 설정\n"
            "2. Streamlit Secrets에 'gcp_service_account' 설정\n"
            "3. JSON 키 파일 저장"
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
