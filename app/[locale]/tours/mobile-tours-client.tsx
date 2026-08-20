'use client';

import ToursClient from './tours-client';

/**
 * The mobile shell for /tours.
 *
 * It used to toggle between a route browser and the tour list; the tour list is
 * now the only thing this screen does, and routes are reached from the home
 * page or by filtering. What is left is the mobile chrome — narrow gutters, a
 * capped column — around the shared client.
 */
export default function MobileToursClient() {
  return (
    // A div, not a <main>: ToursClient renders the page's <main> itself, and
    // nesting one inside another leaves the document with two main landmarks.
    <div className='min-h-screen bg-elev-0 text-ink-1 text-[11px] pt-24 pb-24 px-4'>
      <div className='mx-auto max-w-lg'>
        <div className='rounded-3xl border border-line bg-surface overflow-hidden'>
          <ToursClient layout='embedded' />
        </div>
      </div>
    </div>
  );
}
