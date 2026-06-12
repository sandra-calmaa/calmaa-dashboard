'use client'

const EXPO_GO_APP_STORE = 'https://apps.apple.com/app/expo-go/id982107779'

export default function DownloadButton({ url }: { url: string }) {
  const isExpoGo = url.startsWith('exp://')
  const isAppStore = url.includes('apps.apple.com')

  function handleExpoOpen() {
    window.location.href = url
    // If Expo Go isn't installed, redirect to App Store after 2s
    setTimeout(() => {
      window.location.href = EXPO_GO_APP_STORE
    }, 2000)
  }

  if (isExpoGo) {
    return (
      <div className="w-full">
        <button
          onClick={handleExpoOpen}
          className="inline-flex items-center gap-2.5 px-6 py-3.5 rounded-xl text-white font-semibold text-base w-full justify-center"
          style={{ backgroundColor: 'var(--accent)' }}
        >
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
          </svg>
          Abrir en Expo Go
        </button>
        <p className="text-xs mt-3 text-center" style={{ color: 'var(--text-muted)' }}>
          Si no tenés Expo Go instalado, te llevamos al App Store automáticamente.
        </p>
      </div>
    )
  }

  return (
    <a
      href={url}
      className="inline-flex items-center gap-2.5 px-6 py-3.5 rounded-xl text-white font-semibold text-base w-full justify-center"
      style={{ backgroundColor: 'var(--accent)' }}
    >
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
        <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
      </svg>
      {isAppStore ? 'Descargar en el App Store' : 'Descargar en TestFlight'}
    </a>
  )
}
