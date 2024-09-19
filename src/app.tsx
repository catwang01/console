import { useEffect, useState } from "react";
import { Panel, PanelResizeHandle, PanelGroup } from "react-resizable-panels";
import { compress, decompress } from "lz-string";

import { ConsoleProvider } from "./context/console";
import Editor, { type EditorProps } from "./components/editor";
import Logs from "./components/logs";
import Toolbar from "./components/toolbar";
import Runner from "./components/runner";
import styles from "./app.module.css";

export type ConsoleProps = EditorProps & { autoRun: boolean; };

export const Console = (props: ConsoleProps) => {
  return (
    <ConsoleProvider>
      <div className={styles.container}>
        <PanelGroup direction="horizontal" autoSaveId="panel_size">
          <Panel>
            <Editor {...props} />
          </Panel>
          <PanelResizeHandle className={styles.resize} />
          <Panel>
            <Logs />
          </Panel>
        </PanelGroup>
      </div>
      <Toolbar />
      <Runner autoRun={props.autoRun} />
    </ConsoleProvider>
  );
};

function parseParam(name: string, defaultValue: string | null | undefined): string | null | undefined
{
    const search = window.location.search;
    const params = new URLSearchParams(search);
    return params.get(name) || defaultValue;
}

export default function App() {
  const [code, setCode] = useState("");
  const autoRun = parseParam('autoRun', 'true') === 'true';
  const options = {
    domReadOnly: parseParam('readonly', 'false') === 'true',
  }

  const handleOnChange = (code?: string) => {
    setCode(code || "");
    const compressed = compress(code || "");
    localStorage.setItem("console:code", compressed);
  };

  useEffect(() => {
    const code = parseParam('code', '');
    if (code) 
    {
      setCode(decodeURIComponent(code) || "");
      return;
    }

    const compressed = localStorage.getItem("console:code");
    if (compressed) {
      const code = decompress(compressed);
      setCode(code || "");
      return;
    }
  }, []);

  return <Console defaultValue={code} {...options} autoRun={autoRun} onChange={handleOnChange} />;
}
