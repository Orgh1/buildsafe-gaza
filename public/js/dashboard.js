(async () => {
  const user = await BSG.ui.guard();
  if (!user) return;
  BSG.ui.renderNav('dashboard');
  BSG.ui.initConnectivity();
  BSG.ui.registerSW();

  document.getElementById('welcome').textContent = `Welcome, ${user.full_name.split(' ')[0]}`;

  // Auto-sync any offline records on load, then refresh
  async function trySync() {
    if (navigator.onLine) {
      try {
        const r = await BSG.sync.run();
        if (r && r.synced > 0) BSG.ui.toast(`Synced ${r.synced} offline record(s).`, 'success');
      } catch (_) {}
    }
    await refreshPending();
  }

  async function refreshPending() {
    const n = await BSG.idb.countPending();
    const banner = document.getElementById('sync-banner');
    if (n > 0) {
      document.getElementById('pending-text').textContent = `${n} assessment(s) saved offline and waiting to sync.`;
      banner.classList.remove('d-none');
    } else {
      banner.classList.add('d-none');
    }
  }

  document.getElementById('sync-now').addEventListener('click', async () => {
    if (!navigator.onLine) return BSG.ui.toast('Still offline — cannot sync yet.', 'warning');
    const r = await BSG.sync.run();
    BSG.ui.toast(`Synced ${r.synced || 0} record(s).`, 'success');
    await refreshPending();
    load();
  });

  function statCard(color, icon, num, label) {
    return `<div class="col-6 col-lg-3">
      <div class="card stat-card p-3" style="background:${color}">
        <div class="d-flex justify-content-between align-items-center">
          <div><div class="stat-num">${num}</div><div class="small">${label}</div></div>
          <i class="bi ${icon} fs-1 opacity-50"></i>
        </div>
      </div></div>`;
  }

  async function load() {
    try {
      const { stats } = await BSG.api.get('/api/stats');
      document.getElementById('scope-label').textContent =
        stats.scope === 'system' ? 'System-wide view (admin)' : 'Your personal assessments';

      const sev = stats.by_severity || {};
      const critical = (sev.Critical || 0) + (sev.Severe || 0);
      let cards = '';
      cards += statCard('#0f766e', 'bi-clipboard-data', stats.total_assessments, 'Total Assessments');
      cards += statCard('#dc2626', 'bi-exclamation-triangle', critical, 'Severe / Critical');
      cards += statCard('#2563eb', 'bi-images', stats.total_media, 'Media Files');
      if (stats.scope === 'system') {
        cards += statCard('#7c3aed', 'bi-people', stats.total_engineers, 'Engineers');
      } else {
        const reviewed = (stats.by_status && stats.by_status.reviewed) || 0;
        cards += statCard('#7c3aed', 'bi-check2-circle', reviewed, 'Reviewed');
      }
      document.getElementById('stat-cards').innerHTML = cards;

      const tbody = document.getElementById('recent-body');
      if (!stats.recent.length) {
        tbody.innerHTML = '<tr><td colspan="6" class="text-center text-muted py-4">No assessments yet. Create your first one!</td></tr>';
      } else {
        tbody.innerHTML = stats.recent.map((a) => `
          <tr>
            <td>#${a.id}</td>
            <td>${BSG.ui.escape(a.building_location)}</td>
            <td>${BSG.ui.severityBadge(a.severity)}</td>
            <td><span class="badge bg-light text-dark text-capitalize">${BSG.ui.escape(a.status)}</span></td>
            <td class="small text-muted">${BSG.ui.fmtDate(a.created_at)}</td>
            <td><a href="/view.html?id=${a.id}" class="btn btn-sm btn-outline-bsg">View</a></td>
          </tr>`).join('');
      }
    } catch (ex) {
      BSG.ui.toast(ex.message, 'danger');
    }
  }

  await trySync();
  load();
})();
