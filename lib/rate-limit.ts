interface RateLimitEntry {
  count: number
  resetTime: number
}

const rateLimitMap = new Map<string, RateLimitEntry>()

export function rateLimit(
  identifier: string,
  maxAttempts = 5,
  windowMs: number = 60 * 1000, // 1 minute
): { success: boolean; remaining: number; resetTime: number } {
  const now = Date.now()
  const entry = rateLimitMap.get(identifier)

  // Clean up expired entries
  if (entry && now > entry.resetTime) {
    rateLimitMap.delete(identifier)
  }

  const currentEntry = rateLimitMap.get(identifier)

  if (!currentEntry) {
    // First attempt
    rateLimitMap.set(identifier, {
      count: 1,
      resetTime: now + windowMs,
    })

    return {
      success: true,
      remaining: maxAttempts - 1,
      resetTime: now + windowMs,
    }
  }

  if (currentEntry.count >= maxAttempts) {
    return {
      success: false,
      remaining: 0,
      resetTime: currentEntry.resetTime,
    }
  }

  // Increment count
  currentEntry.count++

  return {
    success: true,
    remaining: maxAttempts - currentEntry.count,
    resetTime: currentEntry.resetTime,
  }
}

// Clean up expired entries periodically
setInterval(
  () => {
    const now = Date.now()
    for (const [key, entry] of rateLimitMap.entries()) {
      if (now > entry.resetTime) {
        rateLimitMap.delete(key)
      }
    }
  },
  5 * 60 * 1000,
) // Clean up every 5 minutes
