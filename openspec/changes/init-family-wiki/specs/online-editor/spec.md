# Spec: online-editor

在线编辑器能力 —— Milkdown 编辑器 + GitHub Contents API 集成 + 密码认证。

关联能力: [content-management](../content-management/spec.md)

## ADDED Requirements

### Requirement: 密码认证

编辑功能 MUST 通过密码认证保护，系统 SHALL 使用 JWT 管理会话。

#### Scenario: 正确密码认证

- **Given**: 用户在编辑页面输入正确密码
- **When**: 提交认证请求 POST /api/auth
- **Then**: 返回 JWT token，token 包含过期时间
- **And**: 后续编辑 API 请求携带该 token

#### Scenario: 错误密码认证

- **Given**: 用户输入错误密码
- **When**: 提交认证请求
- **Then**: 返回 401 错误，提示"密码错误"

#### Scenario: Token 过期

- **Given**: JWT token 已过期
- **When**: 使用该 token 请求编辑 API
- **Then**: 返回 401 错误，需要重新认证

### Requirement: Milkdown 编辑器集成

系统 MUST 集成 Milkdown 作为所见即所得的 Markdown 编辑器，SHALL 支持常用格式和 Mermaid 插入。

#### Scenario: 加载已有文章编辑

- **Given**: 用户已认证，访问 `/editor/cooking/rice`
- **When**: 页面加载完成
- **Then**: Milkdown 编辑器加载该文章的原始 Markdown 内容
- **And**: frontmatter 字段以表单形式展示

#### Scenario: 新建文章

- **Given**: 用户已认证，访问 `/editor`
- **When**: 选择分类并填写 frontmatter
- **Then**: 编辑器显示空白编辑区，可开始编写正文

#### Scenario: 工具栏功能

- **Given**: 编辑器已加载
- **When**: 用户点击工具栏按钮
- **Then**: 支持插入标题、粗体、斜体、链接、图片、代码块、Mermaid 代码块

### Requirement: GitHub Contents API 提交

系统 MUST 通过 GitHub Contents API 将编辑内容保存到仓库，GitHub Token SHALL 仅在服务端使用。

#### Scenario: 更新已有文章

- **Given**: 用户编辑了 `cooking/rice` 的内容
- **When**: 点击发布并确认
- **Then**: API 通过 GitHub Contents API PUT 更新文件
- **And**: 返回新的 SHA 和 commit URL
- **And**: 触发 ISR revalidation

#### Scenario: 创建新文章

- **Given**: 用户创建了新文章 `cooking/noodles`
- **When**: 点击发布并确认
- **Then**: API 通过 GitHub Contents API PUT 创建新文件
- **And**: 文件路径为 `content/cooking/noodles.mdx`

#### Scenario: 编辑冲突处理

- **Given**: 用户正在编辑文章，期间另一方更新了同一文件
- **When**: 用户提交时 SHA 不匹配
- **Then**: 返回 409 Conflict 错误
- **And**: 提示用户"文件已被修改，请刷新后重试"

### Requirement: 发布流程 UI

系统 MUST 提供完整的发布流程 UI，包含密码验证、确认、反馈。

#### Scenario: 发布成功

- **Given**: 用户完成编辑并点击发布
- **When**: 输入密码（如未认证）→ 确认发布
- **Then**: 显示加载状态 → 成功 Toast 提示 → 可选跳转到文章页面

#### Scenario: 发布失败

- **Given**: 用户点击发布，但 GitHub API 返回错误
- **When**: 提交失败
- **Then**: 显示错误 Toast 提示，编辑内容不丢失
