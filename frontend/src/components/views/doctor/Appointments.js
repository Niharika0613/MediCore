const DoctorAppointments = {
  data() { return { bookings:[], loading:true, error:'', success:'' } },
  async mounted() { await this.load() },
  methods: {
    async load() {
      this.loading = true
      const { data } = await api.get('/physician/bookings')
      this.bookings = data; this.loading = false
    },
    async action(id, type) {
      try {
        await api.put('/physician/bookings/' + id + '/' + type)
        this.success = 'Booking ' + type + 'd'
        await this.load()
      } catch(e) { this.error = 'Action failed' }
    }
  },
  template: `
    <div>
      <h2 class="page-title mb-4">My Bookings</h2>
      <div v-if="error"   class="alert alert-error">{{ error }}</div>
      <div v-if="success" class="alert alert-success">{{ success }}</div>
      <div v-if="loading" class="spinner-wrap"><div class="spinner"></div></div>
      <div v-else style="overflow-x:auto">
        <table class="data-table">
          <thead><tr><th>ID</th><th>Client</th><th>Date</th><th>Time</th><th>Reason</th><th>Status</th><th>Actions</th></tr></thead>
          <tbody>
            <tr v-for="b in bookings" :key="b.id">
              <td>{{ b.id }}</td><td>{{ b.client_name }}</td><td>{{ b.date }}</td><td>{{ b.time }}</td>
              <td style="max-width:150px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">{{ b.reason||'—' }}</td>
              <td><span :class="'status status-' + b.status">{{ b.status }}</span></td>
              <td style="white-space:nowrap">
                <template v-if="b.status==='pending'">
                  <button class="btn btn-sm btn-success" @click="action(b.id,'approve')" style="margin-right:.3rem">Approve</button>
                  <button class="btn btn-sm btn-danger"  @click="action(b.id,'cancel')">Cancel</button>
                </template>
                <template v-else-if="b.status==='approved'">
                  <button class="btn btn-sm btn-primary" @click="action(b.id,'complete')" style="margin-right:.3rem">Complete</button>
                  <router-link :to="'/doctor/records/add/' + b.client_id" class="btn btn-sm btn-secondary">Add Note</router-link>
                </template>
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
