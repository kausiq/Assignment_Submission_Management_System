import api from './axios';

export const usersApi = {
  list: (params) => api.get('/users', { params }).then((r) => r.data.data),
  create: (payload) => api.post('/users', payload).then((r) => r.data.data),
  update: (id, payload) => api.put(`/users/${id}`, payload).then((r) => r.data.data),
  remove: (id) => api.delete(`/users/${id}`).then((r) => r.data)
};

export const classesApi = {
  list: () => api.get('/classes').then((r) => r.data.data),
  create: (payload) => api.post('/classes', payload).then((r) => r.data.data),
  update: (id, payload) => api.put(`/classes/${id}`, payload).then((r) => r.data.data),
  remove: (id) => api.delete(`/classes/${id}`).then((r) => r.data)
};

export const subjectsApi = {
  list: (params) => api.get('/subjects', { params }).then((r) => r.data.data),
  create: (payload) => api.post('/subjects', payload).then((r) => r.data.data),
  update: (id, payload) => api.put(`/subjects/${id}`, payload).then((r) => r.data.data),
  remove: (id) => api.delete(`/subjects/${id}`).then((r) => r.data)
};

export const assignmentsApi = {
  list: (params) => api.get('/assignments', { params }).then((r) => r.data.data),
  get: (id) => api.get(`/assignments/${id}`).then((r) => r.data.data),
  create: (payload) => api.post('/assignments', payload).then((r) => r.data.data),
  update: (id, payload) => api.put(`/assignments/${id}`, payload).then((r) => r.data.data),
  remove: (id) => api.delete(`/assignments/${id}`).then((r) => r.data),
  submit: (assignmentId, payload) =>
    api.post(`/assignments/${assignmentId}/submissions`, payload).then((r) => r.data.data)
};

export const submissionsApi = {
  list: (params) => api.get('/submissions', { params }).then((r) => r.data.data),
  get: (id) => api.get(`/submissions/${id}`).then((r) => r.data.data),
  update: (id, payload) => api.put(`/submissions/${id}`, payload).then((r) => r.data.data),
  grade: (id, payload) => api.put(`/submissions/${id}/grade`, payload).then((r) => r.data.data),
  setStatus: (id, status) => api.put(`/submissions/${id}/status`, { status }).then((r) => r.data.data)
};
