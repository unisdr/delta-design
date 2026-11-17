import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './styles/theme.css';
import { ComponentsView } from './showcase';

createRoot(document.getElementById('root')!).render(<StrictMode><main className="mx-auto max-w-[1280px] p-6"><ComponentsView /></main></StrictMode>);
