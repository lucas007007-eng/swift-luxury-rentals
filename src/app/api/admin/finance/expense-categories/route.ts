import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const { PrismaClient } = await import('@prisma/client')
    const prisma = new PrismaClient()

    // Check if categories exist, if not create defaults
    const existing = await (prisma as any).expenseCategory.count()
    
    if (existing === 0) {
      const defaultCategories = [
        { name: 'Furniture', type: 'setup', description: 'Sofas, beds, tables, chairs' },
        { name: 'Appliances', type: 'setup', description: 'Refrigerator, washing machine, dishwasher' },
        { name: 'Renovation', type: 'renovation', description: 'Construction, repairs, upgrades' },
        { name: 'Insurance', type: 'fixed', description: 'Property insurance, liability' },
        { name: 'Property Tax', type: 'fixed', description: 'Annual property taxes' },
        { name: 'Utilities', type: 'recurring', description: 'Electricity, gas, water' },
        { name: 'Internet & TV', type: 'recurring', description: 'WiFi, cable, streaming' },
        { name: 'Cleaning', type: 'recurring', description: 'Regular cleaning service' },
        { name: 'Maintenance', type: 'operational', description: 'Repairs, replacements' },
        { name: 'Marketing', type: 'operational', description: 'Photography, listings, ads' },
        { name: 'Guest Damages', type: 'guest', description: 'Damage repairs from guests' },
        { name: 'Guest Supplies', type: 'guest', description: 'Toiletries, amenities, linens' }
      ]
      
      await (prisma as any).expenseCategory.createMany({
        data: defaultCategories,
        skipDuplicates: true
      })
    }

    const categories = await (prisma as any).expenseCategory.findMany({
      orderBy: { name: 'asc' }
    })

    await prisma.$disconnect()
    return NextResponse.json(categories)
  } catch (e) {
    console.error('Expense categories error:', e)
    return NextResponse.json([])
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { PrismaClient } = await import('@prisma/client')
    const prisma = new PrismaClient()

    const category = await (prisma as any).expenseCategory.create({
      data: body
    })

    await prisma.$disconnect()
    return NextResponse.json(category)
  } catch (e) {
    console.error('Create category error:', e)
    return NextResponse.json({ error: 'Failed to create category' }, { status: 500 })
  }
}
