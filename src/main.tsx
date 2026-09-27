import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './styles/base.css';
import './styles/app.css';
import './styles/linkedin.css';
import './styles/tour.css';
import './styles/landing.css';
import { Root } from './Root';

createRoot(document.getElementById('root')!).render(<StrictMode><Root /></StrictMode>);
