const PatientAppointments = {
  data() { return { bookings:[], loading:true, error:'', success:'' } },
  async mounted() { await this.load() },
  methods: {
    async load() {
      this.loading = true
      const { data } = await api.get('/client/bookings')
      this.bookings = data; this.loading = false
    },
    async cancel(id) {
      if (!confirm('Cancel this booking?')) return
      try { await api.put('/client/bookings/' + id + '/cancel'); this.success = 'Booking cancelled'; await this.load() }
      catch(e) { this.error = 'Cancel failed' }
    }
  },
  template: `
    <div>
      <div class="section-header mb-4">
        <h2 class="page-title">My Bookings</h2>
        <router-link to="/patient/doctors" class="btn btn-primary">+ New Booking</router-link>
      </div>
      <div v-if="error"   class="alert alert-error">{{ error }}</div>
      <div v-if="success" class="alert alert-success">{{ success }}</div>
      <div v-if="loading" class="spinner-wrap"><div class="spinner"></div></div>
      <div v-else style="overflow-x:auto">
        <table class="data-table">
          <thead><tr><th>ID</th><th>Physician</th><th>Expertise</th><th>Date</th><th>Time</th><th>Status</th><th>Actions</th></tr></thead>
          <tbody>
            <tr v-for="b in bookings" :key="b.id">
              <td>{{ b.id }}</td><td>{{ b.physician_name }}</td><td>{{ b.physician_expertise }}</td>
              <td>{{ b.date }}</td><td>{{ b.time }}</td>
              <td><span :class="'status status-' + b.status">{{ b.status }}</span></td>
              <td>
                <button v-if="b.status==='pending'" class="btn btn-sm btn-danger" @click="cancel(b.id)">Cancel</button>
              </td>
            </tr>
            <tr v-if="!bookings.length">
              <td colspan="7" class="text-center" style="padding:2rem;color:var(--text-light)">No bookings found</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  `
}
