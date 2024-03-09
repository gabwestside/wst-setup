import axios from 'axios'

export const api = axios.create({
  baseURL: 'http://192.168.0.92:3333', // home host
  // baseURL: 'http://localhost:3333', // localhost
  // baseURL: 'http://192.168.100.22:3333', // travel host
})
