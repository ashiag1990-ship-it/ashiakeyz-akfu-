import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'AKFU - Ashia Keyz Film University',
  description: 'Interactive AI-powered film creation platform',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="bg-akfu-dark text-white">
        <div className="min-h-screen flex flex-col">
          {children}
        </div>
      </body>
    </html>
  )
}
