import os
import requests
from dotenv import load_dotenv

load_dotenv()


def _get_config(key: str, default: str) -> str:
    """Lê config do st.secrets (Streamlit Cloud) ou .env (local)."""
    try:
        import streamlit as st
        return st.secrets.get(key, os.getenv(key, default))
    except Exception:
        return os.getenv(key, default)


API_BASE_URL = _get_config("API_BASE_URL", "http://localhost:8000")
API_TIMEOUT = int(_get_config("API_TIMEOUT", "120"))


class APIError(Exception):
    """Erro customizado para falhas na comunicação com o backend."""

    def __init__(self, message: str, status_code: int | None = None):
        self.message = message
        self.status_code = status_code
        super().__init__(self.message)


def send_resume(file_bytes: bytes, filename: str, adjust: bool) -> dict | bytes:
    """
    Envia o currículo para o backend.

    Args:
        file_bytes: Conteúdo do arquivo em bytes.
        filename: Nome original do arquivo.
        adjust: Se True, solicita análise + ajuste (retorna PDF).
                Se False, solicita apenas análise (retorna JSON).

    Returns:
        dict  — JSON com a análise, quando adjust=False.
        bytes — PDF ajustado, quando adjust=True.

    Raises:
        APIError: Em caso de falha na requisição.
    """
    url = f"{API_BASE_URL}/resume/analyze"

    # Determinar MIME type pelo nome do arquivo
    if filename.lower().endswith(".pdf"):
        mime_type = "application/pdf"
    else:
        mime_type = "text/plain"

    files = {"file": (filename, file_bytes, mime_type)}
    data = {"adjust": str(adjust).lower()}

    try:
        response = requests.post(
            url,
            files=files,
            data=data,
            timeout=API_TIMEOUT,
        )
    except requests.exceptions.ConnectionError:
        raise APIError(
            "Não foi possível conectar ao servidor. "
            "Verifique se o backend está rodando."
        )
    except requests.exceptions.Timeout:
        raise APIError(
            f"O servidor não respondeu dentro de {API_TIMEOUT}s. "
            "Tente novamente mais tarde."
        )
    except requests.exceptions.RequestException as exc:
        raise APIError(f"Erro inesperado na requisição: {exc}")

    if response.status_code != 200:
        # Tenta extrair mensagem de erro do corpo JSON
        try:
            detail = response.json().get("detail", response.text)
        except Exception:
            detail = response.text
        raise APIError(
            f"Erro do servidor ({response.status_code}): {detail}",
            status_code=response.status_code,
        )

    content_type = response.headers.get("Content-Type", "")

    if "application/json" in content_type:
        return response.json()

    if "application/pdf" in content_type:
        return response.content

    # Fallback: tenta JSON, senão devolve bytes
    try:
        return response.json()
    except Exception:
        return response.content
