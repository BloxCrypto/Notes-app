import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';

interface TypewriterTextProps {
  texts: string[];
  speed?: number;
  deleteSpeed?: number;
  delay?: number;
  className?: string;
  loop?: boolean;
}

export const TypewriterText = ({
  texts,
  speed = 100,
  deleteSpeed = 50,
  delay = 2000,
  className,
  loop = true
}: TypewriterTextProps) => {
  const [displayText, setDisplayText] = useState('');
  const [textIndex, setTextIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    const currentText = texts[textIndex];
    
    if (isPaused) {
      const pauseTimeout = setTimeout(() => {
        setIsPaused(false);
        setIsDeleting(true);
      }, delay);
      return () => clearTimeout(pauseTimeout);
    }

    const timeout = setTimeout(() => {
      if (!isDeleting) {
        // Typing
        if (displayText.length < currentText.length) {
          setDisplayText(currentText.slice(0, displayText.length + 1));
        } else {
          setIsPaused(true);
        }
      } else {
        // Deleting
        if (displayText.length > 0) {
          setDisplayText(displayText.slice(0, -1));
        } else {
          setIsDeleting(false);
          if (loop) {
            setTextIndex((textIndex + 1) % texts.length);
          }
        }
      }
    }, isDeleting ? deleteSpeed : speed);

    return () => clearTimeout(timeout);
  }, [displayText, textIndex, isDeleting, isPaused, texts, speed, deleteSpeed, delay, loop]);

  return (
    <span className={cn("inline-block", className)}>
      {displayText}
      <span className="animate-pulse ml-1">|</span>
    </span>
  );
};