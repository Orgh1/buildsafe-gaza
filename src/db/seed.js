'use strict';

const bcrypt = require('bcryptjs');
const db = require('./index');

const engineers = [
  // Primary demo account (field engineer) — owns the sample assessments
  { full_name: 'Osama Al-Ghazali', email: 'osama@buildsafe.ps', phone: '+970590000001', password: 'Engineer@123', role: 'engineer' },
  // Admin account (for the system-wide statistics view)
  { full_name: 'Mahmoud Irheem', email: 'admin@buildsafe.ps', phone: '+970590000002', password: 'Admin@123', role: 'admin' },
];

const upsertEngineer = db.prepare(
  `INSERT INTO engineers (full_name, email, phone, password_hash, role)
   VALUES (@full_name, @email, @phone, @password_hash, @role)
   ON CONFLICT(email) DO UPDATE SET full_name=excluded.full_name, phone=excluded.phone, role=excluded.role`
);
const findEngineer = db.prepare('SELECT * FROM engineers WHERE email = ?');

const sampleAssessments = [
  {
    client_uuid: 'seed-0001', owner_name: 'Ahmed Saleh', owner_id_number: '900112233', owner_phone: '+970591234567',
    building_location: 'Al-Rimal, Gaza City — Omar Al-Mukhtar St.', latitude: 31.5169, longitude: 34.4546,
    building_type: 'Residential', num_floors: 4, year_built: 2008, damage_type: 'Structural',
    severity: 'Severe', habitability: 'Uninhabitable',
    notes: 'Major cracks in load-bearing columns on the ground floor. Partial slab failure on 2nd floor.',
  },
  {
    client_uuid: 'seed-0002', owner_name: 'Layla Mansour', owner_id_number: '800223344', owner_phone: '+970599876543',
    building_location: 'Khan Younis — Jalal St.', latitude: 31.3469, longitude: 34.3061,
    building_type: 'Commercial', num_floors: 2, year_built: 2015, damage_type: 'Facade',
    severity: 'Moderate', habitability: 'Conditional',
    notes: 'Facade and shopfront damage; structure appears stable pending detailed inspection.',
  },
  {
    client_uuid: 'seed-0003', owner_name: 'Yusuf Khalil', owner_id_number: '700334455', owner_phone: '+970567778899',
    building_location: 'Jabalia — Block 7', latitude: 31.5281, longitude: 34.4831,
    building_type: 'Residential', num_floors: 3, year_built: 1999, damage_type: 'Partial collapse',
    severity: 'Critical', habitability: 'Uninhabitable',
    notes: 'Partial collapse of the upper floor. Immediate evacuation recommended.',
  },
];

const insertAssessment = db.prepare(
  `INSERT INTO assessments
     (client_uuid, engineer_id, owner_name, owner_id_number, owner_phone, building_location,
      latitude, longitude, building_type, num_floors, year_built, damage_type, severity,
      habitability, notes, status, source)
   VALUES
     (@client_uuid, @engineer_id, @owner_name, @owner_id_number, @owner_phone, @building_location,
      @latitude, @longitude, @building_type, @num_floors, @year_built, @damage_type, @severity,
      @habitability, @notes, 'submitted', 'online')
   ON CONFLICT(client_uuid) DO NOTHING`
);

function seed() {
  for (const e of engineers) {
    upsertEngineer.run({
      full_name: e.full_name,
      email: e.email,
      phone: e.phone,
      password_hash: bcrypt.hashSync(e.password, 10),
      role: e.role,
    });
  }
  const osama = findEngineer.get('osama@buildsafe.ps');
  for (const a of sampleAssessments) {
    insertAssessment.run({ ...a, engineer_id: osama.id });
  }

  console.log('Seed complete.');
  console.log('  Engineer -> osama@buildsafe.ps / Engineer@123  (primary demo)');
  console.log('  Admin    -> admin@buildsafe.ps / Admin@123');
}

module.exports = { seed };

// Run directly via `npm run seed`
if (require.main === module) seed();
