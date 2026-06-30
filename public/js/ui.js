// Shared UI helpers: auth state, navbar, toasts, connectivity indicator, auto-sync.
window.BSG = window.BSG || {};

window.BSG.ui = (function () {
  let user = null; // cached current user (null = not authenticated)

  function escape(s) {
    if (s == null) return '';
    return String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  }

  function fmtDate(s) {
    if (!s) return '—';
    const d = new Date(s.includes('T') ? s : s.replace(' ', 'T') + 'Z');
    if (isNaN(d)) return s;
    return d.toLocaleString(undefined, { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  }

  function severityBadge(sev) {
    return `<span class="badge sev sev-${escape(sev)}">${escape(sev || 'N/A')}</span>`;
  }

  function toast(msg, type = 'success') {
    let wrap = document.querySelector('.toast-wrap');
    if (!wrap) { wrap = document.createElement('div'); wrap.className = 'toast-wrap'; document.body.appendChild(wrap); }
    const bg = { success: 'text-bg-success', danger: 'text-bg-danger', warning: 'text-bg-warning', info: 'text-bg-primary' }[type] || 'text-bg-secondary';
    const el = document.createElement('div');
    el.className = `toast align-items-center ${bg} border-0 show mb-2`;
    el.role = 'alert';
    el.innerHTML = `<div class="d-flex"><div class="toast-body">${escape(msg)}</div>
      <button type="button" class="btn-close btn-close-white me-2 m-auto" onclick="this.closest('.toast').remove()"></button></div>`;
    wrap.appendChild(el);
    setTimeout(() => el.remove(), 4000);
  }

  async function loadUser() {
    try {
      const r = await BSG.api.get('/api/auth/me');
      user = r.user;
    } catch (_) { user = null; }
    return user;
  }

  async function guard() {
    await loadUser();
    if (!user) {
      const next = encodeURIComponent(location.pathname + location.search);
      location.replace(`/login.html?next=${next}`);
      return null;
    }
    return user;
  }

  function currentUser() { return user; }

  async function logout() {
    try { await BSG.api.post('/api/auth/logout'); } catch (_) {}
    user = null;
    location.href = '/login.html';
  }

  function navLink(href, label, key, active) {
    return `<li class="nav-item"><a class="nav-link ${active === key ? 'active' : ''}" href="${href}">${label}</a></li>`;
  }

  function renderNav(active) {
    const host = document.getElementById('app-nav');
    if (!host) return;
    let links = '';
    let right = '';
    if (user) {
      links += navLink('/dashboard.html', 'Dashboard', 'dashboard', active);
      links += navLink('/assessment.html', 'New Assessment', 'new', active);
      links += navLink('/history.html', 'History', 'history', active);
      links += navLink('/contact.html', 'Contact', 'contact', active);
      right = `
        <span id="net-indicator" class="text-white"></span>
        <div class="dropdown">
          <a class="btn btn-sm btn-light dropdown-toggle" data-bs-toggle="dropdown" href="#">
            <i class="bi bi-person-circle"></i> ${escape(user.full_name.split(' ')[0])}
          </a>
          <ul class="dropdown-menu dropdown-menu-end">
            <li><a class="dropdown-item" href="/profile.html"><i class="bi bi-gear"></i> Profile</a></li>
            <li><hr class="dropdown-divider"></li>
            <li><a class="dropdown-item" href="#" id="logout-btn"><i class="bi bi-box-arrow-right"></i> Log out</a></li>
          </ul>
        </div>`;
    } else {
      links += navLink('/', 'Home', 'home', active);
      links += navLink('/contact.html', 'Contact', 'contact', active);
      right = `<a class="btn btn-sm btn-light me-2" href="/login.html">Log in</a>
               <a class="btn btn-sm btn-outline-light" href="/register.html">Register</a>`;
    }

    host.innerHTML = `
      <nav class="navbar navbar-expand-lg navbar-bsg sticky-top">
        <div class="container">
          <a class="navbar-brand fw-bold d-flex align-items-center" href="${user ? '/dashboard.html' : '/'}">
            <span class="brand-logo">BS</span> BuildSafe Gaza
          </a>
          <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navmenu">
            <span class="navbar-toggler-icon"></span>
          </button>
          <div class="collapse navbar-collapse" id="navmenu">
            <ul class="navbar-nav me-auto mb-2 mb-lg-0">${links}</ul>
            <div class="d-flex align-items-center gap-3">${right}</div>
          </div>
        </div>
      </nav>`;

    const lo = document.getElementById('logout-btn');
    if (lo) lo.addEventListener('click', (e) => { e.preventDefault(); logout(); });
    updateNetIndicator();
  }

  async function updateNetIndicator() {
    const el = document.getElementById('net-indicator');
    if (!el) return;
    const online = navigator.onLine;
    let pending = 0;
    try { pending = await BSG.idb.countPending(); } catch (_) {}
    const dot = online ? '<span class="dot dot-online"></span>Online' : '<span class="dot dot-offline"></span>Offline';
    const badge = pending > 0 ? ` <span class="badge bg-warning text-dark pending-badge">${pending} pending</span>` : '';
    el.innerHTML = `<span id="net-indicator-inner">${dot}${badge}</span>`;
  }

  function initConnectivity() {
    window.addEventListener('online', async () => {
      toast('Back online — synchronizing…', 'info');
      await updateNetIndicator();
      if (window.BSG.sync) {
        const r = await BSG.sync.run();
        if (r && r.synced > 0) toast(`Synced ${r.synced} offline record(s).`, 'success');
      }
      await updateNetIndicator();
    });
    window.addEventListener('offline', () => { toast('You are offline — data will be saved on this device.', 'warning'); updateNetIndicator(); });
  }

  function registerSW() {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch((e) => console.warn('SW registration failed', e));
    }
  }

  return {
    escape, fmtDate, severityBadge, toast, loadUser, guard, currentUser, logout,
    renderNav, updateNetIndicator, initConnectivity, registerSW,
  };
})();
