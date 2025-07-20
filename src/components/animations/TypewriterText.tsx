
import { useState, useEffect } from 'react';

interface TypewriterTextProps {
  text: string;
  speed?: number;
  delay?: number;
  className?: string;
  onComplete?: () => void;
}

export const TypewriterText = ({ 
  text, 
  speed = 100, 
  delay = 0, 
  className = '',
  onComplete 
}: TypewriterTextProps) => {
  const [displayText, setDisplayText] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  useEffect(() => {
    const startTyping = setTimeout(() => {
      setIsTyping(true);
      let index = 0;
      
      const typeTimer = setInterval(() => {
        if (index < text.length) {
          setDisplayText(text.slice(0, index + 1));
          index++;
        } else {
          clearInterval(typeTimer);
          setIsTyping(false);
          onComplete?.();
        }
      }, speed);

      return () => clearInterval(typeTimer);
    }, delay);

    return () => clearTimeout(startTyping);
  }, [text, speed, delay, onComplete]);

  return (
    <span className={`${className} ${isTyping ? 'border-r-2 border-primary' : ''}`}>
      {displayText}
    </span>
  );
};
