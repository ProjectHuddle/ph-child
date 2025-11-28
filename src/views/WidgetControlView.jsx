import React from 'react';
import { __ } from '@wordpress/i18n';

// Import the WidgetControl component
import WidgetControl from '../components/WidgetControl';

const WidgetControlView = () => {
    return (
        <div className="surefeedback-widget-control-view">
            <WidgetControl />
        </div>
    );
};

export default WidgetControlView;
