import React from 'react';

// Import the WidgetControl component
import WidgetControl from '../../components/SaaS/WidgetControl';

// WordPress i18n fallback
const __ = (text, domain) => {
  if (typeof window !== 'undefined' && window.wp && window.wp.i18n) {
    return window.wp.i18n.__(text, domain);
  }
  return text;
};

const WidgetControlView = () => {
    return (
        <div className="surefeedback-widget-control-view">
            <WidgetControl />
        </div>
    );
};

export default WidgetControlView;
