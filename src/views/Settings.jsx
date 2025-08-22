import React from 'react'
import NavMenu from '../components/NavMenu'

const Settings = () => {
  console.log('🟢 Settings component is rendering!');
  return (
    <div id="surefeedback-settings-app" className="surefeedback-styles" style={{backgroundColor: 'lightgreen', border: '3px solid red'}}>
      <NavMenu />
      <div className="p-6">
        <h1 className="text-2xl font-semibold text-gray-900 mb-4">🟢 SETTINGS PAGE 🟢</h1>
        <p>This is the Settings page content.</p>
        <p>If you can see this green background and red border, the Settings component is working!</p>
      </div>
    </div>
  )
}

export default Settings