'use client';

import { useMDXComponent } from 'next-contentlayer2/hooks';
import { mdxComponents } from './index';

interface MdxContentProps {
  code: string;
}

export function MdxContent({ code }: MdxContentProps) {
  const MDXComponent = useMDXComponent(code);
  return <MDXComponent components={mdxComponents} />;
}
