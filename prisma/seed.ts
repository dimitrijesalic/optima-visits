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

const seedVisits = async () => {
  const user = await prisma.user.findUnique({
    where: { email: 'user@optima.rs' },
  })

  if (!user) {
    console.log('User not found, skipping visits seed')
    return
  }

  const today = new Date().toISOString().split('T')[0]
  const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0]
  const nextWeek = new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0]

  await prisma.visit.createMany({
    data: [
      // Upcoming visits (PENDING) - today
      {
        userId: user.id,
        status: 'PENDING',
        plannedTopic: 'Predstavljanje novog proizvoda',
        plannedVisitDate: today,
        plannedVisitTime: '09:00',
        plannedVisitDuration: '45 min',
        businessPartner: 'Kompanija ABC d.o.o.',
      },
      {
        userId: user.id,
        status: 'PENDING',
        plannedTopic: 'Pregled ugovora za Q2',
        plannedVisitDate: today,
        plannedVisitTime: '11:30',
        plannedVisitDuration: '60 min',
        businessPartner: 'Delta Holding',
      },
      {
        userId: user.id,
        status: 'PENDING',
        plannedTopic: 'Analiza prodajnih rezultata',
        plannedVisitDate: today,
        plannedVisitTime: '14:00',
        plannedVisitDuration: '30 min',
        businessPartner: 'NIS a.d.',
      },
      {
        userId: user.id,
        status: 'PENDING',
        plannedTopic: 'Dogovor o isporuci',
        plannedVisitDate: today,
        plannedVisitTime: '15:00',
        plannedVisitDuration: '45 min',
        businessPartner: 'Vino Župa a.d.',
      },
      {
        userId: user.id,
        status: 'PENDING',
        plannedTopic: 'Revizija cenovnika',
        plannedVisitDate: today,
        plannedVisitTime: '16:00',
        plannedVisitDuration: '30 min',
        businessPartner: 'Bambi a.d.',
      },
      {
        userId: user.id,
        status: 'PENDING',
        plannedTopic: 'Sastanak sa menadžmentom',
        plannedVisitDate: today,
        plannedVisitTime: '10:00',
        plannedVisitDuration: '60 min',
        businessPartner: 'Imlek a.d.',
      },
      {
        userId: user.id,
        status: 'PENDING',
        plannedTopic: 'Promocija novog asortimana',
        plannedVisitDate: today,
        plannedVisitTime: '12:00',
        plannedVisitDuration: '45 min',
        businessPartner: 'Maxi Retail',
      },
      {
        userId: user.id,
        status: 'PENDING',
        plannedTopic: 'Kontrola kvaliteta isporuke',
        plannedVisitDate: today,
        plannedVisitTime: '13:30',
        plannedVisitDuration: '30 min',
        businessPartner: 'Agromarket d.o.o.',
      },
      // Upcoming visits (PENDING) - tomorrow
      {
        userId: user.id,
        status: 'PENDING',
        plannedTopic: 'Potpisivanje ugovora',
        plannedVisitDate: tomorrow,
        plannedVisitTime: '10:00',
        plannedVisitDuration: '90 min',
        businessPartner: 'Telekom Srbija',
      },
      // Upcoming visits (PENDING) - next week
      {
        userId: user.id,
        status: 'PENDING',
        plannedTopic: 'Uvodni sastanak',
        plannedVisitDate: nextWeek,
        plannedVisitTime: '13:00',
        plannedVisitDuration: '60 min',
        businessPartner: 'Hemofarm a.d.',
      },
      // Previous visits (DONE)
      {
        userId: user.id,
        status: 'DONE',
        plannedTopic: 'Mesečni pregled saradnje',
        realisedTopic: 'Pregled saradnje i dogovor o novim uslovima',
        plannedVisitDate: '2026-02-20',
        plannedVisitTime: '09:00',
        plannedVisitDuration: '60 min',
        businessPartner: 'Metalac a.d.',
        note: 'Dogovoreno povećanje obima za 15%',
        grade: '5',
      },
      {
        userId: user.id,
        status: 'DONE',
        plannedTopic: 'Reklamacija proizvoda',
        realisedTopic: 'Rešena reklamacija, zamena robe',
        plannedVisitDate: '2026-02-18',
        plannedVisitTime: '11:00',
        plannedVisitDuration: '45 min',
        businessPartner: 'Idea d.o.o.',
        note: 'Klijent zadovoljan brzinom rešavanja',
        grade: '4',
      },
      {
        userId: user.id,
        status: 'DONE',
        plannedTopic: 'Prezentacija kataloga',
        realisedTopic: 'Prezentacija završena, narudžbina u toku',
        plannedVisitDate: '2026-02-15',
        plannedVisitTime: '14:30',
        plannedVisitDuration: '30 min',
        businessPartner: 'Univerexport',
        note: 'Očekuje se narudžbina do kraja meseca',
        grade: '4',
      },
      {
        userId: user.id,
        status: 'DONE',
        plannedTopic: 'Godišnji pregled ugovora',
        realisedTopic: 'Ugovor produžen na još godinu dana',
        plannedVisitDate: '2026-02-10',
        plannedVisitTime: '10:00',
        plannedVisitDuration: '90 min',
        businessPartner: 'Sunoko d.o.o.',
        note: 'Potpisan aneks ugovora',
        grade: '5',
      },
      {
        userId: user.id,
        status: 'DONE',
        plannedTopic: 'Inicijalni razgovor',
        realisedTopic: 'Dogovorena probna isporuka',
        plannedVisitDate: '2026-02-05',
        plannedVisitTime: '15:00',
        plannedVisitDuration: '45 min',
        businessPartner: 'Gomex d.o.o.',
        note: 'Novi klijent, probna saradnja',
        grade: '3',
      },
      {
        userId: user.id,
        status: 'DONE',
        plannedTopic: 'Pregled zaliha',
        realisedTopic: 'Zalihe dopunjene, plan za mart',
        plannedVisitDate: '2026-01-28',
        plannedVisitTime: '08:30',
        plannedVisitDuration: '60 min',
        businessPartner: 'Mercator-S',
        note: 'Napravljen plan nabavke za naredni mesec',
        grade: '4',
      },
    ],
  })
}

async function main() {
  await seedUsers()
  await seedVisits()
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
