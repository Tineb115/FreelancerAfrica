import axios from 'axios'

const api = axios.create({
  baseURL: 'http://localhost:8000/api',
  headers: { 'Content-Type': 'application/json' },
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config
    if (error.response?.status === 401 && !original._retry) {
      original._retry = true
      const refresh = localStorage.getItem('refresh_token')
      if (refresh) {
        try {
          const res = await axios.post('http://localhost:8000/api/auth/token/refresh/', { refresh })
          localStorage.setItem('access_token', res.data.access)
          original.headers.Authorization = `Bearer ${res.data.access}`
          return api(original)
        } catch { localStorage.clear(); window.location.href = '/login' }
      }
    }
    return Promise.reject(error)
  }
)

export const authAPI = {
  register: (d) => api.post('/auth/register/', d),
  login:    (d) => api.post('/auth/login/', d),
  me:       ()  => api.get('/auth/me/'),
}
export const profileAPI = {
  createFreelance: (d) => api.post('/auth/profile/freelance/create/', d),
  updateFreelance: (d) => api.patch('/auth/profile/freelance/', d),
  createClient:    (d) => api.post('/auth/profile/client/create/', d),
  updateClient:    (d) => api.patch('/auth/profile/client/', d),
  getFreelance:    (id) => api.get(`/auth/profile/freelance/${id}/`),
  listFreelances:  (p) => api.get('/auth/freelances/', { params: p }),
}
export const projectsAPI = {
  list:           (p)    => api.get('/projects/', { params: p }),
  create:         (d)    => api.post('/projects/', d),
  get:            (id)   => api.get(`/projects/${id}/`),
  update:         (id,d) => api.patch(`/projects/${id}/`, d),
  mine:           ()     => api.get('/projects/mine/'),
  deliver:        (id,d) => api.post(`/projects/${id}/deliver/`, d),
  acceptDelivery: (id)   => api.post(`/projects/${id}/accept/`),
  requestRevision:(id)   => api.post(`/projects/${id}/revision/`),
}
export const proposalsAPI = {
  submit:  (pid, d) => api.post(`/proposals/project/${pid}/`, d),
  list:    (pid)    => api.get(`/proposals/project/${pid}/list/`),
  accept:  (id)     => api.post(`/proposals/${id}/accept/`),
  reject:  (id)     => api.post(`/proposals/${id}/reject/`),
  mine:    ()       => api.get('/proposals/mine/'),
}
export const messagesAPI = {
  send:         (d)  => api.post('/messages/send/', d),
  inbox:        ()   => api.get('/messages/inbox/'),
  conversation: (id) => api.get(`/messages/${id}/`),
  unread:       ()   => api.get('/messages/unread/'),
}
export const paymentsAPI = {
  pay:    (pid, m) => api.post(`/payments/project/${pid}/pay/`, { method: m }),
  release:(pid)    => api.post(`/payments/project/${pid}/release/`),
  detail: (pid)    => api.get(`/payments/project/${pid}/`),
}
export const reviewsAPI = {
  create:       (pid, d) => api.post(`/reviews/project/${pid}/`, d),
  forFreelance: (uid)    => api.get(`/reviews/freelance/${uid}/`),
}
export const notificationsAPI = {
  list:       () => api.get('/notifications/'),
  unread:     () => api.get('/notifications/unread/'),
  markRead:   (id) => api.post(`/notifications/${id}/read/`),
  markAllRead:()   => api.post('/notifications/read-all/'),
}
export default api
