import { format } from 'date-fns'
import { es } from 'date-fns/locale'

export function formatDate(date: Date | string): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  return format(dateObj, "dd/MM/yyyy", { locale: es })
}

export function formatDateTime(date: Date | string): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  return format(dateObj, "dd/MM/yyyy HH:mm", { locale: es })
}

export function formatLongDate(date: Date | string): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  return format(dateObj, "EEEE dd 'de' MMMM 'de' yyyy", { locale: es })
}

export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ')
}

export const DAYS_OF_WEEK = [
  'Domingo',
  'Lunes',
  'Martes',
  'Miércoles',
  'Jueves',
  'Viernes',
  'Sábado',
]

export const APPOINTMENT_STATUS = {
  PENDING: { label: 'Pendiente', color: 'bg-yellow-100 text-yellow-800' },
  CONFIRMED: { label: 'Confirmado', color: 'bg-blue-100 text-blue-800' },
  COMPLETED: { label: 'Completado', color: 'bg-green-100 text-green-800' },
  CANCELLED: { label: 'Cancelado', color: 'bg-red-100 text-red-800' },
  NO_SHOW: { label: 'No asistió', color: 'bg-gray-100 text-gray-800' },
}