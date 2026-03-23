import './Hero.css';
import CardSwap, { Card } from './CardSwap';
import Shuffle from './Shuffle';
import RotatingText from './RotatingText';

export default function Hero() {
  return (
    <section className="hero">
      <div className="hero__content">
        <Shuffle
          text="Currículo.AI"
          shuffleDirection="right"
          duration={0.35}
          animationMode="evenodd"
          shuffleTimes={1}
          ease="power3.out"
          stagger={0.03}
          threshold={0.1}
          triggerOnce={true}
          triggerOnHover={true}
          respectReducedMotion={true}
          loop={false}
          loopDelay={0}
          tag="h1"
          className="hero__title"
        />
        <div className="hero__subtitle">
          <span style={{ whiteSpace: 'nowrap' }}>análise direta,</span>
          <RotatingText
            texts={['sem rodeios.', 'focada no essencial.', 'direto ao ponto.']}
            mainClassName="hero__subtitle-rotator"
            staggerFrom={'first'}
            initial={{ y: '100%', opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: '-120%', opacity: 0 }}
            staggerDuration={0.025}
            splitLevelClassName="overflow-hidden"
            transition={{ type: 'spring', damping: 30, stiffness: 400 }}
            rotationInterval={3000}
          />
        </div>
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
