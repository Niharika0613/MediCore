const AdminAppointments = {
  data() { return { appointments:[], filter:'', loading:true } },
  async mounted() {
    const { data } = await api.get('/manage/bookings')
    this.appointments = data; this.loading = false
  },
  computed: {
    filtered() {
      return this.filter ? this.appointments.filter(a => a.status === this.filter) : this.appointments
    }
  },
  template: `
    <div>
      <h2 class="page-title mb-2">All Bookings</h2>
      <div style="display:flex;gap:.5rem;margin-bottom:1.5rem;flex-wrap:wrap">
        <button v-for="s in ['','pending','approved','completed','cancelled']" :key="s"
          class="btn btn-sm" :class="filter===s ? 'btn-primary' : 'btn-secondary'" @click="filter=s">
          {{ s || 'All' }}
        </button>
      </div>
      <div v-if="loading" class="spinner-wrap"><div class="spinner"></div></div>
      <div v-else style="overflow-x:auto">
        <table class="data-table">
          <thead><tr><th>ID</th><th>Client</th><th>Physician</th><th>Date</th><th>Time</th><th>Status</th></tr></thead>
          <tbody>
            <tr v-for="a in filtered" :key="a.id">
              <td>{{ a.id }}</td><td>{{ a.client_name }}</td><td>{{ a.physician_name }}</td>
              <td>{{ a.date }}</td><td>{{ a.time }}</td>
              <td><span :class="'status status-' + a.status">{{ a.status }}</span></td>
            </tr>
            <tr v-if="!filtered.length">
              <td colspan="6" class="text-center" style="padding:2rem;color:var(--text-light)">No bookings found</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  `
}
