'use client';

import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { cn } from '@/lib/utils';
import { Menu } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export interface SidebarCategory {
  name: string;
  label: string;
  icon?: string;
  count: number;
}

interface SidebarProps {
  categories: SidebarCategory[];
  className?: string;
  mobile?: boolean;
}

function SidebarNav({ categories, currentPath }: { categories: SidebarProps['categories']; currentPath: string }) {
  return (
    <nav className="space-y-1">
      <Link
        href="/"
        className={cn(
          'block rounded-md px-3 py-2 text-sm font-medium transition-colors',
          currentPath === '/' ? 'bg-accent text-accent-foreground' : 'text-muted-foreground hover:bg-accent/50 hover:text-foreground'
        )}
      >
        首页
      </Link>
      <Link
        href="/tags"
        className={cn(
          'block rounded-md px-3 py-2 text-sm font-medium transition-colors',
          currentPath.startsWith('/tags') ? 'bg-accent text-accent-foreground' : 'text-muted-foreground hover:bg-accent/50 hover:text-foreground'
        )}
      >
        标签
      </Link>
      {categories.map((cat) => {
        const href = `/${cat.name}`;
        const isActive = currentPath === href || (currentPath.startsWith(href + '/') && currentPath.length > href.length + 1);
        return (
          <Link
            key={cat.name}
            href={href}
            className={cn(
              'flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors',
              isActive ? 'bg-accent text-accent-foreground' : 'text-muted-foreground hover:bg-accent/50 hover:text-foreground'
            )}
          >
            {cat.icon && <span>{cat.icon}</span>}
            <span>{cat.label}</span>
            <span className="ml-auto text-xs opacity-70">({cat.count})</span>
          </Link>
        );
      })}
    </nav>
  );
}

export function Sidebar({ categories, className, mobile = false }: SidebarProps) {
  const pathname = usePathname();

  if (mobile) {
    return (
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon" className="md:hidden" aria-label="打开菜单">
            <Menu className="h-5 w-5" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-64 pt-10">
          <SidebarNav categories={categories} currentPath={pathname ?? ''} />
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <aside className={cn('w-56 shrink-0 border-r pr-4', className)}>
      <SidebarNav categories={categories} currentPath={pathname ?? ''} />
    </aside>
  );
}
