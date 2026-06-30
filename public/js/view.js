(async () => {
  const user = await BSG.ui.guard();
  if (!user) return;
  BSG.ui.renderNav('');
  BSG.ui.initConnectivity();
  BSG.ui.registerSW();

  const id = new URLSearchParams(location.search).get('id');
  const content = document.getElementById('content');
  if (!id) { content.innerHTML = '<div class="alert alert-danger">No assessment specified.</div>'; return; }

  function row(label, value) {
    return `<div class="col-md-6 mb-2"><div class="small text-muted text-uppercase">${label}</div>
      <div class="fw-semibold">${value != null && value !== '' ? BSG.ui.escape(value) : '—'}</div></div>`;
  }

  try {
    const { report: a } = await BSG.api.get(`/api/assessments/${id}/report`);
    const media = a.media || [];
    const images = media.filter((m) => m.kind === 'image');
    const videos = media.filter((m) => m.kind === 'video');

    content.innerHTML = `
      <div class="d-flex justify-content-between align-items-start flex-wrap gap-2 mb-3">
        <div>
          <a href="/history.html" class="text-bsg small"><i class="bi bi-arrow-left"></i> Back to history</a>
          <h3 class="fw-bold mb-0 mt-1">Assessment #${a.id} ${BSG.ui.severityBadge(a.severity)}</h3>
          <span class="text-muted small">${BSG.ui.escape(a.building_location)}</span>
        </div>
        <div class="d-flex gap-2 no-print">
          <a href="/api/assessments/${a.id}/report.pdf" target="_blank" class="btn btn-bsg"><i class="bi bi-file-earmark-pdf"></i> Generate PDF</a>
          <a href="/assessment.html?id=${a.id}" class="btn btn-outline-bsg"><i class="bi bi-pencil"></i> Edit</a>
          <button id="del-btn" class="btn btn-outline-danger"><i class="bi bi-trash"></i></button>
        </div>
      </div>

      <div class="card p-4 mb-3">
        <h6 class="form-section-title">Building Information</h6>
        <div class="row">
          ${row('Location', a.building_location)}
          ${row('Building type', a.building_type)}
          ${row('Floors', a.num_floors)}
          ${row('Year built', a.year_built)}
          ${(a.latitude != null && a.longitude != null) ? row('GPS', a.latitude + ', ' + a.longitude) : ''}
          ${row('Status', a.status)}
        </div>

        <h6 class="form-section-title">Owner Information</h6>
        <div class="row">
          ${row('Owner', a.owner_name)}
          ${row('National ID', a.owner_id_number)}
          ${row('Phone', a.owner_phone)}
        </div>

        <h6 class="form-section-title">Damage Assessment</h6>
        <div class="row">
          ${row('Damage type', a.damage_type)}
          ${row('Severity', a.severity)}
          ${row('Habitability', a.habitability)}
          ${row('Source', a.source)}
        </div>

        <h6 class="form-section-title">Engineer Notes</h6>
        <p>${a.notes ? BSG.ui.escape(a.notes) : '<span class="text-muted">No notes.</span>'}</p>

        <h6 class="form-section-title">Assessed By</h6>
        <div class="row">
          ${row('Engineer', a.engineer ? a.engineer.full_name : '—')}
          ${row('Date', BSG.ui.fmtDate(a.created_at))}
        </div>
      </div>

      ${media.length ? `
      <div class="card p-4">
        <h6 class="form-section-title">Media Documentation (${media.length})</h6>
        <div class="row g-2">
          ${images.map((m) => `<div class="col-4 col-md-3"><img src="/api/media/${m.id}" class="media-thumb js-img" data-src="/api/media/${m.id}"></div>`).join('')}
          ${videos.map((m) => `<div class="col-4 col-md-3"><video src="/api/media/${m.id}" class="media-thumb" controls></video></div>`).join('')}
        </div>
      </div>` : '<div class="alert alert-light border">No media attached to this assessment.</div>'}
    `;

    // Lightbox
    const modal = new bootstrap.Modal(document.getElementById('imgModal'));
    content.querySelectorAll('.js-img').forEach((img) => img.addEventListener('click', () => {
      document.getElementById('modal-img').src = img.dataset.src;
      modal.show();
    }));

    // Delete
    document.getElementById('del-btn').addEventListener('click', async () => {
      if (!confirm('Delete this assessment and all its media? This cannot be undone.')) return;
      try {
        await BSG.api.del(`/api/assessments/${a.id}`);
        BSG.ui.toast('Assessment deleted.', 'success');
        location.href = '/history.html';
      } catch (ex) { BSG.ui.toast(ex.message, 'danger'); }
    });
  } catch (ex) {
    content.innerHTML = `<div class="alert alert-danger">Could not load assessment: ${BSG.ui.escape(ex.message)}</div>`;
  }
})();
