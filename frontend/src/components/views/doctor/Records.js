const DoctorRecords = {
  data() { return { notes:[], loading:true } },
  async mounted() {
    const { data } = await api.get('/physician/notes')
    this.notes = data; this.loading = false
  },
  template: `
    <div>
      <h2 class="page-title mb-4">Case Notes</h2>
      <div v-if="loading" class="spinner-wrap"><div class="spinner"></div></div>
      <div v-else style="overflow-x:auto">
        <table class="data-table">
          <thead><tr><th>ID</th><th>Date</th><th>Client</th><th>Condition</th><th>Treatment</th><th>Remarks</th></tr></thead>
          <tbody>
            <tr v-for="n in notes" :key="n.id">
              <td>{{ n.id }}</td><td>{{ n.date }}</td><td>{{ n.client_name }}</td>
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
