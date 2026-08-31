// Auth store — reactive singleton, backed by localStorage
const store = Vue.reactive({
  user:  JSON.parse(localStorage.getItem('mc_user')  || 'null'),
  token: localStorage.getItem('mc_token') || null,

  setAuth(user, token) {
    this.user  = user
    this.token = token
    localStorage.setItem('mc_user',  JSON.stringify(user))
    localStorage.setItem('mc_token', token)
  },

  clearAuth() {
    this.user  = null
    this.token = null
    localStorage.removeItem('mc_user')
    localStorage.removeItem('mc_token')
  },

  get isLoggedIn() { return !!this.token },
  get role()       { return this.user?.user_type || null },
  get name()       { return this.user?.full_name || '' },
})
