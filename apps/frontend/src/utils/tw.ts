import { twMerge } from 'tailwind-merge';
import clsx from 'clsx';

export const tw = (...args: string[]) => {
  return twMerge(clsx(args));
};
