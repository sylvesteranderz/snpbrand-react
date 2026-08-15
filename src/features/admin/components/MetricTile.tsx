import React from 'react';

interface MetricTileProps {
  label: string;
  value: string | number;
  icon?: React.ReactNode;
  valueClass?: string;
  className?: string;
}

const MetricTile: React.FC<MetricTileProps> = ({
  label,
  value,
  icon,
  valueClass = 'text-gray-900',
  className = '',
}) => {
  return (
    <div className={`bg-white p-5 border border-gray-200 rounded-2xl shadow-sm hover:shadow-md transition-all flex flex-col justify-between ${className}`}>
      <div className="flex justify-between items-start gap-4">
        <div className="min-w-0">
          <span className="text-gray-500 text-xs font-semibold uppercase tracking-wider block">
            {label}
          </span>
          <span className={`text-xl sm:text-2xl font-extrabold mt-2 block truncate ${valueClass}`}>
            {value}
          </span>
        </div>
        {icon && (
          <div className="p-2.5 bg-gray-50 border border-gray-100 rounded-xl shrink-0">
            {icon}
          </div>
        )}
      </div>
    </div>
  );
};

export default MetricTile;
