/**
 * One block of structured data.
 *
 * A server component on purpose: this is markup for crawlers, and shipping it
 * through the client bundle would put it on the page a beat after the page
 * itself, for no reader's benefit.
 */
export function JsonLd({ data }: { data: object }) {
  return (
    <script
      type='application/ld+json'
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
