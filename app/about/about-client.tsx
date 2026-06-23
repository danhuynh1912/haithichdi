'use client';

import Image from 'next/image';
import { motion } from 'motion/react';
import { BadgeCheck, Sparkles, Users } from 'lucide-react';
import { ANIMATION_EASE } from '@/lib/constants';
import { cn } from '@/lib/utils';
import {
  LeadersShowcaseSection,
  MomentsGallerySection,
} from '@/features/about/about-shared-sections';

const storyParagraphs = [
  'Ngày trước, mình chỉ đơn giản là một người mê núi, mê rừng, mê cái cảm giác hít căng lồng ngực bầu không khí trong lành và thả hồn theo những biển mây trôi lững lờ. Rồi mình chợt nghĩ: Nếu chỉ mình mình được thấy thì… uổng quá. Giá mà có thêm nhiều người cùng đi, cùng trải nghiệm thì tuyệt biết bao!',
  'Từ ý nghĩ đó, mình bắt đầu hành trình dẫn tour trekking. Với mình, trekking không chỉ là đi bộ trên những con đường mòn gập ghềnh, mà còn là hành trình kết nối những tâm hồn. Nơi mà ta có thể tạm quên deadline, gác lại phố thị ồn ào, chỉ còn tiếng cười vang quanh đống lửa, những câu hát ngẫu hứng và những câu chuyện thật lòng chưa từng dám kể.',
  'Và mình tin, giá trị của một chuyến đi không chỉ nằm ở cảnh đẹp. Thỉnh thoảng, chúng mình mang theo vài món quà nhỏ gửi tặng các em nhỏ vùng cao như chút bánh kẹo, quyển vở,... để san sẻ niềm vui.',
  'Nhưng quan trọng hơn, chính những chuyến trekking còn mở ra cơ hội để bà con trên bản có thêm việc làm, thêm nguồn thu nhập sau vụ mùa vất vả. Họ trở thành những người porter âm thầm gùi đồ, khéo léo nấu nướng, kiên nhẫn dẫn đường… không chỉ giúp chuyến đi trọn vẹn hơn, mà còn để lại trong chúng mình sự biết ơn và những kỷ niệm khó quên.',
  '💚 Với mình, một chuyến đi trọn vẹn phải có đủ ba điều: Trekking – Kết nối – Thiện nguyện. Và mình tin, nếu bạn đồng hành cùng Hải Thích Đi, bạn sẽ không chỉ thấy thiên nhiên hùng vĩ hơn, tâm hồn mình rộng mở hơn, mà còn mang về một góc nhìn mới về con người, về cuộc sống, và có khi… về chính bản thân mình.',
];

export default function AboutClient() {
  return (
    <main className='bg-black text-white overflow-hidden'>
      <StorySection />
      <LeadersShowcaseSection />
      <MomentsGallerySection />
    </main>
  );
}

function StorySection() {
  return (
    <section className='relative min-h-screen flex items-center bg-gradient-to-b from-black via-[#0b0b0b] to-[#0a0a0a]'>
      <div className='pointer-events-none absolute inset-0'>
        <div className='absolute top-10 left-[-10%] w-[320px] h-[320px] bg-red-500/20 blur-[120px]' />
        <div className='absolute bottom-0 right-[-10%] w-[380px] h-[380px] bg-[#ff7b47]/20 blur-[140px]' />
        <div className='absolute inset-0 opacity-15 bg-[radial-gradient(circle_at_top,_rgba(255,80,80,0.08),transparent_45%)]' />
      </div>

      <div className='relative z-10 max-w-[1400px] mx-auto px-4 sm:px-8 py-20 grid lg:grid-cols-[1.05fr_0.95fr] gap-10 items-center'>
        <div className='space-y-6'>
          <div className='inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs uppercase tracking-[0.2em] text-red-200'>
            <Sparkles className='w-4 h-4 text-red-400' />
            Về chúng tôi
          </div>
          <h1 className='text-4xl sm:text-5xl lg:text-6xl font-black leading-tight'>
            Trekking. Kết nối. Thiện nguyện.
          </h1>
          <p className='text-red-200/90 text-lg font-medium'>
            Hành trình Hải Thích Đi được viết từ những biển mây, bếp lửa đêm và những
            cái ôm tạm biệt ở bản làng.
          </p>

          <div className='space-y-4 text-sm sm:text-base text-neutral-200 leading-relaxed max-w-3xl'>
            {storyParagraphs.map((paragraph, idx) => (
              <motion.p
                key={idx}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, ease: ANIMATION_EASE, delay: idx * 0.05 }}
                className={cn(idx === storyParagraphs.length - 1 && 'font-semibold text-red-100')}
              >
                {paragraph}
              </motion.p>
            ))}
          </div>

          <div className='flex flex-wrap gap-3 pt-4'>
            {['Trekking', 'Kết nối', 'Thiện nguyện'].map((pill) => (
              <span
                key={pill}
                className='inline-flex items-center gap-2 rounded-full border border-red-500/30 bg-red-500/10 px-4 py-2 text-xs uppercase tracking-[0.15em] text-red-100'
              >
                <BadgeCheck className='w-4 h-4 text-red-400' />
                {pill}
              </span>
            ))}
          </div>
        </div>

        <div className='relative'>
          <div className='absolute inset-0 -left-6 -top-6 rounded-[36px] border border-white/10 bg-gradient-to-br from-red-500/15 via-transparent to-white/5' />
          <div className='relative overflow-hidden rounded-[32px] border border-white/10 shadow-2xl shadow-red-900/30'>
            <Image
              src='/images/haithichdi1.jpg'
              alt='Hải Thích Đi trekking'
              width={1200}
              height={1400}
              className='h-full w-full object-cover'
              priority
            />
            <div className='absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-6'>
              <p className='text-sm text-red-100 uppercase tracking-[0.2em] mb-1'>Hải Thích Đi</p>
              <p className='text-xl font-semibold'>“Mỗi hành trình là một sợi dây kết nối mới.”</p>
            </div>
          </div>
          <motion.div
            className='absolute -left-6 -bottom-8 bg-black border border-white/10 rounded-2xl px-4 py-3 shadow-lg shadow-red-900/20 flex items-center gap-3'
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: ANIMATION_EASE }}
            viewport={{ once: true }}
          >
            <Users className='w-5 h-5 text-red-400' />
            <div>
              <p className='text-xs text-neutral-400'>Đoàn đã đồng hành</p>
              <p className='font-semibold text-lg'>5000+ trekkers</p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
