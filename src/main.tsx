import React from 'react';
import ReactDOM from 'react-dom/client';
import { HashRouter } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import './styles.css';
import App from './App';

// Aqui arrancamos toda la aplicacion React y cargamos los estilos globales.
ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    {/* Usamos HashRouter para que las rutas funcionen facil en este tipo de proyecto */}
    <HashRouter>
      <App />
    </HashRouter>
  </React.StrictMode>
);
