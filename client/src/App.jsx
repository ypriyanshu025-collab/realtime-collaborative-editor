import React, { useState, useEffect, useRef } from 'react';
import Editor from '@monaco-editor/react';
import * as Y from 'yjs';
import { WebsocketProvider } from 'y-websocket';
import { MonacoBinding } from 'y-monaco';
import { Wifi, WifiOff, Code2, Users } from 'lucide-react';

function App() {
  const [room, setRoom] = useState('demo-room');
  const [connected, setConnected] = useState(false);
  const [language, setLanguage] = useState('javascript');
  
  const editorRef = useRef(null);
  const providerRef = useRef(null);
  const bindingRef = useRef(null);

  function handleEditorDidMount(editor, monaco) {
    editorRef.current = editor;

    const ydoc = new Y.Doc();

    const provider = new WebsocketProvider(
      'ws://localhost:5000',
      room,
      ydoc
    );
    providerRef.current = provider;

    provider.on('status', (event) => {
      setConnected(event.status === 'connected');
    });

    const ytext = ydoc.getText('monaco');

    const binding = new MonacoBinding(
      ytext,
      editor.getModel(),
      new Set([editor]),
      provider.awareness
    );
    bindingRef.current = binding;
  }

  useEffect(() => {
    return () => {
      if (bindingRef.current) bindingRef.current.destroy();
      if (providerRef.current) providerRef.current.destroy();
    };
  }, [room]);

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: '#1e1e1e', color: '#fff', fontFamily: 'sans-serif' }}>
      <header style={{ height: '60px', padding: '0 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #333' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Code2 color="#61dafb" size={28} />
          <h2 style={{ margin: 0, fontSize: '1.2rem', fontWeight: '600' }}>Collaborative Code Engine</h2>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#2a2a2a', padding: '6px 12px', borderRadius: '6px' }}>
            <Users size={16} color="#888" />
            <span style={{ fontSize: '0.85rem', color: '#aaa' }}>Room:</span>
            <input
              type="text"
              value={room}
              onChange={(e) => setRoom(e.target.value)}
              style={{ background: 'transparent', border: 'none', color: '#fff', outline: 'none', width: '100px', fontWeight: 'bold' }}
            />
          </div>

          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            style={{ background: '#2a2a2a', border: 'none', color: '#fff', padding: '6px 12px', borderRadius: '6px', outline: 'none' }}
          >
            <option value="javascript">JavaScript</option>
            <option value="typescript">TypeScript</option>
            <option value="python">Python</option>
            <option value="cpp">C++</option>
          </select>

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', padding: '6px 12px', borderRadius: '20px', backgroundColor: connected ? 'rgba(76, 175, 80, 0.15)' : 'rgba(244, 67, 54, 0.15)', color: connected ? '#4caf50' : '#f44336' }}>
            {connected ? <Wifi size={16} /> : <WifiOff size={16} />}
            <span>{connected ? 'Connected' : 'Disconnected'}</span>
          </div>
        </div>
      </header>

      <div style={{ flex: 1 }}>
        <Editor
          height="100%"
          theme="vs-dark"
          language={language}
          defaultValue="// Write or paste code here to collaborate in real time..."
          onMount={handleEditorDidMount}
          options={{
            fontSize: 14,
            automaticLayout: true,
            minimap: { enabled: true },
            scrollBeyondLastLine: false,
            padding: { top: 12 },
          }}
        />
      </div>
    </div>
  );
}

export default App;
