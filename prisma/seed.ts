import bcrypt from 'bcryptjs'
import prisma from './../src/lib/prisma'

const seedUsers = async () => {
  const hashedPassword = await bcrypt.hash('MojaLozinka123!', 10)

  await prisma.user.createMany({
    data: [
      {
        firstName: 'Admin',
        lastName: 'User',
        email: 'admin@optima.rs',
        password: hashedPassword,
        role: 'ADMIN',
      },
      {
        firstName: 'Test',
        lastName: 'User',
        email: 'user@optima.rs',
        password: hashedPassword,
        role: 'USER',
      },
    ],
    skipDuplicates: true,
  })
}

async function main() {
  // TODO - uncomment when want to seed the database
  // await seedUsers()
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (error) => {
    console.error(error)
    await prisma.$disconnect()
    process.exit(1)
  })
