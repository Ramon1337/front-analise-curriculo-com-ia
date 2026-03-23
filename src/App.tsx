import { useState, lazy, Suspense } from 'react';
import {
  Rocket,
  Loader2,
  AlertTriangle,
  CheckCircle2,
  Download,
} from 'lucide-react';
import Hero from './components/Hero';
import FileUpload from './components/FileUpload';
import ModeSelector, { type Mode } from './components/ModeSelector';
import Footer from './components/Footer';
import LoadingSteps from './components/LoadingSteps';
import {
  sendResume,
  APIError,
  type AnalysisResult,
} from './services/apiClient';
import './App.css';

const ScoreCard = lazy(() => import('./components/ScoreCard'));
const ResultTabs = lazy(() => import('./components/ResultTabs'));

/* ── Helpers ──────────────────────────────────────────────────────── */

function buildDownloadText(r: AnalysisResult): string {
  const sep = '─'.repeat(40);
  const parts: string[] = [];

  if (r.score != null) parts.push(`SCORE: ${r.score}/10`);
  if (r.nivel_classificado) parts.push(`NÍVEL: ${r.nivel_classificado}`);
  if (r.justificativa_score)
    parts.push(`JUSTIFICATIVA\n${sep}\n${r.justificativa_score}`);
  if (r.pontos_fortes.length)
    parts.push(
      `PONTOS FORTES\n${sep}\n${r.pontos_fortes.map((p, i) => `${i + 1}. ${p}`).join('\n')}`,
    );
  if (r.pontos_fracos.length)
    parts.push(
      `PONTOS FRACOS\n${sep}\n${r.pontos_fracos.map((p, i) => `${i + 1}. ${p}`).join('\n')}`,
    );
  if (r.sugestoes_praticas.length)
    parts.push(
      `SUGESTÕES PRÁTICAS\n${sep}\n${r.sugestoes_praticas.map((s, i) => `${i + 1}. ${s}`).join('\n')}`,
    );
  if (r.avaliacao_geral)
    parts.push(`AVALIAÇÃO GERAL\n${sep}\n${r.avaliacao_geral}`);

  return parts.join('\n\n');
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

  const isDocxSelected = !!file && file.name.toLowerCase().endsWith('.docx');

  async function handleProcess() {
    if (!file || isDocxSelected) return;
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

  function downloadFile(blob: Blob, filename: string) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  }

  function handleModeChange(nextMode: Mode) {
    setMode(nextMode);
    setError(null);
    setAnalysisResult(null);
    setPdfBlob(null);
  }

  return (
    <div className="app">
      <div style={{ width: '100%', maxWidth: '1024px', margin: '0 auto' }}>
        <Hero />
      </div>
      <div className="app__container">
        <FileUpload file={file} onFileChange={setFile} />
        <ModeSelector mode={mode} onModeChange={handleModeChange} />

        <button
          type="button"
          className="btn-process"
          disabled={!file || loading || isDocxSelected}
          onClick={handleProcess}
        >
          {loading ? (
            <>
              <Loader2 className="animate-spin" size={20} /> Processando…
            </>
          ) : (
            <>
              <Rocket size={20} /> Processar
            </>
          )}
        </button>

        {isDocxSelected && (
          <div className="alert alert--warning">
            Formato DOCX está temporariamente desabilitado. Use PDF ou TXT.
          </div>
        )}

        {loading && <LoadingSteps />}

        {error && (
          <div className="alert alert--error">
            <AlertTriangle size={20} /> {error}
          </div>
        )}

        {analysisResult && (
          <div className="results">
            <div className="alert alert--success">
              <CheckCircle2 size={20} /> Análise concluída!
            </div>

            <Suspense fallback={null}>
              {analysisResult.score != null && (
                <ScoreCard
                  score={analysisResult.score}
                  nivel={analysisResult.nivel_classificado}
                  justificativa={analysisResult.justificativa_score}
                />
              )}

              <ResultTabs
                pontosFortes={analysisResult.pontos_fortes}
                pontosFracos={analysisResult.pontos_fracos}
                sugestoesPraticas={analysisResult.sugestoes_praticas}
                avaliacaoGeral={analysisResult.avaliacao_geral}
              />
            </Suspense>

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
              <Download size={20} /> Baixar análise (.txt)
            </button>
          </div>
        )}

        {pdfBlob && (
          <div className="results">
            <div className="alert alert--success">
              <CheckCircle2 size={20} /> Currículo ajustado com sucesso!
            </div>
            <button
              type="button"
              className="btn-download"
              onClick={() => downloadFile(pdfBlob, 'curriculo_ajustado.pdf')}
            >
              <Download size={20} /> Baixar currículo ajustado (PDF)
            </button>
          </div>
        )}

        <Footer />
      </div>
    </div>
  );
}
