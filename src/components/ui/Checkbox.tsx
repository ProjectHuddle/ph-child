import React from 'react'
import { Check } from 'lucide-react'

interface CheckboxProps {
  id?: string
  checked: boolean
  onChange: (checked: boolean) => void
  disabled?: boolean
  className?: string
}

const Checkbox: React.FC<CheckboxProps> = ({ id, checked, onChange, disabled, className }) => {
  return (
    <div className="relative">
      <input
        id={id}
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        disabled={disabled}
        className={`peer h-4 w-4 shrink-0 rounded-sm border border-gray-300 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${className || ''}`}
      />
      {checked && (
        <Check className="absolute inset-0 h-4 w-4 text-blue-600 pointer-events-none" />
      )}
    </div>
  )
}

export default Checkbox