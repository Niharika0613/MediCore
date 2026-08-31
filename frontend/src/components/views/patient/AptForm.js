const PatientAptForm = {
  props: ['did'],
  data() { return { doctor:null, form:{ date:'', time:'', reason:'' }, loading:true, saving:false, error:'' } },
  async mounted() {
    const { data } = await api.get('/client/physicians')
    this.doctor = data.find(d => d.id == this.did); this.loading = false
  },
  computed: {
    today() { return new Date().toISOString().split('T')[0] }
  },
  methods: {
    async submit() {
      this.error = ''; this.saving = true
      try {
        await api.post('/client/bookings/' + this.did, this.form)
        this.$router.push('/patient/appointments')
      } catch(e) { this.error = e.response?.data?.error || 'Booking failed' }
      finally { this.saving = false }
    }
  },
  template: `
    <div class="page-container">
      <div v-if="loading" class="spinner-wrap"><div class="spinner"></div></div>
      <template v-else-if="doctor">
        <h2 class="page-title">Book Visit with {{ doctor.full_name }}</h2>
        <div class="doctor-info">
          <p><strong>Expertise:</strong> {{ doctor.expertise }}</p>
          <p><strong>Experience:</strong> {{ doctor.years_exp }} years</p>
          <p><strong>Fee:</strong> &#8377;{{ doctor.consult_fee }}</p>
          <p><strong>Schedule:</strong> {{ doctor.schedule_text || 'Contact for schedule' }}</p>
        </div>
        <div v-if="error" class="alert alert-error">{{ error }}</div>
        <div class="form-container">
          <form @submit.prevent="submit">
            <div class="form-group">
              <label>Preferred Date</label>
              <input v-model="form.date" type="date" required :min="today">
            </div>
            <div class="form-group">
              <label>Preferred Time</label>
              <select v-model="form.time" required>
                <option value="">Select Time</option>
                <option v-for="t in ['09:00 AM','10:00 AM','11:00 AM','12:00 PM','02:00 PM','03:00 PM','04:00 PM','05:00 PM']" :key="t">{{ t }}</option>
              </select>
            </div>
            <div class="form-group">
              <label>Reason / Symptoms (Optional)</label>
              <textarea v-model="form.reason" rows="3" placeholder="Describe your symptoms or reason for visit"></textarea>
            </div>
            <div style="display:flex;gap:.75rem">
              <button type="submit" class="btn btn-primary" :disabled="saving">{{ saving ? 'Booking...' : 'Confirm Booking' }}</button>
              <router-link to="/patient/doctors" class="btn btn-secondary">Cancel</router-link>
            </div>
          </form>
        </div>
      </template>
    </div>
  `
}
