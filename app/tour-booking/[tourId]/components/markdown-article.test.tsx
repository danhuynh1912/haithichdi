import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { MarkdownArticle } from './markdown-article';

describe('MarkdownArticle', () => {
  it('renders empty state when markdown is blank', () => {
    render(<MarkdownArticle markdown='' emptyMessage='Chưa có dữ liệu' />);

    expect(screen.getByText('Chưa có dữ liệu')).toBeInTheDocument();
  });

  it('renders headings, lists and inline styles from markdown text', () => {
    render(
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
