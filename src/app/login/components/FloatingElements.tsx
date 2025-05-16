import React from 'react';
import { motion } from 'framer-motion';

export default function FloatingElements() {
  return (
    <div className="absolute inset-0 overflow-hidden">
      {[...Array(20)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full bg-white/10 backdrop-blur-sm"
          initial={{
            x: `${Math.random() * 100}%`,
            y: `${Math.random() * 100}%`,
            scale: Math.random() * 0.5 + 0.5,
            opacity: Math.random() * 0.5 + 0.2,
          }}
          animate={{
            x: `${Math.random() * 100}%`,
            y: `${Math.random() * 100}%`,
            transition: { duration: Math.random() * 20 + 10, repeat: Infinity, repeatType: 'reverse' },
          }}
          style={{
            width: `${Math.random() * 100 + 20}px`,
            height: `${Math.random() * 100 + 20}px`,
          }}
        />
      ))}
    </div>
  );
}