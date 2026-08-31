const PatientDashboard = {
  setup() { return { store } },
  data() { return { bookings:[], notes:[], loading:true } },
  async mounted() {
    const [db_, dn] = await Promise.all([api.get('/client/bookings'), api.get('/client/notes')])
    this.bookings = db_.data; this.notes = dn.data; this.loading = false
  },
  computed: {
    pending()  { return this.bookings.filter(b => b.status==='pending').length },
    approved() { return this.bookings.filter(b => b.status==='approved').length },
    upcoming() {
      return this.bookings
        .filter(b => b.status === 'pending' || b.status === 'approved')
        .slice(0, 4)
    },
  },
  template: `
    <div>
      <div v-if="loading" class="spinner-wrap"><div class="spinner"></div></div>
      <template v-else>

        <!-- Greeting banner -->
        <div style="background:linear-gradient(120deg,var(--primary) 0%,var(--accent) 100%);color:#fff;border-radius:var(--radius);padding:1.75rem 2rem;margin-bottom:1.75rem;display:flex;justify-content:space-between;align-items:center">
          <div>
            <div style="font-size:1.5rem;font-weight:800">Hello, {{ store.name }}</div>
            <div style="opacity:.8;margin-top:.3rem;font-size:.9rem">Here is your health summary for today.</div>
          </div>
          <router-link to="/patient/doctors" class="btn" style="background:#fff;color:var(--primary);font-weight:800;flex-shrink:0">+ Book Visit</router-link>
        </div>

        <!-- Metric tiles -->
        <div class="metric-row">
          <div class="metric-card">
            <div class="metric-icon orange">⏳</div>
            <div class="metric-body">
              <div class="metric-num">{{ pending }}</div>
              <div class="metric-label">Pending Bookings</div>
            </div>
          </div>
          <div class="metric-card">
            <div class="metric-icon green">✅</div>
            <div class="metric-body">
              <div class="metric-num">{{ approved }}</div>
              <div class="metric-label">Confirmed Visits</div>
            </div>
          </div>
          <div class="metric-card">
            <div class="metric-icon sky">📋</div>
            <div class="metric-body">
              <div class="metric-num">{{ notes.length }}</div>
              <div class="metric-label">Case Notes</div>
              <router-link to="/patient/records" class="metric-link">View →</router-link>
            </div>
          </div>
        </div>

        <!-- Upcoming as appointment cards -->
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:1rem">
          <span style="font-size:1rem;font-weight:800">Upcoming Visits</span>
          <router-link to="/patient/appointments" style="font-size:.82rem;color:var(--primary);font-weight:700">View all →</router-link>
        </div>
        <div class="appt-cards">
          <div v-for="b in upcoming" :key="b.id" class="appt-card">
            <div class="appt-date-badge">
              <div class="adb-day">{{ b.date.slice(8) }}</div>
              <div class="adb-mon">{{ new Date(b.date+'T00:00:00').toLocaleString('en',{month:'short'}) }}</div>
            </div>
            <div class="appt-info">
              <div class="ai-name">{{ b.physician_name }}</div>
              <div class="ai-meta">{{ b.physician_expertise }} &nbsp;·&nbsp; {{ b.time }}</div>
            </div>
            <span :class="'status status-' + b.status">{{ b.status }}</span>
          </div>
          <div v-if="!upcoming.length" style="text-align:center;padding:2rem;color:var(--text-light);background:#fff;border-radius:var(--radius);border:1px solid var(--border)">
            No upcoming visits — <router-link to="/patient/doctors" style="color:var(--primary);font-weight:700">find a physician</router-link>
          </div>
        </div>

      </template>
    </div>
  `
}
