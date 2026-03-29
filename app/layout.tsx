import type { Metadata } from "next"
import "./globals.css"

export const metadata: Metadata = {
  title: "Veltro — Hiring Decision Engine",
  description: "Veltro turns a read on a candidate into a scored report — giving search and staffing firms a deliverable their clients can hold and act on.",
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
