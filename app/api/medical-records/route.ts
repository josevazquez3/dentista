import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const createMedicalRecordSchema = z.object({
  appointmentId: z.string(),
  userId: z.string(),
  diagnosis: z.string(),
  treatment: z.string(),
  observations: z.string().optional(),
  images: z.array(z.string()).optional(),
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

    const where: any = {}

    if (session.user.role !== 'ADMIN') {
      where.userId = session.user.id
    } else if (userId) {
      where.userId = userId
    }

    const records = await prisma.medicalRecord.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            dni: true,
          }
        },
        appointment: {
          select: {
            id: true,
            date: true,
            time: true,
            status: true,
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json(records)

  } catch (error) {
    console.error('Error obteniendo historias clínicas:', error)
    return NextResponse.json(
      { error: 'Error al obtener historias clínicas' },
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
    const validatedData = createMedicalRecordSchema.parse(body)

    // Verificar que no exista ya un registro para este turno
    const existingRecord = await prisma.medicalRecord.findUnique({
      where: { appointmentId: validatedData.appointmentId }
    })

    if (existingRecord) {
      return NextResponse.json(
        { error: 'Ya existe una historia clínica para este turno' },
        { status: 400 }
      )
    }

    const record = await prisma.medicalRecord.create({
      data: {
        appointmentId: validatedData.appointmentId,
        userId: validatedData.userId,
        diagnosis: validatedData.diagnosis,
        treatment: validatedData.treatment,
        observations: validatedData.observations,
        images: validatedData.images || [],
      },
      include: {
        user: true,
        appointment: true,
      }
    })

    // Actualizar el estado del turno a COMPLETED
    await prisma.appointment.update({
      where: { id: validatedData.appointmentId },
      data: { status: 'COMPLETED' }
    })

    return NextResponse.json(record, { status: 201 })

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      )
    }

    console.error('Error creando historia clínica:', error)
    return NextResponse.json(
      { error: 'Error al crear historia clínica' },
      { status: 500 }
    )
  }
}