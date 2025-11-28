import React, { useState, useEffect } from 'react';
import Welcome from '../components/Welcome';

const SetupView = () => {
    useEffect(() => {
        // Add body class for setup fullscreen mode
        document.body.classList.add('surefeedback-setup-fullscreen');
        
        // Cleanup: remove body class when component unmounts
        return () => {
            document.body.classList.remove('surefeedback-setup-fullscreen');
        };
    }, []);

    return (
        <div className="setup-view-container" style={{ 
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            zIndex: 999999,
            backgroundColor: '#ffffff',
            overflow: 'auto'
        }}>
            <div className="setup-content" style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'flex-start',
                minHeight: '100vh',
                padding: '20px'
            }}>
                <Welcome />
            </div>
        </div>
    );
}

export default SetupView;