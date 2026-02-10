/**
 * 声明 mdx/types 模块，供 components/mdx 等处使用。
 * @types/mdx 仅通过 index.d.ts 暴露 *.mdx，未单独暴露 mdx/types 子路径，故在此补充。
 * 使用宽松的组件类型以兼容 MDX 各类内置/自定义组件。
 */
declare module 'mdx/types' {
  import type { ComponentType } from 'react';

  export interface MDXComponents {
    [key: string]: ComponentType<any> | undefined;
  }
}
