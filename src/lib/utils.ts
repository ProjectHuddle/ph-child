import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// SureFeedback connection helpers
export const isConnectedWithSaaS = () => {
  const accessKey = (window as any).sureFeedbackAdmin?.accessKey;
  return !(!accessKey || accessKey === '' || accessKey === null || accessKey === false || accessKey === 'connection-denied');
};

export const authenticateRedirect = () => {
  const { sureFeedbackAdmin } = (window as any);
  if (!sureFeedbackAdmin) {
    console.error('SureFeedback admin data not available');
    return;
  }

  const { connectUrl, connectNonce, siteUrl, siteTitle, sourceType } = sureFeedbackAdmin;

  const currentUrlParams = new URLSearchParams();
  currentUrlParams.set('url', siteUrl);
  currentUrlParams.set('redirect', window.location.href);
  currentUrlParams.set('connectNonce', connectNonce);
  currentUrlParams.set('sf-authorize', 'true');
  currentUrlParams.set('site-title', siteTitle);
  currentUrlParams.set('source_type', sourceType);

  window.open(`${connectUrl}?${currentUrlParams.toString()}`, '_self');
};

export const getUrlParam = (param: string) => {
  return new URL(window.location.href).searchParams.get(param);
};

export const disconnectFromSaaS = () => {
  const { sureFeedbackAdmin } = (window as any);
  if (!sureFeedbackAdmin) {
    console.error('SureFeedback admin data not available');
    return;
  }

  // Show confirmation dialog
  if (!confirm('Are you sure you want to disconnect from SureFeedback? This will remove all connection data.')) {
    return;
  }

  // Make a request to disconnect
  const formData = new FormData();
  formData.append('action', 'sf_disconnect');
  formData.append('nonce', sureFeedbackAdmin.disconnect_nonce);

  fetch(sureFeedbackAdmin.admin_url + 'admin-ajax.php', {
    method: 'POST',
    body: formData,
  })
    .then(response => response.json())
    .then(data => {
      if (data.success) {
        // Reload the page to show disconnected state
        window.location.reload();
      } else {
        alert('Failed to disconnect. Please try again.');
      }
    })
    .catch(error => {
      console.error('Disconnect error:', error);
      alert('Failed to disconnect. Please try again.');
    });
};