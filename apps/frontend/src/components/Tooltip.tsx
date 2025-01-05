import * as RadixTooltip from '@radix-ui/react-tooltip';
import { ReactNode } from 'react';

interface TooltipProps extends RadixTooltip.TooltipContentProps {
  content: string;
  children: ReactNode;
}

export const Tooltip = ({ content, children, ...props }: TooltipProps) => {
  return (
    <RadixTooltip.Provider>
      <RadixTooltip.Root>
        <RadixTooltip.Trigger asChild>{children}</RadixTooltip.Trigger>
        <RadixTooltip.Portal>
          <RadixTooltip.Content
            className="bg-white rounded-md p-2 shadow-lg text-xs text-gray-500"
            sideOffset={5}
            {...props}
          >
            {content}
          </RadixTooltip.Content>
        </RadixTooltip.Portal>
      </RadixTooltip.Root>
    </RadixTooltip.Provider>
  );
};
