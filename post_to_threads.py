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


import os, json, requests
import sys
from dotenv import load_dotenv
from openai import OpenAI

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

def get_token():
    """환경 변수에서 토큰을 가져옵니다."""
    token = os.getenv('LONG_LIVED_ACCESS_TOKEN')
    if not token:
        raise ValueError("LONG_LIVED_ACCESS_TOKEN이 .env 파일에 설정되지 않았습니다.")
    return token.strip().strip('"').strip("'")  # 따옴표 제거

def generate_text_with_gpt(topic=None, style="engaging", max_length=500):
    """
    GPT를 사용하여 Threads용 텍스트 콘텐츠를 생성합니다.
    
    Args:
        topic (str, optional): 생성할 콘텐츠의 주제. None이면 자동 생성
        style (str): 콘텐츠 스타일 (기본값: "engaging")
        max_length (int): 최대 문자 길이 (기본값: 500)
    
    Returns:
        str: 생성된 Threads 텍스트 콘텐츠
    """
    # 환경 변수에서 OpenAI API 키 로드
    api_key = os.getenv('OPENAI_API_KEY')
    model = 'gpt-4o'  # gpt-5는 아직 출시되지 않았으므로 gpt-4o 사용
    
    if not api_key:
        raise ValueError("OPENAI_API_KEY가 .env 파일에 설정되지 않았습니다.")
    
    # OpenAI 클라이언트 초기화
    client = OpenAI(api_key=api_key.strip().strip('"').strip("'"))
    
    # 프롬프트 구성
    if topic:
        prompt = f"""Threads에 게시할 {style}한 텍스트 콘텐츠를 작성해주세요.

주제: {topic}

요구사항:
- Threads 플랫폼에 적합한 간결하고 매력적인 콘텐츠
- 최대 {max_length}자 이내
- 자연스럽고 읽기 쉬운 문체
- 핵심 메시지가 명확하게 전달되도록 작성

텍스트만 작성하고, 따옴표나 설명 없이 콘텐츠만 반환해주세요."""
    else:
        prompt = f"""Threads에 게시할 {style}한 텍스트 콘텐츠를 자유롭게 작성해주세요.

요구사항:
- Threads 플랫폼에 적합한 간결하고 매력적인 콘텐츠
- 최대 {max_length}자 이내
- 자연스럽고 읽기 쉬운 문체
- 흥미롭고 참여를 유도하는 내용

텍스트만 작성하고, 따옴표나 설명 없이 콘텐츠만 반환해주세요."""
    
    try:
        # GPT API 호출
        response = client.chat.completions.create(
            model=model,
            messages=[
                {"role": "system", "content": "You are a creative content writer specializing in social media posts for Threads platform."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.7,
            max_tokens=200
        )
        
        # 생성된 콘텐츠 추출
        content = response.choices[0].message.content.strip()
        
        # 따옴표 제거 (있는 경우)
        if content.startswith('"') and content.endswith('"'):
            content = content[1:-1]
        elif content.startswith("'") and content.endswith("'"):
            content = content[1:-1]
        
        print(f"✅ GPT 콘텐츠 생성 완료 ({len(content)}자)")
        return content
        
    except Exception as e:
        print(f"❌ GPT 콘텐츠 생성 중 오류 발생: {e}")
        raise

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

def post_gpt_generated_text(topic=None, style="engaging", max_length=500, token=None):
    """
    GPT로 텍스트를 생성하고 Threads에 게시하는 전체 플로우를 실행합니다.
    
    Args:
        topic (str, optional): GPT가 생성할 콘텐츠의 주제
        style (str): 콘텐츠 스타일
        max_length (int): 최대 문자 길이
        token (str, optional): Threads 액세스 토큰 (None이면 .env에서 읽음)
    
    Returns:
        dict: 게시 결과 (media_id, permalink 등 포함)
    """
    # 1단계: GPT로 텍스트 생성
    print("🤖 GPT로 텍스트 생성 중...")
    text = generate_text_with_gpt(topic=topic, style=style, max_length=max_length)
    print(f"생성된 텍스트: {text[:100]}...")
    
    # 2단계: Threads 사용자 정보 가져오기
    if token is None:
        token = get_token()
    print("📋 Threads 사용자 정보 확인 중...")
    user_info = me(token=token)
    threads_user_id = user_info["id"]
    print(f"사용자 ID: {threads_user_id} (@{user_info.get('username', 'N/A')})")
    
    # 3단계: 컨테이너 생성
    print("📦 컨테이너 생성 중...")
    creation_id = create_text_container(threads_user_id, text, token=token)
    
    # 4단계: 게시
    print("🚀 Threads에 게시 중...")
    media_id = publish_container(threads_user_id, creation_id, token=token)
    
    # 5단계: Permalink 가져오기
    print("🔗 Permalink 가져오는 중...")
    permalink = get_permalink(media_id, token=token)
    
    result = {
        "media_id": media_id,
        "creation_id": creation_id,
        "permalink": permalink,
        "text": text,
        "user_id": threads_user_id
    }
    
    print(f"\n✅ 게시 완료!")
    print(f"📝 Media ID: {media_id}")
    print(f"🔗 Permalink: {permalink}")
    
    return result

if __name__ == "__main__":
    import sys
    
    # 명령줄 인자 처리
    if len(sys.argv) > 1:
        # 주제가 제공된 경우 GPT로 생성해서 게시
        topic = sys.argv[1]
        print(f"🎯 주제: {topic}")
        print("=" * 60)
        result = post_gpt_generated_text(topic=topic)
    else:
        # 기본 테스트: 수동 텍스트로 게시
        print("=" * 60)
        print("📝 기본 테스트 모드 (수동 텍스트)")
        print("=" * 60)
        m = me()
        uid = m["id"]
        print("✅ me:", m)

        creation_id = create_text_container(uid, "Hello from API ✨")
        print("🧩 creation_id:", creation_id)

        media_id = publish_container(uid, creation_id)
        print("🚀 published media_id:", media_id)

        link = get_permalink(media_id)
        print("🔗 permalink:", link)
        
        print("\n💡 GPT로 생성하려면: python post_to_threads.py \"주제\"")
