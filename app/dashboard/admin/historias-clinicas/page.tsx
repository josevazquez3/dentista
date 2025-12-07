'use client'

import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { formatDate } from '@/lib/utils'

interface MedicalRecord {
  id: string
  diagnosis: string
  treatment: string
  observations?: string
  images: string[]
  createdAt: string
  user: {
    name: string
    email: string
    dni?: string
  }
  appointment: {
    date: string
    time: string
  }
}

interface User {
  id: string
  name: string
  email: string
}

interface Appointment {
  id: string
  date: string
  time: string
  user: {
    id: string
    name: string
  }
}

export default function HistoriasClinicasPage() {
  const [records, setRecords] = useState<MedicalRecord[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [selectedUser, setSelectedUser] = useState('')
  const [viewingRecord, setViewingRecord] = useState<MedicalRecord | null>(null)
  const [formData, setFormData] = useState({
    appointmentId: '',
    userId: '',
    diagnosis: '',
    treatment: '',
    observations: '',
  })

  useEffect(() => {
    fetchRecords()
    fetchUsers()
  }, [])

  useEffect(() => {
    if (formData.userId) {
      fetchUserAppointments(formData.userId)
    }
  }, [formData.userId])

  const fetchRecords = async () => {
    try {
      const response = await fetch('/api/medical-records')
      const data = await response.json()
      setRecords(data)
    } catch (error) {
      toast.error('Error al cargar historias clínicas')
    } finally {
      setIsLoading(false)
    }
  }

  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/users')
      const data = await response.json()
      setUsers(data.filter((u: User) => u.id))
    } catch (error) {
      console.error('Error al cargar usuarios')
    }
  }

  const fetchUserAppointments = async (userId: string) => {
    try {
      const response = await fetch(`/api/appointments?userId=${userId}`)
      const data = await response.json()
      // Solo mostrar turnos confirmados o completados sin historia clínica
      const availableAppointments = data.filter(
        (apt: any) => 
          (apt.status === 'CONFIRMED' || apt.status === 'COMPLETED') &&
          !apt.medicalRecord
      )
      setAppointments(availableAppointments)
    } catch (error) {
      console.error('Error al cargar turnos')
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      const response = await fetch('/api/medical-records', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (!response.ok) {
        toast.error(data.error || 'Error al crear historia clínica')
        return
      }

      toast.success('Historia clínica creada')
      setShowModal(false)
      resetForm()
      fetchRecords()
    } catch (error) {
      toast.error('Error al crear historia clínica')
    }
  }

  const resetForm = () => {
    setFormData({
      appointmentId: '',
      userId: '',
      diagnosis: '',
      treatment: '',
      observations: '',
    })
    setAppointments([])
  }

  const filterRecordsByUser = selectedUser
    ? records.filter((r) => r.user.email === selectedUser)
    : records

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
        <h1 className="text-3xl font-bold text-dental-dark">Historias Clínicas</h1>
        <button
          onClick={() => setShowModal(true)}
          className="bg-dental-dark text-white px-6 py-2 rounded-lg hover:bg-opacity-90"
        >
          + Nueva Historia Clínica
        </button>
      </div>

      <div className="bg-white p-4 rounded-lg shadow mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-1">Filtrar por paciente</label>
        <select
          value={selectedUser}
          onChange={(e) => setSelectedUser(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg"
        >
          <option value="">Todos los pacientes</option>
          {users.map((user) => (
            <option key={user.id} value={user.email}>{user.name}</option>
          ))}
        </select>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filterRecordsByUser.map((record) => (
          <div key={record.id} className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="font-bold text-lg text-dental-dark">{record.user.name}</h3>
                <p className="text-sm text-gray-600">{record.user.email}</p>
                {record.user.dni && (
                  <p className="text-sm text-gray-600">DNI: {record.user.dni}</p>
                )}
              </div>
              <button
                onClick={() => setViewingRecord(record)}
                className="text-blue-600 hover:text-blue-800 text-sm"
              >
                Ver detalle
              </button>
            </div>

            <div className="border-t pt-4 space-y-2">
              <div>
                <p className="text-xs text-gray-500">Fecha de consulta</p>
                <p className="font-medium">{formatDate(record.appointment.date)} - {record.appointment.time}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Diagnóstico</p>
                <p className="text-sm">{record.diagnosis}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Tratamiento</p>
                <p className="text-sm">{record.treatment}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filterRecordsByUser.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          No hay historias clínicas para mostrar
        </div>
      )}

      {/* Modal para crear historia clínica */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-lg p-8 max-w-2xl w-full my-8">
            <h2 className="text-2xl font-bold text-dental-dark mb-4">Nueva Historia Clínica</h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Paciente *</label>
                <select
                  required
                  value={formData.userId}
                  onChange={(e) => setFormData({ ...formData, userId: e.target.value, appointmentId: '' })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                >
                  <option value="">Seleccionar paciente</option>
                  {users.map((user) => (
                    <option key={user.id} value={user.id}>{user.name}</option>
                  ))}
                </select>
              </div>

              {formData.userId && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Turno *</label>
                  <select
                    required
                    value={formData.appointmentId}
                    onChange={(e) => setFormData({ ...formData, appointmentId: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  >
                    <option value="">Seleccionar turno</option>
                    {appointments.map((apt) => (
                      <option key={apt.id} value={apt.id}>
                        {formatDate(apt.date)} - {apt.time}
                      </option>
                    ))}
                  </select>
                  {appointments.length === 0 && (
                    <p className="text-sm text-gray-500 mt-1">
                      No hay turnos disponibles para este paciente
                    </p>
                  )}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Diagnóstico *</label>
                <textarea
                  required
                  value={formData.diagnosis}
                  onChange={(e) => setFormData({ ...formData, diagnosis: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  rows={3}
                  placeholder="Descripción del diagnóstico..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tratamiento *</label>
                <textarea
                  required
                  value={formData.treatment}
                  onChange={(e) => setFormData({ ...formData, treatment: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  rows={3}
                  placeholder="Descripción del tratamiento realizado..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Observaciones</label>
                <textarea
                  value={formData.observations}
                  onChange={(e) => setFormData({ ...formData, observations: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  rows={3}
                  placeholder="Observaciones adicionales..."
                />
              </div>

              <div className="flex gap-2 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-dental-dark text-white py-2 rounded-lg hover:bg-opacity-90"
                >
                  Crear Historia Clínica
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false)
                    resetForm()
                  }}
                  className="flex-1 bg-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-400"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal para ver detalle */}
      {viewingRecord && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-lg p-8 max-w-2xl w-full my-8">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className="text-2xl font-bold text-dental-dark">Historia Clínica</h2>
                <p className="text-gray-600">{viewingRecord.user.name}</p>
              </div>
              <button
                onClick={() => setViewingRecord(null)}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600">Paciente</p>
                <p className="font-medium">{viewingRecord.user.name}</p>
                <p className="text-sm text-gray-600">{viewingRecord.user.email}</p>
                {viewingRecord.user.dni && (
                  <p className="text-sm text-gray-600">DNI: {viewingRecord.user.dni}</p>
                )}
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600">Fecha de consulta</p>
                <p className="font-medium">
                  {formatDate(viewingRecord.appointment.date)} - {viewingRecord.appointment.time}
                </p>
              </div>

              <div>
                <p className="text-sm font-medium text-gray-700 mb-1">Diagnóstico</p>
                <p className="bg-gray-50 p-3 rounded-lg">{viewingRecord.diagnosis}</p>
              </div>

              <div>
                <p className="text-sm font-medium text-gray-700 mb-1">Tratamiento</p>
                <p className="bg-gray-50 p-3 rounded-lg">{viewingRecord.treatment}</p>
              </div>

              {viewingRecord.observations && (
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-1">Observaciones</p>
                  <p className="bg-gray-50 p-3 rounded-lg">{viewingRecord.observations}</p>
                </div>
              )}

              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600">Fecha de registro</p>
                <p className="font-medium">{formatDate(viewingRecord.createdAt)}</p>
              </div>
            </div>

            <button
              onClick={() => setViewingRecord(null)}
              className="w-full mt-6 bg-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-400"
            >
              Cerrar
            </button>
          </div>
        </div>
      )}
    </div>
  )
}