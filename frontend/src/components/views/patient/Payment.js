const PatientPayment = {
  data() { return {
    paymentMethod: 'card',
    form: { booking_id:'', card_number:'', expiry:'', cvv:'', amount:'', notes:'', upi_id:'' },
    message:'', error:'', loading:false,
    bookings: []
  }},
  async mounted() {
    try {
      const { data } = await api.get('/client/bookings')
      this.bookings = data.filter(b => b.status === 'completed')
    } catch(e) {
      console.error('Failed to load bookings', e)
    }
  },
  methods: {
    async submit() {
      this.error = '';
      this.message = '';
      this.loading = true;
      try {
        const payload = {
          booking_id: this.form.booking_id || null,
          payment_method: this.paymentMethod,
          amount: parseFloat(this.form.amount),
        };
        
        if (this.paymentMethod === 'card') {
          payload.card_number = this.form.card_number;
          payload.expiry = this.form.expiry;
          payload.cvv = this.form.cvv;
        } else {
          payload.upi_id = this.form.upi_id;
        }
        
        const { data } = await api.post('/client/payments', payload)
        this.message = data.message
        this.form = { booking_id:'', card_number:'', expiry:'', cvv:'', amount:'', notes:'', upi_id:'' }
      } catch(e) {
        this.error = e.response?.data?.error || 'Payment failed'
      } finally {
        this.loading = false
      }
    }
  },
  template: `
    <div class="page-container">
      <h2 class="page-title">Payment Portal</h2>
      <p class="page-subtitle">Make payments for your completed appointments and treatments</p>

      <!-- Info Banner -->
      <div style="background:#FEF3C7;border:1px solid #FCD34D;border-radius:12px;padding:1.25rem;margin-bottom:2rem;display:flex;gap:1rem;align-items:start">
        <div>
          <div style="font-weight:700;color:#92400E;margin-bottom:.3rem">Demo Payment System</div>
          <div style="font-size:.9rem;color:#B45309;line-height:1.5">
            This is a demonstration payment portal. In a real system, this would integrate with payment gateways like Razorpay, Stripe, or PayTM. 
            For testing, use any dummy card details.
          </div>
        </div>
      </div>

      <!-- Completed Appointments -->
      <div v-if="bookings.length > 0" style="background:#fff;border:1px solid var(--border);border-radius:12px;padding:1.5rem;margin-bottom:2rem">
        <h3 style="font-size:1.1rem;font-weight:800;margin-bottom:1rem;color:var(--text)">Completed Appointments</h3>
        <div style="display:flex;flex-direction:column;gap:.75rem">
          <div v-for="b in bookings" :key="b.id" style="background:#F9FAFB;padding:1rem;border-radius:8px;display:flex;justify-content:space-between;align-items:center">
            <div>
              <div style="font-weight:700;color:var(--text)">{{ b.physician_name }}</div>
              <div style="font-size:.85rem;color:var(--text-light);margin-top:.2rem">{{ b.date }} at {{ b.time }} • Booking ID: #{{ b.id }}</div>
            </div>
            <button @click="form.booking_id = b.id; form.amount = b.physician_fee" class="btn btn-sm btn-primary">Pay ₹{{ b.physician_fee }}</button>
          </div>
        </div>
      </div>

      <div v-if="error" class="alert alert-error">{{ error }}</div>
      <div v-if="message" class="alert alert-success">{{ message }}</div>

      <div class="form-container" style="max-width:600px">
        <h3 style="font-size:1.1rem;font-weight:800;margin-bottom:1.5rem;color:var(--text)">Enter Payment Details</h3>
        <form @submit.prevent="submit">
          <div class="form-group">
            <label>Booking ID (Optional)</label>
            <input v-model="form.booking_id" type="number" min="1" placeholder="Link payment to a specific appointment">
            <small style="color:var(--text-light);font-size:.8rem;display:block;margin-top:.3rem">Select from completed appointments above or enter manually</small>
          </div>
          
          <div class="form-group">
            <label>Amount (₹)</label>
            <input v-model="form.amount" type="number" step="0.01" min="1" placeholder="Enter amount to pay" required>
          </div>

          <!-- Payment Method Selection -->
          <div style="margin-bottom:1.5rem">
            <label style="display:block;font-weight:700;margin-bottom:.75rem;color:var(--text)">Payment Method</label>
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:1rem">
              <button type="button" @click="paymentMethod='card'" :class="paymentMethod==='card'?'btn btn-primary':'btn btn-outline'" style="padding:.75rem;display:flex;align-items:center;justify-content:center;gap:.5rem">
                Card Payment
              </button>
              <button type="button" @click="paymentMethod='upi'" :class="paymentMethod==='upi'?'btn btn-primary':'btn btn-outline'" style="padding:.75rem;display:flex;align-items:center;justify-content:center;gap:.5rem">
                UPI Payment
              </button>
            </div>
          </div>

          <!-- Card Payment Form -->
          <div v-if="paymentMethod==='card'" style="background:#F9FAFB;padding:1.25rem;border-radius:8px;margin-bottom:1.5rem">
            <div style="font-weight:700;margin-bottom:1rem;color:var(--text)">Card Details</div>
            
            <div class="form-group">
              <label>Card Number</label>
              <input v-model="form.card_number" type="text" inputmode="numeric" placeholder="1234567890123456" required>
              <small style="color:var(--text-light);font-size:.8rem;display:block;margin-top:.3rem">Format: 13-19 digits (e.g., 4532015112830366)</small>
            </div>
            
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:1rem;">
              <div class="form-group">
                <label>Expiry Date</label>
                <input v-model="form.expiry" type="text" placeholder="MM/YY" maxlength="5" required>
                <small style="color:var(--text-light);font-size:.8rem;display:block;margin-top:.3rem">Format: MM/YY (e.g., 12/25)</small>
              </div>
              <div class="form-group">
                <label>CVV</label>
                <input v-model="form.cvv" type="password" inputmode="numeric" placeholder="123" maxlength="4" required>
                <small style="color:var(--text-light);font-size:.8rem;display:block;margin-top:.3rem">3-4 digits on back of card</small>
              </div>
            </div>
          </div>

          <!-- UPI Payment Form -->
          <div v-if="paymentMethod==='upi'" style="background:#F0FDF4;padding:1.25rem;border-radius:8px;margin-bottom:1.5rem;border:1px solid #BBF7D0">
            <div style="font-weight:700;margin-bottom:1rem;color:var(--text)">UPI Payment</div>
            
            <div class="form-group">
              <label>UPI ID</label>
              <input v-model="form.upi_id" type="text" placeholder="yourname@paytm" required>
              <small style="color:var(--text-light);font-size:.8rem;display:block;margin-top:.3rem">Format: username@provider (e.g., john@paytm, user@phonepe, name@googlepay)</small>
            </div>
            
            <div style="background:#fff;padding:.75rem;border-radius:6px;margin-top:1rem;font-size:.85rem;color:var(--text-light)">
              <div style="font-weight:600;color:var(--text);margin-bottom:.5rem">Supported UPI Apps:</div>
              <div style="display:flex;flex-wrap:wrap;gap:.5rem">
                <span style="background:#E0F2FE;color:#0369A1;padding:.25rem .5rem;border-radius:4px;font-size:.75rem">Google Pay</span>
                <span style="background:#DBEAFE;color:#1E40AF;padding:.25rem .5rem;border-radius:4px;font-size:.75rem">PhonePe</span>
                <span style="background:#E0E7FF;color:#4338CA;padding:.25rem .5rem;border-radius:4px;font-size:.75rem">Paytm</span>
                <span style="background:#F3E8FF;color:#7C3AED;padding:.25rem .5rem;border-radius:4px;font-size:.75rem">BHIM</span>
              </div>
            </div>
          </div>

          <div class="form-group">
            <label>Notes (Optional)</label>
            <textarea v-model="form.notes" rows="2" placeholder="Add any additional notes about this payment"></textarea>
          </div>

          <button type="submit" class="btn btn-primary" style="width:100%;padding:.85rem;font-size:1rem" :disabled="loading">
            {{ loading ? 'Processing Payment...' : 'Pay Now' }}
          </button>

          <div style="text-align:center;margin-top:1rem;font-size:.8rem;color:var(--text-light)">
            Secure payment processing - Demo mode
          </div>
        </form>
      </div>
    </div>
  `
}
