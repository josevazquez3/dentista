import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const createSlotSchema = z.object({
  dayOfWeek: z.number().min(0).max(6),
  time: z.string(),
  isActive: z.boolean().optional(),
})

export async function GET() {
  try {
    const slots = await prisma.availableSlot.findMany({
      where: { isActive: true },
      orderBy: [
        { dayOfWeek: 'asc' },
        { time: 'asc' },
      ]
    })

    return NextResponse.json(slots)

  } catch (error) {
    console.error('Error obteniendo horarios:', error)
    return NextResponse.json(
      { error: 'Error al obtener horarios' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const validatedData = createSlotSchema.parse(body)

    const slot = await prisma.availableSlot.create({
      data: validatedData
    })

    return NextResponse.json(slot, { status: 201 })

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      )
    }

    console.error('Error creando horario:', error)
    return NextResponse.json(
      { error: 'Error al crear horario' },
      { status: 500 }
    )
  }
}