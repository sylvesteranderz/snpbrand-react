import React from 'react'

interface MetricGridProps {
  children: React.ReactNode
  cols?: 2 | 3 | 4
  className?: string
}

const MetricGrid: React.FC<MetricGridProps> = ({ children, cols = 4, className = '' }) => {
  const getColsClass = () => {
    switch (cols) {
      case 2:
        return 'grid-cols-2'
      case 3:
        return 'grid-cols-2 sm:grid-cols-3'
      case 4:
      default:
        return 'grid-cols-2 md:grid-cols-4'
    }
  }

  return (
    <div className={`grid ${getColsClass()} gap-4 ${className}`}>
      {children}
    </div>
  )
}

export default MetricGrid
