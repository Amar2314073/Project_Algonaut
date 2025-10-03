
import axios from "axios";

 const axiosClient = axios.create({
    baseURL: 'srv-d3ft7gp5pdvs73bsa2r0',
    withCredentials: true,
    headers:{
        'Content-Type': 'application/json'
    }
});

export default axiosClient;