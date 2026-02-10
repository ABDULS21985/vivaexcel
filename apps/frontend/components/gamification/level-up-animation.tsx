"use client";

import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronUp } from "lucide-react";

interface LevelUpAnimationProps {
  level: number;
  title: string;
  onClose: () => void;
}

export function LevelUpAnimation({
  level,
  title,
  onClose,
}: LevelUpAnimationProps) {
  useEffect(() => {
    const timer = setTimeout(onClose, 4000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          exit={{ scale: 0 }}
          transition={{ type: "spring", damping: 15 }}
          className="bg-gradient-to-br from-violet-600 to-indigo-700 rounded-3xl p-8 text-center shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          <ChevronUp className="h-12 w-12 text-yellow-400 mx-auto mb-2" />
          <h2 className="text-3xl font-black text-white">LEVEL UP!</h2>
          <div className="text-6xl font-black text-yellow-400 my-3">
            {level}
          </div>
          <p className="text-lg font-semibold text-white/80">{title}</p>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
