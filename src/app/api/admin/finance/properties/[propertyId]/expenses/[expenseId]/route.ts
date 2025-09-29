import { NextRequest, NextResponse } from 'next/server'

export async function PATCH(req: NextRequest, { params }: { params: { propertyId: string; expenseId: string } }) {
  try {
    const body = await req.json()
    const { PrismaClient } = await import('@prisma/client')
    const prisma = new PrismaClient()

    const expense = await (prisma as any).expense.update({
      where: { id: params.expenseId },
      data: {
        ...body,
        amount: parseFloat(body.amount),
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

    // Set global cache invalidation timestamp
    ;(global as any).__financeLastUpdate = Date.now()
    console.log('💰 Expense updated, portfolio cache invalidated')

    await prisma.$disconnect()
    return NextResponse.json(expense)
  } catch (e) {
    console.error('Update expense error:', e)
    return NextResponse.json({ error: 'Failed to update expense' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { propertyId: string; expenseId: string } }) {
  try {
    const { PrismaClient } = await import('@prisma/client')
    const prisma = new PrismaClient()

    await (prisma as any).expense.delete({
      where: { id: params.expenseId }
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

    // Set global cache invalidation timestamp
    ;(global as any).__financeLastUpdate = Date.now()
    console.log('💰 Expense deleted, portfolio cache invalidated')

    await prisma.$disconnect()
    return NextResponse.json({ success: true })
  } catch (e) {
    console.error('Delete expense error:', e)
    return NextResponse.json({ error: 'Failed to delete expense' }, { status: 500 })
  }
}
