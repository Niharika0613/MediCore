const AdminPatients = {
  data() { return { patients:[], search:'', loading:true, error:'', success:'' } },
  async mounted() { await this.load() },
  methods: {
    async load() {
      this.loading = true
      try {
        const { data } = await api.get('/manage/clients', { params: { q: this.search } })
        this.patients = data
      } catch(e) { this.error = 'Failed to load clients' }
      finally { this.loading = false }
    },
    async remove(id, name) {
      if (!confirm('Remove ' + name + '? This will also delete all their bookings and case notes. This cannot be undone.')) return
      try {
        await api.delete('/manage/clients/' + id)
        this.success = 'Client removed'
        await this.load()
      } catch(e) { this.error = 'Remove failed' }
    }
  },
  template: `
    <div>
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:1.5rem;">
        <h2 class="page-title" style="margin:0;">Manage Clients</h2>
        <router-link to="/admin/patients/add" class="btn btn-primary">+ Add Client</router-link>
      </div>
      <div v-if="error" class="alert alert-error">{{ error }}</div>
      <div v-if="success" class="alert alert-success">{{ success }}</div>
      <div class="search-bar">
        <input v-model="search" type="text" placeholder="Search by name or email..." @keyup.enter="load">
        <button class="btn btn-primary" @click="load">Search</button>
      </div>
      <div v-if="loading" class="spinner-wrap"><div class="spinner"></div></div>
      <div v-else style="overflow-x:auto">
        <table class="data-table">
          <thead><tr><th>ID</th><th>Name</th><th>Email</th><th>Phone</th><th>Gender</th><th>Blood Type</th><th>Actions</th></tr></thead>
          <tbody>
            <tr v-for="p in patients" :key="p.id">
              <td>{{ p.id }}</td><td>{{ p.full_name }}</td><td>{{ p.email }}</td>
              <td>{{ p.contact }}</td><td>{{ p.gender }}</td><td>{{ p.blood_type }}</td>
              <td style="white-space:nowrap">
                <router-link :to="'/admin/patients/view/' + p.id" class="btn btn-sm btn-secondary" style="margin-right:.4rem">View</router-link>
                <router-link :to="'/admin/patients/edit/' + p.id" class="btn btn-sm btn-secondary" style="margin-right:.4rem">Edit</router-link>
                <button class="btn btn-sm btn-danger" @click="remove(p.id, p.full_name)">Remove</button>
              </td>
            </tr>
            <tr v-if="!patients.length">
              <td colspan="7" class="text-center" style="padding:2rem;color:var(--text-light)">No clients found</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  `
}
