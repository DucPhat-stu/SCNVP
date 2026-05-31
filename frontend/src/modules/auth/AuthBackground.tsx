interface Particle {
  id: number;
  size: number;
  x: number;
  y: number;
  duration: number;
  delay: number;
  opacity: number;
}

const PARTICLES: Particle[] = Array.from({ length: 18 }, (_, index) => ({
  id: index,
  size: 2 + (index % 4),
  x: (index * 17 + 11) % 100,
  y: (index * 29 + 7) % 100,
  duration: 18 + (index % 7) * 3,
  delay: -1 * ((index * 5) % 18),
  opacity: 0.16 + (index % 5) * 0.04,
}));

export function AuthBackground() {
  return (
    <div className="auth-bg" aria-hidden="true">
      <div className="auth-bg__grid" />
      <div className="auth-bg__sweep" />
      <div className="auth-bg__map">
        <span className="auth-bg__route auth-bg__route--one" />
        <span className="auth-bg__route auth-bg__route--two" />
        <span className="auth-bg__route auth-bg__route--three" />
      </div>

      {PARTICLES.map((particle) => (
        <span
          key={particle.id}
          className="auth-bg__particle"
          style={{
            width: particle.size,
            height: particle.size,
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            animationDuration: `${particle.duration}s`,
            animationDelay: `${particle.delay}s`,
            opacity: particle.opacity,
          }}
        />
      ))}
    </div>
  );
}
