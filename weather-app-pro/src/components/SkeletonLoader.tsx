'use client';

import { motion } from 'framer-motion';

export default function SkeletonLoader() {
  return (
    <div className="w-full max-w-md mx-auto space-y-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-center space-y-4"
      >
        <div className="w-20 h-20 mx-auto rounded-full bg-white/10 animate-pulse" />
        <div className="w-32 h-8 mx-auto rounded-xl bg-white/10 animate-pulse" />
        <div className="w-48 h-4 mx-auto rounded-lg bg-white/10 animate-pulse" />
      </motion.div>
      
      <div className="grid grid-cols-3 gap-3">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-white/10 backdrop-blur-md rounded-2xl p-3 flex flex-col items-center gap-2"
          >
            <div className="w-6 h-6 rounded-full bg-white/10 animate-pulse" />
            <div className="w-12 h-3 rounded bg-white/10 animate-pulse" />
            <div className="w-8 h-4 rounded bg-white/10 animate-pulse" />
          </motion.div>
        ))}
      </div>
    </div>
  );
}

export function ShimmerCard() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="w-full max-w-md mx-auto"
    >
      <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/10 overflow-hidden relative">
        <div className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-white/5 to-transparent" />
        <div className="space-y-3">
          <div className="w-full h-32 rounded-xl bg-white/10 animate-pulse" />
          <div className="w-full h-4 rounded bg-white/10 animate-pulse" />
          <div className="w-3/4 h-4 rounded bg-white/10 animate-pulse" />
        </div>
      </div>
    </motion.div>
  );
}
