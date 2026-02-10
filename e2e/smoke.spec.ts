import { test, expect } from '@playwright/test';

/**
 * 端到端冒烟测试：首页 → 文章 → 搜索 → RSS
 * 验证核心浏览与订阅流程（不依赖真实 GitHub，仅公开路由）
 */
test.describe('冒烟：首页 → 文章 → 搜索 → RSS', () => {
  test('首页可访问，展示分类与最近更新', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('heading', { name: 'Family Wiki', level: 1 })).toBeVisible();
    await expect(page.getByText('个人决策型知识库')).toBeVisible();
    // 至少存在分类或最近更新其一
    const hasCategories = await page.getByText('分类').isVisible();
    const hasRecent = await page.getByText('最近更新').isVisible();
    expect(hasCategories || hasRecent).toBeTruthy();
  });

  test('从首页进入文章页可正常渲染', async ({ page }) => {
    await page.goto('/');
    const linkToArticle = page.locator('a[href^="/guide/"]').first();
    if ((await linkToArticle.count()) > 0) {
      await linkToArticle.click();
    } else {
      await page.goto('/guide/example');
    }
    await page.waitForLoadState('networkidle');
    const h1 = page.getByRole('heading', { level: 1 }).first();
    await expect(h1).toBeVisible({ timeout: 5000 });
  });

  test('搜索可打开并输入', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: /搜索/ }).click();
    const searchInput = page.getByPlaceholder('搜索…');
    await expect(searchInput).toBeVisible({ timeout: 3000 });
    await searchInput.fill('示例');
    await expect(searchInput).toHaveValue('示例');
  });

  test('RSS feed 返回有效 XML', async ({ request }) => {
    const res = await request.get('/feed.xml');
    expect(res.ok()).toBeTruthy();
    const text = await res.text();
    expect(text).toMatch(/<\?xml/);
    expect(text).toMatch(/<rss|<\/rss>|<channel|<\/channel>/);
  });

  test('Atom feed 返回有效 XML', async ({ request }) => {
    const res = await request.get('/feed.atom');
    expect(res.ok()).toBeTruthy();
    const text = await res.text();
    expect(text).toMatch(/<\?xml/);
    expect(text).toMatch(/feed|atom/);
  });

  test('sitemap.xml 可访问', async ({ request }) => {
    const res = await request.get('/sitemap.xml');
    expect(res.ok()).toBeTruthy();
    const text = await res.text();
    expect(text).toMatch(/<urlset|<\/urlset>|<url>/);
  });

  test('robots.txt 可访问并包含 Sitemap', async ({ request }) => {
    const res = await request.get('/robots.txt');
    expect(res.ok()).toBeTruthy();
    const text = await res.text();
    expect(text).toMatch(/Sitemap:/i);
  });

  test('404 页面展示自定义内容', async ({ page }) => {
    const res = await page.goto('/non-existent-page-404');
    expect(res?.status()).toBe(404);
    await expect(page.getByText('404')).toBeVisible();
    await expect(page.getByRole('link', { name: '返回首页' })).toBeVisible();
  });
});
