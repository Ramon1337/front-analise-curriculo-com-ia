import { useState } from 'react';
import Header from './components/Header';
import FileUpload from './components/FileUpload';
import ModeSelector, { type Mode } from './components/ModeSelector';
import ScoreCard from './components/ScoreCard';
import ResultTabs from './components/ResultTabs';
import Footer from './components/Footer';
import {
  sendResume,
  APIError,
  type AnalysisResult,
} from './services/apiClient';
import './App.css';

/* ── Helpers ──────────────────────────────────────────────────────── */

function splitAnalysisSuggestions(text: string): [string, string] {
  const patterns = [
    /(?:^|\n)\s*\d+[.)]\s*[Ss]ugest[õo]es/,
    /(?:^|\n)\s*#+\s*[Ss]ugest[õo]es/,
    /(?:^|\n)\s*\*{0,2}[Ss]ugest[õo]es\s*de\s+/,
    /(?:^|\n)\s*\*{0,2}[Ss]ugest[õo]es\*{0,2}\s*:?/,
    /(?:^|\n)\s*\d+[.)]\s*[Mm]elhorias/,
    /(?:^|\n)\s*#+\s*[Mm]elhorias/,
    /(?:^|\n)\s*\*{0,2}[Rr]ecomenda[çc][õo]es\*{0,2}/,
    /(?:^|\n)\s*\d+[.)]\s*[Rr]ecomenda[çc][õo]es/,
    /(?:^|\n)\s*\*{0,2}[Oo]\s+que\s+melhorar\*{0,2}/,
    /(?:^|\n)\s*\*{0,2}[Pp]ontos\s+a\s+melhorar\*{0,2}/,
  ];

  let bestPos = text.length;
  for (const p of patterns) {
    const m = p.exec(text);
    if (m && m.index < bestPos) bestPos = m.index;
  }

  if (bestPos < text.length) {
    return [text.slice(0, bestPos).trim(), text.slice(bestPos).trim()];
  }

  // Fallback: dividir pela metade das seções numeradas
  const sections = [...text.matchAll(/(?:^|\n)\s*\d+[.)]/g)];
  if (sections.length >= 2) {
    const mid = Math.floor(sections.length / 2);
    const splitPos = sections[mid].index!;
    return [text.slice(0, splitPos).trim(), text.slice(splitPos).trim()];
  }

  return [text, ''];
}

function normalizeSuggestions(raw: string | string[] | undefined): string {
  if (!raw) return '';
  if (Array.isArray(raw)) return raw.join('\n');
  try {
    const parsed: unknown = JSON.parse(raw);
    if (Array.isArray(parsed)) return (parsed as string[]).join('\n');
  } catch {
    /* não é JSON */
  }
  return raw;
}

function buildDownloadText(result: AnalysisResult): string {
  const parts: string[] = [];
  if (result.score != null) parts.push(`SCORE: ${result.score}/10\n`);
  if (result.analysis)
    parts.push(`ANÁLISE\n${'─'.repeat(40)}\n${result.analysis}\n`);
  if (result.suggestions) {
    const sug = Array.isArray(result.suggestions)
      ? result.suggestions.map((s, i) => `${i + 1}. ${s}`).join('\n')
      : String(result.suggestions);
    parts.push(`SUGESTÕES\n${'─'.repeat(40)}\n${sug}\n`);
  }
  return parts.join('\n');
}

/* ── App ──────────────────────────────────────────────────────────── */

export default function App() {
  const [file, setFile] = useState<File | null>(null);
  const [mode, setMode] = useState<Mode>('analysis');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(
    null,
  );
  const [pdfBlob, setPdfBlob] = useState<Blob | null>(null);

  async function handleProcess() {
    if (!file) return;
    setError(null);
    setAnalysisResult(null);
    setPdfBlob(null);
    setLoading(true);

    try {
      const result = await sendResume(file, mode === 'adjust');
      if (result instanceof Blob) {
        setPdfBlob(result);
      } else {
        setAnalysisResult(result);
      }
    } catch (err) {
      if (err instanceof APIError) {
        setError(err.message);
      } else {
        setError(`Ocorreu um erro inesperado: ${err}`);
      }
    } finally {
      setLoading(false);
    }
  }

  // Processar análise / sugestões
  let analysisText = '';
  let suggestionsText = '';
  if (analysisResult) {
    const rawAnalysis = analysisResult.analysis ?? '';
    const rawSuggestions = normalizeSuggestions(analysisResult.suggestions);
    const contentIsSame = rawAnalysis.trim() === rawSuggestions.trim();

    if (contentIsSame && rawAnalysis) {
      [analysisText, suggestionsText] = splitAnalysisSuggestions(rawAnalysis);
    } else {
      analysisText = rawAnalysis;
      suggestionsText = rawSuggestions;
    }
  }

  function downloadFile(blob: Blob, filename: string) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="app">
      <div className="app__container">
        <Header />
        <FileUpload file={file} onFileChange={setFile} />
        <ModeSelector mode={mode} onModeChange={setMode} />

        <button
          type="button"
          className="btn-process"
          disabled={!file || loading}
          onClick={handleProcess}
        >
          {loading ? '⏳ Processando…' : '🚀 Processar'}
        </button>

        {error && <div className="alert alert--error">⚠️ {error}</div>}

        {analysisResult && (
          <div className="results">
            <div className="alert alert--success">✅ Análise concluída!</div>

            {analysisResult.score != null && (
              <ScoreCard score={Number(analysisResult.score)} />
            )}

            <ResultTabs analysis={analysisText} suggestions={suggestionsText} />

            <button
              type="button"
              className="btn-download"
              onClick={() => {
                const txt = buildDownloadText(analysisResult);
                const blob = new Blob([txt], {
                  type: 'text/plain;charset=utf-8',
                });
                downloadFile(blob, 'analise_curriculo.txt');
              }}
            >
              📥 Baixar análise (.txt)
            </button>
          </div>
        )}

        {pdfBlob && (
          <div className="results">
            <div className="alert alert--success">
              ✅ Currículo ajustado com sucesso!
            </div>
            <button
              type="button"
              className="btn-download"
              onClick={() => downloadFile(pdfBlob, 'curriculo_ajustado.pdf')}
            >
              📥 Baixar currículo ajustado (PDF)
            </button>
          </div>
        )}

        <Footer />
      </div>
    </div>
  );
}
