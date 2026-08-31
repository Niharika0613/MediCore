const RegisterView = {
  data() {
    return {
      form: { username:'', password:'', name:'', email:'', phone:'', birth_date:'', gender:'', blood_type:'', location:'' },
      error:'', success:'', loading:false
    }
  },
  methods: {
    async submit() {
      this.error = ''; this.success = ''; this.loading = true
      try {
        await api.post('/auth/register', this.form)
        this.success = 'Registration successful! Redirecting to sign in...'
        setTimeout(() => this.$router.push('/login'), 1500)
      } catch(e) {
        this.error = e.response?.data?.error || 'Registration failed'
      } finally { this.loading = false }
    }
  },
  template: `
    <div class="auth-wrap">
      <div class="auth-box" style="max-width:520px">
        <div class="auth-logo"><span>Medi<em>Core</em></span></div>
        <h2>Create Account</h2>
        <div v-if="error"   class="alert alert-error">{{ error }}</div>
        <div v-if="success" class="alert alert-success">{{ success }}</div>
        <form @submit.prevent="submit">
          <div class="form-group"><label>Username</label><input v-model="form.username" type="text" required></div>
          <div class="form-group"><label>Password</label><input v-model="form.password" type="password" required></div>
          <div class="form-group"><label>Full Name</label><input v-model="form.name" type="text" required></div>
          <div class="form-group"><label>Email</label><input v-model="form.email" type="email" required></div>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:1rem">
            <div class="form-group"><label>Phone</label><input v-model="form.phone" type="text"></div>
            <div class="form-group"><label>Date of Birth</label><input v-model="form.birth_date" type="date"></div>
          </div>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:1rem">
            <div class="form-group">
              <label>Gender</label>
              <select v-model="form.gender">
                <option value="">Select</option>
                <option>Male</option><option>Female</option><option>Other</option>
              </select>
            </div>
            <div class="form-group">
              <label>Blood Type</label>
              <select v-model="form.blood_type">
                <option value="">Select</option>
                <option v-for="bg in ['A+','A-','B+','B-','AB+','AB-','O+','O-']" :key="bg">{{ bg }}</option>
              </select>
            </div>
          </div>
          <div class="form-group"><label>Location / Address</label><textarea v-model="form.location" rows="2"></textarea></div>
          <button type="submit" class="btn btn-primary" style="width:100%;padding:.75rem" :disabled="loading">
            {{ loading ? 'Creating account...' : 'Create Account' }}
          </button>
        </form>
        <p class="text-center mt-2" style="font-size:.9rem">
          Already registered?
          <router-link to="/login" style="color:var(--primary);font-weight:700">Sign in here</router-link>
        </p>
      </div>
    </div>
  `
}
