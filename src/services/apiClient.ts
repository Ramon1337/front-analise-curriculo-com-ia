export class APIError extends Error {
  status?: number;

  constructor(message: string, status?: number) {
    super(message);
    this.name = 'APIError';
    this.status = status;
  }
}

export interface AnalysisResult {
  score?: number;
  justificativa_score?: string;
  nivel_classificado?: string;
  pontos_fortes?: string[];
  pontos_fracos?: string[];
  sugestoes_praticas?: string[];
  avaliacao_geral?: string;
  rewritten_resume?: string;
}

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ??
  'https://api-analise-curriculo-com-ia.onrender.com';

const API_TIMEOUT = Number(import.meta.env.VITE_API_TIMEOUT ?? 120_000);

export async function sendResume(
  file: File,
  adjust: boolean,
): Promise<AnalysisResult | Blob> {
  const url = `${API_BASE_URL}/resume/analyze`;

  const formData = new FormData();
  formData.append('file', file);
  formData.append('adjust', String(adjust));

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), API_TIMEOUT);

  let response: Response;
  try {
    response = await fetch(url, {
      method: 'POST',
      body: formData,
      signal: controller.signal,
    });
  } catch (err: unknown) {
    if (err instanceof DOMException && err.name === 'AbortError') {
      throw new APIError(
        `O servidor não respondeu dentro de ${API_TIMEOUT / 1000}s. Tente novamente mais tarde.`,
      );
    }
    throw new APIError(
      'Não foi possível conectar ao servidor. Verifique se o backend está rodando.',
    );
  } finally {
    clearTimeout(timer);
  }

  if (!response.ok) {
    let detail: string;
    try {
      const body = await response.json();
      detail = body.detail ?? response.statusText;
    } catch {
      detail = response.statusText;
    }
    throw new APIError(
      `Erro do servidor (${response.status}): ${detail}`,
      response.status,
    );
  }

  const contentType = response.headers.get('Content-Type') ?? '';

  if (contentType.includes('application/json')) {
    return (await response.json()) as AnalysisResult;
  }

  if (contentType.includes('application/pdf')) {
    return await response.blob();
  }

  // Fallback: tenta JSON, senão devolve blob
  try {
    return (await response.clone().json()) as AnalysisResult;
  } catch {
    return await response.blob();
  }
}
