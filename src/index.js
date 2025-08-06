import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';

// Importações do Redux
import { state, persistor } from "./store";
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';

// Importação do React Router
import { BrowserRouter } from 'react-router-dom';

// Importação do LoadingContext - AGORA ESTÁ AQUI! 🎉
import { LoadingProvider } from './componets/LoadingContext'; // Verifique o caminho real

import axios from 'axios';
axios.defaults.baseURL = 'https://eu-desenvolvo-default-rtdb.firebaseio.com/';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode> {/* É uma boa prática manter o React.StrictMode */}
    {/* O LoadingProvider DEVE ser o componente mais externo para envolver tudo */}
    <LoadingProvider>
      <Provider store={state}>
        <PersistGate persistor={persistor} loading={null} >
            <BrowserRouter>
              <App />
            </BrowserRouter>
        </PersistGate>
      </Provider>
    </LoadingProvider>
  </React.StrictMode>
);

reportWebVitals();
