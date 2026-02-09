import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';

export default function PullToRefresh({ onRefresh, children }) {
  const [isPulling, setIsPulling] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const touchStartY = useRef(0);
  const containerRef = useRef(null);

  const PULL_THRESHOLD = 80;

  const handleTouchStart = (e) => {
    // Only start pull if at top of scroll
    if (containerRef.current && containerRef.current.scrollTop === 0) {
      touchStartY.current = e.touches[0].clientY;
    }
  };

  const handleTouchMove = (e) => {
    if (!touchStartY.current || isRefreshing) return;

    const currentY = e.touches[0].clientY;
    const distance = currentY - touchStartY.current;

    // Only pull down
    if (distance > 0 && containerRef.current && containerRef.current.scrollTop === 0) {
      setIsPulling(true);
      setPullDistance(Math.min(distance, PULL_THRESHOLD * 1.5));
    }
  };

  const handleTouchEnd = async () => {
    if (!isPulling) return;

    if (pullDistance >= PULL_THRESHOLD) {
      setIsRefreshing(true);
      try {
        await onRefresh();
      } finally {
        setIsRefreshing(false);
      }
    }

    setIsPulling(false);
    setPullDistance(0);
    touchStartY.current = 0;
  };

  return (
    <div
      ref={containerRef}
      className="relative overflow-y-auto h-full"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Pull indicator */}
      <motion.div
        className="absolute top-0 left-0 right-0 flex justify-center items-center z-10"
        initial={{ opacity: 0, y: -50 }}
        animate={{
          opacity: isPulling || isRefreshing ? 1 : 0,
          y: isPulling || isRefreshing ? pullDistance * 0.5 : -50,
        }}
        transition={{ type: 'spring', damping: 20 }}
      >
        <div className="bg-white dark:bg-gray-800 rounded-full p-3 shadow-lg">
          <Loader2
            className={`w-6 h-6 text-blue-600 ${isRefreshing ? 'animate-spin' : ''}`}
            style={{
              transform: !isRefreshing ? `rotate(${pullDistance * 2}deg)` : undefined,
            }}
          />
        </div>
      </motion.div>

      {/* Content */}
      <motion.div
        animate={{
          paddingTop: isPulling || isRefreshing ? pullDistance * 0.5 : 0,
        }}
        transition={{ type: 'spring', damping: 20 }}
      >
        {children}
      </motion.div>
    </div>
  );
}