import prisma from '@/lib/prisma'

export type BookingValidationError = {
  field: string
  message: string
}

export async function validateBookingDates(
  propertyId: string,
  checkIn: string,
  checkOut: string,
  excludeBookingId?: string
): Promise<BookingValidationError[]> {
  const errors: BookingValidationError[] = []

  // Validate date format
  const checkinDate = new Date(checkIn)
  const checkoutDate = new Date(checkOut)
  
  if (isNaN(checkinDate.getTime())) {
    errors.push({ field: 'checkIn', message: 'Invalid check-in date format' })
  }
  
  if (isNaN(checkoutDate.getTime())) {
    errors.push({ field: 'checkOut', message: 'Invalid check-out date format' })
  }
  
  if (errors.length > 0) return errors

  // Validate date logic
  if (checkinDate >= checkoutDate) {
    errors.push({ field: 'checkOut', message: 'Check-out must be after check-in' })
  }
  
  if (checkinDate < new Date(Date.now() - 24 * 60 * 60 * 1000)) {
    errors.push({ field: 'checkIn', message: 'Check-in cannot be in the past' })
  }
  
  const stayDays = Math.ceil((checkoutDate.getTime() - checkinDate.getTime()) / (1000 * 60 * 60 * 24))
  if (stayDays > 365) {
    errors.push({ field: 'checkOut', message: 'Stay cannot exceed 365 days' })
  }
  
  if (stayDays < 1) {
    errors.push({ field: 'checkOut', message: 'Stay must be at least 1 day' })
  }

  // Check for overlapping bookings
  try {
    const overlapping = await prisma.booking.findFirst({
      where: {
        propertyId: propertyId,
        status: 'confirmed', // Only block confirmed bookings, not holds
        deletedAt: null, // Exclude soft-deleted bookings
        ...(excludeBookingId ? { id: { not: excludeBookingId } } : {}),
        OR: [
          // New booking starts during existing booking
          { checkin: { lte: checkinDate }, checkout: { gt: checkinDate } },
          // New booking ends during existing booking  
          { checkin: { lt: checkoutDate }, checkout: { gte: checkoutDate } },
          // New booking completely contains existing booking
          { checkin: { gte: checkinDate }, checkout: { lte: checkoutDate } }
        ]
      },
      select: { id: true, checkin: true, checkout: true, user: { select: { name: true } } }
    })
    
    if (overlapping) {
      const userName = overlapping.user?.name || 'Unknown'
      errors.push({ 
        field: 'dates', 
        message: `Dates overlap with confirmed booking by ${userName} (${overlapping.checkin.toDateString()} - ${overlapping.checkout.toDateString()})` 
      })
    }
  } catch (e) {
    errors.push({ field: 'dates', message: 'Could not check for overlapping bookings' })
  }

  return errors
}

export function validateBookingData(data: any): BookingValidationError[] {
  const errors: BookingValidationError[] = []

  if (!data.propertyId) {
    errors.push({ field: 'propertyId', message: 'Property ID is required' })
  }

  if (!data.checkIn) {
    errors.push({ field: 'checkIn', message: 'Check-in date is required' })
  }

  if (!data.checkOut) {
    errors.push({ field: 'checkOut', message: 'Check-out date is required' })
  }

  if (data.email && !/\S+@\S+\.\S+/.test(data.email)) {
    errors.push({ field: 'email', message: 'Invalid email format' })
  }

  return errors
}
