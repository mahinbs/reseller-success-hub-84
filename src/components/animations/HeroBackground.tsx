
import { useMemo } from 'react';

interface AtmosphericParticle {
  id: number;
  size: number;
  left: number;
  top: number;
  animationDelay: number;
  animationDuration: number;
}

interface HeroBackgroundProps {
  className?: string;
}

export const HeroBackground = ({ className = '' }: HeroBackgroundProps) => {
  const atmosphericParticles = useMemo(() => {
    return Array.from({ length: 12 }, (_, i) => ({
      id: i,
      size: Math.random() * 4 + 2, // 2-6px
      left: Math.random() * 100,
      top: Math.random() * 100,
      animationDelay: Math.random() * 12,
      animationDuration: Math.random() * 8 + 12, // 12-20s
    }));
  }, []);

  return (
    <div className={`hero-background ${className}`}>
      {/* Mesh Gradient Layer */}
      <div className="mesh-gradient" />
      
      {/* Edge Glow Effect */}
      <div className="edge-glow" />
      
      {/* Atmospheric Particles */}
      <div className="atmospheric-particles">
        {atmosphericParticles.map((particle) => (
          <div
            key={particle.id}
            className="atmospheric-particle"
            style={{
              width: `${particle.size}px`,
              height: `${particle.size}px`,
              left: `${particle.left}%`,
              top: `${particle.top}%`,
              animationDelay: `${particle.animationDelay}s`,
              animationDuration: `${particle.animationDuration}s`,
            }}
          />
        ))}
      </div>
    </div>
  );
};
