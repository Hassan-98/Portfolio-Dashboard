export const createAuthHeaders = (token) => ({
  headers: {
    'Authorization': `Bearer ${token}`
  }
})