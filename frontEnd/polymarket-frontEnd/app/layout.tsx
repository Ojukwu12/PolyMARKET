import './globals.css'
import NavBar from '../components/NavBar'

export const metadata = {
  title: 'Polymarket Frontend',
  description: 'Polymarket dashboard demo'
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000'
  const docsUrl = `${API_BASE}/docs`
  return (
    <html lang="en">
      <body>
        <div className="container">
          <header className="mb-8 md:mb-10">
            <NavBar docsUrl={docsUrl} />
          </header>

          <main>
            {children}
          </main>
          {/* Tailwind CDN fallback for dev previews when build step isn't available */}
          <script src="https://cdn.tailwindcss.com"></script>
        </div>
      </body>
    </html>
  )
}
