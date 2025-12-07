'use client'

import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { DAYS_OF_WEEK } from '@/lib/utils'

interface AvailableSlot {
  id: string
  dayOfWeek: number
  time: string
  isActive: boolean
}

export default function HorariosPage() {
  const [slots, setSlots] = useState<AvailableSlot[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [formData, setFormData] = useState({
    dayOfWeek: 1,
    time: '09:00',
  })

  useEffect(() => {
    fetchSlots()
  }, [])

  const fetchSlots = async () => {
    try {
      const response = await fetch('/api/available-slots')
      const data = await response.json()
      setSlots(data)
    } catch (error) {
      toast.error('Error al cargar horarios')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      const response = await fetch('/api/available-slots', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (!response.ok) {
        toast.error(data.error || 'Error al crear horario')
        return
      }

      toast.success('Horario creado')
      setShowModal(false)
      fetchSlots()
    } catch (error) {
      toast.error('Error al crear horario')
    }
  }

  const toggleSlot = async (id: string, isActive: boolean) => {
    try {
      const response = await fetch(`/api/available-slots/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !isActive }),
      })

      if (!response.ok) {
        toast.error('Error al actualizar horario')
        return
      }

      toast.success('Horario actualizado')
      fetchSlots()
    } catch (error) {
      toast.error('Error al actualizar horario')
    }
  }

  const deleteSlot = async (id: string) => {
    if (!confirm('¿Estás seguro de eliminar este horario?')) return

    try {
      const response = await fetch(`/api/available-slots/${id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        toast.error('Error al eliminar horario')
        return
      }

      toast.success('Horario eliminado')
      fetchSlots()
    } catch (error) {
      toast.error('Error al eliminar horario')
    }
  }

  // Agrupar slots por día
  const slotsByDay = slots.reduce((acc, slot) => {
    if (!acc[slot.dayOfWeek]) {
      acc[slot.dayOfWeek] = []
    }
    acc[slot.dayOfWeek].push(slot)
    return acc
  }, {} as Record<number, AvailableSlot[]>)

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-dental-dark"></div>
      </div>
    )
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-dental-dark">Configuración de Horarios</h1>
        <button
          onClick={() => setShowModal(true)}
          className="bg-dental-dark text-white px-6 py-2 rounded-lg hover:bg-opacity-90"
        >
          + Nuevo Horario
        </button>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Object.entries(slotsByDay).map(([dayOfWeek, daySlots]) => (
          <div key={dayOfWeek} className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold text-dental-dark mb-4">
              {DAYS_OF_WEEK[parseInt(dayOfWeek)]}
            </h2>
            <div className="space-y-2">
              {daySlots
                .sort((a, b) => a.time.localeCompare(b.time))
                .map((slot) => (
                  <div key={slot.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                    <span className={slot.isActive ? 'text-gray-900' : 'text-gray-400 line-through'}>
                      {slot.time}
                    </span>
                    <div className="flex gap-2">
                      <button
                        onClick={() => toggleSlot(slot.id, slot.isActive)}
                        className={`px-2 py-1 rounded text-xs ${
                          slot.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-300 text-gray-600'
                        }`}
                      >
                        {slot.isActive ? 'Activo' : 'Inactivo'}
                      </button>
                      <button
                        onClick={() => deleteSlot(slot.id)}
                        className="text-red-600 hover:text-red-900 text-sm"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                ))}
              {daySlots.length === 0 && (
                <p className="text-gray-400 text-sm">Sin horarios configurados</p>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-8 max-w-md w-full">
            <h2 className="text-2xl font-bold text-dental-dark mb-4">Nuevo Horario</h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Día</label>
                <select
                  value={formData.dayOfWeek}
                  onChange={(e) => setFormData({ ...formData, dayOfWeek: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                >
                  {DAYS_OF_WEEK.map((day, index) => (
                    <option key={index} value={index}>{day}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Hora</label>
                <input
                  type="time"
                  value={formData.time}
                  onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
              </div>

              <div className="flex gap-2 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-dental-dark text-white py-2 rounded-lg hover:bg-opacity-90"
                >
                  Crear
                </button>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 bg-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-400"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}