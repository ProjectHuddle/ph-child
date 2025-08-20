import React from 'react'

interface SwitchProps {
  checked: boolean
  onChange: (checked: boolean) => void
  disabled?: boolean
  className?: string
}

const Switch: React.FC<SwitchProps> = ({ checked, onChange, disabled, className }) => {
  return (
    <label className={`inline-flex items-center cursor-pointer ${className || ''}`}>
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        disabled={disabled}
        className="sr-only"
      />
      <div className={`relative w-11 h-6 rounded-full transition-colors ${
        checked 
          ? 'bg-blue-600' 
          : 'bg-gray-200'
      } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}>
        <div className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform ${
          checked ? 'translate-x-5' : 'translate-x-0'
        }`} />
      </div>
    </label>
  )
}

export default Switch