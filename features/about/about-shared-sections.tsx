'use client';

import Image from 'next/image';
import { motion } from 'motion/react';
import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { leaderService, type Leader } from '@/lib/services/leader';
import { homeService, type HomeMomentsGalleryImage } from '@/lib/services/home';
import { ANIMATION_EASE } from '@/lib/constants';
import { cn } from '@/lib/utils';
import FullscreenModalShell from '@/components/fullscreen-modal-shell';
import {
  ArrowUpRight,
  Camera,
  Calendar,
  Flame,
  Heart,
  MapPin,
} from 'lucide-react';

type LeaderCard = Leader & {
  role_label?: string;
  relationship?: string;
  dob?: string;
  highlight?: string | null;
  location?: string | null;
};

type LeadersShowcaseSectionProps = {
  id?: string;
  className?: string;
  eyebrow?: string;
  title?: string;
  description?: string;
  helperText?: string;
};

type MomentsGallerySectionProps = {
  id?: string;
  className?: string;
  eyebrow?: string;
  title?: string;
  description?: string;
};

const fallbackLeaders: LeaderCard[] = [
  {
    id: -1,
    username: 'kieu.trinh',
    first_name: 'Nguyễn Thị',
    last_name: 'Kiều Trinh',
    full_name: 'Nguyễn Thị Kiều Trinh',
    avatar_url:
      'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=900&q=80',
    role_label: 'Trek Leader',
    relationship: 'Single',
    dob: '13/05/1998',
    highlight:
      'Hơn 5 năm dẫn đoàn, mạnh thể lực, xử lý tình huống nhanh nhạy và luôn giữ không khí vui vẻ.',
    strengths: [
      'Thể lực bền bỉ',
      'Kĩ năng quay/chụp',
      'Khả năng dẫn đoàn',
      'Xử lý tình huống',
      'Hài hước, kết nối',
    ],
    bio: 'Một trong những nữ leader sở hữu thể lực tốt và khả năng ứng biến mượt mà, luôn quan tâm và giữ tinh thần đoàn.',
  },
  {
    id: -2,
    username: 'minh.trek',
    first_name: 'Nguyễn',
    last_name: 'Minh',
    full_name: 'Nguyễn Minh',
    avatar_url:
      'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=900&q=80',
    role_label: 'Route Architect',
    relationship: 'Married',
    dob: '04/11/1992',
    strengths: ['Định tuyến', 'An toàn', 'Sơ cứu', 'Logistics'],
    highlight: 'Thiết kế cung đường tối ưu và đảm bảo an toàn cho từng đoàn.',
    bio: 'Đam mê bản đồ, luôn thử nghiệm lộ trình mới để giữ an toàn và trải nghiệm trọn vẹn.',
  },
  {
    id: -3,
    username: 'lan.hoang',
    first_name: 'Hoàng',
    last_name: 'Lan',
    full_name: 'Hoàng Lan',
    avatar_url:
      'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=900&q=80&sat=-40',
    role_label: 'Community Host',
    relationship: 'Single',
    dob: '22/08/1995',
    strengths: ['Giao tiếp bản địa', 'Ẩm thực địa phương', 'Gắn kết đội'],
    highlight: 'Kết nối với cộng đồng địa phương và đem đến trải nghiệm văn hóa.',
    bio: 'Luôn mỉm cười, luôn lắng nghe; người khiến mọi cuộc trò chuyện quanh lửa trại trở nên đáng nhớ.',
  },
];

export function LeadersShowcaseSection({
  id,
  className,
  eyebrow = 'Team',
  title = 'Leaders của Hải Thích Đi',
  description = 'Những người giữ nhịp cho hành trình, đảm bảo an toàn và lan tỏa năng lượng tích cực cho cả đoàn.',
  helperText = 'Chạm để xem profile chi tiết',
}: LeadersShowcaseSectionProps) {
  const { data: leaders = [], isLoading: leadersLoading } = useQuery({
    queryKey: ['leaders'],
    queryFn: leaderService.getLeaders,
  });

  const mergedLeaders = useMemo<LeaderCard[]>(() => {
    if (leaders.length === 0) return fallbackLeaders;
    return leaders.map((leader) => ({
      ...leader,
      role_label: leader.display_role || 'Leader',
      avatar_url: leader.full_avatar_url || leader.avatar_url,
    }));
  }, [leaders]);

  const [selectedLeader, setSelectedLeader] = useState<LeaderCard | null>(null);

  return (
    <>
      <section
        id={id}
        className={cn(
          'relative md:min-h-screen bg-[#121212] border-t border-white/5 py-14 sm:py-16 lg:py-24 scroll-mt-28',
          className,
        )}
      >
        <div className='pointer-events-none absolute inset-0 opacity-30 bg-[radial-gradient(circle_at_20%_20%,rgba(255,80,80,0.12),transparent_35%),radial-gradient(circle_at_80%_10%,rgba(255,120,80,0.12),transparent_30%)]' />
        <div className='relative max-w-[1400px] mx-auto px-4 sm:px-8 space-y-10'>
          <div className='flex flex-col md:flex-row md:items-end md:justify-between gap-6'>
            <div>
              <p className='text-xs uppercase tracking-[0.25em] text-red-200'>{eyebrow}</p>
              <h2 className='text-2xl sm:text-3xl lg:text-4xl font-black mt-2'>{title}</h2>
              <p className='text-neutral-300 mt-3 max-w-2xl'>{description}</p>
            </div>
            <div className='inline-flex items-center gap-3 rounded-full border border-white/10 bg-white/5 px-3 sm:px-4 py-2 text-xs sm:text-sm text-neutral-200'>
              <Heart className='w-4 h-4 text-red-400' />
              <span>{helperText}</span>
            </div>
          </div>

          {leadersLoading ? (
            <p className='text-neutral-400 text-sm'>Đang tải danh sách leaders...</p>
          ) : (
            <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5'>
              {mergedLeaders.map((leader, idx) => (
                <motion.div
                  key={leader.id ?? idx}
                  onClick={() => setSelectedLeader(leader)}
                  role='button'
                  tabIndex={0}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter' || event.key === ' ') {
                      event.preventDefault();
                      setSelectedLeader(leader);
                    }
                  }}
                  className='group text-left rounded-3xl border border-white/10 bg-gradient-to-br from-white/8 via-black/12 to-black/45 p-5 md:cursor-pointer hover:border-red-400/50 hover:shadow-[0_20px_60px_-35px_rgba(255,80,80,0.6)] transition-all duration-300'
                  initial={{ opacity: 0, y: 14 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, ease: ANIMATION_EASE, delay: idx * 0.05 }}
                >
                  <div className='flex items-center gap-4'>
                    <AvatarBubble name={leader.full_name} src={leader.avatar_url} />
                    <div className='flex-1'>
                      <p className='text-xs uppercase tracking-[0.2em] text-red-200'>
                        {leader.role_label || 'Leader'}
                      </p>
                      <p className='text-lg font-semibold leading-tight'>{leader.full_name}</p>
                      <p className='text-xs text-neutral-400 flex items-center gap-1 mt-1'>
                        <MapPin className='w-3 h-3' />
                        {leader.location || 'Việt Nam'}
                      </p>
                    </div>
                    <ArrowUpRight className='w-4 h-4 text-red-300 opacity-0 group-hover:opacity-100 transition-opacity' />
                  </div>

                  <p className='text-sm text-neutral-200 mt-4 line-clamp-3'>
                    {leader.highlight ||
                      leader.bio ||
                      'Luôn đặt trải nghiệm và an toàn của đoàn lên trước.'}
                  </p>

                  <div className='mt-4 flex flex-wrap gap-2'>
                    {(leader.strengths && leader.strengths.length > 0
                      ? leader.strengths
                      : ['An toàn', 'Xử lý tình huống', 'Truyền cảm hứng']
                    )
                      .slice(0, 4)
                      .map((strength) => (
                        <span
                          key={strength}
                          className='text-xs rounded-full border border-white/10 bg-white/5 px-3 py-1 text-neutral-100'
                        >
                          {strength}
                        </span>
                      ))}
                  </div>
                  <div className='mt-4 flex justify-end md:hidden'>
                    <button
                      type='button'
                      onClick={(event) => {
                        event.stopPropagation();
                        setSelectedLeader(leader);
                      }}
                      className='inline-flex items-center gap-1.5 text-xs font-semibold text-red-200 active:text-red-100 transition-colors'
                    >
                      Chi tiết
                      <ArrowUpRight className='w-3.5 h-3.5' />
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>
      <LeaderModal leader={selectedLeader} onClose={() => setSelectedLeader(null)} />
    </>
  );
}

export function MomentsGallerySection({
  id,
  className,
  eyebrow = 'Khoảnh khắc',
  title = 'Những khung hình yêu thích',
  description = 'Chọn layout so le như Pinterest để giữ nhịp tự do, cảm giác phiêu lưu đúng chất trekking.',
}: MomentsGallerySectionProps) {
  const { data, isPending, isError } = useQuery({
    queryKey: ['home', 'moments-gallery'],
    queryFn: homeService.getMomentsGallery,
    staleTime: 60_000,
  });

  const galleryImages = data?.images ?? [];

  return (
    <section
      id={id}
      className={cn(
        'relative md:min-h-screen bg-gradient-to-b from-[#121212] via-[#141414] to-[#1a1a1a] border-t border-white/5 py-14 sm:py-16 lg:py-24 scroll-mt-28',
        className,
      )}
    >
      <div className='pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_10%_10%,rgba(255,80,80,0.08),transparent_30%),radial-gradient(circle_at_90%_20%,rgba(255,140,100,0.08),transparent_28%)] opacity-40' />
      <div className='relative max-w-6xl mx-auto px-4 sm:px-8 space-y-10'>
        <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4'>
          <div>
            <p className='text-xs uppercase tracking-[0.25em] text-red-200'>{eyebrow}</p>
            <h2 className='text-2xl sm:text-3xl lg:text-4xl font-black mt-2'>{title}</h2>
            <p className='text-neutral-300 mt-3 max-w-2xl'>{description}</p>
          </div>
          <div className='inline-flex items-center gap-2 text-xs text-neutral-300 bg-white/5 border border-white/10 px-3 py-2 rounded-full'>
            <Camera className='w-4 h-4 text-red-300' />
            <span>Lướt để xem thêm</span>
          </div>
        </div>

        {isPending ? (
          <MomentsGalleryLoadingState />
        ) : galleryImages.length ? (
          <div className='columns-1 sm:columns-2 lg:columns-3 gap-4 [column-fill:_balance]'>
            {galleryImages.map((img, idx) => (
              <motion.div
                key={img.id}
                className='mb-4 break-inside-avoid overflow-hidden rounded-3xl border border-white/10 bg-white/5 shadow-[0_20px_60px_-35px_rgba(0,0,0,0.7)]'
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, ease: ANIMATION_EASE, delay: idx * 0.03 }}
              >
                <Image
                  src={img.image_url || '/images/haithichdi1.jpg'}
                  alt={getMomentAltText(img)}
                  width={img.width || 900}
                  height={img.height || 1200}
                  className='w-full h-auto object-cover'
                  unoptimized={Boolean(img.image_url?.startsWith('http'))}
                />
                <div className='p-3 text-sm text-neutral-200 flex items-center justify-between gap-3'>
                  <span className='min-w-0 truncate'>{getMomentLabel(img)}</span>
                  <MapPin className='w-4 h-4 shrink-0 text-red-300' />
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className='rounded-3xl border border-white/10 bg-white/5 px-4 py-6 text-sm text-neutral-400'>
            {isError
              ? 'Không tải được gallery khoảnh khắc. Vui lòng thử lại sau.'
              : 'Chưa có ảnh tour nào để hiển thị trong gallery.'}
          </div>
        )}
      </div>
    </section>
  );
}

function MomentsGalleryLoadingState() {
  return (
    <div className='columns-1 sm:columns-2 lg:columns-3 gap-4 [column-fill:_balance]'>
      {['h-[420px]', 'h-[280px]', 'h-[520px]', 'h-[360px]', 'h-[460px]', 'h-[320px]'].map(
        (heightClassName, index) => (
          <div
            key={`moments-gallery-skeleton-${index}`}
            className={cn(
              'mb-4 break-inside-avoid rounded-3xl border border-white/10 bg-white/[0.04] animate-pulse',
              heightClassName,
            )}
          />
        ),
      )}
    </div>
  );
}

function getMomentAltText(image: HomeMomentsGalleryImage) {
  return image.caption.trim() || image.tour_title.trim() || image.location_name.trim();
}

function getMomentLabel(image: HomeMomentsGalleryImage) {
  return image.caption.trim() || image.tour_title.trim() || image.location_name.trim();
}

function LeaderModal({
  leader,
  onClose,
}: {
  leader: LeaderCard | null;
  onClose: () => void;
}) {
  return (
    <FullscreenModalShell
      open={Boolean(leader)}
      onClose={onClose}
      closeAriaLabel='Đóng chi tiết leader'
      backdropClassName='bg-black/80 backdrop-blur-md'
      containerClassName='h-full w-full md:flex md:items-center md:justify-center md:p-6'
      contentClassName='h-full w-full overflow-y-auto bg-gradient-to-br from-[#101010] to-[#0a0a0a] border border-white/10 rounded-none shadow-2xl md:h-auto md:max-h-[90vh] md:max-w-5xl md:w-[90vw] md:rounded-3xl'
      closeButtonClassName='right-4 top-4 md:right-3 md:top-3 border-white/10 bg-black/70 hover:border-red-400/70'
      contentKey={leader?.id}
    >
      {leader && (
        <div className='grid md:grid-cols-[1.05fr_0.95fr]'>
          <div className='relative min-h-[320px] bg-gradient-to-br from-red-600/60 to-red-800/40'>
            <Image
              src={leader.avatar_url || '/images/haithichdi1.jpg'}
              alt={leader.full_name}
              fill
              unoptimized
              sizes='(max-width: 768px) 100vw, 50vw'
              className='object-cover'
            />
            <div className='absolute inset-0 bg-gradient-to-t from-black to-transparent' />
            <div className='absolute bottom-4 left-4 right-4'>
              <p className='text-xs uppercase tracking-[0.2em] text-red-200'>
                {leader.role_label || 'Leader'}
              </p>
              <p className='text-2xl font-semibold'>{leader.full_name}</p>
              <div className='flex flex-wrap gap-3 text-xs text-neutral-200 mt-2'>
                {leader.relationship && (
                  <span className='inline-flex items-center gap-1 bg-black/60 px-3 py-1 rounded-full border border-white/10'>
                    <Heart className='w-3 h-3 text-red-300' />
                    {leader.relationship}
                  </span>
                )}
                {leader.dob && (
                  <span className='inline-flex items-center gap-1 bg-black/60 px-3 py-1 rounded-full border border-white/10'>
                    <Calendar className='w-3 h-3' />
                    {leader.dob}
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className='p-6 sm:p-8 space-y-4'>
            <div className='flex items-center gap-3 text-sm text-red-200'>
              <Flame className='w-4 h-4' />
              <span>
                {leader.highlight ||
                  'Lan tỏa năng lượng tích cực, bảo vệ an toàn và cảm xúc của cả đoàn.'}
              </span>
            </div>

            <div className='text-neutral-200 text-sm leading-relaxed space-y-3'>
              <p>
                {leader.bio ||
                  'Leader của Hải Thích Đi, yêu rừng núi, giỏi điều phối nhịp đoàn và luôn dành thời gian lắng nghe từng thành viên.'}
              </p>
            </div>

            <div>
              <p className='text-xs uppercase tracking-[0.25em] text-red-200'>Strengths</p>
              <div className='mt-3 flex flex-wrap gap-2'>
                {(leader.strengths && leader.strengths.length > 0
                  ? leader.strengths
                  : ['Thể lực', 'An toàn', 'Kết nối', 'Ghi hình', 'Xử lý tình huống']
                ).map((item) => (
                  <span
                    key={item}
                    className='inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-neutral-100'
                  >
                    <Camera className='w-3 h-3 text-red-300' />
                    {item}
                  </span>
                ))}
              </div>
            </div>

            <div className='grid grid-cols-2 gap-3 text-sm text-neutral-300'>
              <div className='rounded-2xl border border-white/5 bg-white/5 px-3 py-3'>
                <p className='text-xs uppercase tracking-[0.2em] text-red-200'>Email</p>
                <p className='font-medium mt-1'>{leader.email || 'hello@haithichdi.vn'}</p>
              </div>
              <div className='rounded-2xl border border-white/5 bg-white/5 px-3 py-3'>
                <p className='text-xs uppercase tracking-[0.2em] text-red-200'>Gia nhập</p>
                <p className='font-medium mt-1'>
                  {leader.date_joined
                    ? new Date(leader.date_joined).toLocaleDateString('vi-VN')
                    : '—'}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </FullscreenModalShell>
  );
}

function AvatarBubble({ name, src }: { name: string; src?: string | null }) {
  const initials = name
    .split(' ')
    .filter(Boolean)
    .slice(-2)
    .map((n) => n[0])
    .join('')
    .toUpperCase();

  return (
    <div className='relative w-14 h-14 rounded-2xl overflow-hidden border border-white/10 bg-gradient-to-br from-red-600 to-red-400 text-center flex items-center justify-center text-lg font-semibold text-white shadow-[0_12px_45px_-25px_rgba(255,80,80,0.8)]'>
      {src ? (
        <Image src={src} alt={name} fill sizes='56px' className='object-cover' unoptimized />
      ) : (
        initials
      )}
    </div>
  );
}
