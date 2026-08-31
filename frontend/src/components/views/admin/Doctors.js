const AdminDoctors = {
  data() { return { doctors:[], search:'', loading:true, error:'', success:'' } },
  async mounted() { await this.load() },
  methods: {
    async load() {
      this.loading = true
      try {
        const { data } = await api.get('/manage/physicians', { params: { q: this.search } })
        this.doctors = data
      } catch(e) { this.error = 'Failed to load physicians' }
      finally { this.loading = false }
    },
    async remove(id, name) {
      if (!confirm('Remove ' + name + '? This cannot be undone.')) return
      try {
        await api.delete('/manage/physicians/' + id)
        this.success = 'Physician removed'; await this.load()
      } catch(e) { this.error = 'Remove failed' }
    }
  },
  template: `
    <div>
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:1.5rem;">
        <h2 class="page-title" style="margin:0;">Manage Physicians</h2>
        <router-link to="/admin/doctors/add" class="btn btn-primary">+ Add Physician</router-link>
      </div>
      <div v-if="error"   class="alert alert-error">{{ error }}</div>
      <div v-if="success" class="alert alert-success">{{ success }}</div>
      <div class="search-bar">
        <input v-model="search" type="text" placeholder="Search by name or expertise..." @keyup.enter="load">
        <button class="btn btn-primary" @click="load">Search</button>
      </div>
      <div v-if="loading" class="spinner-wrap"><div class="spinner"></div></div>
      <div v-else style="overflow-x:auto">
        <table class="data-table">
          <thead><tr><th>ID</th><th>Name</th><th>Email</th><th>Expertise</th><th>Exp.</th><th>Fee</th><th>Actions</th></tr></thead>
          <tbody>
            <tr v-for="d in doctors" :key="d.id">
              <td>{{ d.id }}</td><td>{{ d.full_name }}</td><td>{{ d.email }}</td>
              <td>{{ d.expertise }}</td><td>{{ d.years_exp }} yrs</td><td>&#8377;{{ d.consult_fee }}</td>
              <td style="white-space:nowrap">
                <router-link :to="'/admin/doctors/view/' + d.id" class="btn btn-sm btn-secondary" style="margin-right:.4rem">View</router-link>
                <router-link :to="'/admin/doctors/edit/' + d.id" class="btn btn-sm btn-secondary" style="margin-right:.4rem">Edit</router-link>
                <button class="btn btn-sm btn-danger" @click="remove(d.id, d.full_name)">Remove</button>
              </td>
            </tr>
            <tr v-if="!doctors.length">
              <td colspan="7" class="text-center" style="padding:2rem;color:var(--text-light)">No physicians found</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  `
}
