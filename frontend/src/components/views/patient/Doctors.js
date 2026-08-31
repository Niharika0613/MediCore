const PatientDoctors = {
  data() { return { doctors:[], search:'', loading:true } },
  async mounted() { await this.load() },
  methods: {
    async load() {
      this.loading = true
      const { data } = await api.get('/client/physicians', { params: { q: this.search } })
      this.doctors = data; this.loading = false
    }
  },
  template: `
    <div>
      <h2 class="page-title mb-2">Find Physicians</h2>
      <div class="search-bar">
        <input v-model="search" type="text" placeholder="Search by name or expertise..." @keyup.enter="load">
        <button class="btn btn-primary" @click="load">Search</button>
      </div>
      <div v-if="loading" class="spinner-wrap"><div class="spinner"></div></div>
      <div v-else>
        <p v-if="!doctors.length" class="text-center" style="padding:3rem;color:var(--text-light)">No physicians available</p>
        <div class="doctor-cards">
          <div class="doctor-card" v-for="d in doctors" :key="d.id">
            <h3>{{ d.full_name }}</h3>
            <p><strong>Expertise:</strong> {{ d.expertise }}</p>
            <p><strong>Experience:</strong> {{ d.years_exp }} years</p>
            <p><strong>Fee:</strong> &#8377;{{ d.consult_fee }}</p>
            <p><strong>Schedule:</strong> {{ d.schedule_text || 'Contact for schedule' }}</p>
            <p v-if="d.division_name"><strong>Division:</strong> {{ d.division_name }}</p>
            <router-link :to="'/patient/book/' + d.id" class="btn btn-primary">Book Visit</router-link>
          </div>
        </div>
      </div>
    </div>
  `
}
