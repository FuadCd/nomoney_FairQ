import './globals.css'
import Navigation from '../components/Navigation'
import { ThemeProvider } from '../components/theme-provider'

export const metadata = {
  title: 'AccessER - Accessibility-Adjusted Emergency Room Burden Platform',
  description: 'Real-time accessibility equity layer for emergency departments',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased">
        <ThemeProvider defaultTheme="system" storageKey="accesser-theme">
          <Navigation />
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}
