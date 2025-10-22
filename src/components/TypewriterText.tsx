import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'

interface TypewriterTextProps {
  texts: string[]
  speed?: number
  deleteSpeed?: number
  pauseTime?: number
  className?: string
  highlightWords?: string[]
  highlightColor?: string
}

const TypewriterText = ({ 
  texts, 
  speed = 100, 
  deleteSpeed = 50, 
  pauseTime: _pauseTime = 2000,
  className = '',
  highlightWords = [],
  highlightColor = 'text-primary-500'
}: TypewriterTextProps) => {
  const [currentTextIndex, setCurrentTextIndex] = useState(0)
  const [currentText, setCurrentText] = useState('')
  const [isDeleting, setIsDeleting] = useState(false)
  const [isPaused, setIsPaused] = useState(false)

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (isPaused) {
        setIsPaused(false)
        setIsDeleting(true)
        return
      }

      const fullText = texts[currentTextIndex]
      
      if (isDeleting) {
        setCurrentText(fullText.substring(0, currentText.length - 1))
        
        if (currentText === '') {
          setIsDeleting(false)
          setCurrentTextIndex((prev) => (prev + 1) % texts.length)
        }
      } else {
        setCurrentText(fullText.substring(0, currentText.length + 1))
        
        if (currentText === fullText) {
          setIsPaused(true)
        }
      }
    }, isDeleting ? deleteSpeed : speed)

    return () => clearTimeout(timeout)
  }, [currentText, isDeleting, isPaused, currentTextIndex, texts, speed, deleteSpeed])

  const renderText = () => {
    const words = currentText.split(' ')
    return words.map((word, index) => {
      const isHighlighted = highlightWords.some(highlightWord => 
        word.toLowerCase().includes(highlightWord.toLowerCase())
      )
      
      return (
        <span key={index}>
          {isHighlighted ? (
            <span className={highlightColor}>{word}</span>
          ) : (
            word
          )}
          {index < words.length - 1 && ' '}
        </span>
      )
    })
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className={className}
    >
      <span className="inline-block">
        {renderText()}
        <motion.span
          animate={{ opacity: [0, 1, 0] }}
          transition={{ duration: 0.8, repeat: Infinity }}
          className="inline-block w-0.5 h-8 bg-primary-500 ml-1"
        />
      </span>
    </motion.div>
  )
}

export default TypewriterText
