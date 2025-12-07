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
  appointment: {
    date: string
    time: string
  }
}

export default function HistorialPage() {
  const [records, setRecords] = useState<MedicalRecord[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [viewingRecord, setViewingRecord] = useState<MedicalRecord | null>(null)

  useEffect(() => {
    fetchRecords()
  }, [])

  const fetchRecords = async () => {
    try {
      const response = await fetch('/api/medical-records')
      const data = await response.json()
      setRecords(data)
    } catch (error) {
      toast.error('Error al cargar historial')
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-dental-dark"></div>
      </div>
    )
  }

  return (
    <div>
      <h1 className="text-3xl font-bold text-dental-dark mb-2">Mi Historial Médico</h1>
      <p className="text-gray-600 mb-8">Consulta el registro de todas tus consultas y tratamientos</p>

      {records.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <div className="text-6xl mb-4">🏥</div>
          <h3 className="text-xl font-semibold text-gray-700 mb-2">
            No tienes historial médico aún
          </h3>
          <p className="text-gray-600">
            Tu historial se creará después de tu primera consulta
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {records.map((record) => (
            <div key={record.id} className="bg-white rounded-lg shadow-lg p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-bold text-dental-dark mb-1">
                    Consulta del {formatDate(record.appointment.date)}
                  </h3>
                  <p className="text-gray-600">Hora: {record.appointment.time}</p>
                </div>
                <button
                  onClick={() => setViewingRecord(record)}
                  className="text-blue-600 hover:text-blue-800 font-medium"
                >
                  Ver detalle completo →
                </button>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm font-medium text-gray-700 mb-1">Diagnóstico</p>
                  <p className="text-gray-800">{record.diagnosis}</p>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm font-medium text-gray-700 mb-1">Tratamiento</p>
                  <p className="text-gray-800">{record.treatment}</p>
                </div>
              </div>

              {record.observations && (
                <div className="mt-4 bg-blue-50 p-4 rounded-lg">
                  <p className="text-sm font-medium text-blue-900 mb-1">Observaciones</p>
                  <p className="text-blue-800">{record.observations}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Modal para ver detalle completo */}
      {viewingRecord && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-lg p-8 max-w-2xl w-full my-8">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className="text-2xl font-bold text-dental-dark">Detalle de Consulta</h2>
                <p className="text-gray-600">{formatDate(viewingRecord.appointment.date)} - {viewingRecord.appointment.time}</p>
              </div>
              <button
                onClick={() => setViewingRecord(null)}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium text-gray-700 mb-1">Diagnóstico</p>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-gray-800">{viewingRecord.diagnosis}</p>
                </div>
              </div>

              <div>
                <p className="text-sm font-medium text-gray-700 mb-1">Tratamiento Realizado</p>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-gray-800">{viewingRecord.treatment}</p>
                </div>
              </div>

              {viewingRecord.observations && (
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-1">Observaciones</p>
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <p className="text-gray-800">{viewingRecord.observations}</p>
                  </div>
                </div>
              )}

              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm font-medium text-gray-700 mb-1">Fecha de registro</p>
                <p className="text-gray-800">{formatDate(viewingRecord.createdAt)}</p>
              </div>
            </div>

            <button
              onClick={() => setViewingRecord(null)}
              className="w-full mt-6 bg-dental-dark text-white py-3 rounded-lg hover:bg-opacity-90"
            >
              Cerrar
            </button>
          </div>
        </div>
      )}
    </div>
  )
}