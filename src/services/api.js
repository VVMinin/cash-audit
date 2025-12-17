import axios from 'axios';

const instance = axios.create({
  baseURL: 'http://94.241.140.88:5000/api'
});

export default instance;
