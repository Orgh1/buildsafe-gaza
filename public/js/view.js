(async () => {
  const user = await BSG.ui.guard();
  if (!user) return;
  BSG.ui.renderNav('');
  BSG.ui.initConnectivity();
  BSG.ui.registerSW();

  const T = BSG.i18n.t;
  const id = new URLSearchParams(location.search).get('id');
  const content = document.getElementById('content');
  if (!id) { content.innerHTML = `<div class="alert alert-danger">${T('No assessment specified.')}</div>`; return; }

  function row(label, value) {
    return `<div class="col-md-6 mb-2"><div class="small text-muted text-uppercase">${label}</div>
      <div class="fw-semibold">${value != null && value !== '' ? BSG.ui.escape(value) : '—'}</div></div>`;
  }
  // enum-aware value: translate known enum values, pass others through
  const TV = (v) => (v != null && v !== '' ? T(String(v)) : v);

  try {
    const { report: a } = await BSG.api.get(`/api/assessments/${id}/report`);
    const media = a.media || [];
    const images = media.filter((m) => m.kind === 'image');
    const videos = media.filter((m) => m.kind === 'video');

    content.innerHTML = `
      <div class="d-flex justify-content-between align-items-start flex-wrap gap-2 mb-3">
        <div>
          <a href="/history.html" class="text-bsg small"><i class="bi bi-arrow-left"></i> ${T('Back to history')}</a>
          <h3 class="fw-bold mb-0 mt-1">${T('Assessment')} #${a.id} ${BSG.ui.severityBadge(a.severity)}</h3>
          <span class="text-muted small">${BSG.ui.escape(a.building_location)}</span>
        </div>
        <div class="d-flex gap-2 no-print">
          <a href="/report.html?id=${a.id}" class="btn btn-bsg"><i class="bi bi-file-earmark-pdf"></i> ${T('Generate PDF')}</a>
          <a href="/assessment.html?id=${a.id}" class="btn btn-outline-bsg"><i class="bi bi-pencil"></i> ${T('Edit')}</a>
          <button id="del-btn" class="btn btn-outline-danger"><i class="bi bi-trash"></i></button>
        </div>
      </div>

      <div class="card p-4 mb-3">
        <h6 class="form-section-title">${T('Building Information')}</h6>
        <div class="row">
          ${row(T('Location'), a.building_location)}
          ${row(T('Building type'), TV(a.building_type))}
          ${row(T('Floors'), a.num_floors)}
          ${row(T('Year built'), a.year_built)}
          ${(a.latitude != null && a.longitude != null) ? row(T('GPS'), a.latitude + ', ' + a.longitude) : ''}
          ${row(T('Status'), TV(a.status))}
        </div>

        <h6 class="form-section-title">${T('Owner Information')}</h6>
        <div class="row">
          ${row(T('Owner name'), a.owner_name)}
          ${row(T('National ID'), a.owner_id_number)}
          ${row(T('Phone'), a.owner_phone)}
        </div>

        <h6 class="form-section-title">${T('Damage Assessment')}</h6>
        <div class="row">
          ${row(T('Damage type'), TV(a.damage_type))}
          ${row(T('Severity'), TV(a.severity))}
          ${row(T('Habitability'), TV(a.habitability))}
          ${row(T('Source'), TV(a.source))}
        </div>

        <h6 class="form-section-title">${T('Engineer Notes')}</h6>
        <p>${a.notes ? BSG.ui.escape(a.notes) : `<span class="text-muted">${T('No notes.')}</span>`}</p>

        <h6 class="form-section-title">${T('Assessed By')}</h6>
        <div class="row">
          ${row(T('Engineer'), a.engineer ? a.engineer.full_name : '—')}
          ${row(T('Date'), BSG.ui.fmtDate(a.created_at))}
        </div>
      </div>

      ${media.length ? `
      <div class="card p-4">
        <h6 class="form-section-title">${T('Media Documentation ({n})', { n: media.length })}</h6>
        <div class="row g-2">
          ${images.map((m) => `<div class="col-4 col-md-3"><img src="/api/media/${m.id}" class="media-thumb js-img" data-src="/api/media/${m.id}"></div>`).join('')}
          ${videos.map((m) => `<div class="col-4 col-md-3"><video src="/api/media/${m.id}" class="media-thumb" controls></video></div>`).join('')}
        </div>
      </div>` : `<div class="alert alert-light border">${T('No media attached to this assessment.')}</div>`}
    `;

    // Lightbox
    const modal = new bootstrap.Modal(document.getElementById('imgModal'));
    content.querySelectorAll('.js-img').forEach((img) => img.addEventListener('click', () => {
      document.getElementById('modal-img').src = img.dataset.src;
      modal.show();
    }));

    // Delete
    document.getElementById('del-btn').addEventListener('click', async () => {
      if (!confirm(T('Delete this assessment and all its media? This cannot be undone.'))) return;
      try {
        await BSG.api.del(`/api/assessments/${a.id}`);
        BSG.ui.toast(T('Assessment deleted.'), 'success');
        location.href = '/history.html';
      } catch (ex) { BSG.ui.toast(ex.message, 'danger'); }
    });
  } catch (ex) {
    content.innerHTML = `<div class="alert alert-danger">${T('Could not load assessment:')} ${BSG.ui.escape(ex.message)}</div>`;
  }
})();
