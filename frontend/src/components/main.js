const { createApp, defineComponent } = Vue
const { createRouter, createWebHashHistory } = VueRouter

const Layout = { template: `<div class="page-container"><router-view /></div>` }

const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    { path: '/',         component: HomeView },
    { path: '/login',    component: LoginView },
    { path: '/register', component: RegisterView },

    { path: '/admin', component: Layout, meta: { role: 'admin' }, children: [
      { path: '',                       component: AdminDashboard },
      { path: 'doctors',                component: AdminDoctors },
      { path: 'doctors/add',            component: AdminDoctorForm },
      { path: 'doctors/view/:id',       component: AdminPhysicianView, props: true },
      { path: 'doctors/edit/:id',       component: AdminDoctorForm, props: true },
      { path: 'patients',               component: AdminPatients },
      { path: 'patients/add',           component: AdminPatientForm },
      { path: 'patients/view/:id',      component: AdminPatientView, props: true },
      { path: 'patients/edit/:id',      component: AdminPatientForm, props: true },
      { path: 'appointments',           component: AdminAppointments },
    ]},

    { path: '/doctor', component: Layout, meta: { role: 'doctor' }, children: [
      { path: '',                       component: DoctorDashboard },
      { path: 'appointments',           component: DoctorAppointments },
      { path: 'patients',               component: DoctorPatients },
      { path: 'records',                component: DoctorRecords },
      { path: 'records/add/:pid',       component: DoctorRecordForm, props: true },
      { path: 'profile',                component: DoctorProfile },
    ]},

    { path: '/patient', component: Layout, meta: { role: 'patient' }, children: [
      { path: '',               component: PatientDashboard },
      { path: 'doctors',        component: PatientDoctors },
      { path: 'appointments',   component: PatientAppointments },
      { path: 'records',        component: PatientRecords },
      { path: 'profile',        component: PatientProfile },
      { path: 'payments',       component: PatientPayment },
    ]},
    { path: '/patient/book/:did', component: PatientAptForm, props: true, meta: { role: 'patient' } },

    { path: '/:pathMatch(.*)*', redirect: '/' },
  ],
})

router.beforeEach((to, from, next) => {
  const role = to.meta.role
  if (role) {
    if (!store.isLoggedIn)   return next('/login')
    if (store.role !== role) {
      const dest = store.role === 'admin' ? '/admin' : store.role === 'doctor' ? '/doctor' : '/patient'
      return next(dest)
    }
  }
  next()
})

const App = defineComponent({
  setup() {
    const deferredPrompt = Vue.ref(null)
    const showInstall = Vue.ref(false)

    window.addEventListener('beforeinstallprompt', event => {
      event.preventDefault()
      deferredPrompt.value = event
      showInstall.value = true
    })

    const installApp = async () => {
      if (!deferredPrompt.value) return
      deferredPrompt.value.prompt()
      const choice = await deferredPrompt.value.userChoice
      if (choice.outcome === 'accepted') {
        showInstall.value = false
        deferredPrompt.value = null
      }
    }

    return { store, showInstall, installApp }
  },
  methods: {
    logout() { store.clearAuth(); this.$router.push('/') }
  },
  template: `
    <div>
      <nav class="navbar">
        <div class="nav-brand">
          <router-link to="/">Medi<span>Core</span></router-link>
        </div>
        <div class="nav-links">

          <template v-if="!store.isLoggedIn">
            <router-link to="/login"    class="btn btn-primary">Sign In</router-link>
            <router-link to="/register" class="btn btn-outline">Register</router-link>
          </template>

          <template v-else-if="store.role === 'admin'">
            <router-link to="/admin">Overview</router-link>
            <router-link to="/admin/doctors">Physicians</router-link>
            <router-link to="/admin/patients">Clients</router-link>
            <router-link to="/admin/appointments">Bookings</router-link>
            <span class="nav-user">{{ store.name }}</span>
            <button @click="logout" class="btn btn-logout">Logout</button>
          </template>

          <template v-else-if="store.role === 'doctor'">
            <router-link to="/doctor">Overview</router-link>
            <router-link to="/doctor/appointments">Bookings</router-link>
            <router-link to="/doctor/patients">Clients</router-link>
            <router-link to="/doctor/records">Case Notes</router-link>
            <router-link to="/doctor/profile">Profile</router-link>
            <span class="nav-user">{{ store.name }}</span>
            <button @click="logout" class="btn btn-logout">Logout</button>
          </template>

          <template v-else-if="store.role === 'patient'">
            <router-link to="/patient">Overview</router-link>
            <router-link to="/patient/doctors">Find Physicians</router-link>
            <router-link to="/patient/appointments">Bookings</router-link>
            <router-link to="/patient/records">Case Notes</router-link>
            <router-link to="/patient/payments">Payments</router-link>
            <router-link to="/patient/profile">Profile</router-link>
            <span class="nav-user">{{ store.name }}</span>
            <button @click="logout" class="btn btn-logout">Logout</button>
          </template>

        </div>
        <div v-if="showInstall" style="margin-left:1rem">
          <button @click="installApp" class="btn btn-success">Add to desktop</button>
        </div>
      </nav>

      <router-view />

      <footer v-if="store.isLoggedIn && $route.path !== '/'">
        <p>&copy; 2026 MediCore. All rights reserved.</p>
      </footer>
    </div>
  `
})

const app = createApp(App)
app.use(router)
app.mount('#app')
