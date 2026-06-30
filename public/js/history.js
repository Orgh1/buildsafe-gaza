(async () => {
  const user = await BSG.ui.guard();
  if (!user) return;
  BSG.ui.renderNav('history');
  BSG.ui.initConnectivity();
  BSG.ui.registerSW();

  // severity filter options
  const sevSel = document.getElementById('severity');
  sevSel.innerHTML = '<option value="">All severities</option>' +
    BSG.enums.SEVERITY_LEVELS.map((s) => `<option value="${s}">${s}</option>`).join('');

  let all = [];
  let pending = [];
  let offline = false;

  async function fetchData() {
    try {
      const r = await BSG.api.get('/api/assessments');
      all = r.assessments;
      await BSG.idb.putCache(all);
      offline = false;
    } catch (_) {
      all = (await BSG.idb.getCache()) || [];
      offline = true;
    }
    pending = await BSG.idb.getAllPending();
    document.getElementById('offline-note').classList.toggle('d-none', !offline);
  }

  function applyFilters() {
    const q = document.getElementById('q').value.trim().toLowerCase();
    const sev = document.getElementById('severity').value;
    const status = document.getElementById('status').value;
    const sort = document.getElementById('sort').value;

    let rows = all.filter((a) => {
      if (sev && a.severity !== sev) return false;
      if (status && a.status !== status) return false;
      if (q) {
        const hay = `${a.building_location || ''} ${a.owner_name || ''} ${a.notes || ''}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
    rows.sort((a, b) => sort === 'oldest'
      ? String(a.created_at).localeCompare(String(b.created_at))
      : String(b.created_at).localeCompare(String(a.created_at)));
    render(rows);
  }

  function render(rows) {
    const body = document.getElementById('body');
    let html = '';

    // Pending (offline, not yet synced) records first
    for (const p of pending) {
      const f = p.fields || {};
      html += `<tr class="table-warning">
        <td><i class="bi bi-cloud-arrow-up"></i></td>
        <td>${BSG.ui.escape(f.building_location)}</td>
        <td>${BSG.ui.escape(f.building_type || '—')}</td>
        <td>${BSG.ui.severityBadge(f.severity)}</td>
        <td><span class="badge bg-warning text-dark">pending sync</span></td>
        <td>${(p.media || []).length}</td>
        <td class="small text-muted">${BSG.ui.fmtDate(p.queued_at)}</td>
        <td><span class="text-muted small">on device</span></td>
      </tr>`;
    }

    if (!rows.length && !pending.length) {
      body.innerHTML = '<tr><td colspan="8" class="text-center text-muted py-4">No assessments found.</td></tr>';
    } else {
      html += rows.map((a) => `<tr>
        <td>#${a.id}</td>
        <td>${BSG.ui.escape(a.building_location)}</td>
        <td>${BSG.ui.escape(a.building_type || '—')}</td>
        <td>${BSG.ui.severityBadge(a.severity)}</td>
        <td><span class="badge bg-light text-dark text-capitalize">${BSG.ui.escape(a.status)}</span></td>
        <td>${a.media_count != null ? a.media_count : '—'}</td>
        <td class="small text-muted">${BSG.ui.fmtDate(a.created_at)}</td>
        <td><a href="/view.html?id=${a.id}" class="btn btn-sm btn-outline-bsg">View</a></td>
      </tr>`).join('');
      body.innerHTML = html;
    }
    document.getElementById('count-label').textContent =
      `${rows.length} assessment(s)${pending.length ? ` · ${pending.length} pending sync` : ''}`;
  }

  ['q', 'severity', 'status', 'sort'].forEach((id) =>
    document.getElementById(id).addEventListener('input', applyFilters));

  // Try to sync pending on load if online
  if (navigator.onLine) { try { await BSG.sync.run(); } catch (_) {} }
  await fetchData();
  applyFilters();
})();
