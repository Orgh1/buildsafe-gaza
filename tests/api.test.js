'use strict';

// Use an isolated temp database so tests never touch real data.
const os = require('os');
const path = require('path');
const fs = require('fs');
const TEST_DIR = path.join(os.tmpdir(), 'bsg-test-' + process.pid);
process.env.DATA_DIR = TEST_DIR;
process.env.DB_PATH = path.join(TEST_DIR, 'test.db');
process.env.JWT_SECRET = 'test-secret';

const test = require('node:test');
const assert = require('node:assert');
const app = require('../src/app');

let server, base;

test.before(async () => {
  await new Promise((resolve) => { server = app.listen(0, resolve); });
  base = `http://localhost:${server.address().port}`;
});

test.after(() => { server && server.close(); });

// ---- tiny cookie-aware client ----
function makeClient() {
  let cookie = '';
  async function req(method, p, body, isForm) {
    const headers = {};
    if (cookie) headers.Cookie = cookie;
    let payload;
    if (isForm) payload = body;
    else if (body !== undefined) { headers['Content-Type'] = 'application/json'; payload = JSON.stringify(body); }
    const res = await fetch(base + p, { method, headers, body: payload });
    const sc = res.headers.get('set-cookie');
    if (sc) cookie = sc.split(';')[0];
    let data = null;
    const ct = res.headers.get('content-type') || '';
    if (ct.includes('application/json')) data = await res.json();
    else data = { _contentType: ct, _length: res.headers.get('content-length') };
    return { status: res.status, data };
  }
  return {
    get: (p) => req('GET', p),
    post: (p, b) => req('POST', p, b),
    put: (p, b) => req('PUT', p, b),
    del: (p) => req('DELETE', p),
    upload: (p, fd) => req('POST', p, fd, true),
    clearCookie: () => { cookie = ''; },
  };
}

const PNG_1x1 = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==', 'base64');

// =================== Tests ===================

test('TC1 — Login: valid credentials succeed, invalid fail', async () => {
  const c = makeClient();
  const reg = await c.post('/api/auth/register', { full_name: 'Test Engineer', email: 'tc1@test.ps', password: 'secret123' });
  assert.equal(reg.status, 201);
  assert.equal(reg.data.user.email, 'tc1@test.ps');

  const c2 = makeClient();
  const ok = await c2.post('/api/auth/login', { email: 'tc1@test.ps', password: 'secret123' });
  assert.equal(ok.status, 200);
  assert.equal(ok.data.user.full_name, 'Test Engineer');

  const bad = await c2.post('/api/auth/login', { email: 'tc1@test.ps', password: 'wrong' });
  assert.equal(bad.status, 401);
});

test('TC2 — Create Assessment: valid form is saved', async () => {
  const c = makeClient();
  await c.post('/api/auth/register', { full_name: 'TC2 Eng', email: 'tc2@test.ps', password: 'secret123' });
  const r = await c.post('/api/assessments', {
    building_location: 'Gaza City, Block 5', severity: 'Severe',
    building_type: 'Residential', num_floors: 4, damage_type: 'Structural', notes: 'cracks',
  });
  assert.equal(r.status, 201);
  assert.ok(r.data.assessment.id > 0);
  assert.equal(r.data.assessment.severity, 'Severe');
});

test('TC2b — Create Assessment: missing required fields rejected', async () => {
  const c = makeClient();
  await c.post('/api/auth/register', { full_name: 'TC2b', email: 'tc2b@test.ps', password: 'secret123' });
  const r = await c.post('/api/assessments', { notes: 'no location or severity' });
  assert.equal(r.status, 400);
  assert.ok(Array.isArray(r.data.errors) && r.data.errors.length >= 1);
});

test('TC3 — Upload Image: media is stored and linked', async () => {
  const c = makeClient();
  await c.post('/api/auth/register', { full_name: 'TC3', email: 'tc3@test.ps', password: 'secret123' });
  const a = await c.post('/api/assessments', { building_location: 'Rafah', severity: 'Moderate' });
  const id = a.data.assessment.id;

  const fd = new FormData();
  fd.append('files', new Blob([PNG_1x1], { type: 'image/png' }), 'damage.png');
  const up = await c.upload(`/api/assessments/${id}/media`, fd);
  assert.equal(up.status, 201);
  assert.equal(up.data.media.length, 1);
  assert.equal(up.data.media[0].kind, 'image');

  const view = await c.get(`/api/assessments/${id}`);
  assert.equal(view.data.assessment.media.length, 1);
});

test('TC4 — Generate Report: PDF and JSON report produced', async () => {
  const c = makeClient();
  await c.post('/api/auth/register', { full_name: 'TC4', email: 'tc4@test.ps', password: 'secret123' });
  const a = await c.post('/api/assessments', { building_location: 'Khan Younis', severity: 'Critical' });
  const id = a.data.assessment.id;

  const rjson = await c.get(`/api/assessments/${id}/report`);
  assert.equal(rjson.status, 200);
  assert.equal(rjson.data.report.id, id);
  assert.ok(rjson.data.report.engineer);

  const pdf = await c.get(`/api/assessments/${id}/report.pdf`);
  assert.equal(pdf.status, 200);
  assert.match(pdf.data._contentType, /application\/pdf/);
});

test('TC5 — View Assessment History: list returns created assessments', async () => {
  const c = makeClient();
  await c.post('/api/auth/register', { full_name: 'TC5', email: 'tc5@test.ps', password: 'secret123' });
  await c.post('/api/assessments', { building_location: 'Loc A', severity: 'Minor' });
  await c.post('/api/assessments', { building_location: 'Loc B', severity: 'Severe' });

  const list = await c.get('/api/assessments');
  assert.equal(list.status, 200);
  assert.equal(list.data.count, 2);

  const filtered = await c.get('/api/assessments?severity=Severe');
  assert.equal(filtered.data.count, 1);

  const search = await c.get('/api/assessments?q=Loc A');
  assert.equal(search.data.count, 1);
});

test('TC6 — Offline Data Collection: sync creates records idempotently', async () => {
  const c = makeClient();
  await c.post('/api/auth/register', { full_name: 'TC6', email: 'tc6@test.ps', password: 'secret123' });

  const payload = { assessments: [{
    client_uuid: 'offline-abc', building_location: 'Offline Site', severity: 'Severe',
    media: [{ data: PNG_1x1.toString('base64'), mime_type: 'image/png', original_name: 'o.png' }],
  }] };

  const first = await c.post('/api/sync', payload);
  assert.equal(first.status, 200);
  assert.equal(first.data.synced, 1);
  assert.equal(first.data.results[0].status, 'created');
  assert.equal(first.data.results[0].media_saved, 1);

  // Re-syncing the same client_uuid updates rather than duplicating
  const second = await c.post('/api/sync', { assessments: [{ client_uuid: 'offline-abc', building_location: 'Offline Site UPDATED', severity: 'Critical' }] });
  assert.equal(second.data.results[0].status, 'updated');

  const list = await c.get('/api/assessments');
  assert.equal(list.data.count, 1); // still one record, not two
  assert.equal(list.data.assessments[0].building_location, 'Offline Site UPDATED');
});

test('TC7 — Edit Assessment: update is persisted', async () => {
  const c = makeClient();
  await c.post('/api/auth/register', { full_name: 'TC7', email: 'tc7@test.ps', password: 'secret123' });
  const a = await c.post('/api/assessments', { building_location: 'Old', severity: 'Minor' });
  const id = a.data.assessment.id;

  const upd = await c.put(`/api/assessments/${id}`, { building_location: 'New Address', severity: 'Severe', notes: 'updated' });
  assert.equal(upd.status, 200);
  assert.equal(upd.data.assessment.building_location, 'New Address');
  assert.equal(upd.data.assessment.severity, 'Severe');
});

test('TC8 — Security: unauthenticated requests are blocked', async () => {
  const c = makeClient();
  const r = await c.get('/api/assessments');
  assert.equal(r.status, 401);
});

test('TC9 — Isolation: an engineer cannot read another engineer\'s assessment', async () => {
  const a = makeClient();
  await a.post('/api/auth/register', { full_name: 'Owner', email: 'owner@test.ps', password: 'secret123' });
  const created = await a.post('/api/assessments', { building_location: 'Private', severity: 'Severe' });
  const id = created.data.assessment.id;

  const b = makeClient();
  await b.post('/api/auth/register', { full_name: 'Other', email: 'other@test.ps', password: 'secret123' });
  const peek = await b.get(`/api/assessments/${id}`);
  assert.equal(peek.status, 404);

  const delAttempt = await b.del(`/api/assessments/${id}`);
  assert.equal(delAttempt.status, 404);
});

test('TC10 — Contact form: valid submits, invalid rejected', async () => {
  const c = makeClient();
  const ok = await c.post('/api/contact', { name: 'Visitor', email: 'v@test.ps', message: 'Hello team' });
  assert.equal(ok.status, 201);
  const bad = await c.post('/api/contact', { name: 'No Email', message: 'x' });
  assert.equal(bad.status, 400);
});

test('TC11 — Stats: reflect created assessments', async () => {
  const c = makeClient();
  await c.post('/api/auth/register', { full_name: 'Stats Eng', email: 'stats@test.ps', password: 'secret123' });
  await c.post('/api/assessments', { building_location: 'S1', severity: 'Critical' });
  await c.post('/api/assessments', { building_location: 'S2', severity: 'Critical' });
  const r = await c.get('/api/stats');
  assert.equal(r.status, 200);
  assert.equal(r.data.stats.total_assessments, 2);
  assert.equal(r.data.stats.by_severity.Critical, 2);
});

test('TC12 — Profile: update name and change password', async () => {
  const c = makeClient();
  await c.post('/api/auth/register', { full_name: 'Before', email: 'prof@test.ps', password: 'secret123' });
  const upd = await c.put('/api/profile', { full_name: 'After Name', email: 'prof@test.ps', phone: '+970599' });
  assert.equal(upd.status, 200);
  assert.equal(upd.data.user.full_name, 'After Name');

  const pw = await c.put('/api/profile/password', { current_password: 'secret123', new_password: 'newsecret1' });
  assert.equal(pw.status, 200);

  const c2 = makeClient();
  const login = await c2.post('/api/auth/login', { email: 'prof@test.ps', password: 'newsecret1' });
  assert.equal(login.status, 200);
});
