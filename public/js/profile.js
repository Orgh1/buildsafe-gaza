(async () => {
  const user = await BSG.ui.guard();
  if (!user) return;
  BSG.ui.renderNav('');
  BSG.ui.initConnectivity();
  BSG.ui.registerSW();

  document.getElementById('full_name').value = user.full_name || '';
  document.getElementById('email').value = user.email || '';
  document.getElementById('phone').value = user.phone || '';
  document.getElementById('role').value = user.role || 'engineer';

  const pErr = document.getElementById('p-error');
  document.getElementById('profile-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    pErr.classList.add('d-none');
    try {
      await BSG.api.put('/api/profile', {
        full_name: document.getElementById('full_name').value.trim(),
        email: document.getElementById('email').value.trim(),
        phone: document.getElementById('phone').value.trim(),
      });
      BSG.ui.toast('Profile updated.', 'success');
    } catch (ex) {
      pErr.textContent = ex.message; pErr.classList.remove('d-none');
    }
  });

  const pwErr = document.getElementById('pw-error');
  document.getElementById('pw-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    pwErr.classList.add('d-none');
    try {
      await BSG.api.put('/api/profile/password', {
        current_password: document.getElementById('current_password').value,
        new_password: document.getElementById('new_password').value,
      });
      BSG.ui.toast('Password updated.', 'success');
      e.target.reset();
    } catch (ex) {
      pwErr.textContent = ex.message; pwErr.classList.remove('d-none');
    }
  });
})();
