import React from 'react';
import { tw } from '../utils/tw';

interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg';
}

const sizeClasses = {
  sm: 'w-4 h-4',
  md: 'w-8 h-8',
  lg: 'w-12 h-12',
};

export function Spinner({ size = 'md' }: SpinnerProps) {
  return (
    <div className={tw('flex justify-center items-center')}>
      <div
        className={tw(
          sizeClasses[size],
          'border-2 border-gray-200 rounded-full animate-spin',
          'border-t-gray-500 border-l-gray-500',
        )}
        role="status"
        aria-label="loading"
      >
        <span className="sr-only">Loading...</span>
      </div>
    </div>
  );
}
