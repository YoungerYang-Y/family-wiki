"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import Link from "next/link";
import { toast } from "sonner";
import { AuthDialog } from "@/components/editor/auth-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

const MilkdownEditor = dynamic(
  () =>
    import("@/components/editor/milkdown-editor").then(
      (mod) => mod.MilkdownEditor
    ),
  { ssr: false, loading: () => <EditorSkeleton /> }
);

function EditorSkeleton() {
  return (
    <div className="border rounded-lg min-h-[500px] flex items-center justify-center text-muted-foreground text-sm">
      编辑器加载中...
    </div>
  );
}

export default function NewArticlePage() {
  const router = useRouter();

  const [token, setToken] = useState<string | null>(null);
  const [publishing, setPublishing] = useState(false);
  const [category, setCategory] = useState("");
  const [slug, setSlug] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [authOpen, setAuthOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const contentRef = useRef("");

  // 从 localStorage 读取 token
  useEffect(() => {
    const storedToken = localStorage.getItem("auth_token");
    setToken(storedToken);
  }, []);

  const handleChange = useCallback((value: string) => {
    contentRef.current = value;
  }, []);

  const doPublish = async () => {
    if (!token) return;

    setPublishing(true);

    // 构建 frontmatter
    const now = new Date().toISOString();
    const frontmatterLines = [
      "---",
      `title: "${title}"`,
      ...(description.trim()
        ? [`description: "${description}"`]
        : []),
      `category: "${category}"`,
      `date: "${now}"`,
      `lastModified: "${now}"`,
      "draft: false",
      "---",
    ];
    const frontmatter = frontmatterLines.join("\n");
    const fullContent = `${frontmatter}\n\n${contentRef.current}`;
    const articleSlug = `${category.trim()}/${slug.trim()}`;

    try {
      const res = await fetch("/api/content", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          slug: articleSlug,
          content: fullContent,
          message: `docs: create ${articleSlug}`,
        }),
      });

      const json = await res.json();

      if (json.code === 201) {
        toast.success("发布成功");
        router.push(`/${articleSlug}`);
      } else if (json.code === 401) {
        setToken(null);
        localStorage.removeItem("auth_token");
        toast.error("认证已过期，请重新登录");
      } else {
        toast.error(json.message || "发布失败");
      }
    } catch {
      toast.error("发布失败，请检查网络连接");
    } finally {
      setPublishing(false);
    }
  };

  const handlePublish = () => {
    if (!token) return;
    if (!category.trim()) {
      toast.error("请输入分类");
      return;
    }
    if (!slug.trim()) {
      toast.error("请输入 Slug");
      return;
    }
    if (!title.trim()) {
      toast.error("请输入标题");
      return;
    }
    setConfirmOpen(true);
  };

  const handleConfirmPublish = () => {
    setConfirmOpen(false);
    void doPublish();
  };

  // 未认证状态
  if (!token) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground mb-4">需要先认证才能创建文章</p>
        <button
          onClick={() => setAuthOpen(true)}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-primary/90"
        >
          输入密码
        </button>
        <div className="mt-2">
          <Link href="/" className="text-sm text-muted-foreground hover:underline">
            返回首页
          </Link>
        </div>
        <AuthDialog
          open={authOpen}
          onOpenChange={setAuthOpen}
          onAuthenticated={(t) => setToken(t)}
        />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* 顶部操作栏 */}
      <div className="flex items-center justify-between">
        <Link
          href="/"
          className="text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          &larr; 返回首页
        </Link>
        <button
          onClick={handlePublish}
          disabled={publishing}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-primary/90 disabled:opacity-50 transition-colors"
        >
          {publishing ? "发布中..." : "发布"}
        </button>
      </div>

      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>确认发布</DialogTitle>
            <DialogDescription>
              确定要将文章发布到仓库吗？发布后将触发站点更新。
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmOpen(false)}>
              取消
            </Button>
            <Button onClick={handleConfirmPublish} disabled={publishing}>
              {publishing ? "发布中..." : "确定发布"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 表单字段 */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="block text-sm font-medium mb-1">分类</label>
          <input
            type="text"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            placeholder="例如: health"
            className="w-full px-3 py-2 border rounded-md text-sm bg-background focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Slug</label>
          <input
            type="text"
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            placeholder="例如: my-article"
            className="w-full px-3 py-2 border rounded-md text-sm bg-background focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">标题</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="文章标题"
          className="w-full px-3 py-2 border rounded-md text-sm bg-background focus:outline-none focus:ring-2 focus:ring-ring"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">
          描述 <span className="text-muted-foreground font-normal">（可选）</span>
        </label>
        <input
          type="text"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="文章简要描述"
          className="w-full px-3 py-2 border rounded-md text-sm bg-background focus:outline-none focus:ring-2 focus:ring-ring"
        />
      </div>

      {/* 编辑器 */}
      <MilkdownEditor
        onChange={handleChange}
        className="min-h-[500px]"
      />
    </div>
  );
}
