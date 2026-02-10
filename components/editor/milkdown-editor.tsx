"use client";

import { useCallback } from "react";
import { Editor, rootCtx, defaultValueCtx, commandsCtx, editorViewCtx } from "@milkdown/core";
import { Milkdown, MilkdownProvider, useEditor } from "@milkdown/react";
import { commonmark } from "@milkdown/preset-commonmark";
import {
  wrapInHeadingCommand,
  toggleStrongCommand,
  toggleLinkCommand,
  createCodeBlockCommand,
  insertImageCommand,
} from "@milkdown/preset-commonmark";
import { gfm } from "@milkdown/preset-gfm";
import { history } from "@milkdown/plugin-history";
import { listener, listenerCtx } from "@milkdown/plugin-listener";
import { nord } from "@milkdown/theme-nord";
import { cn } from "@/lib/utils";
import { Heading1, Heading2, Heading3, Bold, Link, Image, Code, GitBranch } from "lucide-react";
import { Button } from "@/components/ui/button";

interface MilkdownEditorProps {
  defaultValue?: string;
  onChange?: (markdown: string) => void;
  className?: string;
}

function EditorToolbar({
  getEditor,
}: {
  getEditor: () => ReturnType<ReturnType<typeof useEditor>["get"]>;
}) {
  const run = useCallback(
    (fn: (ctx: import("@milkdown/ctx").Ctx) => void) => {
      const editor = getEditor();
      editor?.action(fn);
    },
    [getEditor]
  );

  const wrapHeading = (level: 1 | 2 | 3) => () =>
    run((ctx) => ctx.get(commandsCtx).call(wrapInHeadingCommand.key, level));

  // 插入 Mermaid 代码块：先创建代码块，再尝试将语言设为 mermaid
  const insertMermaid = () => {
    run((ctx) => {
      const commands = ctx.get(commandsCtx);
      commands.call(createCodeBlockCommand.key);
      try {
        const view = ctx.get(editorViewCtx);
        const { state, dispatch } = view;
        const $ = state.selection.$from;
        const pos = $.before($.depth);
        const node = state.doc.nodeAt(pos);
        if (node?.type.name === "code_block") {
          const tr = state.tr.setNodeMarkup(pos, undefined, {
            ...node.attrs,
            language: "mermaid",
          });
          dispatch(tr);
        }
      } catch {
        // 回退：仅插入代码块，用户可手动选 mermaid 语言
      }
    });
  };

  return (
    <div className="flex flex-wrap items-center gap-0.5 border-b bg-muted/30 px-2 py-1">
      <Button
        type="button"
        variant="ghost"
        size="sm"
        className="h-8 w-8 p-0"
        onClick={wrapHeading(1)}
        title="一级标题"
      >
        <Heading1 className="h-4 w-4" />
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        className="h-8 w-8 p-0"
        onClick={wrapHeading(2)}
        title="二级标题"
      >
        <Heading2 className="h-4 w-4" />
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        className="h-8 w-8 p-0"
        onClick={wrapHeading(3)}
        title="三级标题"
      >
        <Heading3 className="h-4 w-4" />
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        className="h-8 w-8 p-0"
        onClick={() => run((ctx) => ctx.get(commandsCtx).call(toggleStrongCommand.key))}
        title="粗体"
      >
        <Bold className="h-4 w-4" />
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        className="h-8 w-8 p-0"
        onClick={() => run((ctx) => ctx.get(commandsCtx).call(toggleLinkCommand.key))}
        title="链接"
      >
        <Link className="h-4 w-4" />
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        className="h-8 w-8 p-0"
        onClick={() =>
          run((ctx) =>
            ctx.get(commandsCtx).call(insertImageCommand.key, {
              src: "",
              alt: "",
            })
          )
        }
        title="图片"
      >
        <Image className="h-4 w-4" />
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        className="h-8 w-8 p-0"
        onClick={() => run((ctx) => ctx.get(commandsCtx).call(createCodeBlockCommand.key))}
        title="代码块"
      >
        <Code className="h-4 w-4" />
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        className="h-8 w-8 p-0"
        onClick={insertMermaid}
        title="Mermaid 图表"
      >
        <GitBranch className="h-4 w-4" />
      </Button>
    </div>
  );
}

function MilkdownEditorInner({
  defaultValue = "",
  onChange,
}: Omit<MilkdownEditorProps, "className">) {
  const editorCallback = useCallback(
    (root: HTMLElement) => {
      return Editor.make()
        .config((ctx) => {
          ctx.set(rootCtx, root);
          ctx.set(defaultValueCtx, defaultValue);

          if (onChange) {
            const listenerManager = ctx.get(listenerCtx);
            listenerManager.markdownUpdated((_ctx, markdown, prevMarkdown) => {
              if (markdown !== prevMarkdown) {
                onChange(markdown);
              }
            });
          }
        })
        .use(nord)
        .use(commonmark)
        .use(gfm)
        .use(history)
        .use(listener);
    },
    [defaultValue, onChange]
  );

  const { loading, get } = useEditor(editorCallback);

  return (
    <>
      {!loading && get && <EditorToolbar getEditor={get} />}
      <Milkdown />
    </>
  );
}

export function MilkdownEditor({
  defaultValue,
  onChange,
  className,
}: MilkdownEditorProps) {
  return (
    <div className={cn("border rounded-lg overflow-hidden", className)}>
      <div className="prose dark:prose-invert max-w-none min-h-[300px] p-4">
        <MilkdownProvider>
          <MilkdownEditorInner
            defaultValue={defaultValue}
            onChange={onChange}
          />
        </MilkdownProvider>
      </div>
    </div>
  );
}
