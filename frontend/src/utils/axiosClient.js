
import axios from "axios";

const isLocal = window.location.hostname === 'localhost';

const axiosClient = axios.create({
  baseURL: isLocal
    ? 'http://localhost:3000' // backend running locally
    : 'https://project-algonaut-1.onrender.com', // deployed backend'
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json'
  }
});


export default axiosClient;