import { useMemo } from "react";
import katex from "katex";
import { cn } from "@/lib/utils";

interface TexProps {
  children: string;
  display?: boolean;
  className?: string;
}

/**
 * Renders a TeX expression with KaTeX. Errors render inertly rather than
 * throwing, so a malformed expression never takes down the panel. Named `Tex`
 * to avoid shadowing the global `Math` object in consuming modules.
 */
export function Tex({ children, display = false, className }: TexProps) {
  const html = useMemo(() => {
    try {
      return katex.renderToString(children, {
        displayMode: display,
        throwOnError: false,
        strict: false,
        output: "htmlAndMathml",
      });
    } catch {
      return children;
    }
  }, [children, display]);

  return (
    <span
      className={cn(display ? "block" : "inline-block", className)}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
