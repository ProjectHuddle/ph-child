import React from 'react';

const ContentSection = ({ loading = false, title, content }) => {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
      {loading ? (
        <div className="space-y-4">
          <div className="h-6 bg-gray-200 rounded w-48 animate-pulse"></div>
          <div className="space-y-2">
            <div className="h-4 bg-gray-200 rounded w-full animate-pulse"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4 animate-pulse"></div>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {title && (
            <h3 className="text-base font-semibold text-gray-900 mb-4">{title}</h3>
          )}
          {content && <div>{content}</div>}
        </div>
      )}
    </div>
  );
};

export default ContentSection;

