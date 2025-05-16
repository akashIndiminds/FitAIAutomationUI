import React from 'react';
import { motion } from 'framer-motion';

export default function Logo() {
  return (
    <motion.div
      className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg"
      animate={{ rotateY: [0, 360] }}
      transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
    >
      <span className="text-2xl font-bold text-white">FIT-AI</span>
    </motion.div>
  );
}