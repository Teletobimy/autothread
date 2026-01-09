"""
AI Content Generator - Google Gemini Only
"""
import os
import re
import time
from typing import Optional

from google import genai as google_genai


# System instruction for Threads content generation
SYSTEM_INSTRUCTION = """당신은 Threads 소셜 미디어 게시물 작성 전문가입니다.

절대적 규칙 (반드시 지켜야 함):
1. 게시물 내용만 출력하세요. 다른 설명, 인사말, 코멘트는 절대 포함하지 마세요.
2. "좋아", "알겠어", "~해볼게" 같은 도입부 금지
3. "포인트:", "설명:", "---" 같은 부가 설명 금지
4. 마크다운 문법 절대 금지 (##, **, *, _, `, ---, ``` 등)
5. 순수 텍스트로만 작성
6. 이모지는 적절히 사용 가능
7. 해시태그는 콘텐츠 끝에 자연스럽게 추가 가능
8. 500자 이내로 작성 (Threads 최적 길이)

출력 예시 (이것만 출력):
봄이 오고 있다

길고 긴 겨울밤 차가운 그림자
조용히 물러설 시간.
새로운 시작의 속삭임,
대지를 깨우네.

#봄 #희망 #새로운시작
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
        """Remove surrounding quotes, markdown formatting, and unwanted sections"""
        # Remove surrounding quotes
        if content.startswith('"') and content.endswith('"'):
            content = content[1:-1]
        elif content.startswith("'") and content.endswith("'"):
            content = content[1:-1]
        
        # Remove unwanted intro/outro sections
        content = self._remove_unwanted_sections(content)
        
        # Remove markdown formatting
        content = self._remove_markdown(content)
        
        return content.strip()
    
    def _remove_unwanted_sections(self, text: str) -> str:
        """Remove AI intro/outro and explanations"""
        lines = text.split('\n')
        cleaned_lines = []
        skip_mode = False
        
        for line in lines:
            line_lower = line.strip().lower()
            
            # Skip intro lines
            if any(intro in line_lower for intro in ['좋아', '알겠', '해볼게', '해 볼게', '작성해', '써볼게', '써 볼게']):
                if len(line.strip()) < 50:  # Only skip if it's a short intro line
                    continue
            
            # Start skipping at explanation sections
            if any(marker in line_lower for marker in ['포인트:', '설명:', '참고:', 'point:', 'note:']):
                skip_mode = True
                continue
            
            # Skip horizontal rules and what follows them at the end
            if line.strip() in ['---', '***', '___']:
                # Check if this is near the end (last 30% of content)
                current_pos = lines.index(line) if line in lines else 0
                if current_pos > len(lines) * 0.7:
                    skip_mode = True
                continue
            
            if not skip_mode:
                cleaned_lines.append(line)
        
        return '\n'.join(cleaned_lines)
    
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
