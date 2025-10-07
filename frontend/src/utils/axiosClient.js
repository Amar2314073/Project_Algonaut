
import axios from "axios";

const isLocal = window.location.hostname === 'localhost';

const axiosClient = axios.create({
  baseURL: 'https://project-algonaut-1.onrender.com',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json'
  }
});


export default axiosClient;