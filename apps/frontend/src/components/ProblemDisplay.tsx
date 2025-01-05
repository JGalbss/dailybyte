import Markdown from 'react-markdown';
import { Problem } from '@dailybyte/shared';

interface ProblemDisplayProps {
  problem: Problem;
}

export const ProblemDisplay = ({ problem }: ProblemDisplayProps) => {
  return (
    <div className="w-full h-full">
      {/* Title */}
      <div className="border-b flex items-center border-gray-300 p-1.5 h-9">
        <h1 className="text-xs font-medium">{problem.title}</h1>
      </div>

      {/* Description */}
      <div className="h-[calc(100%-2.25rem)] flex flex-col overflow-y-auto p-2">
        <Markdown className="prose prose-sm max-w-none text-xs text-gray-700">
          {problem.description}
        </Markdown>
      </div>
    </div>
  );
};
