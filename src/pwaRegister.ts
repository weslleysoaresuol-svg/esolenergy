/**
 * Utilitário de Registro e Lifecycle do PWA da Esol Energy
 */

export interface PwaRegistrationOptions {
  onNeedRefresh?: () => void;
  onOfflineReady?: () => void;
  onNetworkChange?: (isOnline: boolean) => void;
}

export function isOnline(): boolean {
  return typeof navigator !== 'undefined' ? navigator.onLine : true;
}

export function onNetworkStatusChange(callback: (isOnline: boolean) => void): () => void {
  if (typeof window === 'undefined') return () => {};

  const handleOnline = () => callback(true);
  const handleOffline = () => callback(false);

  window.addEventListener('online', handleOnline);
  window.addEventListener('offline', handleOffline);

  return () => {
    window.removeEventListener('online', handleOnline);
    window.removeEventListener('offline', handleOffline);
  };
}

export function registerServiceWorker(options?: PwaRegistrationOptions): void {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
    console.log('[PWA] Service Worker não suportado neste ambiente.');
    return;
  }

  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/sw.js')
      .then((registration) => {
        console.log('[PWA] Service Worker registrado com sucesso no escopo:', registration.scope);

        registration.onupdatefound = () => {
          const installingWorker = registration.installing;
          if (installingWorker) {
            installingWorker.onstatechange = () => {
              if (installingWorker.state === 'installed') {
                if (navigator.serviceWorker.controller) {
                  console.log('[PWA] Nova versão disponível! Notificando aplicação...');
                  options?.onNeedRefresh?.();
                } else {
                  console.log('[PWA] Conteúdo em cache para uso offline.');
                  options?.onOfflineReady?.();
                }
              }
            };
          }
        };
      })
      .catch((error) => {
        console.error('[PWA] Erro ao registrar Service Worker:', error);
      });
  });

  if (options?.onNetworkChange) {
    onNetworkStatusChange(options.onNetworkChange);
  }
}
