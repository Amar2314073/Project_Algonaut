
import axios from "axios";

 const axiosClient = axios.create({
    baseURL: 'https://project-algonaut-4i35.vercel.app',
    withCredentials: true,
    headers:{
        'Content-Type': 'application/json'
    }
});

export default axiosClient;