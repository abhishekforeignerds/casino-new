import axios from 'axios';
window.axios = axios;

window.axios.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';

console.log(`Current Vite mode: ${import.meta.env.MODE}`);
console.log("VITE_APP_ENV:", import.meta.env.VITE_APP_ENV);
console.log("VITE MODE:", import.meta.env.MODE);