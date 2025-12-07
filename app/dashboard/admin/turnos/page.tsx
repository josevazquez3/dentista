'use client'

import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { formatDate, APPOINTMENT_STATUS } from '@/lib/utils'

interface Appointment {
  id: string
  date: string
  time: string
  status: string
  notes?: string
  user: {
    name: string
    email: string
    phone?: string
  }
}

export default function TurnosAdminPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [selectedDate, setSelectedDate] = useState('')

  useEffect(() => {
    fetchAppointments()
  }, [selectedDate])

  const fetchAppointments = async () => {
    try {
      let url = '/api/appointments'
      if (selectedDate) {
        url += `?date=${selectedDate}`
      }

      const response = await fetch(url)
      const data = await response.json()
      setAppointments(data)
    } catch (error) {
      toast.error('Error al cargar turnos')
    } finally {
      setIsLoading(false)
    }
  }

  const updateStatus = async (id: string, status: string) => {
    try {
      const response = await fetch(`/api/appointments/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      })

      if (!response.ok) {
        toast.error('Error al actualizar estado')
        return
      }

      toast.success('Estado actualizado')
      fetchAppointments()
    } catch (error) {
      toast.error('Error al actualizar estado')
    }
  }

  const deleteAppointment = async (id: string) => {
    if (!confirm('¿Estás seguro de eliminar este turno?')) return

    try {
      const response = await fetch(`/api/appointments/${id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        toast.error('Error al eliminar turno')
        return
      }

      toast.success('Turno eliminado')
      fetchAppointments()
    } catch (error) {
      toast.error('Error al eliminar turno')
    }
  }

  const filteredAppointments = appointments.filter((apt) => {
    if (filter === 'all') return true
    return apt.status === filter
  })

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-dental-dark"></div>
      </div>
    )
  }

  return (
    <div>
      <h1 className="text-3xl font-bold text-dental-dark mb-6">Gestión de Turnos</h1>

      <div className="bg-white p-4 rounded-lg shadow mb-6">
        <div className="flex gap-4 flex-wrap">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Filtrar por fecha</label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Filtrar por estado</label>
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg"
            >
              <option value="all">Todos</option>
              <option value="PENDING">Pendientes</option>
              <option value="CONFIRMED">Confirmados</option>
              <option value="COMPLETED">Completados</option>
              <option value="CANCELLED">Cancelados</option>
              <option value="NO_SHOW">No asistió</option>
            </select>
          </div>

          {selectedDate && (
            <button
              onClick={() => setSelectedDate('')}
              className="mt-6 text-blue-600 hover:text-blue-800"
            >
              Limpiar filtros
            </button>
          )}
        </div>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Paciente</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fecha</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Hora</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Teléfono</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estado</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Acciones</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredAppointments.map((appointment) => (
              <tr key={appointment.id}>
                <td className="px-6 py-4">
                  <div>
                    <div className="font-medium">{appointment.user.name}</div>
                    <div className="text-sm text-gray-500">{appointment.user.email}</div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">{formatDate(appointment.date)}</td>
                <td className="px-6 py-4 whitespace-nowrap">{appointment.time}</td>
                <td className="px-6 py-4 whitespace-nowrap">{appointment.user.phone || '-'}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <select
                    value={appointment.status}
                    onChange={(e) => updateStatus(appointment.id, e.target.value)}
                    className={`px-2 py-1 rounded text-xs ${APPOINTMENT_STATUS[appointment.status as keyof typeof APPOINTMENT_STATUS]?.color || ''}`}
                  >
                    <option value="PENDING">Pendiente</option>
                    <option value="CONFIRMED">Confirmado</option>
                    <option value="COMPLETED">Completado</option>
                    <option value="CANCELLED">Cancelado</option>
                    <option value="NO_SHOW">No asistió</option>
                  </select>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <button
                    onClick={() => deleteAppointment(appointment.id)}
                    className="text-red-600 hover:text-red-900"
                  >
                    Eliminar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredAppointments.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No hay turnos para mostrar
          </div>
        )}
      </div>
    </div>
  )
}