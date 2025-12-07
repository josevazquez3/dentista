import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const updateMedicalRecordSchema = z.object({
  diagnosis: z.string().optional(),
  treatment: z.string().optional(),
  observations: z.string().optional(),
  images: z.array(z.string()).optional(),
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

    const record = await prisma.medicalRecord.findUnique({
      where: { id: params.id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            dni: true,
          }
        },
        appointment: true,
      }
    })

    if (!record) {
      return NextResponse.json(
        { error: 'Historia clínica no encontrada' },
        { status: 404 }
      )
    }

    if (session.user.role !== 'ADMIN' && record.userId !== session.user.id) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 403 }
      )
    }

    return NextResponse.json(record)

  } catch (error) {
    console.error('Error obteniendo historia clínica:', error)
    return NextResponse.json(
      { error: 'Error al obtener historia clínica' },
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

    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const validatedData = updateMedicalRecordSchema.parse(body)

    const record = await prisma.medicalRecord.update({
      where: { id: params.id },
      data: validatedData,
      include: {
        user: true,
        appointment: true,
      }
    })

    return NextResponse.json(record)

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      )
    }

    console.error('Error actualizando historia clínica:', error)
    return NextResponse.json(
      { error: 'Error al actualizar historia clínica' },
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

    await prisma.medicalRecord.delete({
      where: { id: params.id }
    })

    return NextResponse.json({ message: 'Historia clínica eliminada' })

  } catch (error) {
    console.error('Error eliminando historia clínica:', error)
    return NextResponse.json(
      { error: 'Error al eliminar historia clínica' },
      { status: 500 }
    )
  }
}