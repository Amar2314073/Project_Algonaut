
import axios from "axios";

const isLocal = window.location.hostname === 'localhost';

const axiosClient = axios.create({
  baseURL: isLocal
    ? 'http://localhost:3000' // backend running locally
    : 'https://projectalgonaut-production.up.railway.app', // deployed backend'
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json'
  }
});


export default axiosClient;