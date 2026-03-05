import { useState } from 'react';
import './ResultTabs.css';

interface Props {
  analysis: string;
  suggestions: string;
}

export default function ResultTabs({ analysis, suggestions }: Props) {
  const [activeTab, setActiveTab] = useState<'analysis' | 'suggestions'>(
    'analysis',
  );

  return (
    <div className="result-tabs">
      <div className="result-tabs__header">
        <button
          type="button"
          className={`result-tabs__tab ${activeTab === 'analysis' ? 'result-tabs__tab--active' : ''}`}
          onClick={() => setActiveTab('analysis')}
        >
          📋 Análise
        </button>
        <button
          type="button"
          className={`result-tabs__tab ${activeTab === 'suggestions' ? 'result-tabs__tab--active' : ''}`}
          onClick={() => setActiveTab('suggestions')}
        >
          💡 Sugestões
        </button>
      </div>

      <div className="result-tabs__content">
        {activeTab === 'analysis' ? (
          analysis ? (
            <div className="result-tabs__text">{analysis}</div>
          ) : (
            <p className="result-tabs__empty">Nenhuma análise retornada.</p>
          )
        ) : suggestions ? (
          <div className="result-tabs__text">{suggestions}</div>
        ) : (
          <p className="result-tabs__empty">Nenhuma sugestão retornada.</p>
        )}
      </div>
    </div>
  );
}
