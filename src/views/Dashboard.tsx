import React from 'react'
import NavMenu from '../components/NavMenu'

const Dashboard = () => {
  return (
    <div id="surefeedback-dashboard-app" className="surefeedback-styles">
      <NavMenu />
      <h1 className="ph_child-dashboard-title text-2xl font-semibold text-gray-900 p-4">Dashboard</h1>
    </div>
  )
}

export default Dashboard