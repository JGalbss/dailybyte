import { Languages } from '@dailybyte/shared';
import Editor from '@monaco-editor/react';
import { Button } from './Button';
import { useState } from 'react';

export const CodeEditor = () => {
  const [language, setLanguage] = useState<Languages>(Languages.JavaScript);

  return (
    <div className="h-full w-full">
      {/* Menu */}
      <div className="border-b flex space-x-1.5 p-1.5 text-xs">
        <select
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

        <div className="flex-1" />

        <Button className="bg-gray-200 hover:bg-gray-300">Run</Button>
        <Button className="bg-green-300 hover:bg-green-400">Submit</Button>
      </div>

      {/* Editor */}
      <Editor
        options={{
          automaticLayout: true,
        }}
        language={language}
        theme="vs-light"
      />
    </div>
  );
};
