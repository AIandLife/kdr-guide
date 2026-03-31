/**
 * Tests for the supplier list API sanitization logic.
 * Extracted from src/app/api/suppliers/list/route.ts
 *
 * The API derives `verified` boolean from `status` field and strips
 * sensitive/internal fields before returning to the client.
 */

interface RawSupplier {
  id: string
  business_name: string
  category: string
  origin: string
  description: string
  states: string[]
  specialties: string[]
  status: 'verified' | 'unverified'
  google_rating: number | null
  google_reviews: number | null
  featured: boolean
  website: string | null
  phone: string | null
  wechat: string | null
  email: string | null
}

// Replicate the sanitization logic from the API route
function sanitizeSuppliers(data: RawSupplier[]) {
  return (data || []).map(s => {
    const verified = s.status === 'verified'
    if (verified) return { ...s, verified, status: undefined }
    return {
      id: s.id,
      business_name: s.business_name,
      category: s.category,
      origin: s.origin,
      description: s.description,
      states: s.states,
      specialties: s.specialties,
      verified,
      featured: s.featured,
      website: null,
      phone: null,
      wechat: null,
      email: null,
      google_rating: null,
      google_reviews: null,
    }
  })
}

const verifiedSupplier: RawSupplier = {
  id: 'sup-001',
  business_name: 'Premium Tiles Co',
  category: 'Tiles',
  origin: 'AU',
  description: 'High quality tiles',
  states: ['NSW', 'VIC'],
  specialties: ['porcelain', 'marble'],
  status: 'verified',
  google_rating: 4.8,
  google_reviews: 120,
  featured: true,
  website: 'https://premiumtiles.com.au',
  phone: '0412345678',
  wechat: 'premiumtiles',
  email: 'info@premiumtiles.com.au',
}

const unverifiedSupplier: RawSupplier = {
  id: 'sup-002',
  business_name: 'Budget Hardware',
  category: 'Hardware',
  origin: 'CN',
  description: 'Affordable hardware supplies',
  states: ['NSW'],
  specialties: ['screws', 'nails'],
  status: 'unverified',
  google_rating: 3.5,
  google_reviews: 10,
  featured: false,
  website: 'https://budgethardware.com',
  phone: '0498765432',
  wechat: 'budgethw',
  email: 'sales@budgethardware.com',
}

describe('supplier list sanitization', () => {
  describe('verified boolean derivation', () => {
    it('sets verified=true when status is "verified"', () => {
      const [result] = sanitizeSuppliers([verifiedSupplier])
      expect(result.verified).toBe(true)
    })

    it('sets verified=false when status is "unverified"', () => {
      const [result] = sanitizeSuppliers([unverifiedSupplier])
      expect(result.verified).toBe(false)
    })
  })

  describe('internal field stripping', () => {
    it('removes status field from verified suppliers (set to undefined)', () => {
      const [result] = sanitizeSuppliers([verifiedSupplier])
      expect(result.status).toBeUndefined()
    })

    it('does not include status field for unverified suppliers', () => {
      const [result] = sanitizeSuppliers([unverifiedSupplier])
      // unverified path builds a new object without status
      expect('status' in result).toBe(false)
    })
  })

  describe('contact info exposure for verified suppliers', () => {
    it('exposes website for verified suppliers', () => {
      const [result] = sanitizeSuppliers([verifiedSupplier])
      expect(result.website).toBe('https://premiumtiles.com.au')
    })

    it('exposes phone for verified suppliers', () => {
      const [result] = sanitizeSuppliers([verifiedSupplier])
      expect(result.phone).toBe('0412345678')
    })

    it('exposes email for verified suppliers', () => {
      const [result] = sanitizeSuppliers([verifiedSupplier])
      expect(result.email).toBe('info@premiumtiles.com.au')
    })

    it('exposes google_rating for verified suppliers', () => {
      const [result] = sanitizeSuppliers([verifiedSupplier])
      expect(result.google_rating).toBe(4.8)
    })
  })

  describe('contact info hidden for unverified suppliers', () => {
    it('hides website for unverified suppliers', () => {
      const [result] = sanitizeSuppliers([unverifiedSupplier])
      expect(result.website).toBeNull()
    })

    it('hides phone for unverified suppliers', () => {
      const [result] = sanitizeSuppliers([unverifiedSupplier])
      expect(result.phone).toBeNull()
    })

    it('hides email for unverified suppliers', () => {
      const [result] = sanitizeSuppliers([unverifiedSupplier])
      expect(result.email).toBeNull()
    })

    it('hides wechat for unverified suppliers', () => {
      const [result] = sanitizeSuppliers([unverifiedSupplier])
      expect(result.wechat).toBeNull()
    })

    it('hides google_rating for unverified suppliers', () => {
      const [result] = sanitizeSuppliers([unverifiedSupplier])
      expect(result.google_rating).toBeNull()
    })

    it('hides google_reviews for unverified suppliers', () => {
      const [result] = sanitizeSuppliers([unverifiedSupplier])
      expect(result.google_reviews).toBeNull()
    })
  })

  describe('basic fields always exposed', () => {
    it('always exposes business_name for unverified', () => {
      const [result] = sanitizeSuppliers([unverifiedSupplier])
      expect(result.business_name).toBe('Budget Hardware')
    })

    it('always exposes category and description', () => {
      const [result] = sanitizeSuppliers([unverifiedSupplier])
      expect(result.category).toBe('Hardware')
      expect(result.description).toBe('Affordable hardware supplies')
    })
  })

  describe('mixed list processing', () => {
    it('correctly processes a mix of verified and unverified suppliers', () => {
      const results = sanitizeSuppliers([verifiedSupplier, unverifiedSupplier])
      expect(results).toHaveLength(2)
      expect(results[0].verified).toBe(true)
      expect(results[0].website).toBe('https://premiumtiles.com.au')
      expect(results[1].verified).toBe(false)
      expect(results[1].website).toBeNull()
    })

    it('handles empty list', () => {
      const results = sanitizeSuppliers([])
      expect(results).toEqual([])
    })
  })
})
