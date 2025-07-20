
import { useState, useEffect } from 'react';

interface CounterAnimationProps {
  end: number;
  duration?: number;
  start?: number;
  suffix?: string;
  prefix?: string;
  className?: string;
  isVisible?: boolean;
  decimals?: number;
}

export const CounterAnimation = ({ 
  end, 
  duration = 2000, 
  start = 0, 
  suffix = '', 
  prefix = '',
  className = '',
  isVisible = true,
  decimals = 0
}: CounterAnimationProps) => {
  const [count, setCount] = useState(start);

  useEffect(() => {
    if (!isVisible) return;

    let startTime: number;
    let animationFrame: number;

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      
      const easeOutCubic = 1 - Math.pow(1 - progress, 3);
      const currentCount = decimals > 0 
        ? Math.round((easeOutCubic * (end - start) + start) * Math.pow(10, decimals)) / Math.pow(10, decimals)
        : Math.floor(easeOutCubic * (end - start) + start);
      
      setCount(currentCount);

      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate);
      }
    };

    animationFrame = requestAnimationFrame(animate);

    return () => {
      if (animationFrame) {
        cancelAnimationFrame(animationFrame);
      }
    };
  }, [end, duration, start, isVisible]);

  return (
    <span className={`counter-animate ${className}`}>
      {prefix}{count.toLocaleString()}{suffix}
    </span>
  );
};
