import React from 'react';
import ReactDOM from 'react-dom';
import { Sandbox } from './sandbox';

ReactDOM.render(
  <React.StrictMode>
    <Sandbox />
  </React.StrictMode>,
  document.getElementById('root')
);

export * from './hooks';