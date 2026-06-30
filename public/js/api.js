// Thin fetch wrapper around the BuildSafe Gaza API
window.BSG = window.BSG || {};

window.BSG.api = (function () {
  async function req(method, path, body, isForm) {
    const opts = { method, headers: {}, credentials: 'same-origin' };
    if (isForm) {
      opts.body = body; // FormData — let the browser set the boundary
    } else if (body !== undefined) {
      opts.headers['Content-Type'] = 'application/json';
      opts.body = JSON.stringify(body);
    }
    const res = await fetch(path, opts);
    let data = null;
    const ct = res.headers.get('content-type') || '';
    if (ct.includes('application/json')) data = await res.json();
    if (!res.ok) {
      const err = new Error((data && data.error) || `Request failed (${res.status})`);
      err.status = res.status;
      err.data = data;
      throw err;
    }
    return data;
  }

  return {
    get: (p) => req('GET', p),
    post: (p, b) => req('POST', p, b),
    put: (p, b) => req('PUT', p, b),
    del: (p) => req('DELETE', p),
    upload: (p, formData) => req('POST', p, formData, true),
  };
})();
