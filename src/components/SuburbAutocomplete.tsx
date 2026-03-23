'use client'

import { useEffect, useRef, useState } from 'react'
import { MapPin } from 'lucide-react'

interface Props {
  value: string
  onChange: (suburb: string) => void
  onStateDetected: (state: string) => void
  placeholder: string
}

const STATE_MAP: Record<string, string> = {
  'New South Wales': 'NSW',
  'Victoria': 'VIC',
  'Queensland': 'QLD',
  'Western Australia': 'WA',
  'South Australia': 'SA',
  'Australian Capital Territory': 'ACT',
  'Tasmania': 'TAS',
  'Northern Territory': 'NT',
}

// Module-level singleton — prevents double-loading on re-renders / strict mode
let mapsPromise: Promise<void> | null = null

function loadPlaces(apiKey: string): Promise<void> {
  if (!mapsPromise) {
    mapsPromise = new Promise<void>((resolve, reject) => {
      // If already loaded (e.g. page refresh), resolve immediately
      if (typeof window !== 'undefined' && window.google?.maps?.places) {
        resolve()
        return
      }
      const script = document.createElement('script')
      script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`
      script.async = true
      script.defer = true
      script.onload = () => resolve()
      script.onerror = () => {
        mapsPromise = null
        reject(new Error('Google Maps script failed to load'))
      }
      document.head.appendChild(script)
    })
  }
  return mapsPromise
}

export function SuburbAutocomplete({ value, onChange, onStateDetected, placeholder }: Props) {
  const inputRef = useRef<HTMLInputElement>(null)
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null)
  const [ready, setReady] = useState(false)
  const [failed, setFailed] = useState(false)

  // Keep callback refs current so the autocomplete listener always calls the latest version
  // without needing to re-create the Autocomplete instance on every render
  const onChangeRef = useRef(onChange)
  const onStateDetectedRef = useRef(onStateDetected)
  useEffect(() => { onChangeRef.current = onChange }, [onChange])
  useEffect(() => { onStateDetectedRef.current = onStateDetected }, [onStateDetected])

  // Sync external value into DOM when input is not focused
  useEffect(() => {
    const el = inputRef.current
    if (el && document.activeElement !== el && el.value !== value) {
      el.value = value
    }
  }, [value])

  // Load Google Maps via plain script tag (more reliable than js-api-loader v2)
  useEffect(() => {
    const key = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
    if (!key) { setFailed(true); return }

    loadPlaces(key)
      .then(() => setReady(true))
      .catch(() => setFailed(true))
  }, [])

  // Attach Autocomplete once library is ready.
  // IMPORTANT: onChange/onStateDetected are intentionally NOT in the dependency array.
  // They are accessed via refs above. Adding them would re-create the Autocomplete
  // instance on every keystroke (parent re-renders with a new inline function each time),
  // which causes the input to freeze.
  useEffect(() => {
    if (!ready || !inputRef.current) return
    if (!window.google?.maps?.places?.Autocomplete) { setFailed(true); return }

    try {
      autocompleteRef.current = new google.maps.places.Autocomplete(inputRef.current, {
        componentRestrictions: { country: 'au' },
        types: ['(regions)'],
        fields: ['address_components', 'name'],
      })

      autocompleteRef.current.addListener('place_changed', () => {
        const place = autocompleteRef.current!.getPlace()
        const inputVal = inputRef.current?.value || ''

        if (!place?.address_components) {
          onChangeRef.current(inputVal)
          return
        }

        let suburbName = ''
        let stateName = ''

        for (const component of place.address_components) {
          if (component.types.includes('locality') || component.types.includes('sublocality_level_1')) {
            suburbName = component.long_name
          }
          if (component.types.includes('administrative_area_level_1')) {
            stateName = component.long_name
          }
          if (!suburbName && component.types.includes('colloquial_area')) {
            suburbName = component.long_name
          }
        }

        if (!suburbName && place.name) suburbName = place.name
        if (!suburbName) suburbName = inputVal

        if (suburbName) onChangeRef.current(suburbName)
        if (stateName && STATE_MAP[stateName]) onStateDetectedRef.current(STATE_MAP[stateName])
      })
    } catch {
      setFailed(true)
    }

    return () => {
      if (autocompleteRef.current) {
        google.maps.event.clearInstanceListeners(autocompleteRef.current)
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready])

  const inputClass =
    'w-full pl-10 pr-4 py-3 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none bg-gray-50 border border-gray-200 focus:border-orange-400 transition-colors'

  // Fallback: plain controlled input when Google fails to load
  if (failed) {
    return (
      <div className="relative">
        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
        <input
          type="text"
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          autoComplete="off"
          className={inputClass}
        />
      </div>
    )
  }

  // Normal: uncontrolled input so Google Autocomplete owns the DOM value
  return (
    <div className="relative">
      <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
      <input
        ref={inputRef}
        type="text"
        defaultValue={value}
        onInput={e => onChange((e.target as HTMLInputElement).value)}
        placeholder={placeholder}
        autoComplete="off"
        className={inputClass}
      />
    </div>
  )
}
