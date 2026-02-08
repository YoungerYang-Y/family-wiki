import { Breadcrumb } from '@/components/layout/breadcrumb';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { describe, expect, it, vi } from 'vitest';

vi.mock('next/link', () => ({
  default: ({ children, href }: { children: React.ReactNode; href: string }) => <a href={href}>{children}</a>,
}));

describe('Breadcrumb', () => {
  it('renders items with links and current page', () => {
    render(
      <Breadcrumb
        items={[
          { label: '首页', href: '/' },
          { label: '指南', href: '/guide' },
          { label: '示例文章' },
        ]}
      />
    );
    const nav = screen.getByRole('navigation', { name: '面包屑' });
    expect(document.body.contains(nav)).toBe(true);
    const homeLink = screen.getByRole('link', { name: '首页' });
    expect(homeLink.getAttribute('href')).toBe('/');
    const guideLink = screen.getByRole('link', { name: '指南' });
    expect(guideLink.getAttribute('href')).toBe('/guide');
    const current = screen.getByText('示例文章');
    expect(document.body.contains(current)).toBe(true);
  });

  it('renders empty when items is empty', () => {
    const { container } = render(<Breadcrumb items={[]} />);
    expect(container.firstChild).toBeNull();
  });
});
