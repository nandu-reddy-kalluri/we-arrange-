import { useState, useRef, useCallback } from "react";

interface UseHoverIntentProps {
  enterDelay?: number;
  leaveDelay?: number;
}

export function useHoverIntent({ enterDelay = 120, leaveDelay = 180 }: UseHoverIntentProps = {}) {
  const [isHovered, setIsHovered] = useState(false);
  const enterTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const leaveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const onMouseEnter = useCallback(() => {
    if (leaveTimeoutRef.current) {
      clearTimeout(leaveTimeoutRef.current);
    }
    
    enterTimeoutRef.current = setTimeout(() => {
      setIsHovered(true);
    }, enterDelay);
  }, [enterDelay]);

  const onMouseLeave = useCallback(() => {
    if (enterTimeoutRef.current) {
      clearTimeout(enterTimeoutRef.current);
    }
    
    leaveTimeoutRef.current = setTimeout(() => {
      setIsHovered(false);
    }, leaveDelay);
  }, [leaveDelay]);

  return { isHovered, onMouseEnter, onMouseLeave };
}
