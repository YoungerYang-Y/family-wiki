import { test, expect } from '@playwright/test';

const MOCK_TOKEN = 'mock-jwt-token-for-e2e';

test.describe('编辑器 E2E：打开编辑页 → 密码验证 → 提交成功', () => {
  test.beforeEach(async ({ page }) => {
    // Mock API：认证成功
    await page.route('**/api/auth', async (route) => {
      if (route.request().method() === 'POST') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            code: 200,
            data: {
              token: MOCK_TOKEN,
              expiresAt: new Date(Date.now() + 86400000).toISOString(),
            },
            message: '认证成功',
          }),
        });
      } else {
        await route.fallback();
      }
    });

    // Mock API：获取内容（编辑页用）
    await page.route(/\/api\/content\/.*\?raw=true/, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          code: 200,
          data: {
            slug: 'guide/e2e-test',
            raw: '---\ntitle: E2E Test\n---\n\n# Hello',
            sha: 'mock-sha-123',
            lastModified: new Date().toISOString(),
          },
          message: 'ok',
        }),
      });
    });

    // Mock API：发布内容成功
    await page.route('**/api/content', async (route) => {
      if (route.request().method() === 'POST') {
        await route.fulfill({
          status: 201,
          contentType: 'application/json',
          body: JSON.stringify({
            code: 201,
            data: {
              slug: 'guide/e2e-article',
              sha: 'new-sha-456',
              commitUrl: 'https://github.com/test/commit/abc',
            },
            message: '内容已保存',
          }),
        });
      } else {
        await route.fallback();
      }
    });
  });

  test('新建页：未认证时显示“输入密码”，认证后显示表单并可发布', async ({
    page,
  }) => {
    await page.goto('/editor');

    // 未认证：看到提示与按钮
    await expect(
      page.getByText('需要先认证才能创建文章')
    ).toBeVisible();
    await page.getByRole('button', { name: '输入密码' }).click();

    // 密码 Dialog
    const dialog = page.getByRole('dialog');
    await expect(dialog.getByText('编辑认证')).toBeVisible();
    await dialog.getByPlaceholder('请输入密码').fill('any-password');
    await dialog.getByRole('button', { name: '确认' }).click();

    // 认证成功后应看到新建表单
    await expect(page.getByLabel('分类')).toBeVisible({ timeout: 5000 });
    await expect(page.getByLabel('Slug')).toBeVisible();
    await expect(page.getByLabel('标题')).toBeVisible();

    // 填写并发布
    await page.getByLabel('分类').fill('guide');
    await page.getByLabel('Slug').fill('e2e-article');
    await page.getByLabel('标题').fill('E2E 测试文章');
    await page.getByRole('button', { name: '发布' }).click();

    // 确认发布 Dialog
    await expect(page.getByRole('dialog').getByText('确认发布')).toBeVisible({ timeout: 3000 });
    await page.getByRole('button', { name: '确定发布' }).click();

    // 发布成功：应跳转到文章页或出现成功提示
    await expect(
      page.getByText('发布成功').or(page.locator('h1'))
    ).toBeVisible({ timeout: 10000 });
  });

  test('编辑页：未认证时显示“输入密码”，认证后显示编辑器与保存', async ({
    page,
  }) => {
    await page.goto('/editor/guide/mermaid-example');

    // 未认证
    await expect(
      page.getByText('需要先认证才能编辑文章')
    ).toBeVisible();
    await page.getByRole('button', { name: '输入密码' }).click();

    const dialog = page.getByRole('dialog');
    await expect(dialog.getByText('编辑认证')).toBeVisible();
    await dialog.getByPlaceholder('请输入密码').fill('any-password');
    await dialog.getByRole('button', { name: '确认' }).click();

    // 认证后应看到编辑界面：返回文章、保存按钮、编辑器区域
    await expect(
      page.getByRole('link', { name: '返回文章' }).or(page.getByRole('button', { name: '保存' }))
    ).toBeVisible({ timeout: 10000 });

    await page.getByRole('button', { name: '保存' }).click();

    // 确认保存 Dialog
    await expect(page.getByRole('dialog').getByText('确认保存')).toBeVisible({ timeout: 3000 });
    await page.getByRole('button', { name: '确定保存' }).click();

    // 保存成功
    await expect(page.getByText('保存成功')).toBeVisible({ timeout: 5000 });
  });
});
