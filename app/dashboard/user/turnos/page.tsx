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
  createdAt: string
}

export default function MisTurnosPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [filter, setFilter] = useState<'upcoming' | 'past' | 'all'>('upcoming')

  useEffect(() => {
    fetchAppointments()
  }, [])

  const fetchAppointments = async () => {
    try {
      const response = await fetch('/api/appointments')
      const data = await response.json()
      setAppointments(data)
    } catch (error) {
      toast.error('Error al cargar turnos')
    } finally {
      setIsLoading(false)
    }
  }

  const cancelAppointment = async (id: string) => {
    if (!confirm('¿Estás seguro de cancelar este turno?')) return

    try {
      const response = await fetch(`/api/appointments/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'CANCELLED' }),
      })

      if (!response.ok) {
        toast.error('Error al cancelar turno')
        return
      }

      toast.success('Turno cancelado')
      fetchAppointments()
    } catch (error) {
      toast.error('Error al cancelar turno')
    }
  }

  const getFilteredAppointments = () => {
    const now = new Date()
    
    return appointments.filter(apt => {
      const aptDate = new Date(apt.date)
      
      if (filter === 'upcoming') {
        return aptDate >= now && apt.status !== 'CANCELLED'
      } else if (filter === 'past') {
        return aptDate < now || apt.status === 'COMPLETED' || apt.status === 'CANCELLED'
      }
      return true
    }).sort((a, b) => {
      const dateA = new Date(a.date).getTime()
      const dateB = new Date(b.date).getTime()
      return filter === 'past' ? dateB - dateA : dateA - dateB
    })
  }

  const filteredAppointments = getFilteredAppointments()

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-dental-dark"></div>
      </div>
    )
  }

  return (
    <div>
      <h1 className="text-3xl font-bold text-dental-dark mb-2">Mis Turnos</h1>
      <p className="text-gray-600 mb-8">Administra todos tus turnos agendados</p>

      <div className="bg-white p-4 rounded-lg shadow mb-6">
        <div className="flex gap-2">
          <button
            onClick={() => setFilter('upcoming')}
            className={`px-4 py-2 rounded-lg transition ${
              filter === 'upcoming'
                ? 'bg-dental-dark text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Próximos
          </button>
          <button
            onClick={() => setFilter('past')}
            className={`px-4 py-2 rounded-lg transition ${
              filter === 'past'
                ? 'bg-dental-dark text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Pasados
          </button>
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg transition ${
              filter === 'all'
                ? 'bg-dental-dark text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Todos
          </button>
        </div>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredAppointments.map((appointment) => {
          const isPast = new Date(appointment.date) < new Date()
          const canCancel = !isPast && appointment.status === 'PENDING' || appointment.status === 'CONFIRMED'

          return (
            <div key={appointment.id} className="bg-white rounded-lg shadow-lg p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <p className="text-2xl font-bold text-dental-dark">
                    {formatDate(appointment.date)}
                  </p>
                  <p className="text-lg text-gray-600">{appointment.time}</p>
                </div>
                <span className={`px-3 py-1 rounded text-xs ${
                  APPOINTMENT_STATUS[appointment.status as keyof typeof APPOINTMENT_STATUS]?.color
                }`}>
                  {APPOINTMENT_STATUS[appointment.status as keyof typeof APPOINTMENT_STATUS]?.label}
                </span>
              </div>

              {appointment.notes && (
                <div className="mb-4">
                  <p className="text-sm text-gray-600">Motivo:</p>
                  <p className="text-gray-800">{appointment.notes}</p>
                </div>
              )}

              <div className="border-t pt-4">
                <p className="text-xs text-gray-500 mb-2">
                  Reservado el {formatDate(appointment.createdAt)}
                </p>
                
                {canCancel && (
                  <button
                    onClick={() => cancelAppointment(appointment.id)}
                    className="w-full bg-red-500 text-white py-2 rounded-lg hover:bg-red-600 transition"
                  >
                    Cancelar Turno
                  </button>
                )}

                {appointment.status === 'CANCELLED' && (
                  <p className="text-sm text-gray-500 italic">Este turno fue cancelado</p>
                )}

                {appointment.status === 'COMPLETED' && (
                  <p className="text-sm text-green-600 font-medium">✓ Consulta completada</p>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {filteredAppointments.length === 0 && (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <div className="text-6xl mb-4">📅</div>
          <h3 className="text-xl font-semibold text-gray-700 mb-2">
            No tienes turnos {filter === 'upcoming' ? 'próximos' : filter === 'past' ? 'pasados' : ''}
          </h3>
          <p className="text-gray-600">
            {filter === 'upcoming' && 'Reserva un nuevo turno para agendar tu próxima consulta'}
            {filter === 'past' && 'Aún no has tenido consultas anteriores'}
            {filter === 'all' && 'No tienes ningún turno agendado'}
          </p>
        </div>
      )}
    </div>
  )
}