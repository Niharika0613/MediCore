"""Seed script — populates all demo data."""
from app import create_app, init_db
from models import db, Account, Physician, Client, Booking, CaseNote, Division
from datetime import date, timedelta, datetime
import warnings
warnings.filterwarnings('ignore')

app = create_app()
init_db(app)

with app.app_context():

    # ── Physicians ─────────────────────────────────────────────────────────────
    physicians_data = [
        dict(handle='dr.chen',     name='Dr. James Chen',      email='jchen@medicore.com',    phone='9811001001', expertise='Cardiology',       years_exp=12, consult_fee=800,  schedule_text='Mon-Fri 9AM-1PM',      div='Cardiology',      about='12 years of expertise in interventional cardiology and heart failure management.'),
        dict(handle='dr.okonkwo',  name='Dr. Amara Okonkwo',   email='aokonkwo@medicore.com', phone='9811002002', expertise='Neurology',        years_exp=8,  consult_fee=1000, schedule_text='Mon-Wed-Fri 2PM-6PM',  div='Neurology',       about='Specialist in stroke rehabilitation and neurological disorders with 8 years experience.'),
        dict(handle='dr.torres',   name='Dr. Sofia Torres',    email='storres@medicore.com',  phone='9811003003', expertise='Pediatrics',       years_exp=6,  consult_fee=600,  schedule_text='Tue-Thu-Sat 9AM-12PM', div='Pediatrics',      about='Dedicated to child health and development with a gentle, family-first approach.'),
        dict(handle='dr.walsh',    name='Dr. Robert Walsh',    email='rwalsh@medicore.com',   phone='9811004004', expertise='Dermatology',      years_exp=5,  consult_fee=700,  schedule_text='Mon-Sat 10AM-2PM',     div='Dermatology',     about='Expert in skin conditions, cosmetic dermatology and allergy management.'),
        dict(handle='dr.patel',    name='Dr. Nisha Patel',     email='npatel@medicore.com',   phone='9811005005', expertise='Orthopedics',      years_exp=15, consult_fee=1200, schedule_text='Mon-Fri 8AM-12PM',     div='Orthopedics',     about='Senior orthopedic surgeon specialising in joint replacement and sports injuries.'),
        dict(handle='dr.nguyen',   name='Dr. Kevin Nguyen',    email='knguyen@medicore.com',  phone='9811006006', expertise='General Medicine', years_exp=10, consult_fee=500,  schedule_text='Mon-Sat 9AM-5PM',      div='General Medicine',about='Experienced general physician providing comprehensive primary care and preventive medicine.'),
        dict(handle='dr.shazia',   name='Dr. Shazia Khan',     email='shazia@medicore.com',   phone='9811007007', expertise='Neurology',        years_exp=9,  consult_fee=950,  schedule_text='Mon-Thu 10AM-3PM',     div='Neurology',       about='Specialises in epilepsy, migraine management and neurodegenerative conditions.'),
        dict(handle='dr.anjali',   name='Dr. Anjali Sharma',   email='anjali@medicore.com',   phone='9811008008', expertise='Pediatrics',       years_exp=7,  consult_fee=650,  schedule_text='Mon-Sat 9AM-1PM',      div='Pediatrics',      about='Compassionate paediatrician with expertise in neonatal care and childhood immunisation.'),
        dict(handle='dr.shivam',   name='Dr. Shivam Sharma',   email='shivam@medicore.com',   phone='9811009009', expertise='Orthopedics',      years_exp=11, consult_fee=1100, schedule_text='Tue-Sat 10AM-4PM',     div='Orthopedics',     about='Specialist in minimally invasive orthopaedic surgery and spinal disorders.'),
        dict(handle='dr.nihaar',   name='Dr. Nihaar Mehta',    email='nihaar@medicore.com',   phone='9811010010', expertise='ENT',              years_exp=8,  consult_fee=700,  schedule_text='Mon-Fri 11AM-5PM',     div='ENT',             about='Expert in ear, nose and throat conditions including sinus surgery and hearing disorders.'),
        dict(handle='dr.niharika', name='Dr. Niharika Singh',  email='niharika@medicore.com', phone='9811011011', expertise='Oncology',         years_exp=13, consult_fee=1500, schedule_text='Mon-Wed-Fri 9AM-2PM',  div='Oncology',        about='Oncologist with 13 years in cancer diagnosis, chemotherapy management and palliative care.'),
    ]

    div_map = {d.name: d for d in Division.query.all()}
    physician_objs = []

    for p in physicians_data:
        existing = Account.query.filter_by(handle=p['handle']).first()
        if existing:
            physician_objs.append(Physician.query.filter_by(user_id=existing.id).first())
            continue
        acc = Account(handle=p['handle'], full_name=p['name'], email=p['email'],
                      contact=p['phone'], user_type='doctor')
        acc.set_password('doctor123')
        db.session.add(acc)
        db.session.flush()
        phy = Physician(
            user_id=acc.id,
            expertise=p['expertise'],
            years_exp=p['years_exp'],
            consult_fee=p['consult_fee'],
            schedule_text=p['schedule_text'],
            division_id=div_map.get(p['div'], div_map.get('General Medicine')).id,
            about=p['about'],
        )
        db.session.add(phy)
        db.session.flush()
        physician_objs.append(phy)

    db.session.commit()
    print(f'[OK] {len(physician_objs)} physicians ready')

    # ── Clients ────────────────────────────────────────────────────────────────
    clients_data = [
        dict(handle='client.marcus',  name='Marcus Brown',    email='marcus@mail.com',   phone='9900001001', birth_date='1990-04-15', gender='Male',   blood_type='B+',  location='42 Oak Street, Seattle'),
        dict(handle='client.elena',   name='Elena Vasquez',   email='elena@mail.com',    phone='9900002002', birth_date='1985-09-22', gender='Female', blood_type='A+',  location='18 Pine Ave, Portland'),
        dict(handle='client.oliver',  name='Oliver Mitchell', email='oliver@mail.com',   phone='9900003003', birth_date='1978-12-01', gender='Male',   blood_type='O-',  location='7 Maple Rd, Austin'),
        dict(handle='client.priya',   name='Priya Kapoor',    email='priya@mail.com',    phone='9900004004', birth_date='1995-06-30', gender='Female', blood_type='AB+', location='55 Cedar Blvd, Boston'),
        dict(handle='client.daniel',  name='Daniel Park',     email='daniel@mail.com',   phone='9900005005', birth_date='1982-03-10', gender='Male',   blood_type='A-',  location='3 Elm Court, Denver'),
        dict(handle='client.sara',    name='Sara Johnson',    email='sara@mail.com',     phone='9900006006', birth_date='1993-07-18', gender='Female', blood_type='O+',  location='11 Birch Lane, Chicago'),
        dict(handle='client.raj',     name='Raj Patel',       email='raj@mail.com',      phone='9900007007', birth_date='1988-11-05', gender='Male',   blood_type='B-',  location='27 Willow St, Houston'),
        dict(handle='client.meera',   name='Meera Nair',      email='meera@mail.com',    phone='9900008008', birth_date='1975-02-28', gender='Female', blood_type='AB-', location='9 Rosewood Dr, Miami'),
    ]

    client_objs = []
    for c in clients_data:
        existing = Account.query.filter_by(handle=c['handle']).first()
        if existing:
            client_objs.append(Client.query.filter_by(user_id=existing.id).first())
            continue
        acc = Account(handle=c['handle'], full_name=c['name'], email=c['email'],
                      contact=c['phone'], user_type='patient')
        acc.set_password('patient123')
        db.session.add(acc)
        db.session.flush()
        cl = Client(
            user_id=acc.id,
            birth_date=datetime.strptime(c['birth_date'], '%Y-%m-%d').date(),
            gender=c['gender'], blood_type=c['blood_type'], location=c['location'],
        )
        db.session.add(cl)
        db.session.flush()
        client_objs.append(cl)

    db.session.commit()
    print(f'[OK] {len(client_objs)} clients ready')

    # ── Bookings ───────────────────────────────────────────────────────────────
    today = date.today()

    # (client_idx, physician_idx, days_offset, time, status, reason)
    bookings_data = [
        (0, 0,  +3, '10:00 AM', 'pending',   'Chest tightness and shortness of breath'),
        (1, 0,  +5, '11:00 AM', 'approved',  'Follow-up after ECG results'),
        (2, 1,  +1, '02:00 PM', 'approved',  'Recurring severe headaches'),
        (3, 1,  +7, '03:00 PM', 'pending',   'Memory lapses and difficulty concentrating'),
        (0, 2,  -2, '09:00 AM', 'completed', 'Annual check-up for child'),
        (4, 2,  -5, '10:00 AM', 'completed', 'Fever and sore throat'),
        (1, 3,  +2, '11:00 AM', 'approved',  'Persistent skin rash on forearms'),
        (2, 3,  -1, '12:00 PM', 'cancelled', 'Acne and oily skin consultation'),
        (3, 4,  +4, '09:00 AM', 'pending',   'Knee pain after jogging'),
        (4, 5,   0, '10:00 AM', 'approved',  'Routine general health check'),
        (0, 5,  -3, '11:00 AM', 'completed', 'High blood pressure follow-up'),
        (1, 5,  -7, '02:00 PM', 'completed', 'Fever and body ache'),
        (5, 6,  +2, '10:00 AM', 'pending',   'Dizziness and balance issues'),
        (6, 6,  +6, '03:00 PM', 'approved',  'Tingling sensation in hands'),
        (7, 7,  +1, '09:00 AM', 'pending',   'Child vaccination schedule'),
        (5, 7,  -4, '11:00 AM', 'completed', 'Child cold and cough'),
        (6, 8,  +3, '02:00 PM', 'pending',   'Lower back pain for 2 weeks'),
        (7, 8,  -2, '04:00 PM', 'completed', 'Post-surgery physiotherapy review'),
        (0, 9,  +5, '12:00 PM', 'approved',  'Ear pain and hearing difficulty'),
        (3, 9,  -1, '03:00 PM', 'completed', 'Sinus congestion and nasal polyps'),
        (2, 10, +8, '10:00 AM', 'pending',   'Cancer screening and biopsy review'),
        (4, 10, -6, '11:00 AM', 'completed', 'Post-chemotherapy follow-up'),
    ]

    booking_objs = []
    for ci, pi, days, time, status, reason in bookings_data:
        c = client_objs[ci]
        p = physician_objs[pi]
        bdate = today + timedelta(days=days)
        existing = Booking.query.filter_by(physician_id=p.id, date=bdate, time=time).first()
        if existing:
            booking_objs.append(existing)
            continue
        b = Booking(client_id=c.id, physician_id=p.id,
                    date=bdate, time=time, status=status, reason=reason)
        db.session.add(b)
        db.session.flush()
        booking_objs.append(b)

    db.session.commit()
    print(f'[OK] {len(booking_objs)} bookings ready')

    # ── Case Notes (for completed bookings) ────────────────────────────────────
    notes_data = [
        (4,  'Mild upper respiratory infection',
              'Paracetamol 500mg twice daily x5 days; Cetirizine 10mg at night',
              'Advised rest and hydration. Follow up if fever persists beyond 3 days.'),
        (5,  'Viral fever — resolved',
              'Ibuprofen 400mg thrice daily; ORS sachets after each meal',
              'Client recovered well. No further medication required.'),
        (10, 'Hypertension Stage 1',
              'Amlodipine 5mg once daily; Reduce salt intake; 30 min daily walk',
              'BP: 145/92. Follow up in 2 weeks. Lifestyle modification counselled.'),
        (11, 'Acute viral fever with myalgia',
              'Paracetamol 650mg SOS; Multivitamin tablet daily for 7 days',
              'Avoid cold beverages. Complete bed rest for 48 hours.'),
        (15, 'Post-operative review — knee arthroplasty',
              'Physiotherapy 3x/week; Diclofenac 50mg if pain; Calcium + Vit D supplement',
              'Wound healing well. Range of motion improving. Next review in 4 weeks.'),
        (17, 'Lumbar disc herniation L4-L5',
              'Etoricoxib 90mg once daily; Hot fomentation twice daily; Muscle relaxant at night',
              'MRI confirms mild disc bulge. Conservative management for 6 weeks before reassessment.'),
        (19, 'Chronic sinusitis with nasal polyps',
              'Mometasone nasal spray twice daily; Saline nasal rinse morning and evening',
              'CT scan advised. Surgical option to be discussed if no improvement in 8 weeks.'),
        (21, 'Post-chemotherapy fatigue syndrome',
              'Iron supplement + B12 injection monthly; High-protein diet advised',
              'CBC shows mild anaemia. Energy levels improving. Continue current protocol.'),
    ]

    for idx, condition, treatment, remarks in notes_data:
        if idx >= len(booking_objs):
            continue
        b = booking_objs[idx]
        if CaseNote.query.filter_by(booking_id=b.id).first():
            continue
        note = CaseNote(
            client_id=b.client_id, physician_id=b.physician_id,
            booking_id=b.id, date=b.date,
            condition=condition, treatment=treatment, remarks=remarks,
        )
        db.session.add(note)

    db.session.commit()
    print('[OK] Case notes seeded')

    # ── Summary ────────────────────────────────────────────────────────────────
    print()
    print('=' * 58)
    print('  SEED COMPLETE — MediCore Login Credentials')
    print('=' * 58)
    print()
    print('  ADMIN')
    print('    handle: admin        password: admin123')
    print()
    print('  PHYSICIANS  (all password: doctor123)')
    for p in physician_objs:
        print(f'    {p.account.handle:<20}  {p.account.full_name:<22}  {p.expertise}')
    print()
    print('  CLIENTS  (all password: patient123)')
    for c in client_objs:
        print(f'    {c.account.handle:<20}  {c.account.full_name}')
    print()
    print(f'  Physicians : {Physician.query.count()}')
    print(f'  Clients    : {Client.query.count()}')
    print(f'  Bookings   : {Booking.query.count()}')
    print(f'  Case Notes : {CaseNote.query.count()}')
    print('=' * 58)
