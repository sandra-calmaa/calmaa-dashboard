'use client'

import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function Header() {
  const router = useRouter()

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <header
      className="border-b px-6 py-4 flex items-center justify-between"
      style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}
    >
      <div className="flex items-center gap-2.5">
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold text-base"
          style={{ backgroundColor: 'var(--accent)' }}
        >
          C
        </div>
        <span className="text-xl font-bold tracking-tight" style={{ color: 'var(--text)' }}>
          Calmaa
        </span>
      </div>

      <button
        onClick={handleLogout}
        className="text-sm px-4 py-1.5 rounded-lg border transition-colors"
        style={{
          color: 'var(--text-muted)',
          borderColor: 'var(--border)',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.color = 'var(--text)'
          e.currentTarget.style.borderColor = 'var(--accent)'
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.color = 'var(--text-muted)'
          e.currentTarget.style.borderColor = 'var(--border)'
        }}
      >
        Cerrar sesión
      </button>
    </header>
  )
}
