import './Hero.css';
import CardSwap, { Card } from './CardSwap';

export default function Hero() {
  return (
    <section className="hero">
      <div className="hero__content">
        <h1 className="hero__title">Currículo.AI</h1>
        <p className="hero__subtitle">análise direta, sem rodeios.</p>
      </div>

      <div className="hero__animation">
        <CardSwap
          cardDistance={100}
          verticalDistance={100}
          delay={3000}
          pauseOnHover={false}
          width={280}
          height={380}
        >
          <Card>
            <h3>Direto</h3>
            <p>Feedback sem enrolação.</p>
          </Card>
          <Card>
            <h3>Preciso</h3>
            <p>Pontuações claras baseadas no mercado.</p>
          </Card>
          <Card>
            <h3>Eficaz</h3>
            <p>Seu currículo pronto para os melhores ATS.</p>
          </Card>
        </CardSwap>
      </div>
    </section>
  );
}
