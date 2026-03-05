export class APIError extends Error {
  status?: number;

  constructor(message: string, status?: number) {
    super(message);
    this.name = 'APIError';
    this.status = status;
  }
}

export interface AnalysisResult {
  score: number | null;
  justificativa_score: string;
  nivel_classificado: string;
  pontos_fortes: string[];
  pontos_fracos: string[];
  sugestoes_praticas: string[];
  avaliacao_geral: string;
}

function toStringArray(value: unknown): string[] {
  if (Array.isArray(value)) return value.map(String);
  if (typeof value === 'string') {
    try {
      const parsed: unknown = JSON.parse(value);
      if (Array.isArray(parsed)) return parsed.map(String);
    } catch { /* não é JSON */ }
    return value.trim() ? [value] : [];
  }
  return [];
}

function unwrap(raw: unknown): Record<string, unknown> {
  // Se vier como array, pega o primeiro elemento (padrão n8n)
  if (Array.isArray(raw)) return unwrap(raw[0]);

  if (raw && typeof raw === 'object') {
    const obj = raw as Record<string, unknown>;

    // Se tiver campo "output" stringificado, tenta desempacotar
    if (typeof obj.output === 'string') {
      try {
        const parsed = JSON.parse(obj.output);
        if (parsed && typeof parsed === 'object') return unwrap(parsed);
      } catch { /* não é JSON */ }
    }

    // Verifica wrappers comuns do n8n
    for (const key of ['data', 'result', 'output', 'body', 'response']) {
      const nested = obj[key];
      if (nested && typeof nested === 'object' && !Array.isArray(nested) && 'score' in (nested as Record<string, unknown>)) {
        return nested as Record<string, unknown>;
      }
    }

    return obj;
  }

  return {};
}

function normalizeResult(raw: unknown): AnalysisResult {

  const data = unwrap(raw);

  return {
    score: data.score != null ? Number(data.score) : null,
    justificativa_score: String(data.justificativa_score ?? ''),
    nivel_classificado: String(data.nivel_classificado ?? ''),
    pontos_fortes: toStringArray(data.pontos_fortes),
    pontos_fracos: toStringArray(data.pontos_fracos),
    sugestoes_praticas: toStringArray(data.sugestoes_praticas),
    avaliacao_geral: String(data.avaliacao_geral ?? ''),
  };
}

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ??
  'https://api-analise-curriculo-com-ia.onrender.com';

const API_TIMEOUT = Number(import.meta.env.VITE_API_TIMEOUT ?? 300_000);

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
    return normalizeResult(await response.json());
  }

  if (contentType.includes('application/pdf')) {
    return await response.blob();
  }

  // Fallback: tenta JSON, senão devolve blob
  try {
    return normalizeResult(await response.clone().json());
  } catch {
    return await response.blob();
  }
}
