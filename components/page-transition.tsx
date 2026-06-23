'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState } from 'react';

export function PageTransition() {
  const [show, setShow] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setShow(false), 1100);
    return () => clearTimeout(t);
  }, []);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className='pointer-events-none fixed inset-0 z-50'
          initial={{ opacity: 1 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <video
            autoPlay
            muted
            playsInline
            className='w-full h-full object-cover'
          >
            <source src='/vids/cloud-transition.webm' type='video/webm' />
          </video>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
