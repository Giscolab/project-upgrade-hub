import React from 'react';
import { createRoot } from 'react-dom/client';
import ReactApp from './src/App.tsx';

/**
 * Legacy compatibility bridge.
 *
 * This file keeps the historical `App` class API intact while delegating
 * the runtime to the React application.
 */
export function mountReactApp(container = document.getElementById('root')) {
  if (!container) {
    throw new Error('Unable to mount React app: #root element is missing.');
  }

  const root = createRoot(container);
  root.render(React.createElement(ReactApp));
  return root;
}

export class App {
  constructor(options = {}) {
    this.container = options.container ?? document.getElementById('root');
    this.root = mountReactApp(this.container);
  }

  dispose() {
    this.root?.unmount();
    this.root = null;
  }
}

export { ReactApp as ShaderStudioReactApp };

export default App;
