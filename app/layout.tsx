import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Dopp AI',
  description: 'A new class of AI agents that embody how we think, express and connect, turning presence into something programmable, scalable and alive.',
  keywords: ['AI', 'artificial intelligence', 'agents', 'doppai', 'voice', 'automation'],
  authors: [{ name: 'DoppAI Team' }],
  creator: 'DoppAI',
  publisher: 'DoppAI',
  robots: 'index, follow',
  icons: {
    icon: '/public/doppaitransp.png',
    shortcut: '/public/doppaitransp.png',
    apple: '/public/doppaitransp.png',
  },
  openGraph: {
    title: 'Dopp AI',
    description: 'A new class of AI agents that embody how we think, express and connect.',
    url: 'https://doppai.com',
    siteName: 'Dopp AI',
    images: [
      {
        url: '/public/doppaitransp.png',
        width: 1200,
        height: 630,
        alt: 'Dopp AI Logo',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Dopp AI',
    description: 'A new class of AI agents that embody how we think, express and connect.',
    images: ['/public/doppaitransp.png'],
  },
  viewport: 'width=device-width, initial-scale=1',
  themeColor: '#f5b0be',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/public/doppaitransp.png" />
        <script async src="https://platform.twitter.com/widgets.js" charSet="utf-8"></script>
      </head>
      <body className={inter.className}>
        {children}
      </body>
    </html>
  )
} 