import os
import time
from typing import List
import streamlit as st
from post_to_threads import ContentGenerator, _post_text_to_threads, me, get_token
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

    # Check GCP Service Account in secrets
    has_gcp_creds = "gcp_service_account" in st.secrets
    
    st.divider()
    st.write(f"OpenAI Key: {'✅' if openai_key else '❌'}")
    st.write(f"Google Key: {'✅' if google_key else '❌'}")
    st.write(f"Threads Token: {'✅' if threads_token else '❌'}")
    st.write(f"GCP Service Account: {'✅' if has_gcp_creds else '❌'}")

# --- Tabs ---
tab1, tab2, tab3 = st.tabs(["📝 콘텐츠 생성", "🌐 자동 번역", "🚀 자동 게시"])

# --- Tab 1: Generate Content ---
with tab1:
    st.header("콘텐츠 생성 및 저장")
    st.info("AI를 이용해 콘텐츠를 생성하고 구글 스프레드시트(A열)에 저장합니다.")

    # 2. Default model changed to Gemini (index 1)
    model = st.selectbox(
        "AI 모델 선택",
        options=["gpt-4o", "gemini-2.5-flash"],
        index=1,
        key="gen_model"
    )

    prompt = st.text_area("프롬프트 입력", height=200, placeholder="AI에게 요청할 내용을 상세히 적어주세요.")
    
    # 1. Add generation count
    gen_count = st.number_input("생성할 게시글 수", min_value=1, max_value=100, value=1)
    
    if st.button("생성 및 시트에 저장", type="primary"):
        if not prompt:
            st.warning("프롬프트를 입력해주세요.")
        elif (model == "gpt-4o" and not openai_key) or (model == "gemini-2.5-flash" and not google_key):
            st.error(f"{model} 사용을 위한 API 키가 필요합니다.")
        else:
            try:
                progress_bar = st.progress(0)
                status_text = st.empty()
                
                # Initialize Generator Session
                generator = ContentGenerator(model=model)
                
                for i in range(gen_count):
                    status_text.text(f"[{i+1}/{gen_count}] 콘텐츠 생성 중...")
                    
                    # First iteration: Use user prompt
                    # Subsequent: Use "continue" prompt
                    current_prompt = prompt if i == 0 else "위의 지침에 따라 새로운 게시글을 하나 더 작성해줘. (이전과 겹치지 않게)"
                    
                    with st.spinner(f"{model}로 {i+1}번째 콘텐츠 생성 중..."):
                        generated_text = generator.generate(current_prompt)
                    
                    # Show preview of the last generated text
                    if i == gen_count - 1:
                        st.text_area(f"마지막 생성된 텍스트 ({i+1}/{gen_count})", value=generated_text, height=150)
                    
                    status_text.text(f"[{i+1}/{gen_count}] 구글 시트에 저장 중...")
                    google_sheets.append_to_sheet(generated_text)
                    
                    progress_bar.progress((i + 1) / gen_count)
                    time.sleep(1) # Rate limit safety
                
                status_text.text("모든 작업 완료!")
                st.success(f"✅ {gen_count}개의 콘텐츠가 구글 스프레드시트 A열에 저장되었습니다.")
                
            except Exception as e:
                st.error(f"오류 발생: {e}")

# --- Tab 2: Auto Translation ---
with tab2:
    st.header("자동 번역 (Auto Translation)")
    st.info("'쓰레드' 시트의 A열에 있는 모든 콘텐츠를 번역하여 각 언어별 시트(영어, 스페인어)의 A열에 저장합니다.")
    
    trans_model = st.selectbox(
        "번역 AI 모델 선택",
        options=["gpt-4o", "gemini-2.5-flash"],
        index=1,
        key="trans_model"
    )
    
    target_lang = st.radio(
        "번역 대상 언어",
        options=["영어", "스페인어", "둘 다 (영어 + 스페인어)"],
        horizontal=True
    )
    
    if st.button("번역 시작", type="primary"):
        if (trans_model == "gpt-4o" and not openai_key) or (trans_model == "gemini-2.5-flash" and not google_key):
            st.error(f"{trans_model} 사용을 위한 API 키가 필요합니다.")
        else:
            try:
                with st.spinner("대기열('쓰레드' 시트 A열)을 불러오는 중..."):
                    contents = google_sheets.get_all_from_queue()
                
                if not contents:
                    st.warning("번역할 콘텐츠가 없습니다. ('쓰레드' 시트 A열이 비어있음)")
                else:
                    st.write(f"총 {len(contents)}개의 콘텐츠를 번역합니다.")
                    progress_bar = st.progress(0)
                    status_text = st.empty()
                    
                    generator = ContentGenerator(model=trans_model)
                    
                    for i, text in enumerate(contents):
                        status_text.text(f"[{i+1}/{len(contents)}] 번역 중...")
                        
                        targets = []
                        if target_lang == "영어" or target_lang == "둘 다 (영어 + 스페인어)":
                            targets.append(("English", "영어"))
                        if target_lang == "스페인어" or target_lang == "둘 다 (영어 + 스페인어)":
                            targets.append(("Spanish", "스페인어"))
                            
                        for lang_code, sheet_name in targets:
                            with st.spinner(f"[{i+1}/{len(contents)}] {lang_code}로 번역 중..."):
                                translated = generator.translate(text, lang_code)
                                google_sheets.append_to_sheet(translated, sheet_name=sheet_name)
                        
                        progress_bar.progress((i + 1) / len(contents))
                        time.sleep(1)
                    
                    status_text.text("번역 완료!")
                    st.success(f"✅ {len(contents)}개의 콘텐츠 번역이 완료되었습니다.")
                    
            except Exception as e:
                st.error(f"오류 발생: {e}")

# --- Tab 3: Auto Post ---
with tab3:
    st.header("자동 게시 (Auto Posting)")
    st.info("구글 스프레드시트 A열의 콘텐츠를 순서대로 가져와 Threads에 게시합니다.")
    st.warning("⚠️ 주의: 자동 게시가 진행되는 동안에는 이 브라우저 탭을 닫거나 새로고침하지 마세요. (탭이 닫히면 중단됩니다)")
    
    post_lang = st.radio(
        "게시 언어 선택",
        options=["기본 (쓰레드)", "영어", "스페인어", "둘 다 (영어 + 스페인어)"],
        horizontal=True
    )

    interval_minutes = st.number_input("게시 간격 (분)", min_value=1, max_value=1440, value=60, help="최소 1분, 최대 24시간(1440분)")
    
    if st.button("자동 게시 시작", type="primary"):
        if not threads_token:
            st.error("Threads Access Token이 필요합니다.")
        else:
            status_area = st.empty() # Keep this for overall status
            log_placeholder = st.empty() # This will display the logs
            logs = []
            
            def log_callback(message):
                timestamp = time.strftime("%H:%M:%S")
                logs.append(f"[{timestamp}] {message}")
                # Keep only last 10 logs
                if len(logs) > 10:
                    logs.pop(0)
                log_placeholder.code("\n".join(logs), language="text")
            
            status_area.info("🚀 자동 게시가 시작되었습니다. 이 탭을 닫지 마세요.")
            
            # Verify user first
            try:
                user = me(token=threads_token)
                log_callback(f"로그인 확인: @{user.get('username', 'unknown')}")
            except Exception as e:
                st.error(f"Threads 인증 실패: {e}")
                st.stop()
            
            count = 0
            
            # Determine target sheets based on selection
            if post_lang == "기본 (쓰레드)":
                target_sheets = ["쓰레드"]
            elif post_lang == "영어":
                target_sheets = ["영어"]
            elif post_lang == "스페인어":
                target_sheets = ["스페인어"]
            else: # 둘 다
                target_sheets = ["영어", "스페인어"]
            
            while True:
                # Determine which sheet to use for this turn
                # If "Both", alternate based on count
                current_sheet_idx = count % len(target_sheets)
                current_sheet_name = target_sheets[current_sheet_idx]
                
                log_callback(f"[{current_sheet_name}] 시트에서 게시글 가져오는 중...")
                
                try:
                    # 1. Get content from Google Sheet
                    text_to_post, row_index = google_sheets.pop_from_queue(sheet_name=current_sheet_name)
                    
                    if not text_to_post:
                        log_callback(f"⚠️ [{current_sheet_name}] 시트의 A열이 비어있습니다.")
                        
                        # If single mode, stop.
                        if len(target_sheets) == 1:
                            log_callback("더 이상 게시할 콘텐츠가 없습니다. 자동 게시를 종료합니다.")
                            status_area.success("🎉 모든 콘텐츠 게시가 완료되었습니다!")
                            st.balloons()
                            break
                        else:
                            # Multi mode. Check if all target sheets are empty.
                            all_target_sheets_empty = True
                            for sheet in target_sheets:
                                try:
                                    ws = google_sheets.get_worksheet(sheet)
                                    if ws.col_values(1): # Check if column A has any values
                                        all_target_sheets_empty = False
                                        break
                                except Exception as e:
                                    log_callback(f"시트 '{sheet}' 확인 중 오류 발생: {e}")
                                    # If we can't even check, assume it might have content or skip.
                                    # For robustness, let's assume it's not empty if we can't check.
                                    all_target_sheets_empty = False 
                                    break
                            
                            if all_target_sheets_empty:
                                log_callback("모든 시트의 콘텐츠가 소진되었습니다. 자동 게시를 종료합니다.")
                                status_area.success("🎉 모든 콘텐츠 게시가 완료되었습니다!")
                                st.balloons()
                                break
                            else:
                                log_callback(f"[{current_sheet_name}] 시트가 비어있습니다. 다음 시트를 확인합니다.")
                                # Increment count to try the next sheet immediately without waiting
                                count += 1 
                                continue # Skip to next iteration to try another sheet
                    else:
                        # 2. Post to Threads
                        log_callback(f"[{current_sheet_name}] 게시 중: {text_to_post[:30]}...")
                        
                        # The original _post_text_to_threads takes user_id, text, token, logger
                        result = _post_text_to_threads(user["id"], text_to_post, threads_token, logger=log_callback)
                        
                        if result and 'permalink' in result:
                            log_callback(f"✅ [{current_sheet_name}] 게시 성공! Link: {result['permalink']}")
                            count += 1
                        else:
                            log_callback(f"❌ [{current_sheet_name}] 게시 실패. (시트 C열을 빨간색으로 표시합니다)")
                            # Mark as failed in Google Sheet
                            if row_index:
                                google_sheets.mark_as_failed(current_sheet_name, row_index)
                            
                            count += 1 # Still increment count to move to next sheet/language
                    
                    # 3. Wait for next interval
                    log_callback(f"⏳ {interval_minutes}분 대기 중...")
                    time.sleep(interval_minutes * 60)
                    
                except Exception as e:
                    log_callback(f"❌ 오류 발생: {e}")
                    time.sleep(60) # Wait 1 min on error before retrying

