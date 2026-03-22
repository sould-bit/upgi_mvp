import playerImage from '../../../img/personapadel.png';
import racketImage from '../../../img/raquetapadel.png';
import venueImage from '../../../img/ultimatepadel.png';

function HeroSection() {
  return (
    // Este hero mezcla texto e imagenes para abrir la pagina principal.
    <section className="hero-section">
      <div className="container hero-grid">
        <article className="hero-copy-card">
          <span className="eyebrow">Proyecto de componentes</span>
          <h1>UPGI en React + TSX para practicar arquitectura por componentes.</h1>
        </article>

        {/* Imagen principal mas grande */}
        <figure className="hero-image-card hero-image-tall">
          <img alt="Jugador de padel" src={playerImage} />
        </figure>

        {/* Imagenes de apoyo */}
        <figure className="hero-image-card">
          <img alt="Raqueta de padel" src={racketImage} />
        </figure>

        <figure className="hero-image-card">
          <img alt="Instalaciones de UPGI" src={venueImage} />
        </figure>
      </div>
    </section>
  );
}

export default HeroSection;
