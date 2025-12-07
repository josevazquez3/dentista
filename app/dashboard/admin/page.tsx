'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalAppointments: 0,
    pendingAppointments: 0,
    completedAppointments: 0,
  })

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      const [usersRes, appointmentsRes] = await Promise.all([
        fetch('/api/users'),
        fetch('/api/appointments'),
      ])

      const users = await usersRes.json()
      const appointments = await appointmentsRes.json()

      setStats({
        totalUsers: users.length,
        totalAppointments: appointments.length,
        pendingAppointments: appointments.filter((a: any) => a.status === 'PENDING').length,
        completedAppointments: appointments.filter((a: any) => a.status === 'COMPLETED').length,
      })
    } catch (error) {
      console.error('Error fetching stats:', error)
    }
  }

  return (
    <div>
      <h1 className="text-3xl font-bold text-dental-dark mb-8">
        Panel de Administración
      </h1>

      <div className="grid md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Total Usuarios</p>
              <p className="text-3xl font-bold text-dental-dark">{stats.totalUsers}</p>
            </div>
            <div className="text-4xl">👥</div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Total Turnos</p>
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
              <p className="text-gray-600 text-sm">Turnos Completados</p>
              <p className="text-3xl font-bold text-green-600">{stats.completedAppointments}</p>
            </div>
            <div className="text-4xl">✅</div>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <Link href="/dashboard/admin/usuarios" className="bg-white p-8 rounded-lg shadow-lg hover:shadow-xl transition">
          <div className="text-5xl mb-4">👥</div>
          <h2 className="text-2xl font-bold text-dental-dark mb-2">Gestión de Usuarios</h2>
          <p className="text-gray-600">Administra usuarios, crea nuevas cuentas y gestiona permisos</p>
        </Link>

        <Link href="/dashboard/admin/turnos" className="bg-white p-8 rounded-lg shadow-lg hover:shadow-xl transition">
          <div className="text-5xl mb-4">📅</div>
          <h2 className="text-2xl font-bold text-dental-dark mb-2">Gestión de Turnos</h2>
          <p className="text-gray-600">Administra turnos, confirma citas y gestiona el calendario</p>
        </Link>

        <Link href="/dashboard/admin/historias-clinicas" className="bg-white p-8 rounded-lg shadow-lg hover:shadow-xl transition">
          <div className="text-5xl mb-4">📋</div>
          <h2 className="text-2xl font-bold text-dental-dark mb-2">Historias Clínicas</h2>
          <p className="text-gray-600">Gestiona historias clínicas y resultados de consultas</p>
        </Link>

        <Link href="/dashboard/admin/horarios" className="bg-white p-8 rounded-lg shadow-lg hover:shadow-xl transition">
          <div className="text-5xl mb-4">🕐</div>
          <h2 className="text-2xl font-bold text-dental-dark mb-2">Configuración de Horarios</h2>
          <p className="text-gray-600">Define horarios disponibles y días de atención</p>
        </Link>
      </div>
    </div>
  )
}