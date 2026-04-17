import { createRoot } from 'react-dom/client';
import App from './app/App.tsx';
import { GlobalStyles } from './design/primitives.tsx';
import './styles/index.css';

createRoot(document.getElementById('root')!).render(
  <>
    <GlobalStyles />
    <App />
  </>
);
