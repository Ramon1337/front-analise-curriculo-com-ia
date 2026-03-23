import './Footer.css';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer__divider" />
      <p className="footer__text">
        Currículo.AI · por Ramon Godinho ·{' '}
        <a
          href="https://www.portfolioramondev.com.br"
          target="_blank"
          rel="noopener noreferrer"
        >
          portfolioramondev.com.br
        </a>
      </p>
    </footer>
  );
}
