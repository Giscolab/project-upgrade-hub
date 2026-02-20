import { App } from './App.js';

/**
 * Legacy entrypoint now delegates to the React runtime.
 */
const app = new App();

if (import.meta.hot) {
  import.meta.hot.dispose(() => {
    app.dispose();
  });
}
