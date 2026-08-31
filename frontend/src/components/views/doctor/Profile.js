const DoctorProfile = {
  data() {
    return {
      form:{ name:'', phone:'', expertise:'', years_exp:'', consult_fee:'', schedule_text:'', about:'' },
      schedule:[], loading:true, saving:false, error:'', success:'', tab:'profile'
    }
  },
  async mounted() {
    const [dp, ds] = await Promise.all([api.get('/physician/profile'), api.get('/physician/schedule')])
    const d = dp.data
    Object.assign(this.form, { name:d.full_name, phone:d.contact, expertise:d.expertise, years_exp:d.years_exp, consult_fee:d.consult_fee, schedule_text:d.schedule_text||'', about:d.about||'' })
    this.schedule = ds.data; this.loading = false
  },
  methods: {
    async saveProfile() {
      this.error = ''; this.saving = true
      try { await api.put('/physician/profile', this.form); this.success = 'Profile updated successfully' }
      catch(e) { this.error = 'Update failed' }
      finally { this.saving = false }
    },
    async saveSchedule() {
      try { await api.post('/physician/schedule', this.schedule); this.success = 'Schedule updated' }
      catch(e) { this.error = 'Failed to update schedule' }
    },
    dayName(dateStr) {
      return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-US', { weekday:'short', month:'short', day:'numeric' })
    }
  },
  template: `
    <div>
      <h2 class="page-title mb-4">My Profile</h2>
      <div v-if="error"   class="alert alert-error">{{ error }}</div>
      <div v-if="success" class="alert alert-success">{{ success }}</div>
      <div v-if="loading" class="spinner-wrap"><div class="spinner"></div></div>
      <template v-else>
        <div style="display:flex;gap:.5rem;margin-bottom:1.5rem">
          <button class="btn btn-sm" :class="tab==='profile'?'btn-primary':'btn-secondary'" @click="tab='profile'">Profile</button>
          <button class="btn btn-sm" :class="tab==='schedule'?'btn-primary':'btn-secondary'" @click="tab='schedule'">Schedule (7 Days)</button>
        </div>
        <div v-if="tab==='profile'" class="form-container">
          <form @submit.prevent="saveProfile">
            <div class="form-group"><label>Full Name</label><input v-model="form.name" type="text" required></div>
            <div class="form-group"><label>Contact</label><input v-model="form.phone" type="text"></div>
            <div class="form-group"><label>Expertise</label><input v-model="form.expertise" type="text" required></div>
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:1rem">
              <div class="form-group"><label>Years of Experience</label><input v-model="form.years_exp" type="number" min="0"></div>
              <div class="form-group"><label>Consultation Fee</label><input v-model="form.consult_fee" type="number" step="0.01" min="0"></div>
            </div>
            <div class="form-group"><label>Schedule / Availability</label><input v-model="form.schedule_text" type="text" placeholder="e.g., Mon-Fri 9AM-5PM"></div>
            <div class="form-group"><label>About</label><textarea v-model="form.about" rows="3"></textarea></div>
            <button type="submit" class="btn btn-primary" :disabled="saving">{{ saving ? 'Saving...' : 'Update Profile' }}</button>
          </form>
        </div>
        <div v-else>
          <p class="text-muted mb-2">Click a day to toggle your availability.</p>
          <div class="availability-grid">
            <div v-for="day in schedule" :key="day.date"
              class="avail-card" :class="day.is_open ? 'available' : 'unavailable'"
              @click="day.is_open = !day.is_open">
              <div class="avail-day">{{ dayName(day.date) }}</div>
              <div class="avail-date">{{ day.is_open ? '✓ Open' : '✗ Closed' }}</div>
            </div>
          </div>
          <button class="btn btn-primary mt-4" @click="saveSchedule">Save Schedule</button>
        </div>
      </template>
    </div>
  `
}
