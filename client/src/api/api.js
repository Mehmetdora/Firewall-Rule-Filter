import axios from 'axios';


const BASE_URL = 'http://localhost:5050';   // server adresi
const TIMEOUT = 5000;   // her istek için 5 saniye zaman tanı

const apiClient = axios.create({
  baseURL: BASE_URL,
  timeout: TIMEOUT,
});

export default apiClient;