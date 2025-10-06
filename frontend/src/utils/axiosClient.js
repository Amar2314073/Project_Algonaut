
import axios from "axios";

 const axiosClient = axios.create({
    baseURL: 'http://project-algonaut-4i35.vercel.app',
    withCredentials: true,
    headers:{
        'Content-Type': 'application/json'
    }
});

export default axiosClient;