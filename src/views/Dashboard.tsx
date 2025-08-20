import React from 'react'
import { useSettings } from '../hooks/useSettings'
import { CheckCircle, AlertTriangle, ExternalLink, Settings, Book, HelpCircle } from 'lucide-react'

const Dashboard: React.FC = () => {
  const { settings, isConnected } = useSettings()

  const getPluginName = () => {
    return settings.whiteLabel.ph_child_plugin_name || 'SureFeedback'
  }

  return (
    <div className="surefeedback-dashboard-react">
      {/* Header */}
      <div className="dashboard-header">
        <h1 className="dashboard-title">
          {getPluginName()} Dashboard
        </h1>
        <p className="dashboard-subtitle">
          Overview of your feedback collection system
        </p>
      </div>

      {/* Main Grid */}
      <div className="dashboard-grid">
        {/* Connection Status Card */}
        <div className="dashboard-card">
          <div className="card-header">
            <h3 className="card-title">Connection Status</h3>
          </div>
          <div className="card-content">
            {isConnected ? (
              <div className="status-connected">
                <div className="status-icon-wrapper">
                  <CheckCircle className="status-icon success" />
                </div>
                <div className="status-content">
                  <h4 className="status-title">Connected to SureFeedback Dashboard</h4>
                  <p className="status-description">Ready to sync comments</p>
                </div>
              </div>
            ) : (
              <div className="status-disconnected">
                <div className="status-icon-wrapper">
                  <AlertTriangle className="status-icon warning" />
                </div>
                <div className="status-content">
                  <h4 className="status-title">Not connected to SureFeedback Dashboard</h4>
                  <p className="status-description">
                    Please configure your connection settings to start collecting feedback.
                  </p>
                </div>
              </div>
            )}

            {isConnected && (
              <div className="connection-details">
                <div className="detail-item">
                  <span className="detail-label">Project ID:</span>
                  <span className="detail-value">{settings.connection.ph_child_id}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Parent URL:</span>
                  <span className="detail-value">{settings.connection.ph_child_parent_url}</span>
                </div>
              </div>
            )}

            <div className="card-actions">
              <a 
                href={`${window.location.origin}/wp-admin/admin.php?page=surefeedback-settings`}
                className="btn btn-primary"
              >
                <Settings className="btn-icon" />
                Manage Settings
              </a>
              
              {isConnected && settings.connection.ph_child_parent_url && (
                <a 
                  href={`${settings.connection.ph_child_parent_url}/projects/${settings.connection.ph_child_id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-secondary"
                >
                  <ExternalLink className="btn-icon" />
                  View Dashboard
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Quick Stats Card */}
        <div className="dashboard-card">
          <div className="card-header">
            <h3 className="card-title">Quick Stats</h3>
          </div>
          <div className="card-content">
            <div className="stats-grid">
              <div className="stat-item">
                <span className="stat-number">
                  {isConnected ? 'Active' : 'Inactive'}
                </span>
                <span className="stat-label">Status</span>
              </div>
              <div className="stat-item">
                <span className="stat-number">
                  {settings.general.ph_child_guest_comments_enabled ? 'Yes' : 'No'}
                </span>
                <span className="stat-label">Guest Comments</span>
              </div>
              <div className="stat-item">
                <span className="stat-number">
                  {settings.general.ph_child_admin ? 'Yes' : 'No'}
                </span>
                <span className="stat-label">Admin Comments</span>
              </div>
            </div>
          </div>
        </div>

        {/* Help & Documentation Card */}
        <div className="dashboard-card">
          <div className="card-header">
            <h3 className="card-title">Help & Documentation</h3>
          </div>
          <div className="card-content">
            <p className="help-description">
              Need help setting up or using SureFeedback? Check out these resources:
            </p>
            <div className="help-links">
              <a href="#" target="_blank" rel="noopener noreferrer" className="help-link">
                <Book className="help-icon" />
                <span>Getting Started Guide</span>
              </a>
              <a href="#" target="_blank" rel="noopener noreferrer" className="help-link">
                <Book className="help-icon" />
                <span>Documentation</span>
              </a>
              <a href="#" target="_blank" rel="noopener noreferrer" className="help-link">
                <HelpCircle className="help-icon" />
                <span>Support</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard