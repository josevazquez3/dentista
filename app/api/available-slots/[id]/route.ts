import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const updateSlotSchema = z.object({
  dayOfWeek: z.number().min(0).max(6).optional(),
  time: z.string().optional(),
  isActive: z.boolean().optional(),
})

export async function PATCH(
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

    const body = await request.json()
    const validatedData = updateSlotSchema.parse(body)

    const slot = await prisma.availableSlot.update({
      where: { id: params.id },
      data: validatedData
    })

    return NextResponse.json(slot)

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      )
    }

    console.error('Error actualizando horario:', error)
    return NextResponse.json(
      { error: 'Error al actualizar horario' },
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

    await prisma.availableSlot.delete({
      where: { id: params.id }
    })

    return NextResponse.json({ message: 'Horario eliminado' })

  } catch (error) {
    console.error('Error eliminando horario:', error)
    return NextResponse.json(
      { error: 'Error al eliminar horario' },
      { status: 500 }
    )
  }
}