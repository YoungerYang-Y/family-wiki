import Link from 'next/link';
import { siteConfig } from '@/config/site';

export function Footer() {
  return (
    <footer className="border-t py-6 md:py-0">
      <div className="container flex flex-col items-center justify-between gap-4 py-6 md:flex-row">
        <div className="flex flex-wrap justify-center gap-4 text-sm text-muted-foreground">
          {siteConfig.footer.links.map((item) =>
            item.external ? (
              <a key={item.href} href={item.href} target="_blank" rel="noopener noreferrer">
                {item.label}
              </a>
            ) : (
              <Link key={item.href} href={item.href} className="hover:text-foreground">
                {item.label}
              </Link>
            )
          )}
        </div>
        <p className="text-sm text-muted-foreground">{siteConfig.footer.copyright}</p>
      </div>
    </footer>
  );
}
