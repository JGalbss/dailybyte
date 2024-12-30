import { ButtonHTMLAttributes } from 'react';
import { twMerge } from 'tailwind-merge';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
}

export const Button = ({ children, className, ...props }: ButtonProps) => {
  return (
    <button
      className={twMerge(
        'text-gray-800 hover:bg-gray-200 rounded-md px-1.5 py-0.5',
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
};
