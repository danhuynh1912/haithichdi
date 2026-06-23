'use client';

import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'motion/react';
import { type ComponentType } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  ArrowRight,
  Compass,
  HandHeart,
  HeartHandshake,
  Mountain,
  ShieldCheck,
  Sparkles,
  Stars,
} from 'lucide-react';
import { ANIMATION_EASE } from '@/lib/constants';
import { homeService } from '@/lib/services/home';
import { cn, slugify } from '@/lib/utils';
import {
  buildHomeFeaturedRoutesViewModel,
  formatSuitableAudiences,
} from './home-featured-routes-view-model';

type KeywordCard = {
  title: string;
  body: string;
  Icon: ComponentType<{ className?: string }>;
};

type ValueSection = {
  key: string;
  eyebrow: string;
  title: string;
  intro: string;
  bullets: string[];
  outro: string;
  image: string;
  imageAlt: string;
  ctaLabel: string;
  locationName: string;
  difficulty: string;
};

const keywordCards: KeywordCard[] = [
  {
    title: 'Trekking',
    body: 'Chinh phục cung khó, vượt giới hạn thật sự bằng thể lực và tinh thần.',
    Icon: Mountain,
  },
  {
    title: 'Kết nối',
    body: 'Từ người lạ thành đồng đội, đồng hành cùng nhau trên mọi đoạn dốc.',
    Icon: HeartHandshake,
  },
  {
    title: 'Thiện nguyện',
    body: 'Mỗi chuyến đi đều có giá trị để lại cho cộng đồng địa phương.',
    Icon: HandHeart,
  },
];

const impactStats = [
  { label: 'Trekkers đã đồng hành', value: '5000+' },
  { label: 'Hành trình tổ chức', value: '120+' },
  { label: 'Đánh giá trung bình', value: '4.9/5' },
];

const valueSections: ValueSection[] = [
  {
    key: 'trekking',
    eyebrow: 'Trekking',
    title: 'Chinh phục giới hạn thật sự',
    intro:
      'Chúng tôi không tổ chức những chuyến đi cho có trải nghiệm. Hải Thích Đi lựa chọn những cung đường có độ thử thách thật để bạn cảm nhận rõ hành trình vượt giới hạn.',
    bullets: [
      'Lộ trình theo cấp độ: người mới, trung cấp, nâng cao.',
      'Các cung trekking tiêu biểu: Tà Xùa, Phu Sa Phìn, Fansipan, rừng rêu Samu.',
      'Leader đi cùng có kinh nghiệm địa hình, xử lý tình huống thực tế.',
      'Briefing trước chuyến đi về thể lực, kỹ năng và chuẩn bị cá nhân.',
      'Tỷ lệ khách từng nghĩ không leo được nhưng vẫn lên đỉnh rất cao.',
    ],
    outro: 'Không phải ai cũng khỏe từ đầu, nhưng ai cũng có thể mạnh hơn sau chuyến đi.',
    image: '/images/tachinhu1.jpg',
    imageAlt: 'Trekking vượt giới hạn cùng Hải Thích Đi',
    ctaLabel: 'Xem cung trekking',
    locationName: 'Ta Xua',
    difficulty: 'Người mới + trung cấp',
  },
  {
    key: 'ket-noi',
    eyebrow: 'Kết nối',
    title: 'Từ người lạ thành đồng đội',
    intro:
      'Điều đặc biệt nhất của Hải Thích Đi không nằm ở cung đường, mà nằm ở con người. Bạn có thể đi một mình, nhưng không bao giờ một mình trong hành trình.',
    bullets: [
      '90% khách đi một mình nhưng khi về đều có thêm bạn.',
      'Trong hành trình, cả đoàn chia nước, đồ ăn và kéo nhau qua đoạn khó.',
      'Sau tour, nhiều nhóm vẫn giữ liên lạc và rủ nhau đi tiếp.',
      'Văn hóa đoàn: không bỏ lại ai phía sau.',
      'Kết nối sâu với đồng bào vùng cao, porter và người dẫn đường địa phương.',
    ],
    outro:
      'Không chỉ là đi cùng nhau, mà là hiểu nhau hơn giữa người thành phố và người vùng cao.',
    image: '/images/haithichdi1.jpg',
    imageAlt: 'Kết nối giữa những người đồng hành trong chuyến trek',
    ctaLabel: 'Khám phá lịch tour',
    locationName: 'Ky Quan San',
    difficulty: 'Mở rộng cộng đồng',
  },
  {
    key: 'thien-nguyen',
    eyebrow: 'Thiện nguyện',
    title: 'Đi để lại giá trị',
    intro:
      'Một chuyến đi trọn vẹn không chỉ là bạn nhận được gì, mà còn là bạn để lại điều gì cho nơi mình đi qua.',
    bullets: [
      'Kết hợp tặng quà cho trẻ em vùng cao trong một số hành trình.',
      'Ưu tiên dùng dịch vụ địa phương: porter, homestay, thực phẩm bản địa.',
      'Hỗ trợ người dân qua du lịch bền vững.',
      'Giữ ý thức bảo vệ môi trường: không xả rác, thu gom rác trên đường trek.',
      'Nhiều đoàn chủ động quyên góp thêm sau chuyến đi.',
    ],
    outro:
      'Mỗi bước chân không chỉ in dấu trên núi mà còn để lại giá trị ở nơi bạn đi qua.',
    image:
      'https://images.unsplash.com/photo-1469571486292-b53601020f45?auto=format&fit=crop&w=1600&q=80',
    imageAlt: 'Tinh thần thiện nguyện trong hành trình trekking',
    ctaLabel: 'Xem hành trình ý nghĩa',
    locationName: 'Nhiu Co San',
    difficulty: 'Du lịch bền vững',
  },
];

const sectionRevealInitial = {
  opacity: 0,
  y: 92,
} as const;

const sectionRevealTransition = {
  duration: 1.5,
  delay: 0.5,
  ease: ANIMATION_EASE,
} as const;

export function HomeAboutJourneySection() {
  return (
    <>
      <section
        id='about-us'
        className='relative bg-gradient-to-b from-[#111111] via-[#131313] to-[#191919] py-14 sm:py-16 lg:py-24 scroll-mt-28'
      >
        <div className='pointer-events-none absolute inset-0'>
          <div className='absolute inset-0 bg-[radial-gradient(120%_88%_at_50%_62%,rgba(208,6,0,0.12)_0%,transparent_58%)]' />
          <div className='absolute inset-0 bg-[radial-gradient(86%_72%_at_100%_100%,rgba(208,6,0,0.08)_0%,transparent_62%)]' />
        </div>

        <motion.div
          initial={sectionRevealInitial}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={sectionRevealTransition}
          className='relative mx-auto grid w-full max-w-[1400px] gap-8 px-4 sm:px-8 lg:grid-cols-[1.08fr_0.92fr]'
        >
          <div className='space-y-7'>
            <div className='inline-flex items-center gap-2 rounded-full border border-red-400/35 bg-red-500/10 px-4 py-2 text-xs uppercase tracking-[0.22em] text-red-100'>
              <Sparkles className='h-4 w-4 text-red-300' />
              Về chúng tôi
            </div>

            <h2 className='text-2xl sm:text-3xl md:text-5xl font-black leading-tight'>
              Hải Thích Đi là ai?
            </h2>

            <div className='space-y-4 text-neutral-200 leading-relaxed text-base'>
              <p>
                Hải Thích Đi được sinh ra từ những bước chân đầu tiên trên núi, nơi mà mỗi
                hành trình không chỉ là leo lên một đỉnh cao, mà là hành trình vượt qua chính
                mình.
              </p>
              <p className='font-semibold text-red-100'>
                Chúng tôi tin rằng: Ai cũng có một giới hạn nhưng rất ít người dám bước ra để
                chạm vào nó.
              </p>
              <p>
                Hải Thích Đi không hướng đến những chuyến du lịch nghỉ dưỡng. Chúng tôi tạo ra
                những trải nghiệm thật:
              </p>
              <ul className='space-y-1 text-neutral-100'>
                <li>Leo những cung đường khó.</li>
                <li>Chạm vào thiên nhiên hoang sơ.</li>
                <li>Kết nối những con người xa lạ thành một đội.</li>
              </ul>
              <p>
                Với đội ngũ leader giàu kinh nghiệm, am hiểu địa hình và luôn đặt sự an toàn lên
                hàng đầu, Hải Thích Đi đồng hành cùng bạn trên từng bước chân, từ lúc còn nghi ngờ
                bản thân cho đến khi đứng trên đỉnh.
              </p>

              <div className='mt-5 rounded-2xl border border-red-400/30 bg-red-500/10 px-4 py-3 text-sm font-semibold text-red-100'>
                👉 “Mình làm được rồi.”
              </div>

              <div className='mt-5 grid gap-3 sm:grid-cols-3'>
                {impactStats.map((stat) => (
                  <div
                    key={stat.label}
                    className='rounded-2xl border border-white/10 bg-black/30 px-4 py-3'
                  >
                    <p className='text-xl font-black text-white'>{stat.value}</p>
                    <p className='mt-1 text-[11px] uppercase tracking-[0.14em] text-neutral-400'>
                      {stat.label}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className='flex flex-col gap-4'>
            {keywordCards.map(({ title, body, Icon }, index) => (
              <motion.article
                key={title}
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.45, ease: ANIMATION_EASE, delay: index * 0.06 }}
              >
                <div className='h-full rounded-3xl bg-white/5 p-6 backdrop-blur-md'>
                  <div className='mb-4 inline-flex rounded-2xl border border-red-400/35 bg-red-500/15 p-3 text-red-200'>
                    <Icon className='h-5 w-5' />
                  </div>
                  <h3 className='text-xl sm:text-2xl font-bold'>{title}</h3>
                  <p className='mt-3 text-sm leading-relaxed text-neutral-300'>{body}</p>
                </div>
              </motion.article>
            ))}
          </div>
        </motion.div>
      </section>

      {valueSections.map((section, index) => (
        <section
          key={section.key}
          className='relative border-t border-white/5 bg-gradient-to-b from-[#101010] via-[#121212] to-[#181818] py-14 sm:py-16 lg:py-20 scroll-mt-28'
        >
          <div className='pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.012)_0%,rgba(255,255,255,0)_28%)]' />
          <div className='pointer-events-none absolute inset-0 opacity-70 bg-[radial-gradient(88%_72%_at_90%_18%,rgba(208,6,0,0.14)_0%,transparent_52%)]' />
          <p className='pointer-events-none absolute right-4 top-5 text-[36px] sm:right-6 sm:top-6 sm:text-[56px] font-black uppercase tracking-[0.12em] text-white/[0.04] lg:right-10 lg:text-[90px]'>
            {section.eyebrow}
          </p>

          <motion.div
            initial={sectionRevealInitial}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={sectionRevealTransition}
            className={cn(
              'relative mx-auto grid w-full max-w-[1400px] items-center gap-8 px-4 sm:px-8 lg:grid-cols-2',
              index % 2 === 1 && 'lg:[&>*:first-child]:order-2',
            )}
          >
            <div className='relative'>
              <div className='inline-flex items-center gap-2 rounded-full border border-red-400/30 bg-red-500/10 px-3 py-1.5 text-[11px] uppercase tracking-[0.16em] text-red-100'>
                <Compass className='h-3.5 w-3.5' />
                {section.eyebrow}
              </div>
              <h3 className='mt-4 text-2xl sm:text-3xl md:text-4xl font-black leading-tight'>
                {section.title}
              </h3>
              <p className='mt-4 text-base leading-relaxed text-neutral-200'>{section.intro}</p>

              <div className='mt-5 rounded-2xl border border-white/10 bg-black/35 p-4'>
                <p className='text-[11px] uppercase tracking-[0.16em] text-red-200'>
                  Dẫn chứng thực tế
                </p>
                <ul className='mt-3 space-y-2 text-sm text-neutral-200 leading-relaxed'>
                  {section.bullets.map((bullet, bulletIndex) => (
                    <li key={bullet} className='flex gap-2.5'>
                      <span className='mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-red-400/50 bg-red-500/18 text-[10px] font-semibold text-red-100'>
                        {bulletIndex + 1}
                      </span>
                      <span>{bullet}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <p className='mt-5 text-red-100 font-semibold'>{section.outro}</p>
              <div className='mt-5 flex flex-wrap items-center gap-3'>
                <Link
                  href={`/tours?mode=location&name=${slugify(section.locationName)}`}
                  className='inline-flex items-center gap-2 rounded-full border border-red-400/45 bg-red-500/15 px-5 py-2.5 text-sm font-semibold text-red-100 hover:bg-red-500/25 transition-colors'
                >
                  {section.ctaLabel}
                  <ArrowRight className='h-4 w-4' />
                </Link>
                <span className='rounded-full border border-white/[0.12] bg-white/[0.06] px-4 py-2 text-xs text-neutral-200'>
                  {section.difficulty}
                </span>
              </div>
            </div>

            <motion.div
              initial={{ opacity: 0, scale: 0.97, y: 18 }}
              whileInView={{ opacity: 1, scale: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, ease: ANIMATION_EASE }}
              className='relative overflow-hidden rounded-[30px] border border-white/10 shadow-[0_30px_90px_-45px_rgba(208,6,0,0.8)]'
            >
              <Image
                src={section.image}
                alt={section.imageAlt}
                width={1500}
                height={980}
                className='h-[300px] sm:h-[380px] lg:h-[450px] w-full object-cover'
                unoptimized={section.image.startsWith('http')}
              />
              <div className='absolute inset-0 bg-gradient-to-t from-black/72 via-black/10 to-transparent' />
              <div className='absolute left-5 top-5 inline-flex items-center gap-2 rounded-full border border-white/20 bg-black/45 px-3 py-1.5 text-xs text-neutral-100 backdrop-blur-md'>
                <Stars className='h-3.5 w-3.5 text-red-200' />
                Hải Thích Đi Journey
              </div>
              <div className='absolute bottom-5 left-5 right-5 rounded-2xl border border-white/10 bg-black/45 p-4 backdrop-blur-md'>
                <p className='text-xs uppercase tracking-[0.2em] text-red-200'>Keyword Highlight</p>
                <p className='mt-1 text-lg font-semibold'>{section.title}</p>
              </div>
            </motion.div>
          </motion.div>
        </section>
      ))}
    </>
  );
}

export function HomeFeaturedRoutesSection() {
  const { data, isPending, isError } = useQuery({
    queryKey: ['home-featured-routes'],
    queryFn: homeService.getFeaturedRoutes,
    staleTime: 60_000,
  });
  const { mainRoute, sideRoutes, highlightAudience } =
    buildHomeFeaturedRoutesViewModel(data);

  const mainRouteAudienceLabel = mainRoute
    ? formatSuitableAudiences(mainRoute.suitable_audiences)
    : '';

  return (
    <section className='relative border-t border-white/5 bg-gradient-to-b from-[#101010] via-[#131313] to-[#191919] py-14 sm:py-16 lg:py-20'>
      <div className='pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.012)_0%,rgba(255,255,255,0)_28%)]' />
      <div className='pointer-events-none absolute inset-0 opacity-65 bg-[radial-gradient(100%_86%_at_14%_10%,rgba(208,6,0,0.14)_0%,transparent_58%)]' />
      <motion.div
        initial={sectionRevealInitial}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={sectionRevealTransition}
        className='relative mx-auto w-full max-w-[1400px] space-y-10 px-4 sm:px-8'
      >
        <div className='space-y-4 max-w-4xl'>
          <p className='inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs uppercase tracking-[0.22em] text-red-200'>
            <ShieldCheck className='h-4 w-4 text-red-300' />
            Tour trekking nổi bật
          </p>
          <h2 className='text-2xl sm:text-3xl md:text-5xl font-black leading-tight'>
            Những cung đường không dành cho người chỉ muốn “đi chơi”
          </h2>
        </div>

        {isPending ? (
          <HomeFeaturedRoutesLoadingState />
        ) : mainRoute ? (
          <>
            <div className='grid gap-6 lg:grid-cols-[1.05fr_0.95fr]'>
              <article className='group max-h-[600px] h-[600px] relative overflow-hidden rounded-[32px] border border-white/10'>
                <Image
                  src={mainRoute.image_url || '/images/haithichdi1.jpg'}
                  alt={mainRoute.display_name}
                  width={1600}
                  height={1200}
                  className='h-full min-h-[300px] sm:min-h-[360px] lg:min-h-[420px] w-full object-cover transition-transform duration-700 group-hover:scale-[1.03]'
                  unoptimized={Boolean(mainRoute.image_url?.startsWith('http'))}
                />
                <div className='absolute inset-0 bg-gradient-to-t from-black/78 via-black/25 to-transparent' />
                <div className='absolute inset-x-0 bottom-0 p-7'>
                  <p className='text-xs uppercase tracking-[0.22em] text-red-200'>Main Route</p>
                  <h3 className='mt-2 text-2xl sm:text-3xl font-black'>
                    {mainRoute.display_name}
                  </h3>
                  {mainRoute.summary ? (
                    <p className='mt-3 max-w-2xl text-sm text-neutral-200'>
                      {mainRoute.summary}
                    </p>
                  ) : null}
                  {mainRouteAudienceLabel ? (
                    <p className='mt-2 text-sm font-semibold text-red-100'>
                      Phù hợp: {mainRouteAudienceLabel}.
                    </p>
                  ) : null}
                  <Link
                    href={`/tours?mode=location&name=${slugify(mainRoute.name)}`}
                    className='mt-4 inline-flex items-center gap-2 rounded-full border border-red-400/45 bg-red-500/18 px-5 py-2 text-sm font-semibold text-red-100 hover:bg-red-500/28 transition-colors'
                  >
                    {`Xem lịch tour ${mainRoute.name}`}
                    <ArrowRight className='h-4 w-4' />
                  </Link>
                </div>
              </article>

              <div className='grid gap-4 sm:grid-cols-2 lg:h-[600px] lg:grid-cols-1 lg:grid-rows-3'>
                {sideRoutes.map((route, index) => (
                  <motion.div
                    key={route.id}
                    className='h-full'
                    initial={{ opacity: 0, y: 16 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.45, ease: ANIMATION_EASE, delay: index * 0.06 }}
                  >
                    <Link
                      href={`/tours?mode=location&name=${slugify(route.name)}`}
                      className='group relative block h-40 overflow-hidden rounded-3xl border border-white/10 sm:h-52 lg:h-full'
                    >
                      <Image
                        src={route.image_url || '/images/tachinhu1.jpg'}
                        alt={route.display_name}
                        width={1200}
                        height={780}
                        className='h-full w-full object-cover transition-transform duration-500 group-hover:scale-105'
                        unoptimized={Boolean(route.image_url?.startsWith('http'))}
                      />
                      <div className='absolute inset-0 bg-gradient-to-t from-black/72 to-black/15' />
                      <div className='absolute inset-x-0 bottom-0 p-4'>
                        <p className='text-lg font-bold'>{route.display_name}</p>
                        {route.subtitle ? (
                          <p className='text-sm text-neutral-200'>{route.subtitle}</p>
                        ) : null}
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </div>
            </div>

            <div className='rounded-[30px] border border-white/10 bg-gradient-to-br from-white/[0.1] via-black/32 to-black/55 p-6 backdrop-blur-sm'>
              <p className='text-sm text-neutral-200'>
                {highlightAudience?.description || 'Chưa có mô tả đối tượng phù hợp cho section này.'}
              </p>
              <p className='mt-2 text-sm font-semibold text-red-100'>
                {highlightAudience
                  ? `Phù hợp: ${highlightAudience.title}.`
                  : 'Phù hợp: Đang cập nhật.'}
              </p>
              <div className='mt-5 flex flex-wrap gap-2.5'>
                {highlightAudience?.locations.length ? (
                  highlightAudience.locations.map((route) => (
                    <Link
                      key={route.id}
                      href={`/tours?mode=location&name=${slugify(route.name)}`}
                      className='rounded-full border border-white/10 bg-black/35 px-4 py-2 text-sm text-neutral-100 transition-colors hover:border-red-400/60 hover:text-white'
                    >
                      {route.name}
                    </Link>
                  ))
                ) : (
                  <span className='text-sm text-neutral-400'>
                    Chưa có route nào cho nhóm đối tượng này.
                  </span>
                )}
              </div>
            </div>
          </>
        ) : (
          <HomeFeaturedRoutesEmptyState isError={isError} />
        )}
      </motion.div>
    </section>
  );
}

function HomeFeaturedRoutesLoadingState() {
  return (
    <>
      <div className='grid gap-6 lg:grid-cols-[1.05fr_0.95fr]'>
        <div className='min-h-[300px] sm:min-h-[360px] lg:min-h-[420px] rounded-[32px] border border-white/10 bg-white/[0.04] animate-pulse' />
        <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-1'>
          {Array.from({ length: 3 }).map((_, index) => (
            <div
              key={`home-featured-route-skeleton-${index}`}
              className='h-40 rounded-3xl border border-white/10 bg-white/[0.04] animate-pulse'
            />
          ))}
        </div>
      </div>

      <div className='h-48 rounded-[30px] border border-white/10 bg-white/[0.04] animate-pulse' />
    </>
  );
}

function HomeFeaturedRoutesEmptyState({ isError }: { isError: boolean }) {
  return (
    <div className='rounded-[30px] border border-white/10 bg-gradient-to-br from-white/[0.06] via-black/28 to-black/45 p-6 backdrop-blur-sm'>
      <p className='text-sm text-neutral-200'>
        {isError
          ? 'Không tải được dữ liệu cung nổi bật. Vui lòng thử lại sau.'
          : 'Chưa có dữ liệu cung nổi bật để hiển thị trên homepage.'}
      </p>
    </div>
  );
}
