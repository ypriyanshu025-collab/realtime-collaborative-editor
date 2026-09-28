import React, { useState, useRef } from "react";
import Editor from "@monaco-editor/react";
import * as Y from "yjs";
import { WebsocketProvider } from "y-websocket";

export default function App() {
  const [status, setStatus] = useState("Connecting...");
  const providerRef = useRef(null);
  const docRef = useRef(null);

  const handleEditorDidMount = (editor) => {
    const doc = new Y.Doc();
    docRef.current = doc;

    const provider = new WebsocketProvider(
      "ws://localhost:5000",
      "default-room",
      doc
    );
    providerRef.current = provider;

    const yText = doc.getText("monaco");

    provider.on("status", (event) => {
      setStatus(event.status === "connected" ? "Connected" : "Disconnected");
    });

    // Sync editor content with Yjs text document
    let isLocalChange = false;

    yText.observe(() => {
      if (!isLocalChange) {
        const currentContent = editor.getValue();
        const yContent = yText.toString();
        if (currentContent !== yContent) {
          editor.setValue(yContent);
        }
      }
    });

    editor.onDidChangeModelContent(() => {
      isLocalChange = true;
      const val = editor.getValue();
      if (yText.toString() !== val) {
        doc.transact(() => {
          yText.delete(0, yText.length);
          yText.insert(0, val);
        });
      }
      isLocalChange = false;
    });
  };

  return (
    <div style={{ height: "100vh", display: "flex", flexDirection: "column", backgroundColor: "#1e1e1e", color: "#fff" }}>
      <header style={{ padding: "10px 20px", display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid #333" }}>
        <h2 style={{ margin: 0, fontSize: "18px" }}>⚡ Real-Time Collaborative Code Editor</h2>
        <span style={{ padding: "4px 12px", borderRadius: "12px", fontSize: "13px", fontWeight: "bold", backgroundColor: status === "Connected" ? "#1e4620" : "#5a1e1e" }}>
          {status === "Connected" ? "🟢 Connected" : "🔴 Disconnected"}
        </span>
      </header>
      <div style={{ flex: 1 }}>
        <Editor
          height="100%"
          defaultLanguage="javascript"
          defaultValue="// Type code here to collaborate live...\n"
          theme="vs-dark"
          onMount={handleEditorDidMount}
        />
      </div>
    </div>
  );
}