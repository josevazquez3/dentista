import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import { z } from 'zod'

const createUserSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
  role: z.enum(['USER', 'ADMIN']),
  phone: z.string().optional(),
  dni: z.string().optional(),
  address: z.string().optional(),
  birthDate: z.string().optional(),
})

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      )
    }

    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        phone: true,
        dni: true,
        address: true,
        birthDate: true,
        createdAt: true,
        _count: {
          select: {
            appointments: true,
            medicalRecords: true,
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json(users)

  } catch (error) {
    console.error('Error obteniendo usuarios:', error)
    return NextResponse.json(
      { error: 'Error al obtener usuarios' },
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
    const validatedData = createUserSchema.parse(body)

    const existingEmail = await prisma.user.findUnique({
      where: { email: validatedData.email }
    })

    if (existingEmail) {
      return NextResponse.json(
        { error: 'El email ya existe' },
        { status: 400 }
      )
    }

    if (validatedData.dni) {
      const existingDni = await prisma.user.findUnique({
        where: { dni: validatedData.dni }
      })

      if (existingDni) {
        return NextResponse.json(
          { error: 'El DNI ya existe' },
          { status: 400 }
        )
      }
    }

    const hashedPassword = await bcrypt.hash(validatedData.password, 10)

    const user = await prisma.user.create({
      data: {
        ...validatedData,
        password: hashedPassword,
        birthDate: validatedData.birthDate ? new Date(validatedData.birthDate) : null,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        phone: true,
        dni: true,
      }
    })

    return NextResponse.json(user, { status: 201 })

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      )
    }

    console.error('Error creando usuario:', error)
    return NextResponse.json(
      { error: 'Error al crear usuario' },
      { status: 500 }
    )
  }
}