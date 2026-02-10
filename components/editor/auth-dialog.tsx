'use client';

import * as React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface AuthDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAuthenticated: (token: string) => void;
}

export function AuthDialog({ open, onOpenChange, onAuthenticated }: AuthDialogProps) {
  const [password, setPassword] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState('');
  const inputRef = React.useRef<HTMLInputElement>(null);

  // 每次打开时重置状态
  React.useEffect(() => {
    if (open) {
      setPassword('');
      setError('');
      setLoading(false);
      // 延迟聚焦，确保 Dialog 动画完成后输入框可聚焦
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!password.trim()) {
      setError('请输入密码');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });

      const data = await res.json();

      if (!res.ok || data.code !== 200) {
        const message = data.message || '认证失败';
        setError(message);
        return;
      }

      const { token } = data.data as { token: string; expiresAt: string };

      localStorage.setItem('auth_token', token);
      toast.success('认证成功');
      onAuthenticated(token);
      onOpenChange(false);
    } catch (err) {
      const message = err instanceof Error ? err.message : '网络请求失败，请重试';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !loading) {
      e.preventDefault();
      void handleSubmit(e);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[400px]" showClose={false}>
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>编辑认证</DialogTitle>
            <DialogDescription>请输入编辑密码以继续</DialogDescription>
          </DialogHeader>

          <div className="py-4">
            <Input
              ref={inputRef}
              type="password"
              placeholder="请输入密码"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (error) setError('');
              }}
              onKeyDown={handleKeyDown}
              disabled={loading}
              aria-label="编辑密码"
              autoComplete="current-password"
            />
            {error && (
              <p className="mt-2 text-sm text-destructive" role="alert">
                {error}
              </p>
            )}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              取消
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              确认
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
