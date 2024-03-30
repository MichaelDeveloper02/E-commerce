import React from 'react';
import ReactDOM from 'react-dom';
import App from './app'; // Importa el componente principal

// Renderiza el componente principal en el DOM
ReactDOM.render(<App />, document.getElementById('root'));

if (module.hot) {
    module.hot.accept();
  }