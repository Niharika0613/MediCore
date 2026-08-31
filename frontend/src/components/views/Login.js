const LoginView = {
  data() {
    return { form: { username: '', password: '' }, error: '', loading: false }
  },
  methods: {
    async submit() {
      this.error = ''; this.loading = true
      try {
        const { data } = await api.post('/auth/login', this.form)
        store.setAuth(data.user, data.token)
        const dest = data.user.user_type === 'admin' ? '/admin'
                   : data.user.user_type === 'doctor' ? '/doctor' : '/patient'
        this.$router.push(dest)
      } catch (e) {
        this.error = e.response?.data?.error || 'Login failed'
      } finally { this.loading = false }
    }
  },
  template: `
    <div class="auth-wrap">
      <div class="auth-box">
        <div class="auth-logo"><span>Medi<em>Core</em></span></div>
        <h2>Welcome Back</h2>
        <div v-if="error" class="alert alert-error">{{ error }}</div>
        <form @submit.prevent="submit">
          <div class="form-group">
            <label>Username</label>
            <input v-model="form.username" type="text" required placeholder="Enter your username">
          </div>
          <div class="form-group">
            <label>Password</label>
            <input v-model="form.password" type="password" required placeholder="Enter your password">
          </div>
          <button type="submit" class="btn btn-primary" style="width:100%;padding:.75rem" :disabled="loading">
            {{ loading ? 'Signing in...' : 'Sign In' }}
          </button>
        </form>
        <p class="text-center mt-2" style="font-size:.9rem">
          No account?
          <router-link to="/register" style="color:var(--primary);font-weight:700">Register here</router-link>
        </p>
      </div>
    </div>
  `
}
