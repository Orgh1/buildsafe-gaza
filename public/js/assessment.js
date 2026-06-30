(async () => {
  const user = await BSG.ui.guard();
  if (!user) return;
  BSG.ui.renderNav('new');
  BSG.ui.initConnectivity();
  BSG.ui.registerSW();

  const params = new URLSearchParams(location.search);
  const editId = params.get('id');
  const E = BSG.enums;
  const T = BSG.i18n.t;

  // Populate selects (stored value stays English; only the label is translated)
  function fillSelect(id, options, allowEmpty) {
    const sel = document.getElementById(id);
    sel.innerHTML = (allowEmpty ? `<option value="">${T('— select —')}</option>` : '') +
      options.map((o) => `<option value="${o}">${T(o)}</option>`).join('');
  }
  fillSelect('building_type', E.BUILDING_TYPES, true);
  fillSelect('damage_type', E.DAMAGE_TYPES, true);
  fillSelect('severity', E.SEVERITY_LEVELS, true);
  fillSelect('habitability', E.HABITABILITY, true);

  const offlineNote = document.getElementById('offline-note');
  function updateOfflineNote() { offlineNote.classList.toggle('d-none', navigator.onLine); }
  window.addEventListener('online', updateOfflineNote);
  window.addEventListener('offline', updateOfflineNote);
  updateOfflineNote();

  // Geolocation
  document.getElementById('geo-btn').addEventListener('click', () => {
    if (!navigator.geolocation) return BSG.ui.toast(T('Geolocation not supported.'), 'warning');
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        document.getElementById('latitude').value = pos.coords.latitude.toFixed(6);
        document.getElementById('longitude').value = pos.coords.longitude.toFixed(6);
        BSG.ui.toast(T('Location captured.'), 'success');
      },
      () => BSG.ui.toast(T('Could not get location.'), 'warning')
    );
  });

  // Media preview for newly selected files
  const mediaInput = document.getElementById('media');
  const preview = document.getElementById('preview');
  mediaInput.addEventListener('change', () => {
    preview.innerHTML = '';
    [...mediaInput.files].forEach((f) => {
      const col = document.createElement('div');
      col.className = 'col-4 col-md-3';
      if (f.type.startsWith('image/')) {
        const url = URL.createObjectURL(f);
        col.innerHTML = `<img src="${url}" class="media-thumb">`;
      } else {
        col.innerHTML = `<div class="media-thumb d-flex align-items-center justify-content-center bg-dark text-white"><i class="bi bi-camera-video fs-3"></i></div>`;
      }
      preview.appendChild(col);
    });
  });

  const fields = ['building_location', 'building_type', 'num_floors', 'year_built', 'latitude', 'longitude',
    'owner_name', 'owner_id_number', 'owner_phone', 'damage_type', 'severity', 'habitability', 'notes'];

  function collect() {
    const data = {};
    for (const f of fields) {
      const v = document.getElementById(f).value;
      data[f] = v === '' ? null : v;
    }
    return data;
  }

  // ----- Edit mode: load existing assessment -----
  if (editId) {
    document.getElementById('form-title').innerHTML = `<i class="bi bi-pencil-square text-bsg"></i> ${T('Edit Assessment')}`;
    document.getElementById('form-sub').textContent = T('Editing assessment #{id}', { id: editId });
    try {
      const { assessment } = await BSG.api.get(`/api/assessments/${editId}`);
      for (const f of fields) if (assessment[f] != null) document.getElementById(f).value = assessment[f];
      renderExistingMedia(assessment.media || []);
    } catch (ex) {
      BSG.ui.toast(T('Could not load assessment:') + ' ' + ex.message, 'danger');
    }
  }

  function renderExistingMedia(media) {
    const host = document.getElementById('existing-media');
    if (!media.length) { host.innerHTML = ''; return; }
    host.innerHTML = `<div class="col-12 small text-muted mt-2">${T('Existing media:')}</div>` + media.map((m) => `
      <div class="col-4 col-md-3 media-tile" data-id="${m.id}">
        ${m.kind === 'image'
          ? `<img src="/api/media/${m.id}" class="media-thumb">`
          : `<div class="media-thumb d-flex align-items-center justify-content-center bg-dark text-white"><i class="bi bi-camera-video fs-3"></i></div>`}
        <button type="button" class="btn btn-danger btn-sm btn-del" data-del="${m.id}"><i class="bi bi-x"></i></button>
      </div>`).join('');
    host.querySelectorAll('[data-del]').forEach((b) => b.addEventListener('click', async () => {
      if (!confirm(T('Delete this media file?'))) return;
      try {
        await BSG.api.del(`/api/media/${b.dataset.del}`);
        b.closest('.media-tile').remove();
        BSG.ui.toast(T('Media deleted.'), 'success');
      } catch (ex) { BSG.ui.toast(ex.message, 'danger'); }
    }));
  }

  // ----- Submit -----
  const form = document.getElementById('assess-form');
  const err = document.getElementById('error');
  const btn = document.getElementById('submit-btn');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    err.classList.add('d-none');
    const data = collect();
    if (!data.building_location || !data.severity) {
      err.textContent = T('Building location and severity are required.');
      err.classList.remove('d-none');
      return;
    }
    btn.disabled = true; btn.innerHTML = T('Saving…');
    const files = [...mediaInput.files];

    try {
      if (editId) {
        // Edit requires connectivity
        await BSG.api.put(`/api/assessments/${editId}`, data);
        if (files.length) {
          const fd = new FormData();
          files.forEach((f) => fd.append('files', f));
          await BSG.api.upload(`/api/assessments/${editId}/media`, fd);
        }
        BSG.ui.toast(T('Assessment updated.'), 'success');
        location.href = `/view.html?id=${editId}`;
        return;
      }

      if (navigator.onLine) {
        // Online create
        const { assessment } = await BSG.api.post('/api/assessments', data);
        if (files.length) {
          const fd = new FormData();
          files.forEach((f) => fd.append('files', f));
          await BSG.api.upload(`/api/assessments/${assessment.id}/media`, fd);
        }
        BSG.ui.toast(T('Assessment saved.'), 'success');
        location.href = `/view.html?id=${assessment.id}`;
      } else {
        // Offline create — queue in IndexedDB
        await BSG.sync.queueAssessment(data, files);
        BSG.ui.toast(T('Saved offline. It will sync automatically when you reconnect.'), 'warning');
        location.href = '/dashboard.html';
      }
    } catch (ex) {
      if (!editId && !navigator.onLine) {
        // Network died mid-request — fall back to offline queue
        await BSG.sync.queueAssessment(data, files);
        BSG.ui.toast(T('Network unavailable — saved offline.'), 'warning');
        location.href = '/dashboard.html';
        return;
      }
      err.textContent = ex.message; err.classList.remove('d-none');
      btn.disabled = false; btn.innerHTML = `<i class="bi bi-save"></i> ${T('Save Assessment')}`;
    }
  });
})();
