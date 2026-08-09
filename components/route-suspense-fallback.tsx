'use client';

interface RouteSuspenseFallbackProps {
  className?: string;
}

export default function RouteSuspenseFallback({
  className,
}: RouteSuspenseFallbackProps) {
  return (
    <main
      className={`min-h-screen pt-24 px-4 md:px-8 pb-10 bg-elev-0 text-ink-1 ${
        className || ''
      }`}
    >
      <div className='mx-auto max-w-6xl space-y-4'>
        <div className='h-10 w-44 rounded-2xl bg-surface-2 animate-pulse' />
        <div className='h-28 w-full rounded-3xl bg-surface animate-pulse' />
        <div className='h-[360px] w-full rounded-3xl bg-surface animate-pulse' />
      </div>
    </main>
  );
}
