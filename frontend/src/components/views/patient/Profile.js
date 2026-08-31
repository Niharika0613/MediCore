const PatientProfile = {
  data() { return { form:{ name:'', phone:'', birth_date:'', gender:'', blood_type:'', location:'' }, loading:true, saving:false, error:'', success:'' } },
  async mounted() {
    const { data } = await api.get('/client/profile')
    Object.assign(this.form, { name:data.full_name, phone:data.contact, birth_date:data.birth_date||'', gender:data.gender||'', blood_type:data.blood_type||'', location:data.location||'' })
    this.loading = false
  },
  methods: {
    async submit() {
      this.error = ''; this.saving = true
      try { await api.put('/client/profile', this.form); this.success = 'Profile updated successfully' }
      catch(e) { this.error = 'Update failed' }
      finally { this.saving = false }
    }
  },
  template: `
    <div>
      <h2 class="page-title mb-4">My Profile</h2>
      <div v-if="loading" class="spinner-wrap"><div class="spinner"></div></div>
      <div v-else>
        <div v-if="error"   class="alert alert-error">{{ error }}</div>
        <div v-if="success" class="alert alert-success">{{ success }}</div>
        <div class="form-container">
          <form @submit.prevent="submit">
            <div class="form-group"><label>Full Name</label><input v-model="form.name" type="text" required></div>
            <div class="form-group"><label>Contact / Phone</label><input v-model="form.phone" type="text"></div>
            <div class="form-group"><label>Date of Birth</label><input v-model="form.birth_date" type="date"></div>
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
            <div class="form-group"><label>Location / Address</label><textarea v-model="form.location" rows="3"></textarea></div>
            <button type="submit" class="btn btn-primary" :disabled="saving">{{ saving ? 'Saving...' : 'Update Profile' }}</button>
          </form>
        </div>
      </div>
    </div>
  `
}
