'use client';

import { CodeEditor } from '../../components/CodeEditor';

import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels';
import { EditorConsole } from '../../components/EditorConsole';

import { Problem } from '@dailybyte/shared';
import { ProblemDisplay } from '../../components/ProblemDisplay';

interface ProblemGroupProps {
  problem: Problem;
}

export const ProblemGroup = ({ problem }: ProblemGroupProps) => {
  const defaultHorizontalLayout: readonly [number, number] = [33, 67] as const;
  const defaultVerticalLayout: readonly [number, number] = [70, 30] as const;

  const onHorizontalLayout = (sizes: number[]) => {
    document.cookie = `react-resizable-panels:horizontal=${JSON.stringify(sizes)}`;
  };

  const onVerticalLayout = (sizes: number[]) => {
    document.cookie = `react-resizable-panels:vertical=${JSON.stringify(sizes)}`;
  };

  return (
    <PanelGroup className="h-full w-full" direction="horizontal" onLayout={onHorizontalLayout}>
      <Panel defaultSize={defaultHorizontalLayout[0]}>
        <ProblemDisplay problem={problem} />
      </Panel>
      <PanelResizeHandle className="w-px bg-gray-300" />
      <Panel defaultSize={defaultHorizontalLayout[1]}>
        <PanelGroup direction="vertical" onLayout={onVerticalLayout}>
          <Panel defaultSize={defaultVerticalLayout[0]}>
            <CodeEditor problem={problem} />
          </Panel>
          <PanelResizeHandle className="h-px bg-gray-300" />
          <Panel defaultSize={defaultVerticalLayout[1]}>
            <EditorConsole />
          </Panel>
        </PanelGroup>
      </Panel>
    </PanelGroup>
  );
};
