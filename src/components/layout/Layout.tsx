import { Outlet, useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import LetterGlitch from '@/components/LetterGlitch'
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import ASCIIText from '@/components/ASCIIText'

export function Layout() {
  const logout = useAuthStore((s) => s.logout)
  const navigate = useNavigate()

  function handleLogout() {
    logout()
    navigate('/login')
  }

  return (
    <div style={{ position: 'fixed', inset: 0, display: 'flex', flexDirection: 'column' }}>
      {/* Background animado */}
      <div style={{ position: 'absolute', inset: 0 }}>
        <LetterGlitch
          glitchColors={['#0f2347', '#1a3a6b', '#2d5fa8']}
          glitchSpeed={60}
          outerVignette={true}
          smooth={true}
        />
      </div>

      {/* Navbar */}
      <header style={{
        position: 'relative', zIndex: 10,
        background: 'rgba(16, 18, 32, 0.85)',
        borderBottom: '1px solid rgba(255,255,255,0.08)',
        padding: '0 20px',
        height: 64,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        backdropFilter: 'blur(8px)',
      }}>
        {/* ASCIIText container */}
        <div style={{ position: 'relative', width: 200, height: 50, overflow: 'hidden' }}>
          <ASCIIText
            text="PUC Minas"
            asciiFontSize={6}
            textFontSize={160}
            textColor="#ffffff"
            planeBaseHeight={6}
            enableWaves={true}
          />
        </div>

        <button
          onClick={handleLogout}
          style={{
            background: 'none', border: 'none', cursor: 'pointer',
            color: 'rgba(255,255,255,0.6)', fontSize: 13,
          }}
        >
          Sair
        </button>
      </header>

      {/* Conteúdo centralizado */}
      <main style={{
        position: 'relative', zIndex: 10,
        flex: 1, minHeight: 0,
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        padding: '20px 16px',
        overflowY: 'auto',
      }}>
        <div style={{ width: '100%', maxWidth: 560, flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }}>
          <Outlet />
        </div>
      </main>
    </div>
  )
}
