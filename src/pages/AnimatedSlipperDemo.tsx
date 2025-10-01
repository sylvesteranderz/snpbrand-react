import React, { useState } from 'react'
import { motion } from 'framer-motion'
import AnimatedSlipper from '../components/AnimatedSlipper'
import AdvancedAnimatedSlipper from '../components/AdvancedAnimatedSlipper'

const AnimatedSlipperDemo: React.FC = () => {
  const [activeDemo, setActiveDemo] = useState<'basic' | 'advanced'>('basic')
  const [size, setSize] = useState<'sm' | 'md' | 'lg' | 'xl'>('lg')
  const [speed, setSpeed] = useState<'slow' | 'normal' | 'fast'>('normal')

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen bg-gray-50"
    >
      {/* Header */}
      <div className="text-center py-8 bg-white shadow-sm">
        <h1 className="text-4xl font-bold text-gray-800 mb-2">
          Animated Slipper Demo
        </h1>
        <p className="text-lg text-gray-600 mb-6">
          Watch the slipper float and rotate smoothly
        </p>
        
        {/* Controls */}
        <div className="flex flex-wrap justify-center gap-4 mb-4">
          <div className="flex gap-2">
            <button
              onClick={() => setActiveDemo('basic')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                activeDemo === 'basic' 
                  ? 'bg-blue-500 text-white' 
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Basic Animation
            </button>
            <button
              onClick={() => setActiveDemo('advanced')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                activeDemo === 'advanced' 
                  ? 'bg-blue-500 text-white' 
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Advanced Animation
            </button>
          </div>
        </div>

        {activeDemo === 'advanced' && (
          <div className="flex flex-wrap justify-center gap-4">
            <div className="flex gap-2">
              <label className="text-sm font-medium text-gray-700">Size:</label>
              <select
                value={size}
                onChange={(e) => setSize(e.target.value as 'sm' | 'md' | 'lg' | 'xl')}
                className="px-3 py-1 border border-gray-300 rounded text-sm"
              >
                <option value="sm">Small</option>
                <option value="md">Medium</option>
                <option value="lg">Large</option>
                <option value="xl">Extra Large</option>
              </select>
            </div>
            <div className="flex gap-2">
              <label className="text-sm font-medium text-gray-700">Speed:</label>
              <select
                value={speed}
                onChange={(e) => setSpeed(e.target.value as 'slow' | 'normal' | 'fast')}
                className="px-3 py-1 border border-gray-300 rounded text-sm"
              >
                <option value="slow">Slow</option>
                <option value="normal">Normal</option>
                <option value="fast">Fast</option>
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Animated Slipper */}
      {activeDemo === 'basic' ? (
        <AnimatedSlipper 
          imageSrc="/images/SnPimage.jpg"
          className="bg-gradient-to-br from-blue-50 to-purple-50"
        />
      ) : (
        <AdvancedAnimatedSlipper 
          imageSrc="/images/SnPimage.jpg"
          className="bg-gradient-to-br from-blue-50 to-purple-50"
          size={size}
          animationSpeed={speed}
        />
      )}

      {/* Additional Info */}
      <div className="text-center py-8 bg-white">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">
            Animation Features
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm text-gray-600">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold text-gray-800 mb-2">Floating Motion</h3>
              <p>Smoothly slides left and right with customizable duration</p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold text-gray-800 mb-2">3D Rotation</h3>
              <p>Subtle back and forth rotation for depth effect</p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold text-gray-800 mb-2">Interactive</h3>
              <p>Hover to scale up with smooth transition</p>
            </div>
            {activeDemo === 'advanced' && (
              <>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-gray-800 mb-2">Glow Effect</h3>
                  <p>Animated background glow that pulses with the movement</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-gray-800 mb-2">Floating Particles</h3>
                  <p>Small particles that orbit around the slipper</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-gray-800 mb-2">Vertical Float</h3>
                  <p>Additional vertical movement for more dynamic animation</p>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  )
}

export default AnimatedSlipperDemo
