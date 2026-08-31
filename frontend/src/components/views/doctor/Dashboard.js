const DoctorDashboard = {
  data() { return { doc:null, bookings:[], loading:true } },
  setup() { return { store } },
  async mounted() {
    const [dp, db_] = await Promise.all([api.get('/physician/profile'), api.get('/physician/bookings')])
    this.doc = dp.data; this.bookings = db_.data; this.loading = false
  },
  computed: {
    pending()   { return this.bookings.filter(b => b.status==='pending').length },
    approved()  { return this.bookings.filter(b => b.status==='approved').length },
    completed() { return this.bookings.filter(b => b.status==='completed').length },
    cancelled() { return this.bookings.filter(b => b.status==='cancelled').length },
    recent()    { return this.bookings.slice(0,5) },
    todayBookings() {
      const today = new Date().toISOString().split('T')[0]
      return this.bookings.filter(b => b.date === today && b.status !== 'cancelled')
    },
    upcomingBookings() {
      const today = new Date().toISOString().split('T')[0]
      return this.bookings.filter(b => b.date >= today && b.status !== 'cancelled' && b.status !== 'completed').sort((a,b) => a.date.localeCompare(b.date))
    },
    totalRevenue() {
      return this.bookings.filter(b => b.status === 'completed').reduce((sum, b) => sum + (this.doc?.consult_fee || 0), 0)
    },
  },
  methods: {
    async action(id, type) {
      await api.put('/physician/bookings/' + id + '/' + type)
      const idx = this.bookings.findIndex(b => b.id === id)
      if (idx > -1) this.bookings[idx].status = type === 'approve' ? 'approved' : 'completed'
    },
    fmtDate(d) {
      if (!d) return ''
      const dt = new Date(d + 'T00:00:00')
      return dt.toLocaleDateString('en-US', { weekday:'short', month:'short', day:'numeric' })
    }
  },
  template: `
    <div>
      <div v-if="loading" class="spinner-wrap"><div class="spinner"></div></div>
      <template v-else>

        <!-- Welcome Header -->
        <div style="margin-bottom:2rem">
          <h1 style="font-size:1.8rem;font-weight:800;color:var(--text-dark);margin-bottom:.5rem">Welcome back, {{ store.name }}!</h1>
          <p style="color:var(--text-light);font-size:.95rem">Here's your practice overview for today</p>
        </div>

        <!-- Profile Card -->
        <div style="background:linear-gradient(135deg, #667eea 0%, #764ba2 100%);color:#fff;border-radius:12px;padding:2rem;margin-bottom:2rem;box-shadow:0 4px 20px rgba(102,126,234,0.3)">
          <div style="display:flex;align-items:center;gap:1.5rem;margin-bottom:1.5rem">
            <div style="width:70px;height:70px;border-radius:50%;background:rgba(255,255,255,0.2);backdrop-filter:blur(10px);display:flex;align-items:center;justify-content:center;font-size:2rem;flex-shrink:0;border:3px solid rgba(255,255,255,0.3)">🩺</div>
            <div style="flex:1">
              <div style="font-size:1.4rem;font-weight:800;margin-bottom:.3rem">{{ store.name }}</div>
              <div style="opacity:.9;font-size:1rem">{{ doc?.expertise || 'Specialist' }}</div>
              <div style="opacity:.8;font-size:.85rem;margin-top:.3rem">{{ doc?.years_exp || 0 }} years experience · ₹{{ doc?.consult_fee || 0 }} consultation fee</div>
            </div>
          </div>
          <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(120px,1fr));gap:1rem;padding-top:1rem;border-top:1px solid rgba(255,255,255,0.2)">
            <div style="text-align:center">
              <div style="font-size:1.8rem;font-weight:800">{{ bookings.length }}</div>
              <div style="font-size:.8rem;opacity:.85;margin-top:.2rem">Total Bookings</div>
            </div>
            <div style="text-align:center">
              <div style="font-size:1.8rem;font-weight:800">{{ todayBookings.length }}</div>
              <div style="font-size:.8rem;opacity:.85;margin-top:.2rem">Today's Patients</div>
            </div>
            <div style="text-align:center">
              <div style="font-size:1.8rem;font-weight:800">₹{{ totalRevenue.toLocaleString() }}</div>
              <div style="font-size:.8rem;opacity:.85;margin-top:.2rem">Total Revenue</div>
            </div>
          </div>
        </div>

        <!-- Quick Stats Grid -->
        <div class="metric-row" style="margin-bottom:2rem">
          <div class="metric-card" style="border-left:4px solid #F59E0B">
            <div class="metric-icon orange">⏳</div>
            <div class="metric-body">
              <div class="metric-num">{{ pending }}</div>
              <div class="metric-label">Pending Approvals</div>
            </div>
          </div>
          <div class="metric-card" style="border-left:4px solid #10B981">
            <div class="metric-icon green">✅</div>
            <div class="metric-body">
              <div class="metric-num">{{ approved }}</div>
              <div class="metric-label">Confirmed Appointments</div>
            </div>
          </div>
          <div class="metric-card" style="border-left:4px solid #3B82F6">
            <div class="metric-icon sky">🏁</div>
            <div class="metric-body">
              <div class="metric-num">{{ completed }}</div>
              <div class="metric-label">Completed Visits</div>
            </div>
          </div>
          <div class="metric-card" style="border-left:4px solid #EF4444">
            <div class="metric-icon" style="background:#FEE2E2;color:#EF4444">❌</div>
            <div class="metric-body">
              <div class="metric-num">{{ cancelled }}</div>
              <div class="metric-label">Cancelled</div>
            </div>
          </div>
        </div>

        <!-- Today's Schedule -->
        <div v-if="todayBookings.length > 0" style="background:#FEF3C7;border:1px solid #FCD34D;border-radius:12px;padding:1.5rem;margin-bottom:2rem">
          <div style="display:flex;align-items:center;gap:.75rem;margin-bottom:1rem">
            <span style="font-size:1.5rem">📅</span>
            <div>
              <div style="font-size:1.1rem;font-weight:800;color:#92400E">Today's Schedule</div>
              <div style="font-size:.85rem;color:#B45309">{{ todayBookings.length }} patient(s) scheduled for today</div>
            </div>
          </div>
          <div style="display:flex;flex-direction:column;gap:.75rem">
            <div v-for="b in todayBookings" :key="b.id" style="background:#fff;padding:1rem;border-radius:8px;display:flex;align-items:center;gap:1rem;box-shadow:0 1px 3px rgba(0,0,0,0.1)">
              <div style="font-size:1.5rem">👤</div>
              <div style="flex:1">
                <div style="font-weight:700;color:var(--text-dark)">{{ b.client_name }}</div>
                <div style="font-size:.85rem;color:var(--text-light);margin-top:.2rem">{{ b.time }} · {{ b.reason || 'General consultation' }}</div>
              </div>
              <span :class="'status status-' + b.status">{{ b.status }}</span>
            </div>
          </div>
        </div>

        <!-- Upcoming Appointments -->
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:1rem">
          <div>
            <span style="font-size:1.2rem;font-weight:800;color:var(--text-dark)">Upcoming Appointments</span>
            <p style="font-size:.85rem;color:var(--text-light);margin-top:.2rem">Next {{ upcomingBookings.length }} scheduled visits</p>
          </div>
          <router-link to="/doctor/appointments" class="btn btn-primary" style="font-size:.9rem">View All →</router-link>
        </div>
        <div class="appt-cards">
          <div v-for="b in upcomingBookings.slice(0,5)" :key="b.id" class="appt-card" style="border:1px solid var(--border);box-shadow:0 2px 8px rgba(0,0,0,0.05)">
            <div class="appt-date-badge" style="background:linear-gradient(135deg,var(--primary),var(--accent))">
              <div class="adb-day">{{ b.date.slice(8) }}</div>
              <div class="adb-mon">{{ new Date(b.date+'T00:00:00').toLocaleString('en',{month:'short'}) }}</div>
            </div>
            <div class="appt-info" style="flex:1">
              <div class="ai-name" style="font-size:1rem;font-weight:700">{{ b.client_name }}</div>
              <div class="ai-meta" style="margin-top:.3rem">🕐 {{ b.time }} &nbsp;·&nbsp; {{ b.reason || 'General consultation' }}</div>
            </div>
            <div style="display:flex;gap:.5rem;flex-shrink:0;align-items:center">
              <span :class="'status status-' + b.status">{{ b.status }}</span>
              <button v-if="b.status==='pending'"  class="btn btn-sm btn-success" @click="action(b.id,'approve')" style="white-space:nowrap">✓ Approve</button>
              <button v-if="b.status==='approved'" class="btn btn-sm btn-primary" @click="action(b.id,'complete')" style="white-space:nowrap">✓ Complete</button>
            </div>
          </div>
          <div v-if="!upcomingBookings.length" style="text-align:center;padding:3rem;color:var(--text-light);background:#F9FAFB;border-radius:12px;border:2px dashed var(--border)">
            <div style="font-size:3rem;margin-bottom:1rem">📭</div>
            <div style="font-size:1.1rem;font-weight:700;margin-bottom:.5rem">No Upcoming Appointments</div>
            <div style="font-size:.9rem">You're all caught up! New bookings will appear here.</div>
          </div>
        </div>

      </template>
    </div>
  `
}
