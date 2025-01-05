export const EditorConsole = () => {
  return (
    <div className="flex flex-col">
      <div className="flex h-9 items-center justify-between border-b border-gray-300 p-2">
        <div className="text-xs font-medium">Console Output</div>
        <div className="text-xs text-gray-500">Clear</div>
      </div>

      <div className="flex-1 overflow-y-auto p-2">
        <div className="text-xs text-gray-500">No output</div>
      </div>
    </div>
  );
};
