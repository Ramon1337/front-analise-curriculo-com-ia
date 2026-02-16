import json
import re
import streamlit as st
from services.api_client import send_resume, APIError


def _split_analysis_suggestions(text: str) -> tuple[str, str]:
    """
    Separa um bloco de texto em 'análise' e 'sugestões' com base em
    palavras-chave de seção comuns em respostas de IA.
    """
    # Padrões que indicam início da parte de sugestões
    suggestion_patterns = [
        r"(?:^|\n)\s*\d+[\.\)]\s*[Ss]ugest[õo]es",        # "3. Sugestões"
        r"(?:^|\n)\s*#+\s*[Ss]ugest[õo]es",                # "### Sugestões"
        r"(?:^|\n)\s*\*{0,2}[Ss]ugest[õo]es\s*de\s+",     # "Sugestões de melhoria"
        r"(?:^|\n)\s*\*{0,2}[Ss]ugest[õo]es\*{0,2}\s*:?", # "**Sugestões:**"
        r"(?:^|\n)\s*\d+[\.\)]\s*[Mm]elhorias",            # "3. Melhorias"
        r"(?:^|\n)\s*#+\s*[Mm]elhorias",                   # "### Melhorias"
        r"(?:^|\n)\s*\*{0,2}[Rr]ecomenda[çc][õo]es\*{0,2}",  # "Recomendações"
        r"(?:^|\n)\s*\d+[\.\)]\s*[Rr]ecomenda[çc][õo]es",
        r"(?:^|\n)\s*\*{0,2}[Oo]\s+que\s+melhorar\*{0,2}", # "O que melhorar"
        r"(?:^|\n)\s*\*{0,2}[Pp]ontos\s+a\s+melhorar\*{0,2}",
    ]

    best_pos = len(text)
    for pattern in suggestion_patterns:
        match = re.search(pattern, text)
        if match and match.start() < best_pos:
            best_pos = match.start()

    if best_pos < len(text):
        analysis_part = text[:best_pos].strip()
        suggestions_part = text[best_pos:].strip()
        return analysis_part, suggestions_part

    # Fallback: dividir pela metade das seções numeradas
    sections = list(re.finditer(r"(?:^|\n)\s*\d+[\.\)]", text))
    if len(sections) >= 2:
        mid = len(sections) // 2
        split_pos = sections[mid].start()
        return text[:split_pos].strip(), text[split_pos:].strip()

    # Sem como separar — tudo vai para análise
    return text, ""

# ─── Configuração da página ─────────────────────────────────────────
st.set_page_config(
    page_title="Analise de currículo AI",
    page_icon="📄",
    layout="centered",
)

# ─── CSS customizado ────────────────────────────────────────────────
st.markdown(
    """
    <style>
    .main-title  { text-align: center; margin-bottom: 0; }
    .subtitle    { text-align: center; color: #888; margin-top: 0; }
    .stDownloadButton > button { width: 100%; }

    /* Esconder elementos do Streamlit Cloud */
    #MainMenu {visibility: hidden;}
    header {visibility: hidden;}
    footer {visibility: hidden;}
    [data-testid="stToolbar"] {display: none;}
    .stDeployButton {display: none;}

    /* Score card */
    .score-card {
        text-align: center;
        padding: 2rem 1rem;
        border-radius: 16px;
        background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
        border: 1px solid #30395a;
    }
    .score-value {
        font-size: 4rem;
        font-weight: 800;
        line-height: 1;
        margin: 0.25rem 0;
    }
    .score-label {
        font-size: 0.9rem;
        color: #888;
        text-transform: uppercase;
        letter-spacing: 2px;
    }
    .score-bar-bg {
        height: 8px;
        background: #2a2a3e;
        border-radius: 4px;
        margin: 1rem auto 0;
        max-width: 200px;
        overflow: hidden;
    }
    .score-bar-fill {
        height: 100%;
        border-radius: 4px;
        transition: width 0.5s ease;
    }
    .score-low    { color: #ff6b6b; }
    .score-mid    { color: #ffd93d; }
    .score-high   { color: #6bcb77; }
    .bar-low      { background: #ff6b6b; }
    .bar-mid      { background: #ffd93d; }
    .bar-high     { background: #6bcb77; }

    /* Tabs container */
    .stTabs [data-baseweb="tab-list"] {
        gap: 8px;
    }
    .stTabs [data-baseweb="tab"] {
        padding: 10px 20px;
        border-radius: 8px;
    }
    </style>
    """,
    unsafe_allow_html=True,
)

# ─── Header ─────────────────────────────────────────────────────────
st.markdown("<h1 class='main-title'>📄 Currículo AI</h1>", unsafe_allow_html=True)
st.markdown(
    "<p class='subtitle'>Análise inteligente e ajuste de currículos</p>",
    unsafe_allow_html=True,
)
st.divider()

# ─── Upload ──────────────────────────────────────────────────────────
uploaded_file = st.file_uploader(
    "Envie seu currículo",
    type=["pdf", "txt"],
    help="Formatos aceitos: PDF, TXT",
)

# ─── Opções ──────────────────────────────────────────────────────────
st.markdown("##### Modo de processamento")
mode = st.radio(
    label="Selecione o modo",
    options=["analysis", "adjust"],
    format_func=lambda x: "🔍 Apenas análise" if x == "analysis" else "✏️ Analisar e ajustar",
    horizontal=True,
    label_visibility="collapsed",
)

adjust = mode == "adjust"

# ─── Botão processar ─────────────────────────────────────────────────
process_btn = st.button(
    "🚀 Processar",
    use_container_width=True,
    disabled=uploaded_file is None,
)

# ─── Processamento ───────────────────────────────────────────────────
if process_btn and uploaded_file is not None:
    file_bytes = uploaded_file.read()
    filename = uploaded_file.name

    with st.spinner("Processando seu currículo… isso pode levar alguns segundos."):
        try:
            result = send_resume(file_bytes, filename, adjust)
        except APIError as err:
            st.error(f"⚠️ {err.message}")
            st.stop()
        except Exception as exc:
            st.error(f"⚠️ Ocorreu um erro inesperado: {exc}")
            st.stop()

    # ── Resultado: Análise (JSON) ────────────────────────────────────
    if isinstance(result, dict):
        st.success("✅ Análise concluída!")
        st.markdown("")

        # ─── BLOCO 1: Score visual ──────────────────────────────────
        score = result.get("score")
        if score is not None:
            try:
                score_num = float(score)
            except (ValueError, TypeError):
                score_num = 0

            # Cores por faixa
            if score_num >= 7:
                color_cls, bar_cls, emoji = "score-high", "bar-high", "🟢"
            elif score_num >= 4:
                color_cls, bar_cls, emoji = "score-mid", "bar-mid", "🟡"
            else:
                color_cls, bar_cls, emoji = "score-low", "bar-low", "🔴"

            pct = min(score_num / 10 * 100, 100)

            st.markdown(
                f"""
                <div class="score-card">
                    <div class="score-label">Score do currículo</div>
                    <div class="score-value {color_cls}">{score_num:g}<span style="font-size:1.5rem;color:#888">/10</span></div>
                    <div class="score-bar-bg">
                        <div class="score-bar-fill {bar_cls}" style="width:{pct}%"></div>
                    </div>
                </div>
                """,
                unsafe_allow_html=True,
            )
            st.markdown("")

        # ─── BLOCOS 2 e 3: Análise + Sugestões em abas ─────────────
        raw_analysis = result.get("analysis", "")
        raw_suggestions = result.get("suggestions", "")

        # Normalizar suggestions
        if isinstance(raw_suggestions, str):
            try:
                parsed = json.loads(raw_suggestions)
                if isinstance(parsed, list):
                    raw_suggestions = parsed
            except (json.JSONDecodeError, TypeError):
                pass

        sug_text = raw_suggestions if isinstance(raw_suggestions, str) else "\n".join(raw_suggestions) if raw_suggestions else ""
        content_is_same = raw_analysis.strip() == sug_text.strip()

        # Se o conteúdo vier duplicado, separar por seções automaticamente
        if content_is_same and raw_analysis:
            analysis_text, suggestions_text = _split_analysis_suggestions(raw_analysis)
        else:
            analysis_text = raw_analysis
            suggestions_text = sug_text

        tab_analysis, tab_suggestions = st.tabs(
            ["📋 Análise", "💡 Sugestões"]
        )

        with tab_analysis:
            if analysis_text:
                st.markdown(analysis_text)
            else:
                st.info("Nenhuma análise retornada.")

        with tab_suggestions:
            if suggestions_text:
                st.markdown(suggestions_text)
            else:
                st.info("Nenhuma sugestão retornada.")

        st.markdown("")

        # Montar conteúdo TXT para download
        txt_parts = []
        if result.get("score") is not None:
            txt_parts.append(f"SCORE: {result['score']}/10\n")
        if result.get("analysis"):
            txt_parts.append(f"ANÁLISE\n{'─' * 40}\n{result['analysis']}\n")
        if result.get("suggestions"):
            sug = result["suggestions"]
            if isinstance(sug, list):
                sug_text = "\n".join(f"{i}. {s}" for i, s in enumerate(sug, 1))
            else:
                sug_text = str(sug)
            txt_parts.append(f"SUGESTÕES\n{'─' * 40}\n{sug_text}\n")

        txt_content = "\n".join(txt_parts)
        st.download_button(
            label="📥 Baixar análise (.txt)",
            data=txt_content,
            file_name="analise_curriculo.txt",
            mime="text/plain",
        )

    # ── Resultado: PDF ajustado ──────────────────────────────────────
    elif isinstance(result, bytes):
        st.success("✅ Currículo ajustado com sucesso!")

        st.download_button(
            label="📥 Baixar currículo ajustado (PDF)",
            data=result,
            file_name="curriculo_ajustado.pdf",
            mime="application/pdf",
        )

    else:
        st.warning("Resposta inesperada do servidor.")

# ─── Footer ──────────────────────────────────────────────────────────
st.divider()
st.caption("Currículo AI · por Ramon Godinho · https://www.portfolioramondev.com.br")
