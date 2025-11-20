import os
import time
from typing import List
import streamlit as st
from post_to_threads import generate_text_with_ai, _post_text_to_threads, me, get_token
import google_sheets

st.set_page_config(page_title="Threads Auto Poster", page_icon="🧵")
st.title("Threads Auto Poster")

# --- Helper Functions ---
def _resolve_secret(key: str) -> str:
    if key in st.secrets:
        return st.secrets[key]
    return os.getenv(key, "")

def _ensure_env_var(key: str, value: str) -> None:
    if value:
        os.environ[key] = value

# --- Sidebar: Configuration ---
with st.sidebar:
    st.header("환경 변수 설정")
    openai_key = _resolve_secret("OPENAI_API_KEY")
    google_key = _resolve_secret("GOOGLE_API_KEY")
    threads_token = _resolve_secret("LONG_LIVED_ACCESS_TOKEN")

    # Input fields for keys if not set
    if not openai_key:
        openai_key = st.text_input("OPENAI_API_KEY", type="password")
    if not google_key:
        google_key = st.text_input("GOOGLE_API_KEY", type="password")
    if not threads_token:
        threads_token = st.text_input("LONG_LIVED_ACCESS_TOKEN", type="password")

    # Set env vars
    _ensure_env_var("OPENAI_API_KEY", openai_key)
    _ensure_env_var("GOOGLE_API_KEY", google_key)
    _ensure_env_var("LONG_LIVED_ACCESS_TOKEN", threads_token)

    st.divider()
    st.write(f"OpenAI Key: {'✅' if openai_key else '❌'}")
    st.write(f"Google Key: {'✅' if google_key else '❌'}")
    st.write(f"Threads Token: {'✅' if threads_token else '❌'}")

# --- Tabs ---
tab1, tab2 = st.tabs(["📝 콘텐츠 생성", "🚀 자동 게시"])

# --- Tab 1: Generate Content ---
with tab1:
    st.header("콘텐츠 생성 및 저장")
    st.info("AI를 이용해 콘텐츠를 생성하고 구글 스프레드시트(A열)에 저장합니다.")

    model = st.selectbox(
        "AI 모델 선택",
        options=["gpt-4o", "gemini-2.5-flash"],
        index=0
    )

    topic = st.text_input("게시 주제 (프롬프트)", placeholder="예: AI 트렌드, 직장인 꿀팁...")
    
    if st.button("생성 및 시트에 저장", type="primary"):
        if not topic:
            st.warning("주제를 입력해주세요.")
        elif (model == "gpt-4o" and not openai_key) or (model == "gemini-2.5-flash" and not google_key):
            st.error(f"{model} 사용을 위한 API 키가 필요합니다.")
        else:
            try:
                with st.spinner(f"{model}로 콘텐츠 생성 중..."):
                    generated_text = generate_text_with_ai(model=model, topic=topic)
                
                st.success("콘텐츠 생성 완료!")
                st.text_area("생성된 텍스트", value=generated_text, height=150)
                
                with st.spinner("구글 시트에 저장 중..."):
                    google_sheets.append_to_sheet(generated_text)
                
                st.success("✅ 구글 스프레드시트 A열에 저장되었습니다.")
                
            except Exception as e:
                st.error(f"오류 발생: {e}")

# --- Tab 2: Auto Post ---
with tab2:
    st.header("자동 게시 (Auto Posting)")
    st.info("구글 스프레드시트 A열의 콘텐츠를 순서대로 가져와 Threads에 게시합니다.")
    
    interval_minutes = st.number_input(
        "게시 간격 (분)", 
        min_value=15, 
        max_value=1440, 
        value=60, 
        step=15,
        help="15분 ~ 24시간(1440분) 사이로 설정 가능합니다."
    )
    
    if st.button("자동 게시 시작", type="primary"):
        if not threads_token:
            st.error("Threads Access Token이 필요합니다.")
        else:
            status_area = st.empty()
            log_area = st.empty()
            logs = []
            
            def log(msg):
                timestamp = time.strftime("%H:%M:%S")
                logs.insert(0, f"[{timestamp}] {msg}")
                log_area.code("\n".join(logs[:20]), language="text")

            status_area.info("🚀 자동 게시가 시작되었습니다. 이 탭을 닫지 마세요.")
            
            # Verify user first
            try:
                user = me(token=threads_token)
                log(f"로그인 확인: @{user.get('username', 'unknown')}")
            except Exception as e:
                st.error(f"Threads 인증 실패: {e}")
                st.stop()

            while True:
                try:
                    # 1. Pop from sheet
                    log("📥 시트에서 다음 게시물 확인 중...")
                    text = google_sheets.pop_from_queue()
                    
                    if text:
                        log(f"📝 게시물 발견: {text[:30]}...")
                        
                        # 2. Post to Threads
                        result = _post_text_to_threads(user["id"], text, threads_token, logger=log)
                        log(f"✅ 게시 성공! Link: {result['permalink']}")
                        
                        # 3. Wait
                        wait_sec = interval_minutes * 60
                        log(f"⏳ 다음 게시까지 {interval_minutes}분 대기합니다...")
                        time.sleep(wait_sec)
                    else:
                        log("📭 대기열(A열)이 비어있습니다. 1분 후 다시 확인합니다.")
                        time.sleep(60)
                        
                except Exception as e:
                    log(f"❌ 오류 발생: {e}")
                    time.sleep(60) # Wait a bit before retry on error




