import './ScoreCard.css';

interface Props {
  score: number;
}

export default function ScoreCard({ score }: Props) {
  let colorClass: string;
  let barClass: string;

  if (score >= 7) {
    colorClass = 'score--high';
    barClass = 'bar--high';
  } else if (score >= 4) {
    colorClass = 'score--mid';
    barClass = 'bar--mid';
  } else {
    colorClass = 'score--low';
    barClass = 'bar--low';
  }

  const pct = Math.min((score / 10) * 100, 100);

  return (
    <div className="score-card">
      <div className="score-card__label">Score do currículo</div>
      <div className={`score-card__value ${colorClass}`}>
        {score}
        <span className="score-card__max">/10</span>
      </div>
      <div className="score-card__bar-bg">
        <div
          className={`score-card__bar-fill ${barClass}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
