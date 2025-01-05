import { CodeEditor } from '../../components/CodeEditor';

import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels';
import { EditorConsole } from '../../components/EditorConsole';

export const ProblemGroup = () => {
  const defaultLayout: readonly [number, number] = [33, 67] as const;

  const onLayout = (sizes: number[]) => {
    document.cookie = `react-resizable-panels:layout=${JSON.stringify(sizes)}`;
  };

  return (
    <PanelGroup direction="horizontal" onLayout={onLayout}>
      <Panel defaultSize={defaultLayout[0]}>
        <div className="h-screen" id="placholder for question"></div>
      </Panel>
      <PanelResizeHandle className="w-px bg-gray-300" />
      <Panel>
        <PanelGroup direction="vertical">
          <Panel>
            <CodeEditor />
          </Panel>
          <PanelResizeHandle className="h-px bg-gray-300" />
          <Panel>
            <EditorConsole />
          </Panel>
        </PanelGroup>
      </Panel>
    </PanelGroup>
  );
};
