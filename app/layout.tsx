import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from '@/components/ui/sonner';
import { ThemeProvider } from '@/components/shared/theme-provider';
import { Header } from '@/components/layout/header';
import { Sidebar } from '@/components/layout/sidebar';
import { Footer } from '@/components/layout/footer';
import { getSidebarCategories } from '@/lib/categories';
import { allWikis } from 'contentlayer/generated';

export const metadata: Metadata = {
  title: 'Family Wiki',
  description: '个人决策型知识库',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const posts = allWikis.filter((doc) => !doc.draft);
  const sidebarCategories = getSidebarCategories(posts);

  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <body className="min-h-screen antialiased flex flex-col">
        <ThemeProvider>
        <Header rightSlot={<Sidebar categories={sidebarCategories} mobile />} />
        <div className="flex flex-1">
          <div className="hidden md:block">
            <Sidebar categories={sidebarCategories} />
          </div>
          <main className="flex-1 min-w-0 px-4 py-6 md:px-8">{children}</main>
        </div>
        <Footer />
        <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
