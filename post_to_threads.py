"""
✨ 피더린 (PYDERIN): 피부 과학 기반 PDRN 전문 더마 솔루션

1. 브랜드 개요 및 미션

항목내용브랜드명PYDERIN (피더린)브랜드 정체성피부 본연의 건강한 회복에 집중하는 PDRN 전문 더마 코스메틱 브랜드 (Neo-Regeneration)핵심 미션의료 전문성과 성분 투명성을 기반으로, 축적된 피부 과학 기술력을 일상 속 피부 케어로 연결하여 건강한 아름다움을 완성합니다.2. 피더린의 차별화된 핵심 가치 (The Core Value)

피더린은 단순한 화장품을 넘어, **'과학적으로 검증된 피부 회복 솔루션'**을 제공합니다.

🥇 고순도 PDRN (핵심 성분)

성분 투명성: 대한민국 천연어에서 엄선하여 추출한 99% 고순도 PDRN만을 사용합니다.

PDRN의 역할: 피부에 새로운 생명 에너지를 불어넣어 피부 재생의 본질에 집중하고, 손상된 피부의 건강한 회복을 돕습니다.

🔬 초저분자 과학 기술 (전달력)

97kDa 초저분자 기술: 유효 성분인 PDRN을 피부 깊은 곳까지 효율적으로 전달하기 위해 초저분자화 기술을 적용했습니다.

최적의 흡수: 피부 컨디션을 균형 있게 관리하고, 성분의 효능을 극대화합니다.

🧑‍⚕️ 의료 기반 솔루션 (신뢰성)

검증된 데이터: 국내외 우수 연구기관과 협력하여 검증된 임상 데이터를 기반으로 제품을 개발합니다.

전문성: 의료 현장에서 안정성과 회복력이 검증된 기술력을 바탕으로, 일상에서도 전문적인 더마 솔루션을 경험할 수 있도록 합니다.

3. 주요 제품 라인업 (예시)

피더린은 전문적인 기술력을 담아 피부 고민별 최적화된 토탈 스킨케어 라인을 제공합니다.

Hospital Line: 의료 현장에서 사용되는 전문 제품군 (병원 전용)

Daily Care Line: 일상 속 피부 컨디션을 관리하는 데일리 솔루션

PDRN 탄력 핏 앰플: 고순도 PDRN을 담아 집중적인 탄력 및 재생 관리를 돕는 핵심 제품.

PDRN 탄력 크림: 피부 장벽 강화 및 탄력 유지에 도움을 주는 고보습 크림.

PDRN 마스크팩: 집중적인 영양 공급 및 피부 회복을 위한 마스크팩 (손/발 마스크팩 포함).

PDRN 클렌징: 순하면서도 효과적인 세정을 돕는 거품 클렌저.



이 부분을 AI AX 전문가로 바꿀건데 다시 잘 프롬프트로 쓸 수 있게 정리해서 나한테 알려줘



주제 => AI AX 전문가 기준에서의 관점:

배경 : K-뷰티 브랜드에서 회사 내부 업무를 강력하게 AX 추진 중인 상황

1) 지금까지 진행 완료
 - 


"""


import json
import os
import time
import sys
from typing import Callable, List, Optional

import requests
from dotenv import load_dotenv
from openai import OpenAI

try:
    from google import genai as google_genai
    GOOGLE_GENAI_AVAILABLE = True
except ImportError:
    GOOGLE_GENAI_AVAILABLE = False
    google_genai = None

# Windows 콘솔 UTF-8 인코딩 설정
if sys.platform == 'win32':
    try:
        sys.stdout.reconfigure(encoding='utf-8')
        sys.stderr.reconfigure(encoding='utf-8')
    except AttributeError:
        # Python 3.6 이하 버전을 위한 대체 방법
        import codecs
        sys.stdout = codecs.getwriter('utf-8')(sys.stdout.buffer, 'strict')
        sys.stderr = codecs.getwriter('utf-8')(sys.stderr.buffer, 'strict')

# .env 파일에서 환경 변수 로드
load_dotenv()

BASE = "https://graph.threads.net/v1.0"

Logger = Optional[Callable[[str], None]]


def _emit(message: str, logger: Logger = None) -> None:
    """Helper to send messages to either stdout or a provided logger."""
    if logger:
        logger(message)
    else:
        print(message)

def get_token():
    """환경 변수에서 토큰을 가져옵니다."""
    token = os.getenv('LONG_LIVED_ACCESS_TOKEN')
    if not token:
        raise ValueError("LONG_LIVED_ACCESS_TOKEN이 .env 파일에 설정되지 않았습니다.")
    return token.strip().strip('"').strip("'")  # 따옴표 제거

def get_google_api_key():
    """환경 변수에서 Google API 키를 가져옵니다."""
    api_key = os.getenv('GOOGLE_API_KEY')
    if not api_key:
        raise ValueError("GOOGLE_API_KEY가 .env 파일에 설정되지 않았습니다.")
    return api_key.strip().strip('"').strip("'")

class ContentGenerator:
    def __init__(self, model="gemini-2.5-flash", logger: Logger = None):
        self.model = model
        self.logger = logger
        self.history = [] # For GPT
        self.gemini_chat = None # For Gemini
        
        if model.startswith("gemini"):
            if not GOOGLE_GENAI_AVAILABLE:
                raise ImportError("google-genai 라이브러리가 설치되지 않았습니다.")
            api_key = get_google_api_key()
            client = google_genai.Client(api_key=api_key)
            # Gemini chat session initialization
            self.gemini_chat = client.chats.create(model="gemini-2.5-flash")
            
        elif model.startswith("gpt"):
            self.api_key = os.getenv('OPENAI_API_KEY')
            if not self.api_key:
                raise ValueError("OPENAI_API_KEY가 필요합니다.")
            self.client = OpenAI(api_key=self.api_key.strip().strip('"').strip("'"))
            # System prompt can be set initially if needed, but we'll just start empty
            self.history = [
                {"role": "system", "content": "당신은 SNS 카피라이팅 전문가입니다. Meta Threads에 최적화된 반말/구어체 글을 작성합니다."}
            ]

    def generate(self, prompt: str) -> str:
        if self.model.startswith("gemini"):
            return self._generate_gemini(prompt)
        else:
            return self._generate_gpt(prompt)

    def _generate_gemini(self, prompt: str) -> str:
        try:
            response = self.gemini_chat.send_message(prompt)
            content = response.text.strip()
            content = self._clean_content(content)
            _emit(f"✅ Gemini 생성 완료 ({len(content)}자)", self.logger)
            return content
        except Exception as e:
            _emit(f"❌ Gemini 오류: {e}", self.logger)
            raise

    def _generate_gpt(self, prompt: str) -> str:
        try:
            self.history.append({"role": "user", "content": prompt})
            
            response = self.client.chat.completions.create(
                model="gpt-4o",
                messages=self.history,
                temperature=0.7,
                max_tokens=500
            )
            
            content = response.choices[0].message.content.strip()
            content = self._clean_content(content)
            
            # Add assistant response to history
            self.history.append({"role": "assistant", "content": content})
            
            _emit(f"✅ GPT 생성 완료 ({len(content)}자)", self.logger)
            return content
        except Exception as e:
            _emit(f"❌ GPT 오류: {e}", self.logger)
            raise

    def _clean_content(self, content: str) -> str:
        if content.startswith('"') and content.endswith('"'):
            return content[1:-1]
        elif content.startswith("'") and content.endswith("'"):
            return content[1:-1]
        return content

# Legacy wrapper for backward compatibility if needed, or just remove
def generate_text_with_ai(model="gpt-4o", prompt=None, logger: Logger = None):
    generator = ContentGenerator(model=model, logger=logger)
    return generator.generate(prompt)

def me(token=None):
    if token is None:
        token = get_token()
    r = requests.get(f"{BASE}/me", params={"fields":"id,username","access_token":token}, timeout=20)
    r.raise_for_status()
    return r.json()

def create_text_container(threads_user_id, text, token=None):
    if token is None:
        token = get_token()
    payload = {"media_type":"TEXT", "text": text, "access_token": token}
    r = requests.post(f"{BASE}/{threads_user_id}/threads",
                      headers={"Content-Type":"application/json"},
                      data=json.dumps(payload), timeout=30)
    r.raise_for_status()
    return r.json()["id"]  # creation_id

def publish_container(threads_user_id, creation_id, token=None):
    if token is None:
        token = get_token()
    r = requests.post(f"{BASE}/{threads_user_id}/threads_publish",
                      data={"creation_id": creation_id, "access_token": token}, timeout=20)
    r.raise_for_status()
    return r.json()["id"]  # 최종 media id

def get_permalink(media_id, token=None):
    if token is None:
        token = get_token()
    r = requests.get(f"{BASE}/{media_id}", params={"fields":"permalink","access_token":token}, timeout=20)
    r.raise_for_status()
    return r.json()["permalink"]

def _post_text_to_threads(threads_user_id: str, text: str, token: str, logger: Logger = None):
    """Create, publish, and return metadata for a single Threads post."""
    _emit("📦 컨테이너 생성 중...", logger)
    creation_id = create_text_container(threads_user_id, text, token=token)

    _emit("🚀 Threads에 게시 중...", logger)
    media_id = publish_container(threads_user_id, creation_id, token=token)

    _emit("🔗 Permalink 가져오는 중...", logger)
    permalink = get_permalink(media_id, token=token)

    return {
        "media_id": media_id,
        "creation_id": creation_id,
        "permalink": permalink,
        "text": text,
        "user_id": threads_user_id,
    }


def post_gpt_generated_text(
    topic=None,
    model="gpt-4o",
    token=None,
    logger: Logger = None
):
    """
    AI 모델로 텍스트를 생성하고 Threads에 게시하는 전체 플로우를 실행합니다.
    
    Args:
        topic (str, optional): AI가 생성할 콘텐츠의 주제
        model (str): 사용할 AI 모델 ("gpt-4o" 또는 "gemini-2.5-flash")
        token (str, optional): Threads 액세스 토큰 (None이면 .env에서 읽음)
        logger (Logger, optional): 로그 함수
    
    Returns:
        dict: 게시 결과 (media_id, permalink 등 포함)
    """
    # 1단계: AI로 텍스트 생성
    model_name = "GPT" if model.startswith("gpt") else "Gemini"
    _emit(f"🤖 {model_name}로 텍스트 생성 중...", logger)
    text = generate_text_with_ai(model=model, topic=topic, logger=logger)
    _emit(f"생성된 텍스트: {text[:100]}...", logger)

    # 2단계: Threads 사용자 정보 가져오기
    if token is None:
        token = get_token()
    _emit("📋 Threads 사용자 정보 확인 중...", logger)
    user_info = me(token=token)
    threads_user_id = user_info["id"]
    username = user_info.get('username', 'N/A')
    _emit(f"사용자 ID: {threads_user_id} (@{username})", logger)

    # 3~5단계: 게시 및 링크 반환
    result = _post_text_to_threads(threads_user_id, text, token, logger=logger)

    _emit("\n✅ 게시 완료!", logger)
    _emit(f"📝 Media ID: {result['media_id']}", logger)
    _emit(f"🔗 Permalink: {result['permalink']}", logger)

    return result


def post_multiple_gpt_texts(
    topic=None,
    count=5,
    interval_seconds=60,
    model="gpt-4o",
    token=None,
    logger: Logger = None,
) -> List[dict]:
    """
    지정된 횟수만큼 Threads에 AI 생성 게시물을 순차적으로 업로드합니다.

    Args:
        topic (str, optional): 각 게시물에 대한 프롬프트 주제.
        count (int): 게시할 게시물 수.
        interval_seconds (int): 게시 사이 지연(초).
        model (str): 사용할 AI 모델 ("gpt-4o" 또는 "gemini-2.5-flash").
        token (str, optional): Threads 액세스 토큰.
        logger (callable, optional): 로그 메시지를 처리할 콜백.

    Returns:
        List[dict]: 각 게시물의 결과 정보 목록.
    """
    if count < 1:
        raise ValueError("count는 1 이상이어야 합니다.")

    if interval_seconds < 0:
        raise ValueError("interval_seconds는 0 이상이어야 합니다.")

    if token is None:
        token = get_token()

    _emit("📋 Threads 사용자 정보 확인 중...", logger)
    user_info = me(token=token)
    threads_user_id = user_info["id"]
    username = user_info.get('username', 'N/A')
    _emit(f"사용자 ID: {threads_user_id} (@{username})", logger)

    model_name = "GPT" if model.startswith("gpt") else "Gemini"
    results = []

    for idx in range(count):
        _emit(f"\n===== 게시 {idx + 1}/{count} 시작 =====", logger)
        _emit(f"🤖 {model_name}로 텍스트 생성 중...", logger)
        text = generate_text_with_ai(model=model, topic=topic, logger=logger)
        _emit(f"생성된 텍스트: {text[:100]}...", logger)

        result = _post_text_to_threads(threads_user_id, text, token, logger=logger)
        result["sequence"] = idx + 1
        result["username"] = username
        results.append(result)

        _emit(f"✅ 게시 {idx + 1}/{count} 완료! Permalink: {result['permalink']}", logger)

        if idx < count - 1 and interval_seconds > 0:
            _emit(f"⏳ 다음 게시까지 {interval_seconds}초 대기합니다...", logger)
            time.sleep(interval_seconds)

    _emit("\n🎉 모든 게시가 완료되었습니다!", logger)
    return results

if __name__ == "__main__":
    import argparse

    parser = argparse.ArgumentParser(description="Threads에 AI 생성 콘텐츠를 자동 게시합니다.")
    parser.add_argument("topic", nargs="?", help="AI가 생성할 콘텐츠 주제 (미입력 시 기본 테스트 모드 실행)")
    parser.add_argument("--count", type=int, default=5, help="게시할 게시물 수 (기본값: 5)")
    parser.add_argument("--interval", dest="interval_seconds", type=int, default=60, help="게시 간격(초) (기본값: 60)")
    parser.add_argument("--model", default="gpt-4o", choices=["gpt-4o", "gemini-2.5-flash"], help="사용할 AI 모델 (기본값: gpt-4o)")
    args = parser.parse_args()

    if args.topic:
        print(f"🎯 주제: {args.topic}")
        print(f"🤖 모델: {args.model}")
        print("=" * 60)
        post_multiple_gpt_texts(
            topic=args.topic,
            count=args.count,
            interval_seconds=args.interval_seconds,
            model=args.model,
        )
    else:
        print("=" * 60)
        print("📝 기본 테스트 모드 (수동 텍스트 한 번 게시)")
        print("=" * 60)
        token = get_token()
        user = me(token=token)
        uid = user["id"]
        print("✅ me:", user)

        result = _post_text_to_threads(uid, "Hello from API ✨", token)
        print("🚀 published media_id:", result["media_id"])
        print("🔗 permalink:", result["permalink"])

        print("\n💡 AI로 생성하려면: python post_to_threads.py \"주제\" [--model gpt-4o|gemini-2.5-flash]")
