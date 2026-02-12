import { createSignal, Show, JSX } from 'solid-js';

interface ServerGateProps {
  children: (data: () => { url: string; password: string }) => JSX.Element;
}

export function ServerGate(props: ServerGateProps) {
  const [loading, setLoading] = createSignal(true);
  const [error, setError] = createSignal<string | null>(null);
  const [serverData, setServerData] = createSignal<{ url: string; password: string } | null>(null);

  const startServer = async () => {
    try {
      const result = await window.electronPlatform.openDirectoryPickerDialog();
      
      if (result.canceled || !result.filePaths || result.filePaths.length === 0) {
        setError('No directory selected');
        setLoading(false);
        return;
      }

      const cwd = result.filePaths[0];
      const port = 4096;
      
      const startResult = await window.electronPlatform.startServer(cwd, port);
      
      if (!startResult.success) {
        setError(startResult.error || 'Failed to start server');
        setLoading(false);
        return;
      }

      const password = await window.electronPlatform.getPassword();
      
      setServerData({
        url: `http://127.0.0.1:${port}`,
        password: password
      });
      setLoading(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      setLoading(false);
    }
  };

  startServer();

  return (
    <Show
      when={!loading() && !error() && serverData()}
      fallback={
        <div style={{ 
          display: 'flex', 
          'align-items': 'center', 
          'justify-content': 'center', 
          height: '100vh',
          'flex-direction': 'column',
          gap: '16px'
        }}>
          <Show when={error()}>
            <div style={{ color: 'red' }}>{error()}</div>
            <button onclick={() => { setError(null); setLoading(true); startServer(); }}>
              Retry
            </button>
          </Show>
          <Show when={loading()}>
            <div>Starting OpenCode Server...</div>
          </Show>
        </div>
      }
    >
      {props.children(serverData as () => { url: string; password: string })}
    </Show>
  );
}
