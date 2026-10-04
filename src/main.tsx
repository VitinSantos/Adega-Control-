import React, { Component, type ErrorInfo, type ReactNode } from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { AppProvider } from './context/AppContext';
import './index.css';

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('[v0] Erro inesperado na interface:', error, info.componentStack);
  }

  render() {
    if (this.state.hasError) {
      return (
        <main className="flex min-h-screen items-center justify-center bg-gray-50 p-6 text-gray-900 dark:bg-gray-900 dark:text-gray-100">
          <section className="w-full max-w-md rounded-2xl border border-red-200 bg-white p-6 text-center shadow-sm dark:border-red-900 dark:bg-gray-800">
            <h1 className="text-lg font-bold">O sistema encontrou um erro</h1>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
              Recarregue a página. Se o problema continuar, verifique a configuração do Supabase.
            </p>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="mt-5 rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700"
            >
              Recarregar sistema
            </button>
          </section>
        </main>
      );
    }

    return this.props.children;
  }
}

const root = document.getElementById('root');

if (!root) {
  throw new Error('Elemento raiz da aplicação não encontrado.');
}

ReactDOM.createRoot(root).render(
  <React.StrictMode>
    <ErrorBoundary>
      <AppProvider>
        <App />
      </AppProvider>
    </ErrorBoundary>
  </React.StrictMode>
);
