import { useState, useEffect } from 'react';
import './LoadingSteps.css';

const STEPS = [
  { label: 'Enviando currículo…', icon: '📤' },
  { label: 'Extraindo conteúdo…', icon: '📝' },
  { label: 'Analisando com IA…', icon: '🤖' },
  { label: 'Gerando relatório…', icon: '📊' },
];

const STEP_INTERVAL = 4000;

export default function LoadingSteps() {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    if (current >= STEPS.length - 1) return;
    const timer = setTimeout(() => setCurrent((s) => s + 1), STEP_INTERVAL);
    return () => clearTimeout(timer);
  }, [current]);

  return (
    <div className="loading-steps">
      <div className="loading-steps__spinner" />
      <ul className="loading-steps__list">
        {STEPS.map((step, i) => (
          <li
            key={i}
            className={`loading-steps__item ${
              i < current
                ? 'loading-steps__item--done'
                : i === current
                  ? 'loading-steps__item--active'
                  : ''
            }`}
          >
            <span className="loading-steps__icon">
              {i < current ? '✅' : step.icon}
            </span>
            {step.label}
          </li>
        ))}
      </ul>
    </div>
  );
}
