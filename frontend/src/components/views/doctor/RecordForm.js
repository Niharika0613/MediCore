const DoctorRecordForm = {
  props: ['pid'],
  data() { return { form:{ condition:'', treatment:'', remarks:'', booking_id:null }, clientName:'', loading:false, error:'' } },
  async mounted() {
    try {
      const { data } = await api.get('/physician/clients')
      const c = data.find(cl => cl.id == this.pid)
      if (c) this.clientName = c.full_name
    } catch(e) {}
  },
  methods: {
    async submit() {
      this.error = ''; this.loading = true
      try {
        await api.post('/physician/notes/' + this.pid, this.form)
        this.$router.push('/doctor/records')
      } catch(e) { this.error = e.response?.data?.error || 'Failed to save note' }
      finally { this.loading = false }
    }
  },
  template: `
    <div>
      <h2 class="page-title">Add Case Note{{ clientName ? ' for ' + clientName : '' }}</h2>
      <div v-if="error" class="alert alert-error">{{ error }}</div>
      <div class="form-container">
        <form @submit.prevent="submit">
          <div class="form-group"><label>Condition / Diagnosis</label><textarea v-model="form.condition" rows="3" required placeholder="Enter the clinical condition"></textarea></div>
          <div class="form-group"><label>Treatment Plan</label><textarea v-model="form.treatment" rows="5" required placeholder="Enter treatment and prescription details"></textarea></div>
          <div class="form-group"><label>Remarks</label><textarea v-model="form.remarks" rows="3" placeholder="Additional remarks (optional)"></textarea></div>
          <div style="display:flex;gap:.75rem">
            <button type="submit" class="btn btn-primary" :disabled="loading">{{ loading ? 'Saving...' : 'Save Note' }}</button>
            <router-link to="/doctor/records" class="btn btn-secondary">Cancel</router-link>
          </div>
        </form>
      </div>
    </div>
  `
}
