const DoctorPatients = {
  data() { return { clients:[], loading:true } },
  async mounted() {
    const { data } = await api.get('/physician/clients')
    this.clients = data; this.loading = false
  },
  template: `
    <div>
      <h2 class="page-title mb-4">My Clients</h2>
      <div v-if="loading" class="spinner-wrap"><div class="spinner"></div></div>
      <div v-else style="overflow-x:auto">
        <table class="data-table">
          <thead><tr><th>ID</th><th>Name</th><th>Email</th><th>Contact</th><th>Gender</th><th>Blood Type</th><th>Actions</th></tr></thead>
          <tbody>
            <tr v-for="c in clients" :key="c.id">
              <td>{{ c.id }}</td><td>{{ c.full_name }}</td><td>{{ c.email }}</td>
              <td>{{ c.contact }}</td><td>{{ c.gender }}</td><td>{{ c.blood_type }}</td>
              <td><router-link :to="'/doctor/records/add/' + c.id" class="btn btn-sm btn-primary">Add Note</router-link></td>
            </tr>
            <tr v-if="!clients.length">
              <td colspan="7" class="text-center" style="padding:2rem;color:var(--text-light)">No clients found</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  `
}
