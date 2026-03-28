import type { Metadata } from "next"
import "./globals.css"

export const metadata: Metadata = {
  title: "Veltro — Hiring Decision Engine",
  description: "Veltro analyzes behavioral signals and produces defensible hiring recommendations for recruiting firms.",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col font-sans">{children}</body>
    </html>
  )
}
