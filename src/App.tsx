import { useState, useEffect } from 'react';
import { initSDK, getAccelerationMode } from './runanywhere';
import { PhotoOrganizer } from './components/PhotoOrganizer';

export function App() {
  const [sdkReady, setSdkReady] = useState(false);
  const [sdkError, setSdkError] = useState<string | null>(null);

  useEffect(() => {
    initSDK()
      .then(() => setSdkReady(true))
      .catch((err) => setSdkError(err instanceof Error ? err.message : String(err)));
  }, []);

  if (sdkError) {
    return (
      <div className="app-loading">
        <h2>SDK Error</h2>
        <p className="error-text">{sdkError}</p>
      </div>
    );
  }

  if (!sdkReady) {
    return (
      <div className="app-loading">
        <div className="spinner" />
        <h2>Loading RunAnywhere SDK...</h2>
        <p>Initializing on-device AI engine</p>
      </div>
    );
  }

  const accel = getAccelerationMode();

  return (
    <div className="app">
      <header className="app-header">
        <h1>Smart Photo Organizer</h1>
        <div className="header-info">
          <span className="badge badge-privacy">🔒 Privacy-First</span>
          <span className="badge badge-offline">📡 Offline</span>
          {accel && <span className="badge badge-accel">{accel === 'webgpu' ? '⚡ WebGPU' : '💻 CPU'}</span>}
        </div>
      </header>

      <main className="main-content">
        <PhotoOrganizer />
      </main>
    </div>
  );
}
