"""
AI Content Generator - Google Gemini Only
"""
import os
import time
from typing import Optional

from google import genai as google_genai


class ContentGenerator:
    def __init__(self, model: str = "gemini-2.5-flash"):
        self.model = model
        self.gemini_chat = None
        
        api_key = os.getenv("GOOGLE_API_KEY")
        if not api_key:
            raise ValueError("GOOGLE_API_KEY not set")
        
        self.client = google_genai.Client(api_key=api_key)
        self.gemini_chat = self.client.chats.create(model="gemini-2.5-flash")

    def generate(self, prompt: str) -> str:
        """Generate content based on prompt"""
        max_retries = 5
        base_delay = 2
        
        for attempt in range(max_retries):
            try:
                response = self.gemini_chat.send_message(prompt)
                content = response.text.strip()
                return self._clean_content(content)
            except Exception as e:
                error_str = str(e)
                if "503" in error_str or "overloaded" in error_str or "429" in error_str:
                    if attempt < max_retries - 1:
                        wait_time = base_delay * (2 ** attempt)
                        time.sleep(wait_time)
                        continue
                raise

    def translate(self, text: str, target_language: str) -> str:
        """Translate text to target language"""
        prompt = f"""
        Translate the following text to {target_language}. 
        Only output the translated text, without any additional explanation or quotes.
        
        Text to translate:
        {text}
        """
        return self.generate(prompt)

    def _clean_content(self, content: str) -> str:
        """Remove surrounding quotes if present"""
        if content.startswith('"') and content.endswith('"'):
            return content[1:-1]
        elif content.startswith("'") and content.endswith("'"):
            return content[1:-1]
        return content
