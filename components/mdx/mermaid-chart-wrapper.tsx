'use client';

import React, { useState, useCallback } from 'react';
import { Maximize2, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from '@/components/ui/dialog';

interface MermaidChartWrapperProps {
  children: React.ReactNode;
  className?: string;
}

/**
 * 包装构建期渲染的 Mermaid SVG（img 或 picture），提供缩放、全屏查看。
 * 暗色模式由 rehype-mermaid 的 picture + media 已处理，此处仅做容器与交互。
 */
export function MermaidChartWrapper({ children, className }: MermaidChartWrapperProps) {
  const [fullscreenOpen, setFullscreenOpen] = useState(false);

  const openFullscreen = useCallback(() => setFullscreenOpen(true), []);
  const closeFullscreen = useCallback(() => setFullscreenOpen(false), []);

  return (
    <figure
      className={cn('my-4 flex flex-col items-center gap-2', className)}
      role="img"
      aria-label="Mermaid 图表"
    >
      <div className="relative inline-block max-w-full overflow-x-auto rounded-lg border bg-muted/20 p-2">
        <div className="flex justify-end">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-8 w-8 shrink-0"
            onClick={openFullscreen}
            aria-label="全屏查看"
          >
            <Maximize2 className="h-4 w-4" />
          </Button>
        </div>
        {children}
      </div>
      <Dialog open={fullscreenOpen} onOpenChange={setFullscreenOpen}>
        <DialogContent
          showClose={false}
          className="max-h-[90vh] max-w-[95vw] overflow-auto border bg-background p-2"
          onPointerDownOutside={closeFullscreen}
          onEscapeKeyDown={closeFullscreen}
        >
          <DialogTitle className="sr-only">Mermaid 图表全屏</DialogTitle>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="absolute right-2 top-2 z-10"
            onClick={closeFullscreen}
            aria-label="关闭全屏"
          >
            <X className="h-5 w-5" />
          </Button>
          <div className="mt-8 flex min-h-[200px] items-center justify-center pt-4">
            {children}
          </div>
        </DialogContent>
      </Dialog>
    </figure>
  );
}
