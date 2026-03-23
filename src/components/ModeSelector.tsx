import { Search, PenLine } from 'lucide-react';
import './ModeSelector.css';

export type Mode = 'analysis' | 'adjust';

interface Props {
  mode: Mode;
  onModeChange: (mode: Mode) => void;
}

export default function ModeSelector({ mode, onModeChange }: Props) {
  return (
    <div className="mode-selector">
      <h3 className="mode-selector__title">
        Como deseja processar seu currículo?
      </h3>
      <div className="mode-selector__options">
        <label
          className={`mode-option ${mode === 'analysis' ? 'mode-option--active' : ''}`}
        >
          <input
            type="radio"
            name="mode"
            value="analysis"
            checked={mode === 'analysis'}
            onChange={() => onModeChange('analysis')}
          />
          <span>
            <Search size={18} color="#60a5fa" /> Apenas análise
          </span>
        </label>
        <label
          className={`mode-option ${mode === 'adjust' ? 'mode-option--active' : ''}`}
        >
          <input
            type="radio"
            name="mode"
            value="adjust"
            checked={mode === 'adjust'}
            onChange={() => onModeChange('adjust')}
          />
          <span>
            <PenLine size={18} color="#f87171" /> Analisar e ajustar
          </span>
        </label>
      </div>
    </div>
  );
}
