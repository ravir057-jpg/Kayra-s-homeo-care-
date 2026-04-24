export const db = {
  get: <T>(key: string): T | null => {
    try {
      const data = localStorage.getItem(`clinic_db_${key}`);
      return data ? JSON.parse(data) : null;
    } catch (e) {
      console.error('Error reading from localStorage', e);
      return null;
    }
  },
  set: (key: string, value: any): void => {
    try {
      localStorage.setItem(`clinic_db_${key}`, JSON.stringify(value));
    } catch (e) {
      console.error('Error writing to localStorage', e);
    }
  },
  clear: (): void => {
    localStorage.clear();
  }
};

// Initial Data Seed if empty
export const seedInitialData = () => {
  if (!db.get('patients')) {
    db.set('patients', [
      { id: 'P001', name: 'Rajesh Kumar', age: 45, gender: 'Male', phone: '9876543210', address: 'Jehanabad, Bihar', createdAt: new Date(Date.now() - 86400000 * 10).toISOString() },
      { id: 'P002', name: 'Sita Devi', age: 32, gender: 'Female', phone: '8765432109', address: 'Patna, Bihar', createdAt: new Date(Date.now() - 86400000 * 5).toISOString() },
      { id: 'P003', name: 'Amit Singh', age: 28, gender: 'Male', phone: '9123456780', address: 'Gaya, Bihar', createdAt: new Date(Date.now() - 86400000 * 2).toISOString() },
      { id: 'P004', name: 'Meena Kumari', age: 55, gender: 'Female', phone: '9234567891', address: 'Arwal, Bihar', createdAt: new Date(Date.now() - 86400000 * 15).toISOString() }
    ]);
  }
  if (!db.get('inventory')) {
    db.set('inventory', [
      { id: 'M001', name: 'Arnica Montana', potency: '200C', stock: 45, unit: 'ml', price: 150 },
      { id: 'M002', name: 'Nux Vomica', potency: '30C', stock: 8, unit: 'ml', price: 120 },
      { id: 'M003', name: 'Belladonna', potency: '200C', stock: 5, unit: 'ml', price: 140 },
      { id: 'M004', name: 'Pulsatilla', potency: '30C', stock: 60, unit: 'ml', price: 110 },
      { id: 'M005', name: 'Lycopodium', potency: '1M', stock: 12, unit: 'ml', price: 180 },
      { id: 'M006', name: 'Sulphur', potency: '200C', stock: 3, unit: 'ml', price: 160 }
    ]);
  }
  if (!db.get('appointments')) {
    const today = new Date().toISOString().split('T')[0];
    const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];
    db.set('appointments', [
      { id: 'A001', patientId: 'P001', patientName: 'Rajesh Kumar', date: today, time: '10:30', type: 'Follow-up', status: 'Pending', reminderMinutes: 15 },
      { id: 'A002', patientId: 'P002', patientName: 'Sita Devi', date: today, time: '11:15', type: 'Regular', status: 'Pending', reminderMinutes: 0 },
      { id: 'A003', patientId: 'P003', patientName: 'Amit Singh', date: today, time: '12:45', type: 'Follow-up', status: 'Completed', reminderMinutes: 60 },
      { id: 'A004', patientId: 'P004', patientName: 'Meena Kumari', date: tomorrow, time: '10:00', type: 'Regular', status: 'Pending', reminderMinutes: 1440 }
    ]);
  }
  if (!db.get('prescriptions')) {
    db.set('prescriptions', [
      {
        id: 'RX1001',
        patientId: 'P003',
        date: new Date().toISOString(),
        complaints: 'Chronic Gastritis, acidity after eating, better by warm drinks.',
        diagnosis: 'Sycotic Dyspepsia',
        medicines: [
          { medicineId: 'M002', medicineName: 'Nux Vomica', dosage: '5 drops tid', duration: '7 days' }
        ],
        amount: 500,
        isPaid: true
      }
    ]);
  }
  if (!db.get('cases')) {
    db.set('cases', [
      {
        id: 'CASE1001',
        patientId: 'P001',
        date: new Date(Date.now() - 86400000 * 5).toISOString(),
        chiefComplaints: 'Chronic lumbar pain since 2 years. < cold, damp weather. > warm applications.',
        mentalGenerals: 'Anxious about health. Irritable. Desire for company.',
        physicalGenerals: 'Thirsty for large quantities of cold water. Chilly patient.',
        modalities: '< Cold damp, > Warmth',
        pastHistory: 'History of malaria in childhood.',
        familyHistory: 'Father had heart disease.',
        miasmaticAnalysis: 'Psoric base'
      }
    ]);
  }
  if (!db.get('call_sessions')) {
    db.set('call_sessions', [
      { 
        id: 'CALL-001', 
        patientId: 'P001', 
        patientName: 'Rajesh Kumar', 
        doctorName: 'Dr. Ravi Raj', 
        status: 'ended', 
        startedAt: new Date(Date.now() - 86400000).toISOString(), 
        endedAt: new Date(Date.now() - 86400000 + 600000).toISOString(), 
        duration: 600 
      }
    ]);
  }
  if (!db.get('doctors')) {
    db.set('doctors', [
      { 
        id: 'D001', 
        name: 'Dr. Ravi Raj', 
        specialization: 'Homeopathy & Chronic Cases', 
        experience: '12', 
        clinicName: "Kayra's Homeo Care", 
        location: 'Jehanabad, Bihar',
        email: 'ravi@kayra.com',
        phone: '9876543211',
        createdAt: new Date().toISOString()
      }
    ]);
  }
};
