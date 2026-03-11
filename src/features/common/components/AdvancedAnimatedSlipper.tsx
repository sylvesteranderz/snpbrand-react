import React from 'react'
import { motion } from 'framer-motion'

interface AdvancedAnimatedSlipperProps {
  imageSrc?: string
  className?: string
  size?: 'sm' | 'md' | 'lg' | 'xl'
  animationSpeed?: 'slow' | 'normal' | 'fast'
}

const AdvancedAnimatedSlipper: React.FC<AdvancedAnimatedSlipperProps> = ({ 
  imageSrc = '/images/SnPimage.jpg', 
  className = '',
  size = 'lg',
  animationSpeed = 'normal'
}) => {
  // Size configurations
  const sizeConfig = {
    sm: { width: 'w-32', height: 'h-32', glowSize: 'w-40 h-40' },
    md: { width: 'w-48', height: 'h-48', glowSize: 'w-56 h-56' },
    lg: { width: 'w-64', height: 'h-64', glowSize: 'w-72 h-72' },
    xl: { width: 'w-80', height: 'h-80', glowSize: 'w-88 h-88' }
  }

  // Speed configurations
  const speedConfig = {
    slow: { duration: 8, particleDuration: 12 },
    normal: { duration: 5, particleDuration: 8 },
    fast: { duration: 3, particleDuration: 5 }
  }

  const currentSize = sizeConfig[size]
  const currentSpeed = speedConfig[animationSpeed]

  return (
    <div className={`flex items-center justify-center min-h-screen bg-white p-8 ${className}`}>
      <div className="relative">
        {/* Animated Glow Background */}
        <motion.div
          className={`absolute inset-0 ${currentSize.glowSize} bg-gradient-to-r from-blue-400/20 via-purple-400/20 to-pink-400/20 rounded-full blur-xl`}
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.6, 0.3],
          }}
          transition={{
            duration: currentSpeed.duration,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />

        {/* Floating Particles */}
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 bg-blue-400 rounded-full"
            style={{
              left: `${20 + (i * 15)}%`,
              top: `${20 + (i * 10)}%`,
            }}
            animate={{
              y: [-20, 20, -20],
              x: [-10, 10, -10],
              opacity: [0.3, 0.8, 0.3],
            }}
            transition={{
              duration: currentSpeed.particleDuration + (i * 0.5),
              repeat: Infinity,
              ease: "easeInOut",
              delay: i * 0.2,
            }}
          />
        ))}

        {/* Main Slipper */}
        <motion.div
          className="relative z-10"
          animate={{
            x: [-50, 50, -50], // Horizontal slide
            y: [-20, 20, -20], // Vertical float
            rotate: [-8, 8, -8], // Enhanced rotation
          }}
          transition={{
            duration: currentSpeed.duration,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          <motion.img
            src={imageSrc}
            alt="Advanced Animated Slipper"
            className={`${currentSize.width} ${currentSize.height} object-cover rounded-lg shadow-2xl`}
            whileHover={{
              scale: 1.15,
              rotate: [0, 5, -5, 0],
              transition: { duration: 0.4 }
            }}
            animate={{
              boxShadow: [
                '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
                '0 35px 60px -12px rgba(59, 130, 246, 0.3)',
                '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
              ]
            }}
            transition={{
              boxShadow: {
                duration: currentSpeed.duration,
                repeat: Infinity,
                ease: "easeInOut",
              }
            }}
          />
        </motion.div>

        {/* Additional Glow Effects */}
        <motion.div
          className={`absolute inset-0 ${currentSize.glowSize} bg-gradient-to-br from-purple-400/10 to-blue-400/10 rounded-full blur-2xl`}
          animate={{
            rotate: [0, 360],
            scale: [0.8, 1.2, 0.8],
          }}
          transition={{
            duration: currentSpeed.duration * 2,
            repeat: Infinity,
            ease: "linear",
          }}
        />
      </div>
    </div>
  )
}

export default AdvancedAnimatedSlipper