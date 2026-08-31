const PatientRecords = {
  data() { return { notes:[], loading:true, exporting:false, exportMsg:'', exportUrl:'' } },
  async mounted() {
    const { data } = await api.get('/client/notes')
    this.notes = data; this.loading = false
  },
  methods: {
    async exportCsv() {
      this.exporting = true; this.exportMsg = 'Generating export...'
      try {
        const { data } = await api.post('/client/download-csv')
        const taskId = data.task_id
        let tries = 0
        const poll = setInterval(async () => {
          tries++
          try {
            const { data: res } = await api.get('/client/task/' + taskId)
            if (res.status === 'done') {
              clearInterval(poll)
              this.exportUrl = res.result.download_url
              this.exportMsg = 'Export ready (' + res.result.records + ' records)'
              this.exporting = false
            } else if (res.status === 'failed' || tries > 15) {
              clearInterval(poll)
              this.exportMsg = 'Export failed. Is Celery running?'
              this.exporting = false
            }
          } catch(e) { clearInterval(poll); this.exportMsg = 'Export failed'; this.exporting = false }
        }, 2000)
      } catch(e) { this.exportMsg = 'Export failed'; this.exporting = false }
    }
  },
  template: `
    <div>
      <div class="section-header mb-4">
        <h2 class="page-title">My Case Notes</h2>
        <div style="display:flex;align-items:center;gap:.75rem">
          <button class="btn btn-secondary" @click="exportCsv" :disabled="exporting">
            {{ exporting ? 'Exporting...' : 'Export CSV' }}
          </button>
          <a v-if="exportUrl" :href="exportUrl" class="btn btn-success btn-sm">Download</a>
        </div>
      </div>
      <div v-if="exportMsg" class="alert alert-info">{{ exportMsg }}</div>
      <div v-if="loading" class="spinner-wrap"><div class="spinner"></div></div>
      <div v-else style="overflow-x:auto">
        <table class="data-table">
          <thead><tr><th>ID</th><th>Date</th><th>Physician</th><th>Condition</th><th>Treatment</th><th>Remarks</th></tr></thead>
          <tbody>
            <tr v-for="n in notes" :key="n.id">
              <td>{{ n.id }}</td><td>{{ n.date }}</td><td>{{ n.physician_name }}</td>
              <td>{{ n.condition }}</td><td>{{ n.treatment }}</td><td>{{ n.remarks }}</td>
            </tr>
            <tr v-if="!notes.length">
              <td colspan="6" class="text-center" style="padding:2rem;color:var(--text-light)">No case notes found</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  `
}
