'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import { formatDate, APPOINTMENT_STATUS } from '@/lib/utils'

interface Appointment {
  id: string
  date: string
  time: string
  status: string
  notes?: string
}

export default function UserDashboard() {
  const { data: session } = useSession()
  const [nextAppointment, setNextAppointment] = useState<Appointment | null>(null)
  const [stats, setStats] = useState({
    totalAppointments: 0,
    completedAppointments: 0,
    pendingAppointments: 0,
  })

  useEffect(() => {
    fetchUserData()
  }, [])

  const fetchUserData = async () => {
    try {
      const response = await fetch('/api/appointments')
      const appointments = await response.json()

      const now = new Date()
      const upcoming = appointments
        .filter((apt: Appointment) => {
          const aptDate = new Date(apt.date)
          return aptDate >= now && apt.status !== 'CANCELLED'
        })
        .sort((a: Appointment, b: Appointment) => 
          new Date(a.date).getTime() - new Date(b.date).getTime()
        )

      setNextAppointment(upcoming[0] || null)

      setStats({
        totalAppointments: appointments.length,
        completedAppointments: appointments.filter((a: Appointment) => a.status === 'COMPLETED').length,
        pendingAppointments: appointments.filter((a: Appointment) => a.status === 'PENDING').length,
      })
    } catch (error) {
      console.error('Error fetching user data:', error)
    }
  }

  return (
    <div>
      <h1 className="text-3xl font-bold text-dental-dark mb-2">
        ¡Bienvenido, {session?.user.name}!
      </h1>
      <p className="text-gray-600 mb-8">Aquí puedes gestionar tus turnos y ver tu historial médico</p>

      <div className="grid md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Total de Turnos</p>
              <p className="text-3xl font-bold text-dental-dark">{stats.totalAppointments}</p>
            </div>
            <div className="text-4xl">📅</div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Turnos Pendientes</p>
              <p className="text-3xl font-bold text-yellow-600">{stats.pendingAppointments}</p>
            </div>
            <div className="text-4xl">⏳</div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Consultas Realizadas</p>
              <p className="text-3xl font-bold text-green-600">{stats.completedAppointments}</p>
            </div>
            <div className="text-4xl">✅</div>
          </div>
        </div>
      </div>

      {nextAppointment && (
        <div className="bg-gradient-to-r from-dental-blue to-dental-accent text-white p-8 rounded-lg shadow-lg mb-8">
          <h2 className="text-2xl font-bold mb-4">Tu Próximo Turno</h2>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-lg mb-2">
                📅 {formatDate(nextAppointment.date)} a las {nextAppointment.time}
              </p>
              <span className={`px-3 py-1 rounded text-sm ${APPOINTMENT_STATUS[nextAppointment.status as keyof typeof APPOINTMENT_STATUS]?.color}`}>
                {APPOINTMENT_STATUS[nextAppointment.status as keyof typeof APPOINTMENT_STATUS]?.label}
              </span>
            </div>
            <Link
              href="/dashboard/user/turnos"
              className="bg-white text-dental-dark px-6 py-2 rounded-lg font-semibold hover:bg-gray-100"
            >
              Ver Detalles
            </Link>
          </div>
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-6">
        <Link 
          href="/dashboard/user/nuevo-turno"
          className="bg-white p-8 rounded-lg shadow-lg hover:shadow-xl transition"
        >
          <div className="text-5xl mb-4">📅</div>
          <h2 className="text-2xl font-bold text-dental-dark mb-2">Reservar Nuevo Turno</h2>
          <p className="text-gray-600">Agenda una nueva cita de forma rápida y sencilla</p>
        </Link>

        <Link 
          href="/dashboard/user/turnos"
          className="bg-white p-8 rounded-lg shadow-lg hover:shadow-xl transition"
        >
          <div className="text-5xl mb-4">📋</div>
          <h2 className="text-2xl font-bold text-dental-dark mb-2">Mis Turnos</h2>
          <p className="text-gray-600">Consulta y gestiona todos tus turnos agendados</p>
        </Link>

        <Link 
          href="/dashboard/user/historial"
          className="bg-white p-8 rounded-lg shadow-lg hover:shadow-xl transition"
        >
          <div className="text-5xl mb-4">🏥</div>
          <h2 className="text-2xl font-bold text-dental-dark mb-2">Mi Historial Médico</h2>
          <p className="text-gray-600">Revisa tu historial de consultas y tratamientos</p>
        </Link>

        <div className="bg-white p-8 rounded-lg shadow-lg">
          <div className="text-5xl mb-4">ℹ️</div>
          <h2 className="text-2xl font-bold text-dental-dark mb-2">Información de Contacto</h2>
          <p className="text-gray-600 mb-2">📞 Teléfono: 221-4567890</p>
          <p className="text-gray-600 mb-2">📧 Email: consultoriolaurabertoni@gmail.com</p>
          <p className="text-gray-600">📍 La Plata, Buenos Aires</p>
        </div>
      </div>
    </div>
  )
}