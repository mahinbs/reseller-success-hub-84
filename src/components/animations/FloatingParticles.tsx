
import { useMemo } from 'react';

interface Particle {
  id: number;
  size: number;
  left: number;
  top: number;
  animationDelay: number;
  animationDuration: number;
}

interface FloatingParticlesProps {
  count?: number;
  className?: string;
}

export const FloatingParticles = ({ count = 6, className = '' }: FloatingParticlesProps) => {
  const particles = useMemo(() => {
    return Array.from({ length: count }, (_, i) => ({
      id: i,
      size: Math.random() * 100 + 50,
      left: Math.random() * 100,
      top: Math.random() * 100,
      animationDelay: Math.random() * 8,
      animationDuration: Math.random() * 10 + 15,
    }));
  }, [count]);

  return (
    <div className={`absolute inset-0 pointer-events-none ${className}`}>
      {particles.map((particle) => (
        <div
          key={particle.id}
          className="floating-orb bg-gradient-to-r from-primary/20 to-purple-500/20"
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
  );
};
