import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface LuxuryLoaderProps {
  onComplete: () => void
}

const LuxuryLoader = ({ onComplete }: LuxuryLoaderProps) => {
  const [progress, setProgress] = useState(0)
  const [currentText, setCurrentText] = useState('')
  const [textIndex, setTextIndex] = useState(0)

  const loadingTexts = [
    "Crafting Excellence",
    "Curating Style",
    "Perfecting Details",
    "Creating Magic"
  ]

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(timer)
          setTimeout(onComplete, 1000)
          return 100
        }
        return prev + 1.5
      })
    }, 30)

    return () => clearInterval(timer)
  }, [onComplete])

  useEffect(() => {
    const textTimer = setInterval(() => {
      setTextIndex((prev) => (prev + 1) % loadingTexts.length)
    }, 800)

    return () => clearInterval(textTimer)
  }, [])

  useEffect(() => {
    const text = loadingTexts[textIndex]
    let i = 0
    const typeTimer = setInterval(() => {
      if (i <= text.length) {
        setCurrentText(text.substring(0, i))
        i++
      } else {
        clearInterval(typeTimer)
      }
    }, 100)

    return () => clearInterval(typeTimer)
  }, [textIndex])

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 1 }}
        exit={{ opacity: 0, scale: 0.8 }}
        transition={{ duration: 0.8 }}
        className="fixed inset-0 z-50 bg-gradient-to-br from-gray-900 via-gray-800 to-black flex flex-col items-center justify-center"
      >
        {/* Animated Background */}
        <div className="absolute inset-0 overflow-hidden">
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 bg-white rounded-full"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
              animate={{
                opacity: [0, 1, 0],
                scale: [0, 1, 0],
              }}
              transition={{
                duration: 2 + Math.random() * 2,
                repeat: Infinity,
                delay: Math.random() * 2,
              }}
            />
          ))}
        </div>

        {/* Logo Animation */}
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          className="mb-12 relative"
        >
          <div className="relative">
            <img 
              src="/images/logo.png" 
              alt="SnP Brand Logo" 
              className="h-32 w-auto"
            />
            
            {/* Glow Effect */}
            <motion.div
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.3, 0.6, 0.3],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              className="absolute inset-0 bg-gradient-to-r from-primary-400 to-accent-400 rounded-full blur-2xl -z-10"
            />
          </div>
        </motion.div>

        {/* Brand Name */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.5 }}
          className="text-6xl font-chilanka font-normal text-white mb-8 text-center"
        >
          SnP Brand
        </motion.h1>

        {/* Typing Text */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 1 }}
          className="text-xl text-gray-300 mb-12 text-center min-h-[2rem]"
        >
          {currentText}
          <motion.span
            animate={{ opacity: [0, 1, 0] }}
            transition={{ duration: 0.8, repeat: Infinity }}
            className="ml-1"
          >
            |
          </motion.span>
        </motion.div>

        {/* Progress Bar */}
        <div className="w-80 h-1 bg-gray-700 rounded-full overflow-hidden mb-4">
          <motion.div
            className="h-full bg-gradient-to-r from-primary-500 via-accent-500 to-primary-500"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.1 }}
          />
        </div>

        {/* Progress Text */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 1.5 }}
          className="text-gray-400 text-sm"
        >
          {progress}%
        </motion.p>

        {/* Luxury Elements */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 2 }}
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex space-x-8"
        >
          <div className="text-center">
            <div className="w-8 h-8 border border-gray-600 rounded-full flex items-center justify-center mb-2">
              <div className="w-2 h-2 bg-primary-500 rounded-full"></div>
            </div>
            <span className="text-xs text-gray-500">Premium</span>
          </div>
          <div className="text-center">
            <div className="w-8 h-8 border border-gray-600 rounded-full flex items-center justify-center mb-2">
              <div className="w-2 h-2 bg-accent-500 rounded-full"></div>
            </div>
            <span className="text-xs text-gray-500">Quality</span>
          </div>
          <div className="text-center">
            <div className="w-8 h-8 border border-gray-600 rounded-full flex items-center justify-center mb-2">
              <div className="w-2 h-2 bg-primary-500 rounded-full"></div>
            </div>
            <span className="text-xs text-gray-500">Style</span>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

export default LuxuryLoader
