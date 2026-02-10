import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function NotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 px-4">
      <h1 className="text-2xl font-bold text-foreground">404</h1>
      <p className="text-muted-foreground">页面不存在，请检查链接或返回首页。</p>
      <Button asChild variant="default">
        <Link href="/">返回首页</Link>
      </Button>
    </div>
  );
}
