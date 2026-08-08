import React from 'react';
import { screen } from '@testing-library/react';
import { renderIntl } from '@/test-utils';
import { describe, expect, it } from 'vitest';
import { MarkdownArticle } from './markdown-article';
import viMessages from '@/messages/vi.json';
import enMessages from '@/messages/en.json';

describe('MarkdownArticle', () => {
  it('renders the given empty state when markdown is blank', () => {
    renderIntl(<MarkdownArticle markdown='' emptyMessage='Chưa có dữ liệu' />);

    expect(screen.getByText('Chưa có dữ liệu')).toBeInTheDocument();
  });

  it('falls back to the translated empty state when no message is given', () => {
    renderIntl(<MarkdownArticle markdown='' />);

    expect(
      screen.getByText(viMessages.booking.markdownEmpty),
    ).toBeInTheDocument();
  });

  it('renders the English empty state under the en locale', () => {
    renderIntl(<MarkdownArticle markdown='' />, { locale: 'en' });

    expect(
      screen.getByText(enMessages.booking.markdownEmpty),
    ).toBeInTheDocument();
  });

  it('renders headings, lists and inline styles from markdown text', () => {
    renderIntl(
      <MarkdownArticle
        markdown={`# Tiêu đề lớn
## Tiêu đề phụ
Đây là đoạn **in đậm** và *in nghiêng*.

- Mục 1
- Mục 2`}
      />,
    );

    expect(screen.getByText('Tiêu đề lớn')).toBeInTheDocument();
    expect(screen.getByText('Tiêu đề phụ')).toBeInTheDocument();
    expect(screen.getByText('Mục 1')).toBeInTheDocument();
    expect(screen.getByText('Mục 2')).toBeInTheDocument();
    expect(screen.getByText('in đậm').tagName).toBe('STRONG');
    expect(screen.getByText('in nghiêng').tagName).toBe('EM');
  });
});
