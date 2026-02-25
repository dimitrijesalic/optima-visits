import type React from 'react'

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-[#e8f4fb] to-white">
      <main className="w-full max-w-md px-4">
        {children}
      </main>
    </div>
  )
}
