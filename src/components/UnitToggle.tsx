'use client'

interface UnitToggleProps {
  value: 'miles' | 'km'
  onChange: (unit: 'miles' | 'km') => void
}

export function UnitToggle({ value, onChange }: UnitToggleProps) {
  return (
    <button
      type="button"
      onClick={() => onChange(value === 'miles' ? 'km' : 'miles')}
      className="text-sm font-medium px-3 py-1 rounded-full border border-gray-300 bg-white text-gray-600 active:bg-gray-100 transition-colors min-w-[64px]"
    >
      {value === 'miles' ? 'mi' : 'km'}
    </button>
  )
}
