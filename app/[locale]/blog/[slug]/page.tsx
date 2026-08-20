import { notFound } from 'next/navigation';
import Image from 'next/image';
import { getFormatter, getTranslations, setRequestLocale } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { localizedPath, routing, type Locale } from '@/i18n/routing';
import { createMetadata, SITE_NAME, SITE_URL } from '@/lib/seo';
import { blogService } from '@/lib/services/blog';
import { MarkdownContent } from '@/components/markdown-content';

type PageProps = { params: Promise<{ locale: Locale; slug: string }> };

/**
 * Pre-render every published post. Draft posts are invisible to the anon key
 * that reads here, so a draft can never leak into the build output.
 */
export async function generateStaticParams() {
  const posts = await blogService
    .getPosts(routing.defaultLocale)
    .catch(() => []);
  return posts.map((post) => ({ slug: post.slug }));
}

// A post edited in the admin panel should appear without a redeploy.
export const revalidate = 60;

export async function generateMetadata({ params }: PageProps) {
  const { locale, slug } = await params;
  const post = await blogService.getPost(locale, slug).catch(() => null);

  if (!post) {
    const t = await getTranslations({ locale, namespace: 'metadata.blog' });
    return createMetadata({
      locale,
      pathname: `/blog/${slug}`,
      title: t('title'),
      description: t('description'),
    });
  }

  return createMetadata({
    locale,
    pathname: `/blog/${post.slug}`,
    title: post.title,
    description: post.excerpt,
    images: post.hero_url ? [post.hero_url] : undefined,
  });
}

export default async function Page({ params }: PageProps) {
  const { locale, slug } = await params;
  setRequestLocale(locale);

  const post = await blogService.getPost(locale, slug);
  if (!post) notFound();

  const t = await getTranslations({ locale, namespace: 'blog' });
  const format = await getFormatter({ locale });

  // Tells Google this is an article rather than a generic page — the difference
  // between a plain result and one with a date and image attached.
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.excerpt,
    image: post.hero_url ? [post.hero_url] : undefined,
    datePublished: post.published_at,
    dateModified: post.updated_at,
    author: { '@type': 'Organization', name: SITE_NAME },
    publisher: { '@type': 'Organization', name: SITE_NAME },
    mainEntityOfPage: new URL(
      localizedPath(`/blog/${post.slug}`, locale),
      SITE_URL,
    ).toString(),
  };

  return (
    <main className='min-h-screen bg-elev-0 text-ink-1'>
      <script
        type='application/ld+json'
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <article className='mx-auto max-w-3xl px-4 pt-24 pb-20 md:px-8'>
        <Link
          href='/blog'
          className='text-sm font-medium text-brand-soft hover:text-brand'
        >
          ← {t('backToList')}
        </Link>

        <header className='mt-6'>
          {post.tags.length > 0 && (
            <div className='mb-4 flex flex-wrap gap-2'>
              {post.tags.map((tag) => (
                <span
                  key={tag.id}
                  className='rounded-full border border-line bg-surface px-3 py-1 text-xs font-medium uppercase tracking-wider text-brand-soft'
                >
                  {tag.name}
                </span>
              ))}
            </div>
          )}

          <h1 className='text-3xl font-black leading-tight md:text-5xl'>{post.title}</h1>

          {post.published_at ? (
            <time
              dateTime={post.published_at}
              className='mt-4 block text-sm text-ink-4'
            >
              {format.dateTime(new Date(post.published_at), 'date')}
            </time>
          ) : null}

          {post.excerpt ? (
            <p className='mt-5 text-lg leading-relaxed text-ink-3'>{post.excerpt}</p>
          ) : null}
        </header>

        {post.hero_url ? (
          <div className='relative mt-8 aspect-[16/9] overflow-hidden rounded-3xl border border-line bg-elev-3'>
            <Image
              src={post.hero_url}
              alt={post.hero_alt || post.title}
              fill
              priority
              sizes='(max-width: 768px) 100vw, 768px'
              className='object-cover'
            />
          </div>
        ) : null}

        <MarkdownContent
          markdown={post.content_md}
          imageSizes={post.images}
          className='mt-10'
        />
      </article>
    </main>
  );
}
