import { useState } from 'react';
import './ResultTabs.css';

type TabKey = 'fortes' | 'fracos' | 'sugestoes' | 'avaliacao';

interface Props {
  pontosFortes: string[];
  pontosFracos: string[];
  sugestoesPraticas: string[];
  avaliacaoGeral: string;
}

const TABS: { key: TabKey; label: string }[] = [
  { key: 'fortes', label: '💪 Pontos Fortes' },
  { key: 'fracos', label: '⚠️ Pontos Fracos' },
  { key: 'sugestoes', label: '💡 Sugestões' },
  { key: 'avaliacao', label: '📋 Avaliação Geral' },
];

export default function ResultTabs({
  pontosFortes,
  pontosFracos,
  sugestoesPraticas,
  avaliacaoGeral,
}: Props) {
  const [activeTab, setActiveTab] = useState<TabKey>('fortes');

  function renderList(items: string[], emptyMsg: string) {
    if (!items.length) return <p className="result-tabs__empty">{emptyMsg}</p>;
    return (
      <ul className="result-tabs__list">
        {items.map((item, i) => (
          <li key={i}>{item}</li>
        ))}
      </ul>
    );
  }

  return (
    <div className="result-tabs">
      <div className="result-tabs__header">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            type="button"
            className={`result-tabs__tab ${activeTab === tab.key ? 'result-tabs__tab--active' : ''}`}
            onClick={() => setActiveTab(tab.key)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="result-tabs__content">
        {activeTab === 'fortes' &&
          renderList(pontosFortes, 'Nenhum ponto forte retornado.')}
        {activeTab === 'fracos' &&
          renderList(pontosFracos, 'Nenhum ponto fraco retornado.')}
        {activeTab === 'sugestoes' &&
          renderList(sugestoesPraticas, 'Nenhuma sugestão retornada.')}
        {activeTab === 'avaliacao' &&
          (avaliacaoGeral ? (
            <div className="result-tabs__text">{avaliacaoGeral}</div>
          ) : (
            <p className="result-tabs__empty">Nenhuma avaliação retornada.</p>
          ))}
      </div>
    </div>
  );
}
