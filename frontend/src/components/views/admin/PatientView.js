const AdminPatientView = {
  props: ['id'],
  data() { return { patient:null, loading:true } },
  async mounted() {
    const { data } = await api.get('/manage/clients/' + this.id)
    this.patient = data; this.loading = false
  },
  template: `
    <div>
      <div class="section-header mb-4">
        <h2 class="page-title">Client Details</h2>
        <router-link to="/admin/patients" class="btn btn-secondary">← Back</router-link>
      </div>
      <div v-if="loading" class="spinner-wrap"><div class="spinner"></div></div>
      <template v-else-if="patient">
        <div class="details-card">
          <div class="detail-row"><span class="label">Full Name</span><span class="value">{{ patient.full_name }}</span></div>
          <div class="detail-row"><span class="label">Email</span><span class="value">{{ patient.email }}</span></div>
          <div class="detail-row"><span class="label">Contact</span><span class="value">{{ patient.contact }}</span></div>
          <div class="detail-row"><span class="label">Date of Birth</span><span class="value">{{ patient.birth_date || '—' }}</span></div>
          <div class="detail-row"><span class="label">Gender</span><span class="value">{{ patient.gender || '—' }}</span></div>
          <div class="detail-row"><span class="label">Blood Type</span><span class="value">{{ patient.blood_type || '—' }}</span></div>
          <div class="detail-row"><span class="label">Location</span><span class="value">{{ patient.location || '—' }}</span></div>
        </div>
        <h3 class="mb-2">Bookings</h3>
        <div style="overflow-x:auto">
          <table class="data-table">
            <thead><tr><th>Date</th><th>Time</th><th>Physician</th><th>Status</th></tr></thead>
            <tbody>
              <tr v-for="b in patient.bookings" :key="b.id">
                <td>{{ b.date }}</td><td>{{ b.time }}</td><td>{{ b.physician_name }}</td>
                <td><span :class="'status status-' + b.status">{{ b.status }}</span></td>
              </tr>
              <tr v-if="!patient.bookings.length">
                <td colspan="4" class="text-center" style="padding:1.5rem;color:var(--text-light)">No bookings</td>
              </tr>
            </tbody>
          </table>
        </div>
        <h3 class="mb-2 mt-4">Case Notes</h3>
        <div style="overflow-x:auto">
          <table class="data-table">
            <thead><tr><th>Date</th><th>Physician</th><th>Condition</th><th>Treatment</th></tr></thead>
            <tbody>
              <tr v-for="n in patient.case_notes" :key="n.id">
                <td>{{ n.date }}</td><td>{{ n.physician_name }}</td><td>{{ n.condition }}</td><td>{{ n.treatment }}</td>
              </tr>
              <tr v-if="!patient.case_notes.length">
                <td colspan="4" class="text-center" style="padding:1.5rem;color:var(--text-light)">No case notes</td>
              </tr>
            </tbody>
          </table>
        </div>
      </template>
    </div>
  `
}
