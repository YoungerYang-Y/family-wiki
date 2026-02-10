'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    const msg = error?.message ?? 'Unknown error';
    const digest = error?.digest;
    console.error('Application error:', digest ? `digest=${digest} message=${msg}` : msg);
  }, [error]);

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 px-4">
      <h1 className="text-2xl font-bold text-foreground">出错了</h1>
      <p className="text-center text-muted-foreground max-w-md">
        {error.message || '页面加载时发生错误，请重试。'}
      </p>
      <div className="flex gap-3">
        <Button onClick={reset} variant="default">
          重试
        </Button>
        <Button asChild variant="outline">
          <Link href="/">返回首页</Link>
        </Button>
      </div>
    </div>
  );
}
