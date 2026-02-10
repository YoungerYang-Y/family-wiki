"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useParams } from "next/navigation";
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

export default function EditArticlePage() {
  const params = useParams<{ category: string; slug: string }>();
  const category = params.category;
  const slug = params.slug;
  const articleSlug = `${category}/${slug}`;

  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [markdown, setMarkdown] = useState("");
  const [sha, setSha] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [authOpen, setAuthOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const contentRef = useRef("");

  // 从 localStorage 读取 token
  useEffect(() => {
    const storedToken = localStorage.getItem("auth_token");
    setToken(storedToken);
    if (!storedToken) {
      setLoading(false);
    }
  }, []);

  // 加载文章原始内容
  useEffect(() => {
    if (!token) return;

    let cancelled = false;

    async function fetchContent() {
      try {
        const res = await fetch(
          `/api/content/${category}/${slug}?raw=true`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        const json = await res.json();

        if (cancelled) return;

        if (json.code === 200) {
          setMarkdown(json.data.raw);
          setSha(json.data.sha);
          contentRef.current = json.data.raw;

          // 从 frontmatter 提取标题
          const titleMatch = json.data.raw.match(
            /^---[\s\S]*?title:\s*['"]?(.+?)['"]?\s*$/m
          );
          if (titleMatch) {
            setTitle(titleMatch[1]);
          }
        } else if (json.code === 401) {
          setToken(null);
          localStorage.removeItem("auth_token");
          toast.error("认证已过期，请重新登录");
        } else {
          toast.error(json.message || "加载文章失败");
        }
      } catch {
        if (!cancelled) {
          toast.error("加载文章失败，请检查网络连接");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    fetchContent();

    return () => {
      cancelled = true;
    };
  }, [token, category, slug]);

  const handleChange = useCallback((value: string) => {
    contentRef.current = value;
  }, []);

  const doSave = async () => {
    if (!token) return;

    setSaving(true);
    try {
      const res = await fetch("/api/content", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          slug: articleSlug,
          content: contentRef.current,
          message: `docs: update ${articleSlug}`,
          sha: sha ?? undefined,
        }),
      });

      const json = await res.json();

      if (json.code === 201) {
        setSha(json.data.sha);
        toast.success("保存成功");
      } else if (json.code === 409) {
        toast.error("保存冲突：文章已被其他人修改，请刷新页面后重试");
      } else if (json.code === 401) {
        setToken(null);
        localStorage.removeItem("auth_token");
        toast.error("认证已过期，请重新登录");
      } else {
        toast.error(json.message || "保存失败");
      }
    } catch {
      toast.error("保存失败，请检查网络连接");
    } finally {
      setSaving(false);
    }
  };

  const handleSave = () => {
    if (!token) return;
    setConfirmOpen(true);
  };

  const handleConfirmSave = () => {
    setConfirmOpen(false);
    void doSave();
  };

  // 未认证状态
  if (!token) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground mb-4">需要先认证才能编辑文章</p>
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

  // 加载中
  if (loading) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">加载中...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* 顶部操作栏 */}
      <div className="flex items-center justify-between">
        <Link
          href={`/${category}/${slug}`}
          className="text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          &larr; 返回文章
        </Link>
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-primary/90 disabled:opacity-50 transition-colors"
        >
          {saving ? "保存中..." : "保存"}
        </button>
      </div>

      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>确认保存</DialogTitle>
            <DialogDescription>
              确定要将修改保存到仓库吗？保存后将触发站点更新。
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmOpen(false)}>
              取消
            </Button>
            <Button onClick={handleConfirmSave} disabled={saving}>
              {saving ? "保存中..." : "确定保存"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 文章标题（只读） */}
      {title && <h1 className="text-2xl font-bold">{title}</h1>}

      {/* 编辑器 */}
      <MilkdownEditor
        defaultValue={markdown}
        onChange={handleChange}
        className="min-h-[500px]"
      />
    </div>
  );
}
