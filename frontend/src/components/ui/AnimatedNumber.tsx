import React, { useEffect, useRef } from 'react';
import { animate } from 'framer-motion';

export function AnimatedNumber({ value }: { value: string | number }) {
  const nodeRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (!nodeRef.current) return;
    
    const strValue = String(value);
    const numericMatch = strValue.match(/-?[0-9]*\.?[0-9]+/);
    
    if (!numericMatch) {
      nodeRef.current.textContent = strValue;
      return;
    }

    const num = parseFloat(numericMatch[0]);
    if (isNaN(num)) {
      nodeRef.current.textContent = strValue;
      return;
    }

    const hasDecimals = numericMatch[0].includes('.');
    const decimalPlaces = hasDecimals ? numericMatch[0].split('.')[1].length : 0;

    const controls = animate(0, num, {
      duration: 1.2,
      ease: "easeOut",
      onUpdate(v) {
        if (!nodeRef.current) return;
        const valStr = v.toFixed(decimalPlaces);
        nodeRef.current.textContent = strValue.replace(numericMatch[0], valStr);
      },
    });

    return () => controls.stop();
  }, [value]);

  return <span ref={nodeRef}>{value}</span>;
}
