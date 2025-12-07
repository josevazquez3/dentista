'use client'

import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useEffect } from 'react'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === 'loading') return
    
    if (!session) {
      router.push('/login')
      return
    }

    if (session.user.role !== 'ADMIN') {
      router.push('/dashboard/user')
    }
  }, [session, status, router])

  if (status === 'loading' || !session || session.user.role !== 'ADMIN') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-dental-dark"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-dental-dark text-white shadow-lg">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-8">
              <Link href="/dashboard/admin" className="text-xl font-bold">
                🦷 Consultorio Admin
              </Link>
              
              <div className="hidden md:flex space-x-4">
                <Link href="/dashboard/admin" className="hover:bg-dental-accent px-3 py-2 rounded">
                  Dashboard
                </Link>
                <Link href="/dashboard/admin/usuarios" className="hover:bg-dental-accent px-3 py-2 rounded">
                  Usuarios
                </Link>
                <Link href="/dashboard/admin/turnos" className="hover:bg-dental-accent px-3 py-2 rounded">
                  Turnos
                </Link>
                <Link href="/dashboard/admin/historias-clinicas" className="hover:bg-dental-accent px-3 py-2 rounded">
                  Historias Clínicas
                </Link>
                <Link href="/dashboard/admin/horarios" className="hover:bg-dental-accent px-3 py-2 rounded">
                  Horarios
                </Link>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <span className="text-sm">{session.user.name}</span>
              <button
                onClick={() => signOut({ callbackUrl: '/' })}
                className="bg-red-500 hover:bg-red-600 px-4 py-2 rounded text-sm"
              >
                Cerrar Sesión
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="container mx-auto px-4 py-8">
        {children}
      </main>
    </div>
  )
}