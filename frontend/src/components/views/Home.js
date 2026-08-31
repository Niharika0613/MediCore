const HomeView = {
  setup() { return { store } },
  computed: {
    dashboardRoute() {
      const r = store.role
      return r === 'admin' ? '/admin' : r === 'doctor' ? '/doctor' : '/patient'
    }
  },
  template: `
    <div>

      <!-- Hero -->
      <div class="hero-wrap">
        <div class="hero-inner">
          <div class="hero-text">
            <div class="hero-tag">🏥 Trusted Clinic Management Platform</div>
            <h1>Your Health,<br>Our <span>Priority.</span></h1>
            <p>Book visits with top specialists, access your health records, and manage your care — all in one seamless platform.</p>
            <div class="hero-btns" v-if="!store.isLoggedIn">
              <router-link to="/login"    class="btn btn-primary" style="padding:.72rem 1.75rem">Get Started →</router-link>
              <router-link to="/register" class="btn btn-secondary" style="padding:.72rem 1.75rem">Create Account</router-link>
            </div>
            <router-link v-else :to="dashboardRoute" class="btn btn-primary" style="padding:.72rem 1.75rem">Go to Dashboard →</router-link>
            <div class="hero-mini-stats">
              <div class="hms"><div class="hms-num">2K+</div><div class="hms-lbl">Patients Served</div></div>
              <div style="width:1px;background:var(--border)"></div>
              <div class="hms"><div class="hms-num">50+</div><div class="hms-lbl">Specialists</div></div>
              <div style="width:1px;background:var(--border)"></div>
              <div class="hms"><div class="hms-num">8</div><div class="hms-lbl">Divisions</div></div>
            </div>
          </div>

          <div class="hero-visual">
            <div class="doc-card">
              <div class="doc-avatar">🩺</div>
              <div class="doc-name">Dr. Archi Modgil</div>
              <div class="doc-role">Senior Cardiologist</div>
              <div class="doc-tags">
                <span style="background:#FFF0F1;color:#C8293A;border:1px solid #FFBBC0">✓ Available Today</span>
                <span style="background:#FFF5EE;color:#C05E00;border:1px solid #FECDA0">⭐ Top Rated</span>
              </div>
              <p style="color:var(--text-light);font-size:.84rem;line-height:1.65;margin:0">Expert cardiac care with a compassionate, patient-first approach trusted by thousands.</p>
              <div class="doc-divider"></div>
              <div class="doc-stats">
                <div class="ds-item"><div class="ds-num">15+</div><div class="ds-lbl">Yrs Exp.</div></div>
                <div class="ds-item"><div class="ds-num">4.9★</div><div class="ds-lbl">Rating</div></div>
                <div class="ds-item"><div class="ds-num">800+</div><div class="ds-lbl">Patients</div></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Stats strip -->
      <div class="stats-strip">
        <div class="stats-strip-inner">
          <div class="ss-item"><div class="ss-num">98%</div><div class="ss-lbl">Satisfaction Rate</div></div>
          <div class="ss-item"><div class="ss-num">24/7</div><div class="ss-lbl">Record Access</div></div>
          <div class="ss-item"><div class="ss-num">500+</div><div class="ss-lbl">Visits Per Month</div></div>
          <div class="ss-item"><div class="ss-num">8</div><div class="ss-lbl">Specialised Divisions</div></div>
        </div>
      </div>

      <!-- Featured physician highlight -->
      <div style="background:#fff;padding:3.5rem 5%;border-bottom:1px solid var(--border)">
        <div style="max-width:1200px;margin:0 auto;display:grid;grid-template-columns:1fr 1fr;gap:4rem;align-items:center">
          <div>
            <div style="background:#FFF0F1;color:var(--primary);display:inline-block;padding:.3rem .9rem;border-radius:20px;font-size:.78rem;font-weight:700;margin-bottom:1rem">Featured Physician</div>
            <h2 style="font-size:2rem;font-weight:900;margin-bottom:.5rem">Dr. Archi Modgil</h2>
            <p style="color:var(--primary);font-weight:700;margin-bottom:1rem;font-size:1.05rem">Senior Cardiologist · MBBS, MD (Cardiology)</p>
            <p style="color:var(--text-light);line-height:1.75;margin-bottom:1.5rem">With over 15 years of experience in interventional cardiology, Dr. Archi Modgil is renowned for her expertise in complex cardiac procedures, preventive heart care, and patient-centred treatment. She has helped over 800 patients lead healthier lives through evidence-based medicine and compassionate care.</p>
            <div style="display:flex;gap:2rem;margin-bottom:1.75rem">
              <div style="text-align:center">
                <div style="font-size:1.6rem;font-weight:900;color:var(--primary)">15+</div>
                <div style="font-size:.78rem;color:var(--text-light);font-weight:600">Years Experience</div>
              </div>
              <div style="text-align:center">
                <div style="font-size:1.6rem;font-weight:900;color:var(--primary)">800+</div>
                <div style="font-size:.78rem;color:var(--text-light);font-weight:600">Patients Treated</div>
              </div>
              <div style="text-align:center">
                <div style="font-size:1.6rem;font-weight:900;color:var(--primary)">4.9★</div>
                <div style="font-size:.78rem;color:var(--text-light);font-weight:600">Patient Rating</div>
              </div>
            </div>
            <router-link to="/login" class="btn btn-primary">Book a Consultation →</router-link>
          </div>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:1rem">
            <div style="background:#FFF0F1;border-radius:12px;padding:1.5rem;border:1px solid #FFBBC0">
              <div style="font-size:1.6rem;margin-bottom:.5rem">❤️</div>
              <div style="font-weight:800;margin-bottom:.3rem">Interventional Cardiology</div>
              <div style="font-size:.84rem;color:var(--text-light)">Complex cardiac procedures & stenting</div>
            </div>
            <div style="background:#FFF5EE;border-radius:12px;padding:1.5rem;border:1px solid #FECDA0">
              <div style="font-size:1.6rem;margin-bottom:.5rem">🫀</div>
              <div style="font-weight:800;margin-bottom:.3rem">Preventive Heart Care</div>
              <div style="font-size:.84rem;color:var(--text-light)">Risk assessment & lifestyle management</div>
            </div>
            <div style="background:#F0FBF5;border-radius:12px;padding:1.5rem;border:1px solid #B7EED0">
              <div style="font-size:1.6rem;margin-bottom:.5rem">🩺</div>
              <div style="font-weight:800;margin-bottom:.3rem">Cardiac Diagnostics</div>
              <div style="font-size:.84rem;color:var(--text-light)">ECG, Echo, stress testing</div>
            </div>
            <div style="background:#F0F8FF;border-radius:12px;padding:1.5rem;border:1px solid #BAD4F5">
              <div style="font-size:1.6rem;margin-bottom:.5rem">💊</div>
              <div style="font-weight:800;margin-bottom:.3rem">Heart Failure Management</div>
              <div style="font-size:.84rem;color:var(--text-light)">Long-term care & monitoring</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Features -->
      <div class="features-section">
        <div class="features-section-inner">
          <h2>Everything Your Clinic Needs</h2>
          <p class="sub">From scheduling to records — all your clinic workflows in one place.</p>
          <div class="features-grid">
            <div class="feature-card">
              <div class="fc-icon">🗓</div>
              <h3>Seamless Scheduling</h3>
              <p>Book visits with any specialist in seconds. Real-time slot availability with double-booking prevention.</p>
            </div>
            <div class="feature-card">
              <div class="fc-icon">📋</div>
              <h3>Digital Case Notes</h3>
              <p>Complete medical history with conditions, treatment plans, physician remarks and CSV export support.</p>
            </div>
            <div class="feature-card">
              <div class="fc-icon">👨‍⚕️</div>
              <h3>Multi-Role Access</h3>
              <p>Dedicated dashboards for admins, physicians and clients — each secured with role-based permissions.</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Footer -->
      <footer class="home-footer">
        <div class="footer-content">
          <div class="footer-brand">
            <h2>MediCore</h2>
            <p>Modern clinic management built for efficiency, accuracy and compassionate care.</p>
            <div class="social-links">
              <a href="#">Twitter</a>&nbsp;<a href="#">LinkedIn</a>&nbsp;<a href="#">Instagram</a>
            </div>
          </div>
          <div class="footer-links">
            <h3>Quick Links</h3>
            <a href="#">Home</a>
            <a href="#">Find a Physician</a>
            <a href="#">Our Divisions</a>
            <a href="#">Contact</a>
          </div>
          <div class="footer-links">
            <h3>Specialities</h3>
            <a href="#">Cardiology</a>
            <a href="#">Neurology</a>
            <a href="#">Pediatrics</a>
            <a href="#">Orthopedics</a>
          </div>
          <div class="footer-newsletter">
            <h3>Stay Updated</h3>
            <p>Subscribe for health tips and clinic news.</p>
            <div class="newsletter-form">
              <input type="email" placeholder="Your email address">
              <button class="btn btn-primary">Subscribe</button>
            </div>
          </div>
        </div>
        <div class="footer-bottom"><p>&copy; 2026 MediCore. All rights reserved.</p></div>
      </footer>

    </div>
  `
}
