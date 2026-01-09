"""
Google Sheets Manager - For backward compatibility
Note: In Cloud Run, we primarily use Firestore, but this is kept for reference
"""
import os
from typing import Optional, Tuple, List

import gspread
from google.oauth2.service_account import Credentials


class SheetsManager:
    SCOPES = [
        'https://www.googleapis.com/auth/spreadsheets',
        'https://www.googleapis.com/auth/drive'
    ]
    
    def __init__(self, spreadsheet_id: str):
        self.spreadsheet_id = spreadsheet_id
        self.credentials = self._get_credentials()
        self.client = gspread.authorize(self.credentials)
        self.spreadsheet = self.client.open_by_key(spreadsheet_id)
    
    def _get_credentials(self) -> Credentials:
        """Get credentials from environment variables"""
        creds_dict = {
            'type': os.getenv('GCP_TYPE', 'service_account'),
            'project_id': os.getenv('GCP_PROJECT_ID'),
            'private_key_id': os.getenv('GCP_PRIVATE_KEY_ID', ''),
            'private_key': os.getenv('GCP_PRIVATE_KEY', '').replace('\\n', '\n'),
            'client_email': os.getenv('GCP_CLIENT_EMAIL'),
            'client_id': os.getenv('GCP_CLIENT_ID', ''),
            'auth_uri': 'https://accounts.google.com/o/oauth2/auth',
            'token_uri': 'https://oauth2.googleapis.com/token',
        }
        return Credentials.from_service_account_info(creds_dict, scopes=self.SCOPES)
    
    def get_worksheet(self, sheet_name: str = '쓰레드'):
        """Get or create worksheet"""
        try:
            return self.spreadsheet.worksheet(sheet_name)
        except gspread.WorksheetNotFound:
            return self.spreadsheet.add_worksheet(title=sheet_name, rows=1000, cols=26)
    
    def append(self, text: str, sheet_name: str = '쓰레드'):
        """Append text to column A"""
        ws = self.get_worksheet(sheet_name)
        ws.append_row([text])
    
    def get_all(self, sheet_name: str = '쓰레드') -> List[str]:
        """Get all values from column A"""
        ws = self.get_worksheet(sheet_name)
        return ws.col_values(1)
    
    def pop(self, sheet_name: str = '쓰레드') -> Tuple[Optional[str], Optional[int]]:
        """Pop first item from column A, move to column C"""
        ws = self.get_worksheet(sheet_name)
        col_a = ws.col_values(1)
        
        if not col_a:
            return None, None
        
        text = col_a[0]
        
        # Append to column C
        col_c = ws.col_values(3)
        next_row = len(col_c) + 1
        ws.update_cell(next_row, 3, text)
        
        # Shift column A up
        new_col_a = col_a[1:]
        if not new_col_a:
            ws.update(range_name="A1", values=[[""]])
        else:
            update_data = [[val] for val in new_col_a]
            ws.update(range_name=f"A1:A{len(update_data)}", values=update_data)
            ws.update_cell(len(col_a), 1, "")
        
        return text, next_row
