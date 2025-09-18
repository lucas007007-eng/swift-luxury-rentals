/* eslint-disable */
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
  // Minimal seed: create a city and one property to validate schema
  const berlin = await prisma.city.upsert({
    where: { slug: 'berlin' },
    update: {},
    create: { name: 'Berlin', slug: 'berlin' },
  })
  const prop = await prisma.property.create({
    data: {
      title: 'Sample Property Berlin',
      cityId: berlin.id,
      address: 'Mitte, Berlin',
      priceMonthly: 2500,
      images: { create: [{ url: '/images/177891-4025734775.jpg', position: 0 }] },
    },
  })
  await prisma.calendarDay.create({
    data: { propertyId: prop.id, date: new Date().toISOString(), available: true, priceNight: 120 },
  })
  console.log('Seeded minimal data')
}

main().catch((e) => { console.error(e); process.exit(1) }).finally(async () => { await prisma.$disconnect() })









