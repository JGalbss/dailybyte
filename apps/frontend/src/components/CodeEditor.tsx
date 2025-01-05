import { Languages } from '@dailybyte/shared';
import Editor from '@monaco-editor/react';
import { Button } from './Button';
import { useState } from 'react';
import { Problem } from '@dailybyte/shared';
import { SOLUTION_TEMPLATE } from '../utils/constants/solution-template';
import { useMutation } from '@tanstack/react-query';
import { Api, SubmitSolutionResponse } from '../utils/api';
import { tw } from '../utils/tw';
import { AttemptIndicator } from './AttemptIndicator';
import { Tooltip } from './Tooltip';

interface CodeEditorProps {
  problem: Problem;
}

export const CodeEditor = ({ problem }: CodeEditorProps) => {
  const [language, setLanguage] = useState<Languages>(Languages.JavaScript);
  const [solution, setSolution] = useState<string>(SOLUTION_TEMPLATE[language]);
  const [attemptCount, setAttemptCount] = useState<number>(0);

  const {
    mutate: runSolution,
    data: runSolutionData,
    isPending: isLoading,
  } = useMutation<SubmitSolutionResponse, Error, string>({
    mutationFn: async (solutionCode: string) => {
      return Api.submitSolution(solutionCode, problem.id).then((data) => {
        setAttemptCount(data.attemptCount);
        return data;
      });
    },
  });

  const MAX_ATTEMPTS = 5;
  const isSuccess = runSolutionData?.submission.status === 'success';

  return (
    <div className="h-full w-full">
      {/* Menu */}
      <div className="border-b border-gray-300 flex space-x-1.5 p-1.5 h-9 text-xs">
        <Tooltip content="Language, Note: we only support JavaScript for now" side="bottom">
          <select
            title="Language"
            disabled
            className="border rounded-md px-1.5 py-0.5 border-gray-300"
            value={language}
            onChange={(e) => setLanguage(e.target.value as Languages)}
          >
            {Object.values(Languages).map((language) => (
              <option key={language} value={language}>
                {language}
              </option>
            ))}
          </select>
        </Tooltip>

        <div className="flex-1" />

        {/* Attempts */}
        <Tooltip content="Attempts" side="bottom">
          <div className="flex items-center space-x-1">
            {[...Array(MAX_ATTEMPTS)].map((_, index) => (
              <AttemptIndicator
                key={index}
                index={index}
                attemptCount={attemptCount}
                isSuccess={isSuccess}
                isLoading={isLoading && index === attemptCount}
              />
            ))}
          </div>
        </Tooltip>

        <Button
          className="bg-green-300 hover:bg-green-400"
          onClick={() => runSolution(solution)}
          disabled={attemptCount >= MAX_ATTEMPTS || isSuccess}
        >
          Submit
        </Button>
      </div>

      {/* Editor */}
      <Editor
        options={{
          automaticLayout: true,
        }}
        language={language}
        theme="vs-light"
        value={solution}
        onChange={(value) => setSolution(value || '')}
      />
    </div>
  );
};
