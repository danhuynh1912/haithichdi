import type { ReactNode } from 'react';

function renderInlineMarkdown(text: string, keyPrefix: string): ReactNode[] {
  const chunks = text.split(/(\*\*[^*]+\*\*|\*[^*]+\*)/g);

  return chunks.map((chunk, index) => {
    if (chunk.startsWith('**') && chunk.endsWith('**')) {
      return (
        <strong key={`${keyPrefix}-strong-${index}`} className='font-semibold text-white'>
          {chunk.slice(2, -2)}
        </strong>
      );
    }

    if (chunk.startsWith('*') && chunk.endsWith('*')) {
      return (
        <em key={`${keyPrefix}-italic-${index}`} className='italic text-neutral-100'>
          {chunk.slice(1, -1)}
        </em>
      );
    }

    return <span key={`${keyPrefix}-text-${index}`}>{chunk}</span>;
  });
}

export function MarkdownArticle({
  markdown,
  emptyMessage = 'Thông tin đang được cập nhật.',
}: {
  markdown: string;
  emptyMessage?: string;
}) {
  const lines = (markdown || '').replaceAll('\r\n', '\n').split('\n');
  const blocks: ReactNode[] = [];
  const paragraphLines: string[] = [];
  const listLines: string[] = [];

  const flushParagraph = () => {
    if (paragraphLines.length === 0) return;
    const content = paragraphLines.join(' ');
    blocks.push(
      <p key={`paragraph-${blocks.length}`} className='text-sm md:text-base leading-relaxed text-neutral-300'>
        {renderInlineMarkdown(content, `paragraph-${blocks.length}`)}
      </p>,
    );
    paragraphLines.length = 0;
  };

  const flushList = () => {
    if (listLines.length === 0) return;
    const keyBase = `list-${blocks.length}`;
    blocks.push(
      <ul key={keyBase} className='space-y-2 pl-5 list-disc text-sm md:text-base text-neutral-200'>
        {listLines.map((line, index) => (
          <li key={`${keyBase}-item-${index}`} className='leading-relaxed'>
            {renderInlineMarkdown(line, `${keyBase}-item-${index}`)}
          </li>
        ))}
      </ul>,
    );
    listLines.length = 0;
  };

  lines.forEach((rawLine) => {
    const line = rawLine.trim();

    if (!line) {
      flushParagraph();
      flushList();
      return;
    }

    if (line.startsWith('- ')) {
      flushParagraph();
      listLines.push(line.slice(2));
      return;
    }

    flushList();

    if (line.startsWith('### ')) {
      flushParagraph();
      blocks.push(
        <h4 key={`heading3-${blocks.length}`} className='text-lg font-semibold text-white pt-2'>
          {renderInlineMarkdown(line.slice(4), `heading3-${blocks.length}`)}
        </h4>,
      );
      return;
    }

    if (line.startsWith('## ')) {
      flushParagraph();
      blocks.push(
        <h3 key={`heading2-${blocks.length}`} className='text-xl md:text-2xl font-bold text-white pt-2'>
          {renderInlineMarkdown(line.slice(3), `heading2-${blocks.length}`)}
        </h3>,
      );
      return;
    }

    if (line.startsWith('# ')) {
      flushParagraph();
      blocks.push(
        <h2 key={`heading1-${blocks.length}`} className='text-2xl md:text-3xl font-black text-white pt-2'>
          {renderInlineMarkdown(line.slice(2), `heading1-${blocks.length}`)}
        </h2>,
      );
      return;
    }

    paragraphLines.push(line);
  });

  flushParagraph();
  flushList();

  if (blocks.length === 0) {
    return <p className='text-sm md:text-base text-neutral-400'>{emptyMessage}</p>;
  }

  return <div className='space-y-4'>{blocks}</div>;
}
