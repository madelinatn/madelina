import { useEffect, useRef, useState, ReactNode, Key } from 'react';

interface RevealProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  duration?: number;
  y?: number;
  scale?: number;
  once?: boolean;
  'data-preview-index'?: number;
  onClick?: () => void;
  key?: Key;
}

export const Reveal = ({
  children,
  className = '',
  delay = 0,
  duration = 0.6,
  y = 20,
  scale = 1,
  once = true,
  'data-preview-index': previewIndex,
  onClick
}: RevealProps) => {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          if (once && ref.current) {
            observer.unobserve(ref.current);
          }
        } else if (!once) {
          setIsVisible(false);
        }
      },
      { threshold: 0.1 }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, [once]);

  const style = {
    opacity: isVisible ? 1 : 0,
    transform: isVisible
      ? 'translate3d(0, 0, 0) scale(1)'
      : `translate3d(0, ${y}px, 0) scale(${scale})`,
    transition: `opacity ${duration}s cubic-bezier(0.22, 1, 0.36, 1) ${delay}s, transform ${duration}s cubic-bezier(0.22, 1, 0.36, 1) ${delay}s`,
  };

  return (
    <div
      ref={ref}
      className={className}
      style={style}
      data-preview-index={previewIndex}
      onClick={onClick}
    >
      {children}
    </div>
  );
};
