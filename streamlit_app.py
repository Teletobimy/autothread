import os
from typing import List

import streamlit as st

from post_to_threads import post_multiple_gpt_texts

st.set_page_config(page_title="Threads Auto Poster", page_icon="🧵")
st.title("Threads Auto Poster")
st.write(
    "OpenAI GPT 또는 Google Gemini와 Threads Graph API를 활용해 지정한 간격으로 자동 게시합니다."
)


def _resolve_secret(key: str) -> str:
    """Streamlit secrets > 환경 변수 순으로 값을 찾습니다."""
    if key in st.secrets:
        return st.secrets[key]
    return os.getenv(key, "")


def _ensure_env_var(key: str, value: str) -> None:
    """실행 중 재사용을 위해 환경 변수에 값을 설정합니다."""
    if value:
        os.environ[key] = value


with st.sidebar:
    st.header("환경 변수 상태")
    openai_key = _resolve_secret("OPENAI_API_KEY")
    google_key = _resolve_secret("GOOGLE_API_KEY")
    threads_token = _resolve_secret("LONG_LIVED_ACCESS_TOKEN")

    st.write(
        "- OPENAI_API_KEY: " + ("✅ 설정됨" if openai_key else "❌ 미설정")
    )
    st.write(
        "- GOOGLE_API_KEY: " + ("✅ 설정됨" if google_key else "❌ 미설정")
    )
    st.write(
        "- LONG_LIVED_ACCESS_TOKEN: " + ("✅ 설정됨" if threads_token else "❌ 미설정")
    )

    if not threads_token:
        st.error(
            "Threads LONG_LIVED_ACCESS_TOKEN이 필요합니다. Streamlit secrets에 저장한 뒤 다시 실행해주세요.",
            icon="🚫",
        )


model = st.selectbox(
    "AI 모델 선택",
    options=["gpt-4o", "gemini-2.5-flash"],
    index=0,
    help="사용할 AI 모델을 선택하세요. GPT-4o 또는 Gemini 2.5 Flash를 사용할 수 있습니다."
)

if model == "gpt-4o" and not openai_key:
    st.warning("⚠️ GPT-4o를 사용하려면 OPENAI_API_KEY가 필요합니다.", icon="⚠️")
elif model == "gemini-2.5-flash" and not google_key:
    st.warning("⚠️ Gemini 2.5 Flash를 사용하려면 GOOGLE_API_KEY가 필요합니다.", icon="⚠️")

topic = st.text_input(
    "게시 주제 (선택)", help="공백이면 AI가 자유롭게 주제를 선택합니다."
)
style = st.text_input("문체 스타일", value="engaging")
max_length = st.slider("최대 글자 수", min_value=50, max_value=500, value=500, step=10)
count = st.number_input(
    "게시 횟수", min_value=1, max_value=10, value=5, step=1, format="%d"
)
interval_seconds = st.number_input(
    "게시 간격(초)", min_value=0, max_value=600, value=60, step=5, format="%d"
)


log_placeholder = st.empty()
log_messages: List[str] = []


def log_callback(message: str) -> None:
    log_messages.append(message)
    log_placeholder.write("\n".join(log_messages))


if st.button("Threads에 게시 시작", type="primary", use_container_width=True):
    if not threads_token:
        st.error("Threads LONG_LIVED_ACCESS_TOKEN이 필요합니다.", icon="🚫")
        st.stop()
    
    # 선택한 모델에 따라 API 키 확인
    if model == "gpt-4o" and not openai_key:
        st.error("GPT-4o를 사용하려면 OPENAI_API_KEY가 필요합니다.", icon="🚫")
        st.stop()
    elif model == "gemini-2.5-flash" and not google_key:
        st.error("Gemini 2.5 Flash를 사용하려면 GOOGLE_API_KEY가 필요합니다.", icon="🚫")
        st.stop()

    # 선택한 모델에 따라 API 키 설정
    if model == "gpt-4o":
        _ensure_env_var("OPENAI_API_KEY", openai_key)
    elif model == "gemini-2.5-flash":
        _ensure_env_var("GOOGLE_API_KEY", google_key)
    
    _ensure_env_var("LONG_LIVED_ACCESS_TOKEN", threads_token)

    try:
        model_name = "GPT-4o" if model == "gpt-4o" else "Gemini 2.5 Flash"
        with st.spinner(f"{model_name}로 게시 중입니다. 최대 몇 분이 걸릴 수 있습니다..."):
            results = post_multiple_gpt_texts(
                topic=topic or None,
                style=style,
                max_length=int(max_length),
                count=int(count),
                interval_seconds=int(interval_seconds),
                model=model,
                logger=log_callback,
            )

        st.success("모든 게시가 완료되었습니다! 🎉")

        for res in results:
            st.markdown(f"**게시 {res['sequence']}** — [Threads 링크]({res['permalink']})")
            st.code(res["text"], language="text")
    except Exception as exc:
        st.error(f"오류가 발생했습니다: {exc}")
        import traceback
        st.code(traceback.format_exc(), language="python")



