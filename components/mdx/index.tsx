import type { MDXComponents } from 'mdx/types';
import Link from 'next/link';
import React from 'react';
import { cn } from '@/lib/utils';
import { MermaidChartWrapper, MermaidInsideWrapperContext } from './mermaid-chart-wrapper';
import { MermaidFallback } from './mermaid-fallback';

type HeadingTag = 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';

function createHeading(level: 1 | 2 | 3 | 4 | 5 | 6) {
  const Tag = `h${level}` as HeadingTag;
  return function MDXHeading({ children, className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
    return (
      <Tag className={cn('scroll-mt-20 font-semibold', level === 1 && 'text-2xl mt-8 mb-4', level === 2 && 'text-xl mt-6 mb-3', level >= 3 && 'text-lg mt-4 mb-2', className)} {...props}>
        {children}
      </Tag>
    );
  };
}

export const mdxComponents: MDXComponents = {
  h1: createHeading(1),
  h2: createHeading(2),
  h3: createHeading(3),
  h4: createHeading(4),
  h5: createHeading(5),
  h6: createHeading(6),
  a: ({ href, children, ...props }) => {
    if (!href) return <a {...props}>{children}</a>;
    const isExternal = href.startsWith('http');
    if (isExternal) {
      return (
        <a href={href} target="_blank" rel="noopener noreferrer" className="text-primary underline underline-offset-4 hover:no-underline" {...props}>
          {children}
        </a>
      );
    }
    return (
      <Link href={href} className="text-primary underline underline-offset-4 hover:no-underline" {...props}>
        {children}
      </Link>
    );
  },
  img: function MdxImg({ src, alt, id, ...props }) {
    const srcStr = src ?? '';
    const isMermaid =
      (typeof id === 'string' && id.startsWith('mermaid-')) ||
      (typeof srcStr === 'string' && (srcStr.startsWith('data:image/svg') || srcStr.startsWith('data:image/xml+svg')));
    const insideWrapper = React.useContext(MermaidInsideWrapperContext);
    if (isMermaid && !insideWrapper) {
      return (
        <MermaidChartWrapper>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={srcStr} alt={alt ?? ''} id={id} className="max-w-full h-auto" {...props} />
        </MermaidChartWrapper>
      );
    }
    if (isMermaid && insideWrapper) {
      return (
        /* eslint-disable-next-line @next/next/no-img-element */
        <img src={src ?? ''} alt={alt ?? ''} id={id} className="max-w-full h-auto" {...props} />
      );
    }
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img src={srcStr} alt={alt ?? ''} className="rounded-lg border max-w-full h-auto" {...props} />
    );
  },
  picture: ({ children, ...props }) => {
    const hasMermaidChild = React.Children.toArray(children).some(
      (c) => React.isValidElement(c) && (c.props?.id?.startsWith?.('mermaid-') ?? c.props?.srcset?.includes?.('svg'))
    );
    if (hasMermaidChild) {
      return (
        <MermaidChartWrapper>
          <picture {...props}>{children}</picture>
        </MermaidChartWrapper>
      );
    }
    return <picture {...props}>{children}</picture>;
  },
  blockquote: ({ children, className, ...props }) => (
    <blockquote className={cn('border-l-4 border-primary pl-4 py-1 my-4 text-muted-foreground italic', className)} {...props}>
      {children}
    </blockquote>
  ),
  table: ({ children, ...props }) => (
    <div className="my-6 overflow-x-auto rounded-md border">
      <table className="w-full text-sm" {...props}>
        {children}
      </table>
    </div>
  ),
  th: ({ children, ...props }) => (
    <th className="border-b bg-muted/50 px-4 py-2 text-left font-medium" {...props}>
      {children}
    </th>
  ),
  td: ({ children, ...props }) => (
    <td className="border-b px-4 py-2" {...props}>
      {children}
    </td>
  ),
  pre: ({ children, className, ...props }) => {
    const cnStr = typeof className === 'string' ? className : Array.isArray(className) ? className.join(' ') : '';
    if (cnStr.includes('mermaid-fallback')) {
      const first = React.Children.toArray(children)[0];
      const codeContent =
        React.isValidElement(first) && first.props?.children != null
          ? typeof first.props.children === 'string'
            ? first.props.children
            : Array.isArray(first.props.children)
              ? first.props.children.join('')
              : ''
          : '';
      return <MermaidFallback code={String(codeContent)} />;
    }
    return (
      <pre className="my-4 overflow-x-auto rounded-lg border bg-muted/30 p-4 text-sm" {...props}>
        {children}
      </pre>
    );
  },
  code: ({ children, className, ...props }) => {
    const isInline = !className;
    if (isInline) {
      return (
        <code className="rounded bg-muted px-1.5 py-0.5 text-sm font-mono" {...props}>
          {children}
        </code>
      );
    }
    return (
      <code className={cn('font-mono text-sm', className)} {...props}>
        {children}
      </code>
    );
  },
};
