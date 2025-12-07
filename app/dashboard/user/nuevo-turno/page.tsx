'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import { formatDate, DAYS_OF_WEEK } from '@/lib/utils'

interface AvailableSlot {
  id: string
  dayOfWeek: number
  time: string
}

interface Appointment {
  date: string
  time: string
}

export default function NuevoTurnoPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const [availableSlots, setAvailableSlots] = useState<AvailableSlot[]>([])
  const [bookedAppointments, setBookedAppointments] = useState<Appointment[]>([])
  const [selectedDate, setSelectedDate] = useState('')
  const [selectedTime, setSelectedTime] = useState('')
  const [notes, setNotes] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    fetchAvailableSlots()
    fetchBookedAppointments()
  }, [])

  const fetchAvailableSlots = async () => {
    try {
      const response = await fetch('/api/available-slots')
      const data = await response.json()
      setAvailableSlots(data)
    } catch (error) {
      toast.error('Error al cargar horarios disponibles')
    }
  }

  const fetchBookedAppointments = async () => {
    try {
      const response = await fetch('/api/appointments')
      const data = await response.json()
      setBookedAppointments(data.filter((apt: any) => apt.status !== 'CANCELLED'))
    } catch (error) {
      console.error('Error al cargar turnos ocupados')
    }
  }

  const getAvailableTimesForDate = (date: string) => {
    if (!date) return []

    const selectedDateObj = new Date(date)
    const dayOfWeek = selectedDateObj.getDay()

    // Obtener horarios configurados para ese día
    const slotsForDay = availableSlots.filter(slot => slot.dayOfWeek === dayOfWeek)

    // Filtrar los que ya están ocupados
    const availableTimes = slotsForDay.filter(slot => {
      const isBooked = bookedAppointments.some(apt => {
        const aptDate = new Date(apt.date).toDateString()
        const selectedDateString = selectedDateObj.toDateString()
        return aptDate === selectedDateString && apt.time === slot.time
      })
      return !isBooked
    })

    return availableTimes
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!selectedDate || !selectedTime) {
      toast.error('Por favor selecciona fecha y hora')
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch('/api/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: session?.user.id,
          date: selectedDate,
          time: selectedTime,
          notes,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        toast.error(data.error || 'Error al crear turno')
        return
      }

      toast.success('¡Turno reservado exitosamente! Revisa tu email para la confirmación.')
      router.push('/dashboard/user/turnos')
    } catch (error) {
      toast.error('Error al crear turno')
    } finally {
      setIsLoading(false)
    }
  }

  const getMinDate = () => {
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    return tomorrow.toISOString().split('T')[0]
  }

  const getMaxDate = () => {
    const maxDate = new Date()
    maxDate.setMonth(maxDate.getMonth() + 3)
    return maxDate.toISOString().split('T')[0]
  }

  const availableTimes = getAvailableTimesForDate(selectedDate)

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold text-dental-dark mb-2">Reservar Nuevo Turno</h1>
      <p className="text-gray-600 mb-8">Selecciona la fecha y hora de tu preferencia</p>

      <div className="bg-white rounded-lg shadow-lg p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Selecciona una fecha
            </label>
            <input
              type="date"
              required
              min={getMinDate()}
              max={getMaxDate()}
              value={selectedDate}
              onChange={(e) => {
                setSelectedDate(e.target.value)
                setSelectedTime('')
              }}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-dental-accent focus:border-transparent"
            />
            {selectedDate && (
              <p className="mt-2 text-sm text-gray-600">
                Has seleccionado: {formatDate(selectedDate)} ({DAYS_OF_WEEK[new Date(selectedDate).getDay()]})
              </p>
            )}
          </div>

          {selectedDate && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Horarios disponibles
              </label>
              {availableTimes.length > 0 ? (
                <div className="grid grid-cols-3 gap-3">
                  {availableTimes.map((slot) => (
                    <button
                      key={slot.id}
                      type="button"
                      onClick={() => setSelectedTime(slot.time)}
                      className={`px-4 py-3 rounded-lg border-2 transition ${
                        selectedTime === slot.time
                          ? 'border-dental-dark bg-dental-blue text-dental-dark font-semibold'
                          : 'border-gray-300 hover:border-dental-accent'
                      }`}
                    >
                      {slot.time}
                    </button>
                  ))}
                </div>
              ) : (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <p className="text-yellow-800">
                    No hay horarios disponibles para esta fecha. Por favor selecciona otra fecha.
                  </p>
                </div>
              )}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Motivo de la consulta (opcional)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-dental-accent focus:border-transparent"
              rows={4}
              placeholder="Describe brevemente el motivo de tu consulta..."
            />
          </div>

          {selectedDate && selectedTime && (
            <div className="bg-dental-lightBlue p-4 rounded-lg">
              <h3 className="font-semibold text-dental-dark mb-2">Resumen de tu turno:</h3>
              <p className="text-gray-700">📅 Fecha: {formatDate(selectedDate)}</p>
              <p className="text-gray-700">🕐 Hora: {selectedTime}</p>
              {notes && <p className="text-gray-700 mt-2">📝 Motivo: {notes}</p>}
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading || !selectedDate || !selectedTime}
            className="w-full bg-dental-dark text-white py-3 rounded-lg font-semibold hover:bg-opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Reservando...' : 'Confirmar Reserva'}
          </button>
        </form>
      </div>

      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="font-semibold text-blue-900 mb-2">ℹ️ Información importante:</h3>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Recibirás un email de confirmación</li>
          <li>• Por favor llega 10 minutos antes de tu turno</li>
          <li>• Si necesitas cancelar, hazlo con 24hs de anticipación</li>
          <li>• Trae tu DNI y obra social (si corresponde)</li>
        </ul>
      </div>
    </div>
  )
}