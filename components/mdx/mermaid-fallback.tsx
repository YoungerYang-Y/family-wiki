'use client';

import React, { useState, useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';

interface MermaidFallbackProps {
  code: string;
  className?: string;
}

/**
 * 构建期 Mermaid 渲染失败时的降级展示：保留代码块，并支持客户端懒加载 Mermaid 渲染。
 */
export function MermaidFallback({ code, className }: MermaidFallbackProps) {
  const [svg, setSvg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleRender = async () => {
    if (!code.trim() || loading) return;
    setLoading(true);
    setError(null);
    try {
      const mermaid = (await import('mermaid')).default;
      const id = `mermaid-fallback-${Math.random().toString(36).slice(2, 9)}`;
      mermaid.initialize({
        startOnLoad: false,
        theme: 'base',
        securityLevel: 'loose',
      });
      const { svg: renderedSvg } = await mermaid.render(id, code);
      setSvg(renderedSvg);
    } catch (e) {
      const message = e instanceof Error ? e.message : String(e);
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    return () => {
      setSvg(null);
    };
  }, [code]);

  return (
    <div
      className={cn(
        'my-4 overflow-x-auto rounded-lg border bg-muted/30 p-4 text-sm',
        className
      )}
      ref={containerRef}
    >
      {svg ? (
        <div
          className="mermaid-fallback-rendered flex justify-center [&_svg]:max-w-full"
          dangerouslySetInnerHTML={{ __html: svg }}
        />
      ) : (
        <>
          <pre className="mb-3 whitespace-pre-wrap font-mono text-sm">
            <code className="language-mermaid">{code}</code>
          </pre>
          {error && (
            <p className="mb-2 text-sm text-destructive" role="alert">
              渲染失败: {error}
            </p>
          )}
          <button
            type="button"
            onClick={handleRender}
            disabled={loading}
            className="rounded border bg-muted px-3 py-1.5 text-sm hover:bg-muted/80 disabled:opacity-50"
          >
            {loading ? '渲染中…' : '尝试客户端渲染'}
          </button>
        </>
      )}
    </div>
  );
}
