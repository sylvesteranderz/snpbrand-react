import React from 'react'
import { motion } from 'framer-motion'

interface AnimatedSlipperProps {
  imageSrc?: string
  className?: string
}

const AnimatedSlipper: React.FC<AnimatedSlipperProps> = ({ 
  imageSrc = '/images/SnPimage.jpg', 
  className = '' 
}) => {
  return (
    <div className={`flex items-center justify-center min-h-screen bg-white p-8 ${className}`}>
      <motion.div
        className="relative"
        animate={{
          x: [-50, 50, -50], // Slide left and right
          rotate: [-5, 5, -5], // Rotate back and forth
        }}
        transition={{
          duration: 5, // 5 seconds for one full cycle
          repeat: Infinity, // Infinite loop
          ease: "easeInOut", // Smooth animation
        }}
      >
        <motion.img
          src={imageSrc}
          alt="Animated Slipper"
          className="w-64 h-64 object-cover rounded-lg shadow-2xl"
          whileHover={{
            scale: 1.1,
            transition: { duration: 0.3 }
          }}
        />
      </motion.div>
    </div>
  )
}

export default AnimatedSlipper


