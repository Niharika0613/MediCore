const AdminPhysicianView = {
  props: ['id'],
  data() { return { physician: null, loading: true, error: '' } },
  async mounted() {
    try {
      const { data } = await api.get('/manage/physicians')
      this.physician = data.find(d => d.id == this.id)
      if (!this.physician) this.error = 'Physician not found'
    } catch(e) {
      this.error = 'Failed to load physician details'
    } finally {
      this.loading = false
    }
  },
  template: `
    <div>
      <div style="margin-bottom:1.5rem;">
        <router-link to="/admin/doctors" style="color:var(--primary);font-weight:600;font-size:.9rem;">← Back to Physicians</router-link>
      </div>

      <div v-if="loading" class="spinner-wrap"><div class="spinner"></div></div>
      <div v-else-if="error" class="alert alert-error">{{ error }}</div>
      
      <template v-else-if="physician">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:2rem;">
          <div>
            <h2 class="page-title" style="margin-bottom:.3rem;">{{ physician.full_name }}</h2>
            <p style="color:var(--primary);font-weight:700;font-size:1.05rem;margin:0;">{{ physician.expertise }}</p>
          </div>
          <router-link :to="'/admin/doctors/edit/' + physician.id" class="btn btn-primary">Edit Profile</router-link>
        </div>

        <div class="details-card">
          <h3 style="font-size:1.1rem;font-weight:800;margin-bottom:1.2rem;color:var(--text);">Personal Information</h3>
          <div class="detail-row">
            <span class="label">Physician ID</span>
            <span class="value">{{ physician.id }}</span>
          </div>
          <div class="detail-row">
            <span class="label">Full Name</span>
            <span class="value">{{ physician.full_name }}</span>
          </div>
          <div class="detail-row">
            <span class="label">Email Address</span>
            <span class="value">{{ physician.email }}</span>
          </div>
          <div class="detail-row">
            <span class="label">Contact Number</span>
            <span class="value">{{ physician.contact || 'Not provided' }}</span>
          </div>
        </div>

        <div class="details-card">
          <h3 style="font-size:1.1rem;font-weight:800;margin-bottom:1.2rem;color:var(--text);">Professional Details</h3>
          <div class="detail-row">
            <span class="label">Expertise</span>
            <span class="value">{{ physician.expertise }}</span>
          </div>
          <div class="detail-row">
            <span class="label">Years of Experience</span>
            <span class="value">{{ physician.years_exp }} years</span>
          </div>
          <div class="detail-row">
            <span class="label">Consultation Fee</span>
            <span class="value">₹{{ physician.consult_fee }}</span>
          </div>
          <div class="detail-row">
            <span class="label">Division</span>
            <span class="value">{{ physician.division_name || 'Not assigned' }}</span>
          </div>
          <div class="detail-row">
            <span class="label">Schedule</span>
            <span class="value">{{ physician.schedule_text || 'Not specified' }}</span>
          </div>
        </div>

        <div class="details-card" v-if="physician.about">
          <h3 style="font-size:1.1rem;font-weight:800;margin-bottom:1.2rem;color:var(--text);">About</h3>
          <p style="color:var(--text-light);line-height:1.75;margin:0;">{{ physician.about }}</p>
        </div>

        <div style="display:flex;gap:1rem;margin-top:2rem;">
          <router-link :to="'/admin/doctors/edit/' + physician.id" class="btn btn-primary">Edit Profile</router-link>
          <router-link to="/admin/doctors" class="btn btn-secondary">Back to List</router-link>
        </div>
      </template>
    </div>
  `
}
