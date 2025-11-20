import gspread
from google.oauth2.service_account import Credentials
import os

# Constants
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
SERVICE_ACCOUNT_FILE = os.path.join(BASE_DIR, 'autosavingprojectforemails-c21ae4b88ab5.json')
SPREADSHEET_ID = '1AFkVyDTZ5QHk-pzrTY5OGZB5-aM24Esq-PU8cRpADWM'
SHEET_NAME = '쓰레드'

SCOPES = [
    'https://www.googleapis.com/auth/spreadsheets',
    'https://www.googleapis.com/auth/drive'
]

def get_worksheet():
    """Authenticates and returns the worksheet object."""
    if not os.path.exists(SERVICE_ACCOUNT_FILE):
        raise FileNotFoundError(f"Service account file not found: {SERVICE_ACCOUNT_FILE}")
    
    credentials = Credentials.from_service_account_file(
        SERVICE_ACCOUNT_FILE, scopes=SCOPES
    )
    gc = gspread.authorize(credentials)
    sh = gc.open_by_key(SPREADSHEET_ID)
    try:
        worksheet = sh.worksheet(SHEET_NAME)
    except gspread.WorksheetNotFound:
        # Fallback if tab doesn't exist, maybe create it or use first one?
        # User said tab name is "쓰레드", so we expect it.
        # But if not found, let's list them to be helpful in logs or error.
        available_sheets = [s.title for s in sh.worksheets()]
        raise ValueError(f"Worksheet '{SHEET_NAME}' not found. Available sheets: {available_sheets}")
        
    return worksheet

def append_to_sheet(text: str):
    """Appends the given text to the next available row in Column A."""
    ws = get_worksheet()
    # append_row adds to the bottom. 
    # We want to add to Column A. append_row([text]) adds to A(next), B(next)...
    # So [text] will go to Column A.
    ws.append_row([text])

def get_next_post_from_queue():
    """
    Reads the top item from the queue (Column A).
    Returns the text and the row index.
    Assumes row 1 might be header if it doesn't look like content, 
    but for simplicity, let's just read A1. 
    If A1 is 'Content' or 'Prompt', we try A2.
    """
    ws = get_worksheet()
    col_a = ws.col_values(1) # Get all values in column A
    
    if not col_a:
        return None, -1
        
    # Check for header
    first_val = col_a[0]
    row_to_process = 1
    text_to_return = first_val
    
    # Simple heuristic for header: if it's short and English/Korean generic word
    # But user might generate short text. 
    # Let's assume if there are multiple items, and A1 is "Content", we skip.
    # If user didn't say, maybe just take A1.
    # Let's just take the first one for now. 
    # If the user wants headers, they usually freeze row 1.
    # We will just return the first item.
    
    return text_to_return, row_to_process

def pop_from_queue():
    """
    Reads the top item from Column A, moves it to the bottom of Column C,
    and shifts Column A up (deleting the processed item from A).
    """
    ws = get_worksheet()
    
    # 1. Read all values from Column A
    col_a = ws.col_values(1)
    
    if not col_a:
        return None
        
    text = col_a[0]
    
    # 2. Append to Column C
    # Find the first empty row in Column C
    col_c = ws.col_values(3)
    next_row_c = len(col_c) + 1
    ws.update_cell(next_row_c, 3, text)
    
    # 3. Shift Column A up
    # We want to remove the first item and write the rest back.
    # To avoid leaving old data at the bottom, we should clear the column first or be careful.
    # Efficient way: Write the new list (A[1:]) to A1. Clear the cell after the last new item.
    
    new_col_a = col_a[1:]
    
    # Prepare the update data. We need a list of lists for update.
    # [[val1], [val2], ...]
    update_data = [[val] for val in new_col_a]
    
    # If new_col_a is empty, we just clear A1.
    if not update_data:
        ws.update(range_name="A1", values=[[""]])
    else:
        # Update A1:A{len}
        ws.update(range_name=f"A1:A{len(update_data)}", values=update_data)
        # Clear the cell that was previously the last one
        ws.update_cell(len(col_a), 1, "")
        
    return text
