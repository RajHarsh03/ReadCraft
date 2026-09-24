import { useMemo } from "react";
import { marked } from "marked";
import "github-markdown-css/github-markdown-dark.css";

/**
 * Renders Markdown exactly the way GitHub does, using GitHub's own stylesheet
 * (github-markdown-css) inside a `.markdown-body` container. This makes the
 * preview a true WYSIWYG of a pasted README: the same fonts, spacing, heading
 * sizes, and colors GitHub applies - no custom app styling that wouldn't
 * survive the copy/paste.
 */

marked.setOptions({
  gfm: true,
  breaks: false,
});

interface MarkdownPreviewProps {
  markdown: string;
}

export function MarkdownPreview({ markdown }: MarkdownPreviewProps) {
  const html = useMemo(() => marked.parse(markdown) as string, [markdown]);

  return (
    <div
      className="markdown-body rc-markdown-preview"
      // Content is the user's own README Markdown, rendered locally for preview.
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
