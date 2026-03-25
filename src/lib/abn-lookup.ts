export interface AbnResult {
  isValid: boolean
  isActive: boolean
  entityName: string
  state: string
  gstRegistered: boolean
  rawMessage?: string
}

/**
 * Look up an ABN via the Australian Business Register (ABR) JSON API.
 * Requires ABN_LOOKUP_GUID env var (free — register at abr.business.gov.au/Tools/WebServices).
 */
export async function lookupAbn(abn: string): Promise<AbnResult> {
  const guid = process.env.ABN_LOOKUP_GUID
  if (!guid) {
    console.warn('ABN_LOOKUP_GUID not configured — skipping ABN verification')
    return { isValid: false, isActive: false, entityName: '', state: '', gstRegistered: false, rawMessage: 'GUID not configured' }
  }

  const cleanAbn = abn.replace(/\s/g, '')
  const url = `https://abn.business.gov.au/json/AbnDetails.aspx?abn=${cleanAbn}&guid=${guid}`

  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(8000) })
    const text = await res.text()

    // API returns JSONP: callback({...}) — strip wrapper
    const json = text.replace(/^[^(]+\(/, '').replace(/\)\s*;?\s*$/, '')
    const data = JSON.parse(json)

    return {
      isValid: !!data.Abn,
      isActive: data.AbnStatus === 'Active',
      entityName: data.EntityName || '',
      state: data.AddressState || '',
      gstRegistered: !!data.Gst,
      rawMessage: data.Message || '',
    }
  } catch (err) {
    console.error('ABN lookup error:', err)
    return { isValid: false, isActive: false, entityName: '', state: '', gstRegistered: false, rawMessage: String(err) }
  }
}
