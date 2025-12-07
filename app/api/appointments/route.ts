import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { sendAppointmentConfirmation } from '@/lib/email'
import { formatDate } from '@/lib/utils'
import { z } from 'zod'

const createAppointmentSchema = z.object({
  userId: z.string(),
  date: z.string(),
  time: z.string(),
  notes: z.string().optional(),
})

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const status = searchParams.get('status')
    const date = searchParams.get('date')

    const where: any = {}

    if (session.user.role !== 'ADMIN') {
      where.userId = session.user.id
    } else if (userId) {
      where.userId = userId
    }

    if (status) {
      where.status = status
    }

    if (date) {
      const selectedDate = new Date(date)
      const nextDay = new Date(selectedDate)
      nextDay.setDate(nextDay.getDate() + 1)
      
      where.date = {
        gte: selectedDate,
        lt: nextDay,
      }
    }

    const appointments = await prisma.appointment.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            dni: true,
          }
        },
        medicalRecord: true,
      },
      orderBy: [
        { date: 'asc' },
        { time: 'asc' },
      ]
    })

    return NextResponse.json(appointments)

  } catch (error) {
    console.error('Error obteniendo turnos:', error)
    return NextResponse.json(
      { error: 'Error al obtener turnos' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const validatedData = createAppointmentSchema.parse(body)

    if (session.user.role !== 'ADMIN' && validatedData.userId !== session.user.id) {
      return NextResponse.json(
        { error: 'No puedes crear turnos para otros usuarios' },
        { status: 403 }
      )
    }

    // Verificar que no exista otro turno en esa fecha y hora
    const existingAppointment = await prisma.appointment.findFirst({
      where: {
        date: new Date(validatedData.date),
        time: validatedData.time,
        status: {
          notIn: ['CANCELLED']
        }
      }
    })

    if (existingAppointment) {
      return NextResponse.json(
        { error: 'Ya existe un turno en ese horario' },
        { status: 400 }
      )
    }

    const appointment = await prisma.appointment.create({
      data: {
        userId: validatedData.userId,
        date: new Date(validatedData.date),
        time: validatedData.time,
        notes: validatedData.notes,
        status: 'PENDING',
      },
      include: {
        user: true,
      }
    })

    // Enviar email de confirmación
    await sendAppointmentConfirmation({
      to: appointment.user.email,
      userName: appointment.user.name,
      date: formatDate(appointment.date),
      time: appointment.time,
    })

    return NextResponse.json(appointment, { status: 201 })

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      )
    }

    console.error('Error creando turno:', error)
    return NextResponse.json(
      { error: 'Error al crear turno' },
      { status: 500 }
    )
  }
}