"""
AI Content Generator - Google Gemini Only
"""
import os
import re
import time
from typing import Optional

from google import genai as google_genai


# System instruction for Threads content generation
SYSTEM_INSTRUCTION = """당신은 소셜 미디어 콘텐츠 작성 전문가입니다.

중요한 규칙:
1. 마크다운 문법을 절대 사용하지 마세요 (##, **, *, _, `, ``` 등)
2. 순수 텍스트로만 작성하세요
3. 이모지는 적절히 사용해도 됩니다
4. 해시태그는 콘텐츠 끝에 자연스럽게 추가할 수 있습니다
5. 500자 이내로 작성하세요 (Threads 최적 길이)
"""


class ContentGenerator:
    def __init__(self, model: str = "gemini-2.5-flash"):
        self.model = model
        self.gemini_chat = None
        
        api_key = os.getenv("GOOGLE_API_KEY")
        if not api_key:
            raise ValueError("GOOGLE_API_KEY not set")
        
        self.client = google_genai.Client(api_key=api_key)
        self.gemini_chat = self.client.chats.create(
            model="gemini-2.5-flash",
            config={"system_instruction": SYSTEM_INSTRUCTION}
        )

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
        """Remove surrounding quotes and markdown formatting"""
        # Remove surrounding quotes
        if content.startswith('"') and content.endswith('"'):
            content = content[1:-1]
        elif content.startswith("'") and content.endswith("'"):
            content = content[1:-1]
        
        # Remove markdown formatting
        content = self._remove_markdown(content)
        
        return content.strip()
    
    def _remove_markdown(self, text: str) -> str:
        """Remove markdown syntax from text"""
        # Remove headers (## Header -> Header)
        text = re.sub(r'^#{1,6}\s*', '', text, flags=re.MULTILINE)
        
        # Remove bold (**text** or __text__ -> text)
        text = re.sub(r'\*\*(.+?)\*\*', r'\1', text)
        text = re.sub(r'__(.+?)__', r'\1', text)
        
        # Remove italic (*text* or _text_ -> text)
        text = re.sub(r'\*(.+?)\*', r'\1', text)
        text = re.sub(r'(?<!\w)_(.+?)_(?!\w)', r'\1', text)
        
        # Remove inline code (`code` -> code)
        text = re.sub(r'`(.+?)`', r'\1', text)
        
        # Remove code blocks
        text = re.sub(r'```[\s\S]*?```', '', text)
        
        # Remove links [text](url) -> text
        text = re.sub(r'\[(.+?)\]\(.+?\)', r'\1', text)
        
        # Remove blockquotes (> text -> text)
        text = re.sub(r'^>\s*', '', text, flags=re.MULTILINE)
        
        # Remove horizontal rules
        text = re.sub(r'^[-*_]{3,}\s*$', '', text, flags=re.MULTILINE)
        
        # Clean up extra whitespace
        text = re.sub(r'\n{3,}', '\n\n', text)
        
        return text
