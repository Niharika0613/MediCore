const AdminPatientForm = {
  props: ['id'],
  data() {
    return {
      form: { username:'', password:'', name:'', email:'', phone:'', birth_date:'', gender:'', blood_type:'', location:'' },
      isEdit:false, loading:false, error:''
    }
  },
  async mounted() {
    if (this.id) {
      this.isEdit = true
      const { data: clients } = await api.get('/manage/clients')
      const client = clients.find(c => c.id == this.id)
      if (client) Object.assign(this.form, { name:client.full_name, email:client.email, phone:client.contact, birth_date:client.birth_date||'', gender:client.gender||'', blood_type:client.blood_type||'', location:client.location||'' })
    }
  },
  methods: {
    async submit() {
      this.error = ''; this.loading = true
      try {
        if (this.isEdit) await api.put('/manage/clients/' + this.id, this.form)
        else             await api.post('/manage/clients', this.form)
        this.$router.push('/admin/patients')
      } catch(e) { this.error = e.response?.data?.error || 'Save failed' }
      finally { this.loading = false }
    }
  },
  template: `
    <div>
      <h2 class="page-title">{{ isEdit ? 'Edit' : 'Add' }} Client</h2>
      <div v-if="error" class="alert alert-error">{{ error }}</div>
      <div class="form-container" style="max-width:560px">
        <form @submit.prevent="submit">
          <template v-if="!isEdit">
            <div class="form-group"><label>Username</label><input v-model="form.username" type="text" required></div>
            <div class="form-group"><label>Password</label><input v-model="form.password" type="password" required></div>
          </template>
          <div class="form-group"><label>Full Name</label><input v-model="form.name" type="text" required></div>
          <div class="form-group"><label>Email</label><input v-model="form.email" type="email" :required="!isEdit"></div>
          <div class="form-group"><label>Phone</label><input v-model="form.phone" type="text"></div>
          <div class="form-group"><label>Birth Date</label><input v-model="form.birth_date" type="date"></div>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:1rem">
            <div class="form-group">
              <label>Gender</label>
              <select v-model="form.gender">
                <option value="">Select</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div class="form-group">
              <label>Blood Type</label>
              <select v-model="form.blood_type">
                <option value="">Select</option>
                <option value="A+">A+</option>
                <option value="A-">A-</option>
                <option value="B+">B+</option>
                <option value="B-">B-</option>
                <option value="AB+">AB+</option>
                <option value="AB-">AB-</option>
                <option value="O+">O+</option>
                <option value="O-">O-</option>
              </select>
            </div>
          </div>
          <div class="form-group"><label>Location</label><input v-model="form.location" type="text"></div>
          <div style="display:flex;gap:.75rem">
            <button type="submit" class="btn btn-primary" :disabled="loading">{{ loading ? 'Saving...' : (isEdit ? 'Update Client' : 'Add Client') }}</button>
            <router-link to="/admin/patients" class="btn btn-secondary">Cancel</router-link>
          </div>
        </form>
      </div>
    </div>
  `
}
