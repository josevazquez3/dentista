import { PrismaClient } from '@prisma/client'
import * as bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  const hashedPassword = await bcrypt.hash('admin123', 10)
  
  const admin = await prisma.user.upsert({
    where: { email: 'admin@consultorio.com' },
    update: {},
    create: {
      email: 'admin@consultorio.com',
      name: 'Administrador',
      password: hashedPassword,
      role: 'ADMIN',
      phone: '221-4567890',
    },
  })
  
  console.log('✅ Usuario administrador creado:', admin.email)

  const slots = []
  const hours = ['09:00', '10:00', '11:00', '12:00', '14:00', '15:00', '16:00', '17:00']
  
  for (let day = 1; day <= 5; day++) {
    for (const time of hours) {
      slots.push({
        dayOfWeek: day,
        time: time,
        isActive: true,
      })
    }
  }

  await prisma.availableSlot.createMany({
    data: slots,
    skipDuplicates: true,
  })

  console.log('✅ Horarios disponibles creados')
}

main()
  .catch((e) => {
    console.error('❌ Error en seed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })