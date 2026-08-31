const AdminDashboard = {
  data() {
    return {
      stats: null,
      monthly: null,
      loading: true,
      chartInstance: null,
      reportFormat: 'html',
      selectedMonth: new Date().getMonth() + 1,
      selectedYear: new Date().getFullYear(),
    }
  },
  async mounted() {
    try {
      const [{ data: stats }, { data: monthly }] = await Promise.all([
        api.get('/manage/overview'),
        api.get('/manage/reports/monthly', { params: { month: this.selectedMonth, year: this.selectedYear } })
      ])
      this.stats = stats
      this.monthly = monthly
      await this.$nextTick()
      setTimeout(() => this.renderChart(), 300)
    } catch(e) { console.error(e) }
    finally { this.loading = false }
  },
  beforeUnmount() { if (this.chartInstance) this.chartInstance.destroy() },
  computed: {
    total() { return this.stats ? (this.stats.pending + this.stats.approved + this.stats.completed + this.stats.cancelled) || 1 : 1 },
    pct()   { return k => Math.round((this.stats[k] / this.total) * 100) }
  },
  methods: {
    renderChart() {
      const el = this.$refs.chart
      console.log('Chart element:', el)
      console.log('Monthly data:', this.monthly)
      
      if (!el) {
        console.error('Canvas element not found')
        return
      }
      if (!this.monthly || !this.monthly.status_counts) {
        console.error('Monthly data not available')
        return
      }
      
      if (this.chartInstance) {
        this.chartInstance.destroy()
      }
      
      try {
        const statusCounts = this.monthly.status_counts
        this.chartInstance = new Chart(el.getContext('2d'), {
          type: 'pie',
          data: {
            labels: ['Pending','Approved','Completed','Cancelled'],
            datasets: [{
              data: [statusCounts.pending || 0, statusCounts.approved || 0, statusCounts.completed || 0, statusCounts.cancelled || 0],
              backgroundColor: ['#FED7AA','#BBF7D0','#BFDBFE','#FECACA'],
              borderColor: ['#F97316','#16A34A','#3B82F6','#DC2626'],
              borderWidth: 2,
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: {
                display: true,
                position: 'bottom',
                labels: {
                  padding: 15,
                  font: { size: 12, weight: '600' }
                }
              },
              tooltip: {
                callbacks: {
                  label: (context) => {
                    const label = context.label || ''
                    const value = context.parsed || 0
                    const total = context.dataset.data.reduce((a, b) => a + b, 0)
                    const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : 0
                    return `${label}: ${value} (${percentage}%)`
                  }
                }
              }
            }
          }
        })
        console.log('Chart created successfully with monthly data')
      } catch(e) {
        console.error('Chart creation error:', e)
      }
    },
    async loadMonthlyReport() {
      this.loading = true
      try {
        const { data } = await api.get('/manage/reports/monthly', { params: { month: this.selectedMonth, year: this.selectedYear } })
        this.monthly = data
        await this.$nextTick()
        setTimeout(() => this.renderChart(), 100)
      } catch(e) { console.error(e) }
      finally { this.loading = false }
    },
    downloadHtmlReport() {
      if (!this.monthly) return
      const html = `<!DOCTYPE html><html><head><title>MediCore Monthly Report</title></head><body><h1>MediCore Monthly Report - ${this.monthly.month}/${this.monthly.year}</h1><ul><li>Total Bookings: ${this.monthly.total_bookings}</li><li>Pending: ${this.monthly.status_counts.pending}</li><li>Approved: ${this.monthly.status_counts.approved}</li><li>Completed: ${this.monthly.status_counts.completed}</li><li>Cancelled: ${this.monthly.status_counts.cancelled}</li><li>Revenue: ₹${this.monthly.revenue.toFixed(2)}</li></ul></body></html>`
      const blob = new Blob([html], { type: 'text/html' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `medicore-monthly-report-${this.monthly.year}-${this.monthly.month}.html`
      a.click()
      URL.revokeObjectURL(url)
    },
    downloadPdfReport() {
      if (!this.monthly || !window.jspdf) return
      const doc = new jspdf.jsPDF({ orientation: 'portrait', unit: 'pt', format: 'a4' })
      doc.setFontSize(16)
      doc.text(`MediCore Monthly Report - ${this.monthly.month}/${this.monthly.year}`, 40, 40)
      doc.setFontSize(12)
      const details = [
        [`Total Bookings`, this.monthly.total_bookings],
        [`Pending`, this.monthly.status_counts.pending],
        [`Approved`, this.monthly.status_counts.approved],
        [`Completed`, this.monthly.status_counts.completed],
        [`Cancelled`, this.monthly.status_counts.cancelled],
        [`Revenue (INR)`, `₹${this.monthly.revenue.toFixed(2)}`],
      ]
      let y = 70
      details.forEach(([label, value]) => {
        doc.text(`${label}: ${value}`, 40, y)
        y += 18
      })

      if (this.$refs.chart && this.chartInstance) {
        const chartDataUrl = this.$refs.chart.toDataURL('image/png', 1.0)
        doc.addImage(chartDataUrl, 'PNG', 40, y + 10, 500, 240)
      }
      doc.save(`medicore-monthly-report-${this.monthly.year}-${this.monthly.month}.pdf`)
    }
  },
  template: `
    <div>
      <div style="margin-bottom:1.75rem">
        <h2 class="page-title" style="margin-bottom:.2rem">Control Panel</h2>
        <p style="color:var(--text-light);font-size:.9rem;margin:0;font-weight:600">Real-time overview of clinic operations</p>
      </div>

      <div v-if="loading" class="spinner-wrap"><div class="spinner"></div></div>
      <template v-else-if="stats">

        <!-- Metric cards -->
        <div class="metric-row">
          <div class="metric-card">
            <div class="metric-icon rose">🩺</div>
            <div class="metric-body">
              <div class="metric-num">{{ stats.physicians }}</div>
              <div class="metric-label">Physicians</div>
              <router-link to="/admin/doctors" class="metric-link">Manage →</router-link>
            </div>
          </div>
          <div class="metric-card">
            <div class="metric-icon orange">👤</div>
            <div class="metric-body">
              <div class="metric-num">{{ stats.clients }}</div>
              <div class="metric-label">Clients</div>
              <router-link to="/admin/patients" class="metric-link">Manage →</router-link>
            </div>
          </div>
          <div class="metric-card">
            <div class="metric-icon sky">📅</div>
            <div class="metric-body">
              <div class="metric-num">{{ stats.bookings }}</div>
              <div class="metric-label">Total Bookings</div>
              <router-link to="/admin/appointments" class="metric-link">View All →</router-link>
            </div>
          </div>
          <div class="metric-card">
            <div class="metric-icon green">🏥</div>
            <div class="metric-body">
              <div class="metric-num">{{ stats.divisions }}</div>
              <div class="metric-label">Divisions</div>
            </div>
          </div>
        </div>

        <!-- Monthly report controls -->
        <div class="dash-box" style="margin-bottom:1.5rem;padding:1rem;background:var(--surface);border:1px solid var(--border);border-radius:var(--radius);">
          <div class="dash-box-title">Monthly Activity Report</div>
          <div style="display:flex;gap:0.75rem;flex-wrap:wrap;align-items:center;margin-top:0.75rem;">
            <label>Month <input type="number" min="1" max="12" v-model.number="selectedMonth" @change="loadMonthlyReport" style="width:70px"></label>
            <label>Year <input type="number" min="2023" v-model.number="selectedYear" @change="loadMonthlyReport" style="width:90px"></label>
            <button @click="downloadHtmlReport" class="btn btn-secondary" style="padding:.4rem .8rem">Download HTML</button>
            <button @click="downloadPdfReport" class="btn btn-secondary" style="padding:.4rem .8rem">Export PDF</button>
          </div>
          <div v-if="monthly" style="margin-top:0.75rem;font-size:.9rem;color:var(--text-light);">
            <strong style="color:var(--text);">Total Bookings:</strong> {{ monthly.total_bookings }} | 
            <strong style="color:var(--text);">Completed:</strong> {{ monthly.status_counts.completed }} | 
            <strong style="color:var(--text);">Pending:</strong> {{ monthly.status_counts.pending }} | 
            <strong style="color:var(--text);">Revenue:</strong> ₹{{ monthly.revenue.toFixed(2) }}
          </div>
        </div>

        <!-- Chart -->
        <div class="dash-box">
          <div class="dash-box-title">Booking Status Distribution ({{ selectedMonth }}/{{ selectedYear }})</div>
          <div style="position:relative;height:350px;padding:20px;">
            <canvas ref="chart"></canvas>
          </div>
          <div style="border-top:1px solid var(--border);margin-top:1.5rem;padding-top:1.25rem;display:flex;flex-direction:column;gap:.6rem">
            <router-link to="/admin/doctors"      class="btn btn-secondary" style="text-align:center;font-size:.85rem">Manage Physicians</router-link>
            <router-link to="/admin/patients"     class="btn btn-secondary" style="text-align:center;font-size:.85rem">Manage Clients</router-link>
            <router-link to="/admin/appointments" class="btn btn-secondary" style="text-align:center;font-size:.85rem">All Bookings</router-link>
          </div>
        </div>

      </template>
    </div>
  `
}
