import Link from 'next/link';
import { siteConfig } from '@/config/site';
import { ThemeToggle } from '@/components/shared/theme-toggle';

export function Header({ rightSlot }: { rightSlot?: React.ReactNode }) {
  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center justify-between">
        <div className="flex items-center">
          <Link href="/" className="mr-6 flex items-center space-x-2 font-semibold">
            {siteConfig.title}
          </Link>
          <nav className="hidden md:flex items-center gap-6 text-sm">
          {siteConfig.nav.map((item) =>
            item.external ? (
              <a key={item.href} href={item.href} target="_blank" rel="noopener noreferrer">
                {item.label}
              </a>
            ) : (
              <Link key={item.href} href={item.href} className="text-muted-foreground transition-colors hover:text-foreground">
                {item.label}
              </Link>
            )
          )}
          </nav>
        </div>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          {rightSlot}
        </div>
      </div>
    </header>
  );
}
