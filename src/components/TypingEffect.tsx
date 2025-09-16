import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';

interface TypingEffectProps {
  text: string;
  speed?: number;
  className?: string;
  onComplete?: () => void;
  showCursor?: boolean;
  cursorChar?: string;
}

export const TypingEffect = ({
  text,
  speed = 50,
  className,
  onComplete,
  showCursor = true,
  cursorChar = '|'
}: TypingEffectProps) => {
  const [displayText, setDisplayText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showCursorBlink, setShowCursorBlink] = useState(true);

  useEffect(() => {
    if (currentIndex < text.length) {
      const timeout = setTimeout(() => {
        setDisplayText(prev => prev + text[currentIndex]);
        setCurrentIndex(prev => prev + 1);
      }, speed);

      return () => clearTimeout(timeout);
    } else if (onComplete) {
      onComplete();
    }
  }, [currentIndex, text, speed, onComplete]);

  useEffect(() => {
    const cursorInterval = setInterval(() => {
      setShowCursorBlink(prev => !prev);
    }, 500);

    return () => clearInterval(cursorInterval);
  }, []);

  return (
    <span className={cn("inline-block", className)}>
      {displayText}
      {showCursor && (
        <span 
          className={cn(
            "inline-block ml-1 transition-opacity duration-100",
            showCursorBlink ? "opacity-100" : "opacity-0"
          )}
        >
          {cursorChar}
        </span>
      )}
    </span>
  );
};