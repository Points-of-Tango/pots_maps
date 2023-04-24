import axios from 'axios'

const instance = axios.create({
  baseURL: 'https://api.pointsoftango.app/'
})

export default instance
