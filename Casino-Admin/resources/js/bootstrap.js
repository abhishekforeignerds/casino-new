// resources/js/bootstrap.js

import axios from 'axios';
// resources/js/bootstrap.js

import qz from 'qz-tray';
window.qz = qz;

// Determine mode from Vite (either "development" or "production")
const isProd = import.meta.env.MODE === 'production';

if (isProd) {
  // In prod, load your real certificate from an environment variable
 qz.security.setCertificatePromise(() => {
  const cert = import.meta.env.VITE_QZ_CERT;
  if (!cert) {
    console.error("QZ Certificate missing");
    return Promise.reject("Certificate not found");
  }
  return Promise.resolve(cert.replace(/\\n/g, '\n'));

});
qz.security.setSignaturePromise((toSign) => {
  return fetch('/api/qz-sign', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ data: toSign }),
  })
    .then(res => res.json())
    .then(json => json.signature);
});
} else {
  // In dev, just no-op the certificate and signature
  qz.security.setCertificatePromise(() => Promise.resolve(''));
  qz.security.setSignaturePromise(() => Promise.resolve(''));
}

console.log(`QZ Tray initialized in ${isProd ? 'production' : 'development'} mode`);
