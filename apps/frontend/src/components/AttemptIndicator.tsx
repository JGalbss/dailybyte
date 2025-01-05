import { tw } from '../utils/tw';
import { CheckIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { memo } from 'react';
import { Spinner } from './Spinner';

interface AttemptIndicatorProps {
  attemptCount: number;
  isSuccess: boolean;
  index: number;
  isLoading: boolean;
}
export const AttemptIndicator = memo(
  ({ attemptCount, isSuccess, index, isLoading }: AttemptIndicatorProps) => {
    const hasAttempt = index < attemptCount;

    const getAttemptStyle = () => {
      if (!hasAttempt) {
        return 'border-gray-300 bg-gray-100 text-gray-400';
      }
      return isSuccess
        ? 'bg-green-300 border-green-400 text-green-700'
        : 'bg-red-300 border-red-400 text-red-700';
    };

    const getAttemptTitle = () => {
      if (!hasAttempt) {
        return 'Unused attempt';
      }
      return isSuccess ? 'Successful attempt' : 'Failed attempt';
    };

    const getAttemptIcon = () => {
      if (isLoading) {
        return <Spinner size="sm" />;
      }

      if (!hasAttempt) {
        return '-';
      }
      return isSuccess ? <CheckIcon className="h-3 w-3" /> : <XMarkIcon className="h-3 w-3" />;
    };

    return (
      <div
        className={tw(
          'h-6 w-6 rounded-md border text-xs flex items-center justify-center transition-colors duration-200',
          getAttemptStyle(),
        )}
        title={getAttemptTitle()}
      >
        {getAttemptIcon()}
      </div>
    );
  },
);
