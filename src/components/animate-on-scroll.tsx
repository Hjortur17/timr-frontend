"use client";

import { type ElementType, type ReactNode, useEffect, useRef, useState } from "react";
import { cn } from "@/utils/classname";

interface AnimateOnScrollProps {
  children: ReactNode;
  className?: string;
  delay?: string;
  threshold?: number;
  once?: boolean;
  as?: ElementType;
}

export default function AnimateOnScroll({
  children,
  className = "",
  delay,
  threshold = 0.1,
  once = true,
  as: Tag = "div",
}: AnimateOnScrollProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          if (once) observer.disconnect();
        }
      },
      { threshold },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold, once]);

  return (
    <Tag
      ref={ref}
      className={cn("opacity-0", visible && `animate-in opacity-100 fill-mode-forwards ${className}`, delay)}
    >
      {children}
    </Tag>
  );
}
