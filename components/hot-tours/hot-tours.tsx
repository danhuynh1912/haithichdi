'use client';

import SimpleBar from 'simplebar-react';
import { motion, stagger } from 'motion/react';
import 'simplebar-react/dist/simplebar.min.css';
import React from 'react';
import { useTranslations } from 'next-intl';
import { MotionHotTour } from './hot-tour';
import { ANIMATION_EASE } from '@/lib/constants';
import { useHotToursQuery } from '@/lib/services/queries';

const list = {
  hidden: {
    opacity: 0,
  },
  visible: {
    opacity: 1,
    transition: {
      when: 'beforeChildren',
      delayChildren: stagger(0.1),
    },
  },
};

const item = {
  hidden: { opacity: 0, transform: 'translateX(-60px)' },
  visible: { opacity: 1, transform: 'translateX(0px)' },
};

const HotTours = ({ className }: { className: string }) => {
  const t = useTranslations('tours.hotPanel');
  const { data, isLoading, isError } = useHotToursQuery();

  return (
    <SimpleBar className={`${className} h-[calc(100vh-100px)] `}>
      {/* The panel sits on the hero video in both themes, so its chrome stays
          literal white rather than following the canvas tokens. */}
      <motion.div
        initial='hidden'
        animate={data?.length ? 'visible' : 'hidden'}
        variants={list}
        className='flex flex-col gap-4 bg-white/10 backdrop-blur-sm rounded-3xl py-8 px-12 shadow-sm text-white'
      >
        <h2 className='text-2xl font-extrabold'>{t('title')}</h2>
        {isLoading ? <p className='text-sm text-white/70'>{t('loading')}</p> : null}
        {isError ? <p className='text-sm text-white/70'>{t('error')}</p> : null}
        {data?.map((tour, index) => (
          <MotionHotTour
            key={tour.id}
            tour={tour}
            transition={{
              ease: ANIMATION_EASE,
              duration: 1.2,
              delay: index * 0.1,
            }}
            initial='hidden'
            animate='visible'
            variants={item}
          />
        ))}
      </motion.div>
    </SimpleBar>
  );
};

export default HotTours;
