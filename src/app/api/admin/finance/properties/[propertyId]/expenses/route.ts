import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest, { params }: { params: { propertyId: string } }) {
  try {
    const { PrismaClient } = await import('@prisma/client')
    const prisma = new PrismaClient()

    // Ensure PropertyFinancials exists for this property
    await (prisma as any).propertyFinancials.upsert({
      where: { propertyId: params.propertyId },
      update: {},
      create: { propertyId: params.propertyId }
    })

    const expenses = await (prisma as any).expense.findMany({
      where: { propertyId: params.propertyId },
      include: {
        category: {
          select: { name: true, type: true }
        }
      },
      orderBy: { date: 'desc' }
    })

    const mapped = expenses.map((e: any) => ({
      id: e.id,
      amount: e.amount,
      description: e.description,
      date: e.date,
      categoryName: e.category?.name || 'Unknown',
      categoryType: e.category?.type || 'operational',
      status: e.status,
      isRecurring: e.isRecurring,
      receiptUrl: e.receiptUrl
    }))

    await prisma.$disconnect()
    return NextResponse.json(mapped)
  } catch (e) {
    console.error('Property expenses error:', e)
    return NextResponse.json([])
  }
}

export async function POST(req: NextRequest, { params }: { params: { propertyId: string } }) {
  try {
    const body = await req.json()
    const { PrismaClient } = await import('@prisma/client')
    const prisma = new PrismaClient()

    const expense = await (prisma as any).expense.create({
      data: {
        ...body,
        propertyId: params.propertyId,
        date: new Date(body.date)
      }
    })

    // Update property financials total
    const total = await (prisma as any).expense.aggregate({
      where: { propertyId: params.propertyId },
      _sum: { amount: true }
    })

    await (prisma as any).propertyFinancials.update({
      where: { propertyId: params.propertyId },
      data: { totalExpenses: total._sum?.amount || 0 }
    })

    // Set global cache invalidation timestamp for portfolio refresh
    ;(global as any).__financeLastUpdate = Date.now()
    console.log('💰 Expense added, portfolio cache invalidated')

    await prisma.$disconnect()
    return NextResponse.json(expense)
  } catch (e) {
    console.error('Create expense error:', e)
    return NextResponse.json({ error: 'Failed to create expense' }, { status: 500 })
  }
}
