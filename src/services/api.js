import axios from 'axios';

const instance = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://94.241.140.88:5000/api'
});

export default instance;
