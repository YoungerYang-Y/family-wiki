# Spec: mermaid-charts

Mermaid 图表能力 —— 构建期 SVG 渲染 + 降级处理。

关联能力: [markdown-rendering](../markdown-rendering/spec.md)

## ADDED Requirements

### Requirement: 构建期 Mermaid SVG 渲染

系统 MUST 在构建期通过 rehype-mermaid 插件将 Mermaid 代码块转换为内联 SVG，SHALL NOT 依赖客户端 JS 运行时。

#### Scenario: Flowchart 渲染

- **Given**: 文章包含 ````mermaid` 代码块，内容为 flowchart 语法
- **When**: 执行 `npm run build` 并访问该文章
- **Then**: 代码块被替换为内联 SVG 图形
- **And**: 页面不加载 Mermaid JS 库

#### Scenario: Sequence Diagram 渲染

- **Given**: 文章包含 sequence diagram 语法的 Mermaid 代码块
- **When**: 构建并访问
- **Then**: 正确渲染为序列图 SVG

#### Scenario: Gantt Chart 渲染

- **Given**: 文章包含 gantt chart 语法的 Mermaid 代码块
- **When**: 构建并访问
- **Then**: 正确渲染为甘特图 SVG

### Requirement: Mermaid 渲染降级

构建期渲染失败时 MUST NOT 阻断构建，SHALL 提供降级展示。

#### Scenario: 语法错误降级

- **Given**: 文章包含语法错误的 Mermaid 代码块
- **When**: 执行 `npm run build`
- **Then**: 构建不中断，该代码块保留为普通代码块展示
- **And**: 构建日志输出警告信息

### Requirement: Mermaid SVG 展示优化

Mermaid SVG 图表 MUST 支持暗色模式适配。

#### Scenario: 暗色模式适配

- **Given**: 用户切换到暗色模式
- **When**: 查看包含 Mermaid 图表的文章
- **Then**: SVG 图表配色自动适配暗色主题
