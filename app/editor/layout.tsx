// 编辑器独立布局，不包含主站 sidebar/header
export default function EditorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b px-4 py-3 flex items-center justify-between">
        <a href="/" className="text-lg font-semibold">
          Family Wiki
        </a>
        <span className="text-sm text-muted-foreground">编辑器</span>
      </header>
      <main className="flex-1 container mx-auto max-w-4xl px-4 py-6">
        {children}
      </main>
    </div>
  );
}
