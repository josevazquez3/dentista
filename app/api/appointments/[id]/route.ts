import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { prisma } from '@/lib/prisma'
import { sendAppointmentCancellation } from '@/lib/email'
import { formatDate } from '@/lib/utils'
import { z } from 'zod'

const updateAppointmentSchema = z.object({
  date: z.string().optional(),
  time: z.string().optional(),
  status: z.enum(['PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED', 'NO_SHOW']).optional(),
  notes: z.string().optional(),
})

export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const params = await context.params
  
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      )
    }

    const appointment = await prisma.appointment.findUnique({
      where: { id: params.id },
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
      }
    })

    if (!appointment) {
      return NextResponse.json(
        { error: 'Turno no encontrado' },
        { status: 404 }
      )
    }

    if (session.user.role !== 'ADMIN' && appointment.userId !== session.user.id) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 403 }
      )
    }

    return NextResponse.json(appointment)

  } catch (error) {
    console.error('Error obteniendo turno:', error)
    return NextResponse.json(
      { error: 'Error al obtener turno' },
      { status: 500 }
    )
  }
}

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const params = await context.params
  
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      )
    }

    const appointment = await prisma.appointment.findUnique({
      where: { id: params.id },
      include: { user: true }
    })

    if (!appointment) {
      return NextResponse.json(
        { error: 'Turno no encontrado' },
        { status: 404 }
      )
    }

    if (session.user.role !== 'ADMIN' && appointment.userId !== session.user.id) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const validatedData = updateAppointmentSchema.parse(body)

    const updateData: any = {}

    if (validatedData.date) {
      updateData.date = new Date(validatedData.date)
    }
    if (validatedData.time) updateData.time = validatedData.time
    if (validatedData.status) updateData.status = validatedData.status
    if (validatedData.notes !== undefined) updateData.notes = validatedData.notes

    const updatedAppointment = await prisma.appointment.update({
      where: { id: params.id },
      data: updateData,
      include: { user: true }
    })

    if (validatedData.status === 'CANCELLED') {
      await sendAppointmentCancellation({
        to: updatedAppointment.user.email,
        userName: updatedAppointment.user.name,
        date: formatDate(updatedAppointment.date),
        time: updatedAppointment.time,
      })
    }

    return NextResponse.json(updatedAppointment)

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      )
    }

    console.error('Error actualizando turno:', error)
    return NextResponse.json(
      { error: 'Error al actualizar turno' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const params = await context.params
  
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      )
    }

    await prisma.appointment.delete({
      where: { id: params.id }
    })

    return NextResponse.json({ message: 'Turno eliminado' })

  } catch (error) {
    console.error('Error eliminando turno:', error)
    return NextResponse.json(
      { error: 'Error al eliminar turno' },
      { status: 500 }
    )
  }
}