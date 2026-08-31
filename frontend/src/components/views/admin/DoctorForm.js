const AdminDoctorForm = {
  props: ['id'],
  data() {
    return {
      form: { username:'', password:'', name:'', email:'', phone:'', expertise:'', years_exp:'', consult_fee:'', schedule_text:'', division_id:'', about:'' },
      divisions:[], isEdit:false, loading:false, error:''
    }
  },
  async mounted() {
    const { data: divs } = await api.get('/manage/divisions')
    this.divisions = divs
    if (this.id) {
      this.isEdit = true
      const { data: docs } = await api.get('/manage/physicians')
      const doc = docs.find(d => d.id == this.id)
      if (doc) Object.assign(this.form, { name:doc.full_name, email:doc.email, phone:doc.contact, expertise:doc.expertise, years_exp:doc.years_exp, consult_fee:doc.consult_fee, schedule_text:doc.schedule_text||'', division_id:doc.division_id||'', about:doc.about||'' })
    }
  },
  methods: {
    async submit() {
      this.error = ''; this.loading = true
      try {
        if (this.isEdit) await api.put('/manage/physicians/' + this.id, this.form)
        else             await api.post('/manage/physicians', this.form)
        this.$router.push('/admin/doctors')
      } catch(e) { this.error = e.response?.data?.error || 'Save failed' }
      finally { this.loading = false }
    }
  },
  template: `
    <div>
      <h2 class="page-title">{{ isEdit ? 'Edit' : 'Add' }} Physician</h2>
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
          <div class="form-group"><label>Expertise / Specialization</label><input v-model="form.expertise" type="text" required></div>
          <div class="form-group">
            <label>Division</label>
            <select v-model="form.division_id">
              <option value="">None</option>
              <option v-for="d in divisions" :key="d.id" :value="d.id">{{ d.name }}</option>
            </select>
          </div>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:1rem">
            <div class="form-group"><label>Years of Experience</label><input v-model="form.years_exp" type="number" min="0"></div>
            <div class="form-group"><label>Consultation Fee</label><input v-model="form.consult_fee" type="number" step="0.01" min="0"></div>
          </div>
          <div class="form-group"><label>Schedule / Availability</label><input v-model="form.schedule_text" type="text" placeholder="e.g., Mon-Fri 9AM-5PM"></div>
          <div class="form-group"><label>About</label><textarea v-model="form.about" rows="3"></textarea></div>
          <div style="display:flex;gap:.75rem">
            <button type="submit" class="btn btn-primary" :disabled="loading">{{ loading ? 'Saving...' : (isEdit ? 'Update Physician' : 'Add Physician') }}</button>
            <router-link to="/admin/doctors" class="btn btn-secondary">Cancel</router-link>
          </div>
        </form>
      </div>
    </div>
  `
}
