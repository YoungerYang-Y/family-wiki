import { MermaidChartWrapper } from '@/components/mdx/mermaid-chart-wrapper';
import { MermaidFallback } from '@/components/mdx/mermaid-fallback';
import { mdxComponents } from '@/components/mdx/index';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import React from 'react';
import { afterEach, describe, expect, it } from 'vitest';

afterEach(() => {
  cleanup();
  // 清除 Radix Dialog portal 残留的 body 属性
  document.body.removeAttribute('data-scroll-locked');
  document.body.removeAttribute('style');
  // 清除 portal 残留节点
  document.body.querySelectorAll('[data-radix-focus-guard], [data-radix-portal]').forEach((el) => el.remove());
  // 恢复 aria-hidden
  document.body.querySelectorAll('[data-aria-hidden]').forEach((el) => {
    el.removeAttribute('aria-hidden');
    el.removeAttribute('data-aria-hidden');
  });
});

describe('MermaidChartWrapper', () => {
  it('renders children and fullscreen button', () => {
    render(
      <MermaidChartWrapper>
        {/* eslint-disable-next-line @next/next/no-img-element -- test fixture: data URL SVG */}
        <img src="data:image/svg+xml,%3Csvg%3E%3C/svg%3E" alt="test" />
      </MermaidChartWrapper>
    );
    expect(screen.getByRole('img', { name: 'test' }).getAttribute('src')).toContain('data:image/svg');
    expect(document.body.contains(screen.getByRole('button', { name: '全屏查看' }))).toBe(true);
  });

  it('opens fullscreen dialog when button clicked', () => {
    render(
      <MermaidChartWrapper>
        {/* eslint-disable-next-line @next/next/no-img-element -- test fixture: data URL SVG */}
        <img src="data:image/svg+xml,test" alt="chart" />
      </MermaidChartWrapper>
    );
    const btns = screen.getAllByRole('button', { name: '全屏查看' });
    fireEvent.click(btns[0]);
    expect(document.body.contains(screen.getByRole('dialog'))).toBe(true);
    expect(document.body.contains(screen.getByRole('button', { name: '关闭全屏' }))).toBe(true);
  });
});

describe('MermaidFallback', () => {
  it('shows code block and render button when no svg', () => {
    const code = 'flowchart LR\n  A --> B';
    const { container } = render(<MermaidFallback code={code} />);
    expect(container.textContent).toContain('flowchart LR');
    expect(container.textContent).toContain('A --> B');
    expect(screen.getByRole('button', { name: '尝试客户端渲染' })).toBeTruthy();
  });

  it('disables button while loading on click', () => {
    const code = 'flowchart LR\n  A --> B';
    render(<MermaidFallback code={code} />);
    const btn = screen.getByRole('button', { name: '尝试客户端渲染' });
    expect((btn as HTMLButtonElement).disabled).toBe(false);
    fireEvent.click(btn);
    expect((btn as HTMLButtonElement).disabled).toBe(true);
  });
});

describe('mdxComponents mermaid mapping', () => {
  it('wraps mermaid img in MermaidChartWrapper', () => {
    const ImgComp = mdxComponents.img as React.ComponentType<{
      src?: string;
      alt?: string;
      id?: string;
    }>;
    const { container } = render(
      <ImgComp src="data:image/svg+xml,test" alt="mermaid" id="mermaid-0" />
    );
    const figure = container.querySelector('figure');
    expect(figure).toBeTruthy();
    expect(document.body.contains(figure!)).toBe(true);
    const img = container.querySelector('img');
    expect(img?.getAttribute('id')).toBe('mermaid-0');
  });

  it('does not wrap normal img in MermaidChartWrapper', () => {
    const ImgComp = mdxComponents.img as React.ComponentType<{
      src?: string;
      alt?: string;
    }>;
    const { container } = render(
      <ImgComp src="https://example.com/photo.jpg" alt="photo" />
    );
    const figure = container.querySelector('figure');
    expect(figure).toBeNull();
    expect(container.querySelector('img')?.getAttribute('src')).toBe('https://example.com/photo.jpg');
  });

  it('renders MermaidFallback for pre with mermaid-fallback class', () => {
    const PreComp = mdxComponents.pre as React.ComponentType<{
      children?: React.ReactNode;
      className?: string;
    }>;
    const codeContent = 'graph TD\n  A-->B';
    const { container } = render(
      <PreComp className="mermaid-fallback my-4 overflow-x-auto rounded-lg border bg-muted/30 p-4 text-sm">
        <code className="language-mermaid">{codeContent}</code>
      </PreComp>
    );
    expect(container.textContent).toContain('graph TD');
    expect(container.textContent).toContain('A-->B');
    // MermaidFallback 被渲染（有"尝试客户端渲染"按钮）
    const renderBtns = screen.getAllByRole('button', { name: '尝试客户端渲染' });
    expect(renderBtns.length).toBeGreaterThan(0);
    expect(document.body.contains(renderBtns[0])).toBe(true);
    // 原始的 <pre class="mermaid-fallback ..."> 被替换为 MermaidFallback 组件
    // MermaidFallback 内部有自己的 <pre>，但没有 mermaid-fallback class
    expect(container.querySelector('pre.mermaid-fallback')).toBeNull();
  });
});
