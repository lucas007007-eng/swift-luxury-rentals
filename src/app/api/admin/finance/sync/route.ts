import { NextResponse } from 'next/server'

export async function POST() {
  try {
    const { PrismaClient } = await import('@prisma/client')
    const prisma = new PrismaClient()

    // Get all properties that don't have financial records
    const properties = await (prisma as any).property.findMany({
      include: {
        financials: true
      }
    })

    let created = 0
    for (const property of properties) {
      if (!property.financials) {
        await (prisma as any).propertyFinancials.create({
          data: {
            propertyId: property.id,
            totalInvestment: 0,
            totalRevenue: 0,
            totalExpenses: 0,
            netProfit: 0
          }
        })
        created++
      }
    }

    // Create default expense categories if they don't exist
    const categoryCount = await (prisma as any).expenseCategory.count()
    if (categoryCount === 0) {
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

    await prisma.$disconnect()

    return NextResponse.json({
      success: true,
      message: `Synced ${created} properties with financial records`,
      propertiesCreated: created
    })
  } catch (e) {
    console.error('Finance sync error:', e)
    return NextResponse.json({ error: 'Sync failed' }, { status: 500 })
  }
}
