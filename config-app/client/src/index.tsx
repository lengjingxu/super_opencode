import { render } from 'solid-js/web';
import { ServerGate } from './server-gate';

render(() => (
  <ServerGate>
    {(data) => (
      <div style={{ padding: '20px' }}>
        <h1>OpenCode Client</h1>
        <p>Server URL: {data().url}</p>
        <p>Status: Connected</p>
        <div style={{ 'margin-top': '20px' }}>
          <p>Client is running. Full UI integration coming soon.</p>
        </div>
      </div>
    )}
  </ServerGate>
), document.getElementById('root')!);
