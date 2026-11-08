/**
 * UNDANGAN V2 - Admin Dashboard Engine
 * Platform Undangan Digital Multi-Acara
 * "Satu Platform, Beragam Undangan"
 */

const $ = id => document.getElementById(id);
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

let invitations = [];
let activeInvitation = null;
let eventCategories = [];
let themesList = [];
let templatesList = [];
let currentSections = [];

// ====================================================================
// 1. API HELPER & AUTHENTICATION
// ====================================================================
async function api(url, opts = {}) {
  const res = await fetch(url, {
    ...opts,
    headers: {
      'content-type': 'application/json',
      ...(opts.headers || {})
    }
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || 'Permintaan gagal.');
  return data;
}

async function checkAuth() {
  try {
    await api('/api/admin/me');
    showDashboard();
  } catch {
    showLogin();
  }
}

function showLogin() {
  $('loginPanel').hidden = false;
  $('dashboardApp').hidden = true;
  $('adminTabs').hidden = true;
  $('invitationSwitcherWrap').hidden = true;
  $('logoutBtn').hidden = true;
}

function showDashboard() {
  $('loginPanel').hidden = true;
  $('dashboardApp').hidden = false;
  $('adminTabs').hidden = false;
  $('invitationSwitcherWrap').hidden = false;
  $('logoutBtn').hidden = false;
  loadInitialData();
}

$('loginForm').onsubmit = async e => {
  e.preventDefault();
  const status = $('loginStatus');
  status.textContent = 'Memeriksa kata sandi…';
  try {
    await api('/api/admin/login', {
      method: 'POST',
      body: JSON.stringify({ password: $('password').value })
    });
    $('password').value = '';
    status.textContent = '';
    showDashboard();
  } catch (err) {
    status.textContent = err.message;
  }
};

$('logoutBtn').onclick = async () => {
  await api('/api/admin/logout', { method: 'POST', body: '{}' }).catch(() => {});
  showLogin();
};

// ====================================================================
// 2. TABS NAVIGATION & INVITATION SWITCHER
// ====================================================================
document.querySelectorAll('.tab-btn').forEach(btn => {
  btn.onclick = () => {
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');

    const targetTabId = btn.dataset.tab;
    document.querySelectorAll('.admin-tab-content').forEach(section => {
      section.hidden = section.id !== targetTabId;
    });

    onTabSwitched(targetTabId);
  };
});

function onTabSwitched(tabId) {
  if (tabId === 'tabInvitations') renderInvitationsTable();
  if (tabId === 'tabCreateWizard') renderCreateCategoryGrid();
  if (tabId === 'tabCategories') loadCategoriesTab();
  if (tabId === 'tabThemes') loadThemeStudio();
  if (tabId === 'tabAnimations') loadAnimationsStudio();
  if (tabId === 'tabBackgrounds') loadBackgroundStudio();
  if (tabId === 'tabMusic') loadMusicStudio();
  if (tabId === 'tabSections') loadSectionBuilder();
  if (tabId === 'tabTemplates') loadTemplateManager();
  if (tabId === 'tabAssets') loadAssetGallery();
  if (tabId === 'tabGuests') loadGuestsTab();
  if (tabId === 'tabRsvp') loadRsvpTab();
  if (tabId === 'tabStats') loadStatsTab();
  if (tabId === 'tabSettings') loadSettingsTab();
  if (tabId === 'tabHistory') loadHistoryTab();
}

$('activeInvSelect').onchange = e => {
  const selectedId = Number(e.target.value);
  activeInvitation = invitations.find(x => x.id === selectedId) || null;
  updateActiveInvitationContext();
};

$('viewActiveInvBtn').onclick = () => {
  if (activeInvitation) {
    window.open(`/i/${encodeURIComponent(activeInvitation.slug)}?preview=1`, '_blank');
  }
};

function updateActiveInvitationContext() {
  if (!activeInvitation) return;
  const iframe = $('themePreviewIframe');
  if (iframe) {
    iframe.src = `/i/${encodeURIComponent(activeInvitation.slug)}?preview=1`;
  }
  const activeTabBtn = document.querySelector('.tab-btn.active');
  if (activeTabBtn) {
    onTabSwitched(activeTabBtn.dataset.tab);
  }
}

async function loadInitialData() {
  try {
    // 1. Muat kategori acara
    const catData = await api('/api/admin/categories');
    eventCategories = catData.categories || [];

    // Isi filter kategori pada tab Semua Undangan & modal edit
    const filterSelect = $('invCategoryFilter');
    filterSelect.innerHTML = '<option value="">Semua Kategori</option>' + eventCategories.map(c => `
      <option value="${c.code}">${c.icon} ${esc(c.name)}</option>
    `).join('');

    const editCatSelect = $('editCategoryCode');
    if (editCatSelect) {
      editCatSelect.innerHTML = eventCategories.map(c => `
        <option value="${c.code}">${c.icon} ${esc(c.name)}</option>
      `).join('');
    }

    // 2. Muat semua undangan
    const invData = await api('/api/admin/invitations');
    invitations = invData.invitations || [];

    const switcher = $('activeInvSelect');
    switcher.innerHTML = invitations.map(inv => {
      const catIcon = inv.category_icon || '💌';
      const label = inv.event_title || `${inv.groom_name} & ${inv.bride_name}`;
      return `<option value="${inv.id}">${catIcon} ${esc(label)} (/${esc(inv.slug)})</option>`;
    }).join('');

    if (!activeInvitation && invitations.length > 0) {
      activeInvitation = invitations[0];
    } else if (activeInvitation) {
      activeInvitation = invitations.find(x => x.id === activeInvitation.id) || invitations[0];
    }

    if (activeInvitation) switcher.value = activeInvitation.id;

    renderDashboardOverview();
    renderInvitationsTable();
    updateActiveInvitationContext();
  } catch (err) {
    alert('Gagal memuat data awal: ' + err.message);
  }
}

// ====================================================================
// 3. TAB 1: DASHBOARD OVERVIEW
// ====================================================================
function renderDashboardOverview() {
  $('dashTotalInv').textContent = invitations.length;
  $('dashTotalRsvp').textContent = invitations.reduce((acc, x) => acc + (x.rsvp_count || 0), 0);
  $('dashTotalAttend').textContent = invitations.reduce((acc, x) => acc + (x.attend_count || 0), 0);

  const container = $('dashInvitationList');
  if (invitations.length === 0) {
    container.innerHTML = '<p class="muted">Belum ada undangan. Mulai dengan membuat undangan baru!</p>';
    return;
  }

  container.innerHTML = invitations.map(inv => {
    const title = inv.event_title || (inv.groom_name ? `${inv.groom_name} & ${inv.bride_name}` : inv.slug);
    const catName = inv.category_name || 'Acara';
    const catIcon = inv.category_icon || '💌';

    return `
      <div class="inv-row">
        <div>
          <span style="font-size:18px;margin-right:6px">${catIcon}</span>
          <strong>${esc(title)}</strong>
          <small>/i/${esc(inv.slug)} · Kategori: ${esc(catName)} · ${inv.rsvp_count || 0} RSVP · ${inv.is_published ? '🟢 Terbit' : '🟡 Draf'}</small>
        </div>
        <div class="actions">
          <button class="mini-btn" onclick="selectAndSwitchTab(${inv.id}, 'tabThemes')">🎨 Tema</button>
          <button class="mini-btn" onclick="selectAndSwitchTab(${inv.id}, 'tabSections')">🧩 Seksi</button>
          <button class="mini-btn" onclick="selectAndSwitchTab(${inv.id}, 'tabGuests')">👥 Tamu</button>
          <button class="mini-btn" onclick="window.open('/i/${encodeURIComponent(inv.slug)}?preview=1', '_blank')">Lihat ↗</button>
        </div>
      </div>
    `;
  }).join('');
}

$('btnGoToCreateWizard').onclick = () => {
  document.querySelector('[data-tab="tabCreateWizard"]').click();
};

window.selectAndSwitchTab = (invId, tabId) => {
  activeInvitation = invitations.find(x => x.id === invId) || activeInvitation;
  $('activeInvSelect').value = activeInvitation.id;
  updateActiveInvitationContext();
  const tabBtn = document.querySelector(`.tab-btn[data-tab="${tabId}"]`);
  if (tabBtn) tabBtn.click();
};

// ====================================================================
// 4. TAB 2: SEMUA UNDANGAN (SEARCH & FILTER)
// ====================================================================
function renderInvitationsTable() {
  const container = $('fullInvitationList');
  const search = $('invSearchInput').value.toLowerCase().trim();
  const cat = $('invCategoryFilter').value;
  const status = $('invStatusFilter').value;

  let filtered = invitations;

  if (cat) {
    filtered = filtered.filter(x => x.category_code === cat);
  }
  if (status !== '') {
    filtered = filtered.filter(x => String(x.is_published) === status);
  }
  if (search) {
    filtered = filtered.filter(x => {
      const matchSlug = (x.slug || '').toLowerCase().includes(search);
      const matchTitle = (x.event_title || '').toLowerCase().includes(search);
      const matchGroom = (x.groom_name || '').toLowerCase().includes(search);
      const matchBride = (x.bride_name || '').toLowerCase().includes(search);
      return matchSlug || matchTitle || matchGroom || matchBride;
    });
  }

  if (filtered.length === 0) {
    container.innerHTML = '<p class="muted">Tidak ada undangan yang cocok dengan filter pencarian.</p>';
    return;
  }

  container.innerHTML = filtered.map(inv => {
    const title = inv.event_title || (inv.groom_name ? `${inv.groom_name} & ${inv.bride_name}` : inv.slug);
    const catName = inv.category_name || inv.category_code;
    const catIcon = inv.category_icon || '💌';

    return `
      <div class="inv-row">
        <div>
          <div style="display:flex;align-items:center;gap:6px">
            <span style="font-size:20px">${catIcon}</span>
            <strong style="font-size:15px">${esc(title)}</strong>
          </div>
          <small>Alamat: /i/${esc(inv.slug)} · Kategori: ${esc(catName)} · Tema: ${esc(inv.theme_code || 'emerald_gold')}</small>
          <div style="margin-top:4px">
            <span class="badge-attendance ${inv.is_published ? 'badge-hadir' : 'badge-ragu'}">
              ${inv.is_published ? 'Dipublikasikan' : 'Draf'}
            </span>
            <span style="font-size:11px;color:#6b7280;margin-left:8px">👁️ ${inv.view_count || 0} tayangan · 💌 ${inv.rsvp_count || 0} RSVP</span>
          </div>
        </div>
        <div class="actions">
          <button class="mini-btn" onclick="openEditInvitationModal(${inv.id})">✏️ Edit</button>
          <button class="mini-btn" onclick="duplicateInvitation(${inv.id})">📋 Gandakan</button>
          <button class="mini-btn" onclick="togglePublishInvitation(${inv.id}, ${inv.is_published ? 0 : 1})">
            ${inv.is_published ? 'Jadikan Draf' : 'Terbitkan'}
          </button>
          <button class="mini-btn" onclick="deleteInvitation(${inv.id}, '${esc(inv.slug)}')">🗑️ Hapus</button>
        </div>
      </div>
    `;
  }).join('');
}

$('invSearchInput').oninput = renderInvitationsTable;
$('invCategoryFilter').onchange = renderInvitationsTable;
$('invStatusFilter').onchange = renderInvitationsTable;

// ====================================================================
// 5. TAB 3: BUAT UNDANGAN BARU (MULTI-EVENT WIZARD)
// ====================================================================
function renderCreateCategoryGrid() {
  const container = $('createCategoryCardsGrid');
  container.innerHTML = eventCategories.map(cat => `
    <div class="card-panel" style="padding:16px;margin:0;cursor:pointer;border:2px solid #e5e7eb;text-align:center;transition:all 0.2s" onclick="selectWizardCategory('${cat.code}')" onmouseover="this.style.borderColor='var(--primary)'" onmouseout="this.style.borderColor='#e5e7eb'">
      <div style="font-size:36px;margin-bottom:8px">${cat.icon}</div>
      <strong style="font-size:15px;display:block;margin-bottom:4px;color:var(--primary)">${esc(cat.name)}</strong>
      <small style="color:#6b7280;font-size:12px;line-height:1.4;display:block">${esc(cat.description)}</small>
    </div>
  `).join('');
}

window.selectWizardCategory = async catCode => {
  const cat = eventCategories.find(x => x.code === catCode);
  if (!cat) return;

  $('wizCatCode').value = cat.code;
  $('wizardCatIcon').textContent = cat.icon;
  $('wizardCatName').textContent = `Buat Undangan: ${cat.name}`;
  $('wizardCatDesc').textContent = cat.description;

  // Auto-generate slug suggestion
  $('wizSlug').value = `${cat.code}-${Date.now().toString(36)}`;

  // Generate dynamic fields form based on category fields
  const fieldsWrap = $('wizDynamicFields');
  const fields = cat.fields || [];

  fieldsWrap.innerHTML = fields.map(f => {
    const isRequired = f.required ? 'required' : '';
    const reqStar = f.required ? '*' : '';

    if (f.type === 'textarea') {
      return `
        <div class="form-group wide">
          <label>${esc(f.label)}${reqStar}</label>
          <textarea id="wizField_${f.key}" class="form-control" rows="2" placeholder="${esc(f.placeholder || '')}" ${isRequired}></textarea>
        </div>
      `;
    } else if (f.type === 'select') {
      const options = (f.options || []).map(opt => `<option value="${esc(opt)}">${esc(opt)}</option>`).join('');
      return `
        <div class="form-group">
          <label>${esc(f.label)}${reqStar}</label>
          <select id="wizField_${f.key}" class="form-control">${options}</select>
        </div>
      `;
    } else {
      return `
        <div class="form-group">
          <label>${esc(f.label)}${reqStar}</label>
          <input type="${f.type || 'text'}" id="wizField_${f.key}" class="form-control" placeholder="${esc(f.placeholder || '')}" ${isRequired}>
        </div>
      `;
    }
  }).join('');

  // Load templates suitable for this category
  try {
    const tplData = await api(`/api/admin/templates?category=${cat.code}`);
    const tpls = tplData.templates || [];
    const tplSelect = $('wizTemplateSelect');
    tplSelect.innerHTML = '<option value="">-- Gunakan Susunan Seksi Standar --</option>' + tpls.map(t => `
      <option value="${t.id}">${esc(t.name)}</option>
    `).join('');
  } catch {}

  $('createEventFormWrap').hidden = false;
  $('createEventFormWrap').scrollIntoView({ behavior: 'smooth' });
};

$('btnCancelWizard').onclick = () => {
  $('createEventFormWrap').hidden = true;
};

$('wizardEventForm').onsubmit = async e => {
  e.preventDefault();
  const status = $('wizStatus');
  status.textContent = 'Menyimpan undangan…';

  const catCode = $('wizCatCode').value;
  const cat = eventCategories.find(x => x.code === catCode);
  const fields = cat?.fields || [];

  const eventData = {};
  for (const f of fields) {
    const el = $(`wizField_${f.key}`);
    if (el) eventData[f.key] = el.value.trim();
  }

  // Map to core fields for database compatibility
  const slug = $('wizSlug').value.trim();
  const groomName = eventData.groom_name || eventData.child_name || eventData.baby_name || eventData.person_name || eventData.graduate_name || eventData.business_name || eventData.community_name || eventData.speaker_name || eventData.event_title || 'Tuan Rumah';
  const brideName = eventData.bride_name || '';
  const groomParents = eventData.parents_name || eventData.groom_parents || eventData.family_name || eventData.owner_name || '';
  const brideParents = eventData.bride_parents || '';
  const eventDate = eventData.event_date || '';
  const eventTime = eventData.event_time || '';
  const venue = eventData.venue || '';
  const address = eventData.address || '';
  const mapsUrl = eventData.maps_url || '';
  const eventTitle = catCode === 'pernikahan' ? `${groomName} & ${brideName}` : (eventData.event_title || eventData.event_name || `${cat.name} ${groomName}`);

  const payload = {
    slug,
    category_code: catCode,
    event_title: eventTitle,
    event_data: eventData,
    groom_name: groomName,
    bride_name: brideName,
    groom_parents: groomParents,
    bride_parents: brideParents,
    event_date: eventDate,
    event_time: eventTime,
    venue,
    address,
    maps_url: mapsUrl,
    is_published: $('wizPublished').checked ? 1 : 0,
    template_id: $('wizTemplateSelect').value ? Number($('wizTemplateSelect').value) : null
  };

  try {
    const res = await api('/api/admin/invitations', {
      method: 'POST',
      body: JSON.stringify(payload)
    });

    status.textContent = '✓ Undangan berhasil dibuat! Mengalihkan ke Theme Studio…';
    await loadInitialData();
    selectAndSwitchTab(res.id, 'tabThemes');
    $('createEventFormWrap').hidden = true;
  } catch (err) {
    status.textContent = err.message;
  }
};

// ====================================================================
// 6. TAB 4: KATEGORI ACARA (CUSTOM EVENT BUILDER)
// ====================================================================
async function loadCategoriesTab() {
  try {
    const data = await api('/api/admin/categories');
    eventCategories = data.categories || [];
    renderCategoriesList();
  } catch (err) {
    alert(err.message);
  }
}

function renderCategoriesList() {
  const container = $('eventCategoriesList');
  container.innerHTML = eventCategories.map(cat => `
    <div class="card-panel" style="padding:16px;margin:0;display:flex;align-items:center;justify-content:space-between;gap:12px">
      <div style="display:flex;align-items:center;gap:14px">
        <span style="font-size:32px">${cat.icon}</span>
        <div>
          <div style="display:flex;align-items:center;gap:8px">
            <strong style="font-size:16px">${esc(cat.name)}</strong>
            <code style="font-size:11px;background:#f3f4f6;padding:2px 6px;border-radius:4px">${esc(cat.code)}</code>
            ${cat.is_builtin ? '<span style="font-size:10px;background:#dbeafe;color:#1e40af;padding:2px 6px;border-radius:10px">Bawaan</span>' : ''}
          </div>
          <small style="color:#6b7280;display:block;margin-top:2px">${esc(cat.description)} · Digunakan oleh ${cat.invitation_count || 0} undangan</small>
        </div>
      </div>
      <div class="actions">
        <button class="mini-btn" onclick="openEditCategoryModal(${cat.id})">✏️ Edit</button>
        <button class="mini-btn" onclick="duplicateCategory(${cat.id})">📋 Gandakan</button>
        ${!cat.is_builtin && cat.invitation_count === 0 ? `<button class="mini-btn" onclick="deleteCategory(${cat.id})">🗑️ Hapus</button>` : ''}
      </div>
    </div>
  `).join('');
}

$('btnOpenAddCategoryModal').onclick = () => {
  $('editCatId').value = '';
  $('modalCatTitle').textContent = 'Buat Kategori Acara Baru';
  $('catNameInput').value = '';
  $('catCodeInput').value = '';
  $('catIconInput').value = '🎉';
  $('catDescInput').value = '';
  $('catFieldsJsonInput').value = JSON.stringify([
    { key: 'event_title', label: 'Judul Acara', type: 'text', required: true },
    { key: 'host_name', label: 'Penyelenggara', type: 'text', required: true },
    { key: 'event_date', label: 'Tanggal Acara', type: 'date', required: true },
    { key: 'event_time', label: 'Waktu Acara', type: 'text', required: false },
    { key: 'venue', label: 'Lokasi Acara', type: 'text', required: false }
  ], null, 2);
  $('catModalStatus').textContent = '';
  $('modalCategory').hidden = false;
};

$('btnCloseCatModal').onclick = () => $('modalCategory').hidden = true;

window.openEditCategoryModal = async catId => {
  const cat = eventCategories.find(x => x.id === catId);
  if (!cat) return;

  $('editCatId').value = cat.id;
  $('modalCatTitle').textContent = `Edit Kategori: ${cat.name}`;
  $('catNameInput').value = cat.name;
  $('catCodeInput').value = cat.code;
  $('catIconInput').value = cat.icon;
  $('catDescInput').value = cat.description;
  $('catFieldsJsonInput').value = JSON.stringify(cat.fields || [], null, 2);
  $('catModalStatus').textContent = '';
  $('modalCategory').hidden = false;
};

$('formCategoryBuilder').onsubmit = async e => {
  e.preventDefault();
  const status = $('catModalStatus');
  status.textContent = 'Menyimpan kategori…';

  let fields = [];
  try {
    fields = JSON.parse($('catFieldsJsonInput').value || '[]');
  } catch {
    status.textContent = 'Format JSON kolom tidak valid.';
    return;
  }

  const catId = $('editCatId').value;
  const payload = {
    name: $('catNameInput').value.trim(),
    code: $('catCodeInput').value.trim(),
    icon: $('catIconInput').value.trim(),
    description: $('catDescInput').value.trim(),
    fields
  };

  try {
    if (catId) {
      await api(`/api/admin/categories/${catId}`, { method: 'PUT', body: JSON.stringify(payload) });
    } else {
      await api('/api/admin/categories', { method: 'POST', body: JSON.stringify(payload) });
    }
    $('modalCategory').hidden = true;
    await loadInitialData();
    await loadCategoriesTab();
  } catch (err) {
    status.textContent = err.message;
  }
};

window.duplicateCategory = async catId => {
  try {
    await api(`/api/admin/categories/${catId}/duplicate`, { method: 'POST' });
    await loadInitialData();
    await loadCategoriesTab();
  } catch (err) {
    alert(err.message);
  }
};

window.deleteCategory = async catId => {
  if (!confirm('Hapus kategori acara ini?')) return;
  try {
    await api(`/api/admin/categories/${catId}`, { method: 'DELETE' });
    await loadInitialData();
    await loadCategoriesTab();
  } catch (err) {
    alert(err.message);
  }
};

// ====================================================================
// 7. TAB 5: THEME STUDIO
// ====================================================================
async function loadThemeStudio() {
  if (!activeInvitation) return;
  try {
    const data = await api('/api/admin/themes');
    themesList = data.themes || [];
    renderThemePresets();
    populateThemeControls();
  } catch (err) {
    $('themeStatus').textContent = err.message;
  }
}

function renderThemePresets() {
  const container = $('themePresetGrid');
  const currentThemeCode = activeInvitation?.theme_code || 'emerald_gold';

  container.innerHTML = themesList.map(t => {
    const c = t.config?.colors || {};
    const isSelected = t.code === currentThemeCode;
    return `
      <div class="card-panel" style="padding:14px;border:2px solid ${isSelected ? 'var(--primary)' : '#e5e7eb'};cursor:pointer;position:relative" onclick="selectThemePreset('${esc(t.code)}')">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px">
          <strong style="font-size:13px">${esc(t.name)}</strong>
          ${isSelected ? '<span style="color:#15803d;font-size:11px;font-weight:700">✓ Aktif</span>' : ''}
        </div>
        <div style="display:flex;gap:4px;height:24px;border-radius:4px;overflow:hidden;margin-bottom:8px">
          <div style="flex:1;background:${c.primary || '#073f35'}"></div>
          <div style="flex:1;background:${c.gold || c.accent || '#d8b66a'}"></div>
          <div style="flex:1;background:${c.bg_content || '#f8f4e9'}"></div>
          <div style="flex:1;background:${c.text_primary || '#26352f'}"></div>
        </div>
        <small style="color:#6b7280;font-size:11px;line-height:1.4;display:block">${esc(t.description)}</small>
      </div>
    `;
  }).join('');
}

window.selectThemePreset = code => {
  const theme = themesList.find(x => x.code === code);
  if (!theme) return;

  activeInvitation.theme_code = code;
  const c = theme.config?.colors || {};
  const f = theme.config?.fonts || {};

  if (c.primary) $('colPrimary').value = c.primary;
  if (c.secondary) $('colSecondary').value = c.secondary;
  if (c.gold || c.accent) $('colGold').value = c.gold || c.accent;
  if (c.bg_content) $('colBgContent').value = c.bg_content;
  if (c.text_primary) $('colTextPrimary').value = c.text_primary;
  if (c.text_muted) $('colTextMuted').value = c.text_muted;
  if (c.btn_bg && c.btn_bg.startsWith('#')) $('colBtnBg').value = c.btn_bg;
  if (c.btn_text) $('colBtnText').value = c.btn_text;

  if (f.heading) $('selectHeadingFont').value = f.heading;
  if (f.body) $('selectBodyFont').value = f.body;

  renderThemePresets();
};

function populateThemeControls() {
  const customTheme = safeJson(activeInvitation.custom_theme_json, {});
  const c = customTheme.colors || {};

  if (c.primary) $('colPrimary').value = c.primary;
  if (c.secondary) $('colSecondary').value = c.secondary;
  if (c.gold || c.accent) $('colGold').value = c.gold || c.accent;
  if (c.bg_content) $('colBgContent').value = c.bg_content;
  if (c.text_primary) $('colTextPrimary').value = c.text_primary;
  if (c.text_muted) $('colTextMuted').value = c.text_muted;

  const design = safeJson(activeInvitation.design_settings_json, {});
  if (design.heading_font) $('selectHeadingFont').value = design.heading_font;
  if (design.body_font) $('selectBodyFont').value = design.body_font;
  if (design.button_radius) $('selectBtnShape').value = design.button_radius;
  if (design.photo_frame) $('selectPhotoFrame').value = design.photo_frame;
}

$('btnApplyThemeToInv').onclick = async () => {
  const status = $('themeStatus');
  status.textContent = 'Menyimpan tema…';

  const customTheme = {
    colors: {
      primary: $('colPrimary').value,
      secondary: $('colSecondary').value,
      gold: $('colGold').value,
      accent: $('colGold').value,
      bg_content: $('colBgContent').value,
      text_primary: $('colTextPrimary').value,
      text_muted: $('colTextMuted').value,
      btn_bg: $('colBtnBg').value,
      btn_text: $('colBtnText').value
    },
    fonts: {
      heading: $('selectHeadingFont').value,
      body: $('selectBodyFont').value
    }
  };

  const designSettings = {
    heading_font: $('selectHeadingFont').value,
    body_font: $('selectBodyFont').value,
    button_radius: $('selectBtnShape').value,
    photo_frame: $('selectPhotoFrame').value
  };

  try {
    await api(`/api/admin/invitations/${activeInvitation.id}`, {
      method: 'PUT',
      body: JSON.stringify({
        ...activeInvitation,
        theme_code: activeInvitation.theme_code || 'emerald_gold',
        custom_theme_json: customTheme,
        design_settings_json: designSettings
      })
    });

    activeInvitation.custom_theme_json = JSON.stringify(customTheme);
    activeInvitation.design_settings_json = JSON.stringify(designSettings);

    status.textContent = '✓ Tema berhasil diperbarui pada undangan.';
    $('themePreviewIframe').contentWindow.location.reload();
  } catch (err) {
    status.textContent = err.message;
  }
};

$('btnSaveCustomTheme').onclick = async () => {
  const name = prompt('Nama tema kustom baru:');
  if (!name) return;

  const customConfig = {
    colors: {
      primary: $('colPrimary').value,
      secondary: $('colSecondary').value,
      gold: $('colGold').value,
      bg_content: $('colBgContent').value,
      text_primary: $('colTextPrimary').value,
      text_muted: $('colTextMuted').value,
      btn_bg: $('colBtnBg').value,
      btn_text: $('colBtnText').value
    },
    fonts: {
      heading: $('selectHeadingFont').value,
      body: $('selectBodyFont').value
    }
  };

  try {
    await api('/api/admin/themes', {
      method: 'POST',
      body: JSON.stringify({ name, description: 'Tema kustom buatan admin', config: customConfig })
    });
    await loadThemeStudio();
    alert('Tema kustom berhasil disimpan.');
  } catch (err) {
    alert(err.message);
  }
};

$('prevMobileBtn').onclick = () => {
  $('themePreviewIframe').className = 'preview-iframe';
  $('prevMobileBtn').style.background = '#073f35'; $('prevMobileBtn').style.color = 'white';
  $('prevTabletBtn').style.background = ''; $('prevTabletBtn').style.color = '';
};
$('prevTabletBtn').onclick = () => {
  $('themePreviewIframe').className = 'preview-iframe tablet';
  $('prevTabletBtn').style.background = '#073f35'; $('prevTabletBtn').style.color = 'white';
  $('prevMobileBtn').style.background = ''; $('prevMobileBtn').style.color = '';
};
$('prevReloadBtn').onclick = () => $('themePreviewIframe').contentWindow.location.reload();

// ====================================================================
// 8. TAB 6: ANIMATION STUDIO
// ====================================================================
function loadAnimationsStudio() {
  if (!activeInvitation) return;
  const anim = safeJson(activeInvitation.animation_settings_json, {
    enabled: true,
    opening: { type: 'envelope', duration: 1.0 },
    text: { type: 'fade_up' },
    photo: { type: 'ken_burns' },
    ornament: { type: 'gold_dust' },
    intensity: 'moderate'
  });

  $('animMasterToggle').checked = anim.enabled !== false;
  if (anim.opening?.type) $('animOpeningSelect').value = anim.opening.type;
  if (anim.text?.type) $('animTextSelect').value = anim.text.type;
  if (anim.photo?.type) $('animPhotoSelect').value = anim.photo.type;
  if (anim.ornament?.type) $('animOrnamentSelect').value = anim.ornament.type;
  if (anim.opening?.duration) {
    $('animSpeedSlider').value = anim.opening.duration;
    $('animSpeedVal').textContent = anim.opening.duration + 's';
  }
  if (anim.intensity) $('animIntensitySelect').value = anim.intensity;
}

$('animSpeedSlider').oninput = e => {
  $('animSpeedVal').textContent = e.target.value + 's';
};

$('btnSaveAnimations').onclick = async () => {
  const status = $('animStatus');
  status.textContent = 'Menyimpan animasi…';

  const animPayload = {
    enabled: $('animMasterToggle').checked,
    reduce_motion_respect: true,
    opening: {
      type: $('animOpeningSelect').value,
      duration: Number($('animSpeedSlider').value)
    },
    text: { type: $('animTextSelect').value },
    photo: { type: $('animPhotoSelect').value },
    ornament: { type: $('animOrnamentSelect').value },
    intensity: $('animIntensitySelect').value
  };

  try {
    await api(`/api/admin/invitations/${activeInvitation.id}`, {
      method: 'PUT',
      body: JSON.stringify({
        ...activeInvitation,
        animation_settings_json: animPayload
      })
    });
    activeInvitation.animation_settings_json = JSON.stringify(animPayload);
    status.textContent = '✓ Pengaturan animasi berhasil disimpan.';
  } catch (err) {
    status.textContent = err.message;
  }
};

$('btnTestAnimation').onclick = () => {
  if (activeInvitation) {
    window.open(`/i/${encodeURIComponent(activeInvitation.slug)}?preview=1`, '_blank');
  }
};

// ====================================================================
// 9. TAB 7: BACKGROUND & ORNAMEN STUDIO
// ====================================================================
function loadBackgroundStudio() {
  if (!activeInvitation) return;
  const bg = safeJson(activeInvitation.background_settings_json, {
    type: 'gradient',
    pattern: 'arabesque',
    particles: 'gold_dust',
    show_floral_corner: true,
    show_islamic_arch: true,
    divider_style: 'diamond'
  });

  if (bg.type) $('bgTypeSelect').value = bg.type;
  if (bg.pattern) $('bgPatternSelect').value = bg.pattern;
  if (bg.image_url) $('bgImageUrlInput').value = bg.image_url;
  if (bg.divider_style) $('dividerStyleSelect').value = bg.divider_style;
  $('showFloralCorners').checked = bg.show_floral_corner !== false;
  $('showIslamicArch').checked = bg.show_islamic_arch !== false;
}

$('btnSaveBackgrounds').onclick = async () => {
  const status = $('bgStatus');
  status.textContent = 'Menyimpan…';

  const bgPayload = {
    type: $('bgTypeSelect').value,
    pattern: $('bgPatternSelect').value,
    image_url: $('bgImageUrlInput').value.trim(),
    divider_style: $('dividerStyleSelect').value,
    show_floral_corner: $('showFloralCorners').checked,
    show_islamic_arch: $('showIslamicArch').checked
  };

  try {
    await api(`/api/admin/invitations/${activeInvitation.id}`, {
      method: 'PUT',
      body: JSON.stringify({
        ...activeInvitation,
        background_settings_json: bgPayload
      })
    });
    activeInvitation.background_settings_json = JSON.stringify(bgPayload);
    status.textContent = '✓ Pengaturan latar belakang berhasil disimpan.';
  } catch (err) {
    status.textContent = err.message;
  }
};

// ====================================================================
// 10. TAB 8: MUSIC & SOUND STUDIO
// ====================================================================
function loadMusicStudio() {
  if (!activeInvitation) return;
  const sound = safeJson(activeInvitation.sound_settings_json, {
    enabled: true,
    music_url: activeInvitation.music_url || '',
    volume: 0.75,
    autoplay_on_open: true,
    button_icon: 'vinyl',
    button_pos: 'bottom-right'
  });

  $('musicEnableToggle').checked = sound.enabled !== false;
  $('musicUrlInput').value = sound.music_url || activeInvitation.music_url || '';
  if (sound.volume !== undefined) {
    $('musicVolumeSlider').value = sound.volume;
    $('musicVolumeVal').textContent = Math.round(sound.volume * 100) + '%';
  }
  if (sound.button_icon) $('musicIconSelect').value = sound.button_icon;
  if (sound.button_pos) $('musicPosSelect').value = sound.button_pos;
  $('musicAutoplayCheck').checked = sound.autoplay_on_open !== false;
}

$('musicVolumeSlider').oninput = e => {
  $('musicVolumeVal').textContent = Math.round(e.target.value * 100) + '%';
};

$('musicPresetSelect').onchange = e => {
  if (e.target.value !== 'custom') {
    $('musicUrlInput').value = e.target.value;
  }
};

$('btnSaveMusic').onclick = async () => {
  const status = $('musicStatus');
  status.textContent = 'Menyimpan…';

  const soundPayload = {
    enabled: $('musicEnableToggle').checked,
    music_url: $('musicUrlInput').value.trim(),
    volume: Number($('musicVolumeSlider').value),
    autoplay_on_open: $('musicAutoplayCheck').checked,
    button_icon: $('musicIconSelect').value,
    button_pos: $('musicPosSelect').value
  };

  try {
    await api(`/api/admin/invitations/${activeInvitation.id}`, {
      method: 'PUT',
      body: JSON.stringify({
        ...activeInvitation,
        music_url: soundPayload.music_url,
        sound_settings_json: soundPayload
      })
    });
    activeInvitation.music_url = soundPayload.music_url;
    activeInvitation.sound_settings_json = JSON.stringify(soundPayload);
    status.textContent = '✓ Pengaturan musik berhasil disimpan.';
  } catch (err) {
    status.textContent = err.message;
  }
};

// ====================================================================
// 11. TAB 9: SECTION BUILDER (ADAPTIF MULTI-ACARA)
// ====================================================================
async function loadSectionBuilder() {
  if (!activeInvitation) return;
  try {
    const data = await api(`/api/admin/invitations/${activeInvitation.id}/sections`);
    currentSections = data.sections || [];
    renderSectionBuilderList();
  } catch (err) {
    $('sectionBuilderStatus').textContent = err.message;
  }
}

function renderSectionBuilderList() {
  const container = $('sectionBuilderList');
  if (currentSections.length === 0) {
    container.innerHTML = '<p class="muted">Belum ada seksi pada undangan ini. Klik "+ Tambah Bagian Baru".</p>';
    return;
  }

  const iconMap = {
    cover: '👑', salam: '🕊️', profile: '👫', profile_person: '👤', profile_child: '👦', profile_baby: '👶', profile_speaker: '🎙️',
    description: '📜', akad: '💍', reception: '🎉', event_detail: '📅', rundown: '📋', countdown: '⏳', location: '📍',
    story: '📖', gallery: '🖼️', video: '🎬', music: '🎶', rsvp: '📝', guestbook: '💬', envelope: '🎁', health_protocol: '✨', closing: '❤️'
  };

  container.innerHTML = currentSections.map((sec, idx) => `
    <div class="card-panel" style="padding:14px;margin-bottom:0;display:flex;align-items:center;justify-content:space-between;gap:12px;opacity:${sec.is_visible ? 1 : 0.6}">
      <div style="display:flex;align-items:center;gap:12px">
        <span style="font-size:22px">${iconMap[sec.key] || '📄'}</span>
        <div>
          <strong>${esc(sec.title || sec.key.toUpperCase())}</strong>
          <small style="display:block;color:#6b7280">${esc(sec.subtitle || `Komponen: ${sec.key}`)} · Urutan: #${sec.order || (idx + 1)}</small>
        </div>
      </div>
      <div class="actions">
        <button class="mini-btn" onclick="moveSection(${idx}, -1)" ${idx === 0 ? 'disabled' : ''}>▲ Naik</button>
        <button class="mini-btn" onclick="moveSection(${idx}, 1)" ${idx === currentSections.length - 1 ? 'disabled' : ''}>▼ Turun</button>
        <button class="mini-btn" onclick="toggleSectionVisibility(${sec.id}, ${sec.is_visible ? 0 : 1})">
          ${sec.is_visible ? '👁️ Tampil' : '👁️‍🗨️ Sembunyi'}
        </button>
        <button class="mini-btn" onclick="openEditSectionModal(${sec.id})">✏️ Edit Isi</button>
        <button class="mini-btn" onclick="deleteSectionItem(${sec.id})">🗑️</button>
      </div>
    </div>
  `).join('');
}

window.moveSection = (index, delta) => {
  const targetIndex = index + delta;
  if (targetIndex < 0 || targetIndex >= currentSections.length) return;
  const temp = currentSections[index];
  currentSections[index] = currentSections[targetIndex];
  currentSections[targetIndex] = temp;
  renderSectionBuilderList();
};

window.toggleSectionVisibility = (secId, newState) => {
  const sec = currentSections.find(x => x.id === secId);
  if (sec) {
    sec.is_visible = newState;
    renderSectionBuilderList();
  }
};

$('btnSaveSectionOrder').onclick = async () => {
  const status = $('sectionBuilderStatus');
  status.textContent = 'Menyimpan urutan seksi…';
  try {
    await api(`/api/admin/invitations/${activeInvitation.id}/sections`, {
      method: 'PUT',
      body: JSON.stringify({ sections: currentSections })
    });
    status.textContent = '✓ Urutan seksi berhasil disimpan.';
    await loadSectionBuilder();
  } catch (err) {
    status.textContent = err.message;
  }
};

window.deleteSectionItem = async secId => {
  if (!confirm('Hapus komponen seksi ini dari undangan?')) return;
  try {
    await api(`/api/admin/invitations/${activeInvitation.id}/sections/${secId}`, { method: 'DELETE' });
    await loadSectionBuilder();
  } catch (err) {
    alert(err.message);
  }
};

$('btnOpenAddSectionModal').onclick = () => {
  const choices = [
    { key: 'cover', title: 'Cover Sambutan', desc: 'Layar sambutan & nama tamu' },
    { key: 'salam', title: 'Salam & Doa Pembuka', desc: 'Basmalah, ayat suci, atau salam' },
    { key: 'profile_person', title: 'Profil Tokoh / Subjek', desc: 'Foto, nama, dan biografi singkat' },
    { key: 'description', title: 'Deskripsi Acara', desc: 'Latar belakang & narasi kegiatan' },
    { key: 'event_detail', title: 'Waktu & Tempat Pelaksanaan', desc: 'Jadwal detail pelaksanaan' },
    { key: 'rundown', title: 'Susunan Acara (Rundown)', desc: 'Tabel jadwal jam per jam' },
    { key: 'countdown', title: 'Countdown Timer', desc: 'Hitung mundur hari bahagia' },
    { key: 'location', title: 'Peta & Petunjuk Lokasi', desc: 'Google Maps & Waze' },
    { key: 'gallery', title: 'Galeri Foto Momen', desc: 'Foto dokumentasi & kenangan' },
    { key: 'video', title: 'Video Acara / Teaser', desc: 'Penyematan YouTube / MP4' },
    { key: 'rsvp', title: 'Formulir RSVP', desc: 'Konfirmasi kehadiran online' },
    { key: 'guestbook', title: 'Buku Tamu & Ucapan', desc: 'Umpan ucapan selamat & doa' },
    { key: 'envelope', title: 'Tanda Kasih / Hadiah', desc: 'Rekening bank & kado fisik' },
    { key: 'health_protocol', title: 'Kenyamanan Acara', desc: 'Panduan dresscode & tata tertib' },
    { key: 'closing', title: 'Penutup & Terima Kasih', desc: 'Salam penutup dan tanda tangan' }
  ];

  $('componentChoicesGrid').innerHTML = choices.map(c => `
    <div class="card-panel" style="padding:12px;margin:0;cursor:pointer;border:1px solid #e5e7eb" onclick="addNewSectionKey('${c.key}', '${esc(c.title)}')">
      <strong>${esc(c.title)}</strong>
      <small style="display:block;color:#6b7280;margin-top:2px">${esc(c.desc)}</small>
    </div>
  `).join('');

  $('modalAddSection').hidden = false;
};

$('btnCloseAddSection').onclick = () => $('modalAddSection').hidden = true;

window.addNewSectionKey = async (key, defaultTitle) => {
  $('modalAddSection').hidden = true;
  try {
    await api(`/api/admin/invitations/${activeInvitation.id}/sections`, {
      method: 'POST',
      body: JSON.stringify({
        section_key: key,
        title: defaultTitle,
        subtitle: '',
        content: {},
        is_visible: 1
      })
    });
    await loadSectionBuilder();
  } catch (err) {
    alert(err.message);
  }
};

window.openEditSectionModal = secId => {
  const sec = currentSections.find(x => x.id === secId);
  if (!sec) return;

  $('editSectionId').value = sec.id;
  $('editSectionModalTitle').textContent = `Edit Seksi: ${sec.title || sec.key}`;
  $('secEditTitle').value = sec.title || '';
  $('secEditSubtitle').value = sec.subtitle || '';

  const dynamicWrap = $('secDynamicFieldsContainer');
  dynamicWrap.innerHTML = generateDynamicFieldsForSection(sec);

  $('modalEditSection').hidden = false;
};

$('btnCloseEditSection').onclick = () => $('modalEditSection').hidden = true;

function generateDynamicFieldsForSection(sec) {
  const c = sec.content || {};
  switch (sec.key) {
    case 'envelope':
      return `
        <div class="form-group" style="margin-top:12px">
          <label>Daftar Rekening Bank &amp; E-Wallet (JSON):</label>
          <textarea id="secAccountsJson" class="form-control" rows="4">${esc(JSON.stringify(c.accounts || [], null, 2))}</textarea>
          <small style="color:#6b7280">Format: [{"bank":"BCA", "number":"123456", "holder":"Nama"}]</small>
        </div>
        <div class="form-group">
          <label>Alamat Kirim Kado Fisik:</label>
          <input id="secShippingAddr" class="form-control" value="${esc(c.shipping_address || '')}">
        </div>
      `;
    case 'event_detail':
    case 'akad':
    case 'reception':
      return `
        <div class="form-group"><label>Tanggal:</label><input id="secEventDate" class="form-control" value="${esc(c.date || '')}"></div>
        <div class="form-group"><label>Waktu Acara:</label><input id="secEventTime" class="form-control" value="${esc(c.time || '')}"></div>
        <div class="form-group"><label>Tempat / Gedung:</label><input id="secVenue" class="form-control" value="${esc(c.venue || '')}"></div>
        <div class="form-group"><label>Alamat Lengkap:</label><input id="secAddress" class="form-control" value="${esc(c.address || '')}"></div>
        <div class="form-group"><label>Dress Code:</label><input id="secDresscode" class="form-control" value="${esc(c.dresscode || '')}"></div>
      `;
    case 'rundown':
      return `
        <div class="form-group" style="margin-top:12px">
          <label>Susunan Acara / Rundown (JSON):</label>
          <textarea id="secRundownJson" class="form-control" rows="4">${esc(JSON.stringify(c.items || [
            { time: "09.00 - 09.30", title: "Registrasi & Pembukaan" },
            { time: "09.30 - 11.00", title: "Acara Inti" },
            { time: "11.00 - selesai", title: "Ramah Tamah & Doa Penutup" }
          ], null, 2))}</textarea>
        </div>
      `;
    default:
      return `
        <div class="form-group" style="margin-top:12px">
          <label>Konten Teks Seksi:</label>
          <textarea id="secGeneralContent" class="form-control" rows="3">${esc(c.intro || c.message || c.note || c.bio || '')}</textarea>
        </div>
      `;
  }
}

$('formEditSectionDetails').onsubmit = async e => {
  e.preventDefault();
  const secId = Number($('editSectionId').value);
  const sec = currentSections.find(x => x.id === secId);
  if (!sec) return;

  sec.title = $('secEditTitle').value.trim();
  sec.subtitle = $('secEditSubtitle').value.trim();

  if (sec.key === 'envelope') {
    try {
      sec.content.accounts = JSON.parse($('secAccountsJson').value || '[]');
    } catch {
      alert('Format JSON rekening tidak valid.');
      return;
    }
    sec.content.shipping_address = $('secShippingAddr').value.trim();
  } else if (sec.key === 'event_detail' || sec.key === 'akad' || sec.key === 'reception') {
    sec.content.date = $('secEventDate').value.trim();
    sec.content.time = $('secEventTime').value.trim();
    sec.content.venue = $('secVenue').value.trim();
    sec.content.address = $('secAddress').value.trim();
    sec.content.dresscode = $('secDresscode').value.trim();
  } else if (sec.key === 'rundown') {
    try {
      sec.content.items = JSON.parse($('secRundownJson').value || '[]');
    } catch {
      alert('Format JSON rundown tidak valid.');
      return;
    }
  } else if ($('secGeneralContent')) {
    sec.content.intro = $('secGeneralContent').value.trim();
  }

  try {
    await api(`/api/admin/invitations/${activeInvitation.id}/sections/${sec.id}`, {
      method: 'PUT',
      body: JSON.stringify(sec)
    });
    $('modalEditSection').hidden = true;
    await loadSectionBuilder();
  } catch (err) {
    alert(err.message);
  }
};

// ====================================================================
// 12. TAB 10: TEMPLATE MANAGER (MULTI-ACARA)
// ====================================================================
async function loadTemplateManager() {
  try {
    const data = await api('/api/admin/templates');
    templatesList = data.templates || [];
    renderTemplateFilters();
    renderTemplatesGrid();
  } catch (err) {
    alert(err.message);
  }
}

function renderTemplateFilters() {
  const container = $('templateCategoryFilters');
  container.innerHTML = `
    <button class="mini-btn active" onclick="filterTemplatesByCategory('')">Semua Kategori</button>
    ${eventCategories.map(c => `<button class="mini-btn" onclick="filterTemplatesByCategory('${c.code}')">${c.icon} ${esc(c.name)}</button>`).join('')}
  `;
}

window.filterTemplatesByCategory = catCode => {
  document.querySelectorAll('#templateCategoryFilters button').forEach(b => b.classList.remove('active'));
  event.target.classList.add('active');
  renderTemplatesGrid(catCode);
};

function renderTemplatesGrid(catFilter = '') {
  const container = $('templateCardGrid');
  let filtered = templatesList;
  if (catFilter) filtered = filtered.filter(x => x.category_code === catFilter);

  if (filtered.length === 0) {
    container.innerHTML = '<p class="muted">Belum ada template pada kategori ini.</p>';
    return;
  }

  container.innerHTML = filtered.map(t => `
    <div class="card-panel" style="padding:16px">
      <div style="height:110px;background:#073f35;border-radius:6px;display:flex;align-items:center;justify-content:center;color:#f0d99e;font-size:24px;margin-bottom:12px;overflow:hidden">
        ${t.thumbnail_url ? `<img src="${esc(t.thumbnail_url)}" style="width:100%;height:100%;object-fit:cover">` : '💌'}
      </div>
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:4px">
        <h3 style="font-size:16px;margin:0">${esc(t.name)}</h3>
        <code style="font-size:10px;background:#f3f4f6;padding:2px 6px;border-radius:4px">${esc(t.category_code || 'umum')}</code>
      </div>
      <small style="color:#6b7280;display:block;margin-bottom:12px">${esc(t.description || 'Desain siap pakai')}</small>
      <div class="actions">
        <button class="mini-btn" onclick="applyTemplateToActiveInv(${t.id}, '${esc(t.name)}')">Terapkan ke Undangan</button>
        <button class="mini-btn" onclick="deleteTemplate(${t.id})">Hapus</button>
      </div>
    </div>
  `).join('');
}

$('btnSaveAsTemplate').onclick = async () => {
  if (!activeInvitation) return;
  const title = activeInvitation.event_title || `${activeInvitation.groom_name} & ${activeInvitation.bride_name}`;
  const name = prompt('Nama template baru:', `Template ${title}`);
  if (!name) return;

  try {
    await api('/api/admin/templates', {
      method: 'POST',
      body: JSON.stringify({
        name,
        category_code: activeInvitation.category_code || 'pernikahan',
        description: `Template dari undangan /i/${activeInvitation.slug}`,
        from_invitation_id: activeInvitation.id
      })
    });
    await loadTemplateManager();
    alert('Desain undangan berhasil disimpan sebagai template.');
  } catch (err) {
    alert(err.message);
  }
};

window.applyTemplateToActiveInv = async (tplId, tplName) => {
  if (!confirm(`Terapkan template "${tplName}" ke undangan aktif? Ini akan mengganti tema dan susunan seksi pada undangan aktif.`)) return;
  try {
    await api(`/api/admin/templates/${tplId}/apply`, {
      method: 'POST',
      body: JSON.stringify({ invitation_id: activeInvitation.id })
    });
    await loadInitialData();
    alert('Template berhasil diterapkan.');
  } catch (err) {
    alert(err.message);
  }
};

window.deleteTemplate = async tplId => {
  if (!confirm('Hapus template ini?')) return;
  try {
    await api(`/api/admin/templates/${tplId}`, { method: 'DELETE' });
    await loadTemplateManager();
  } catch (err) {
    alert(err.message);
  }
};

// ====================================================================
// 13. TAB 11: GALERI ASET
// ====================================================================
async function loadAssetGallery(category = '') {
  try {
    const url = `/api/admin/assets${category ? `?category=${category}` : ''}`;
    const data = await api(url);
    renderAssetGrid(data.assets || []);
  } catch (err) {
    alert(err.message);
  }
}

function renderAssetGrid(assets) {
  const container = $('assetGrid');
  if (assets.length === 0) {
    container.innerHTML = '<p class="muted">Belum ada aset dalam kategori ini.</p>';
    return;
  }

  container.innerHTML = assets.map(a => `
    <div class="card-panel" style="padding:12px;text-align:center">
      <div style="height:80px;background:#f3f4f6;border-radius:6px;display:flex;align-items:center;justify-content:center;margin-bottom:8px;overflow:hidden">
        ${a.category.startsWith('ornament') || a.category === 'pattern' ? `<img src="${esc(a.asset_url)}" style="max-height:60px;max-width:80%">` : (a.category === 'audio' ? '🎵' : '📄')}
      </div>
      <strong style="font-size:12px;display:block;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${esc(a.name)}</strong>
      <small style="color:#6b7280;font-size:10px">${esc(a.category)}</small>
      <div style="margin-top:8px">
        <button class="mini-btn" onclick="copyAssetUrl('${esc(a.asset_url)}')">Salin URL</button>
      </div>
    </div>
  `).join('');
}

window.copyAssetUrl = async url => {
  await navigator.clipboard.writeText(url);
  alert('URL aset tersalin ke clipboard.');
};

// ====================================================================
// 14. TAB 12: DAFTAR TAMU & TAB 13: RSVP & TAB 14: STATS
// ====================================================================
async function loadGuestsTab() {
  if (!activeInvitation) return;
  try {
    const data = await api(`/api/admin/invitations/${activeInvitation.id}/guests`);
    const container = $('adminGuestList');
    const guests = data.guests || [];

    if (guests.length === 0) {
      container.innerHTML = '<p class="muted">Belum ada tamu yang ditambahkan untuk undangan ini.</p>';
      return;
    }

    container.innerHTML = guests.map(g => {
      const personalLink = `${location.origin}/i/${encodeURIComponent(activeInvitation.slug)}?to=${encodeURIComponent(g.guest_name)}&token=${encodeURIComponent(g.guest_token)}`;
      const title = activeInvitation.event_title || `${activeInvitation.groom_name} & ${activeInvitation.bride_name}`;
      const waMsg = `Kepada Yth. Bapak/Ibu/Saudara/i *${g.guest_name}*,\n\nTanpa mengurangi rasa hormat, perkenankan kami mengundang Anda untuk hadir di acara kami:\n*${title}*\n\nBuka link undangan personal Anda:\n${personalLink}\n\nKehadiran dan doa Anda sangat berarti bagi kami.`;

      return `
        <div class="guest-row">
          <div>
            <strong>${esc(g.guest_name)}</strong>
            <code style="word-break:break-all">${esc(personalLink)}</code>
            ${g.attendance ? `<small style="display:block;margin-top:2px;color:#15803d">Status RSVP: ${esc(g.attendance)} (${g.guest_count} orang)</small>` : ''}
          </div>
          <div class="actions">
            <button class="mini-btn" onclick="copyPersonalLink('${esc(personalLink)}')">📋 Salin Link</button>
            <button class="mini-btn" onclick="window.open('https://wa.me/?text=${encodeURIComponent(waMsg)}', '_blank')">💬 Kirim WA</button>
            <button class="mini-btn" onclick="deleteGuest(${g.id})">🗑️</button>
          </div>
        </div>
      `;
    }).join('');
  } catch (err) {
    alert(err.message);
  }
}

$('bulkGuestForm').onsubmit = async e => {
  e.preventDefault();
  const input = $('bulkGuestNames').value.trim();
  if (!input) return;

  try {
    await api(`/api/admin/invitations/${activeInvitation.id}/guests`, {
      method: 'POST',
      body: JSON.stringify({ guest_names: input })
    });
    $('bulkGuestNames').value = '';
    await loadGuestsTab();
  } catch (err) {
    alert(err.message);
  }
};

window.copyPersonalLink = async link => {
  await navigator.clipboard.writeText(link);
  alert('Link personal tamu tersalin ke clipboard.');
};

window.deleteGuest = async guestId => {
  if (!confirm('Hapus tamu ini?')) return;
  try {
    await api(`/api/admin/guests/${guestId}`, { method: 'DELETE' });
    await loadGuestsTab();
  } catch (err) {
    alert(err.message);
  }
};

async function loadRsvpTab() {
  if (!activeInvitation) return;
  try {
    const data = await api(`/api/admin/invitations/${activeInvitation.id}/rsvps`);
    const rsvps = data.rsvps || [];
    const sum = data.summary || {};

    $('adminRsvpSummary').innerHTML = `
      <div class="stat"><span>Total Respon</span><b>${sum.total_rsvp || 0}</b></div>
      <div class="stat"><span>Hadir</span><b style="color:#dcfce7">${sum.hadir_guests || 0} orang</b></div>
      <div class="stat"><span>Berhalangan</span><b style="color:#fecaca">${sum.tidak_hadir_guests || 0}</b></div>
    `;

    const container = $('adminRsvpList');
    if (rsvps.length === 0) {
      container.innerHTML = '<p class="muted">Belum ada konfirmasi kehadiran (RSVP) yang masuk.</p>';
      return;
    }

    container.innerHTML = rsvps.map(r => `
      <div class="rsvp-row">
        <div style="display:flex;justify-content:space-between">
          <strong>${esc(r.guest_name)}</strong>
          <span class="badge-attendance badge-${esc(r.attendance)}">${esc(r.attendance)} · ${r.guest_count} orang</span>
        </div>
        <p style="margin:4px 0;font-size:13px;color:#4b5563">${esc(r.message || '(Tanpa pesan)')}</p>
        <small style="color:#9ca3af;font-size:10px">${new Date(r.created_at).toLocaleString('id-ID')}</small>
      </div>
    `).join('');
  } catch (err) {
    alert(err.message);
  }
}

$('btnExportRsvpCsv').onclick = async () => {
  if (!activeInvitation) return;
  try {
    const data = await api(`/api/admin/invitations/${activeInvitation.id}/rsvps`);
    const rsvps = data.rsvps || [];
    if (rsvps.length === 0) {
      alert('Belum ada data RSVP untuk diekspor.');
      return;
    }

    const headers = ['Nama Tamu', 'Kehadiran', 'Jumlah Tamu', 'Ucapan / Doa', 'Waktu'];
    const rows = rsvps.map(r => [
      `"${(r.guest_name || '').replace(/"/g, '""')}"`,
      `"${r.attendance}"`,
      r.guest_count,
      `"${(r.message || '').replace(/"/g, '""')}"`,
      `"${r.created_at}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `RSVP_${activeInvitation.slug}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } catch (err) {
    alert(err.message);
  }
};

async function loadStatsTab() {
  if (!activeInvitation) return;
  try {
    const data = await api(`/api/admin/invitations/${activeInvitation.id}/stats`);
    const container = $('statsDetailWrap');
    container.innerHTML = `
      <div class="stats" style="margin-bottom:20px">
        <div class="stat"><span>Total Tayangan</span><b>${data.view_count || 0}</b></div>
        <div class="stat"><span>Tamu Terdaftar</span><b>${data.registered_guests || 0}</b></div>
        <div class="stat"><span>Konfirmasi Hadir</span><b style="color:#dcfce7">${data.rsvp?.hadir?.guests || 0} orang</b></div>
      </div>
      <h3>Riwayat Kunjungan Terakhir</h3>
      <div style="margin-top:12px;max-height:300px;overflow-y:auto">
        ${(data.recent_views || []).map(v => `
          <div class="rsvp-row" style="padding:8px 0">
            <strong>${esc(v.guest_name || 'Pengunjung')}</strong> · <small style="color:#6b7280">${new Date(v.viewed_at).toLocaleString('id-ID')}</small>
          </div>
        `).join('') || '<p class="muted">Belum ada riwayat kunjungan.</p>'}
      </div>
    `;
  } catch (err) {
    alert(err.message);
  }
}

// ====================================================================
// 15. TAB 15: PENGATURAN & TAB 16: RIWAYAT SNAPSHOT
// ====================================================================
function loadSettingsTab() {
  if (!activeInvitation) return;
  $('invPrivacySelect').value = activeInvitation.privacy_type || 'public';
  $('invPrivacyPw').value = activeInvitation.privacy_password || '';
  $('invPublishAtInput').value = activeInvitation.publish_at || '';
}

$('btnSaveSettings').onclick = async () => {
  const status = $('settingStatus');
  status.textContent = 'Menyimpan…';

  const payload = {
    privacy_type: $('invPrivacySelect').value,
    privacy_password: $('invPrivacyPw').value.trim(),
    publish_at: $('invPublishAtInput').value
  };

  try {
    await api(`/api/admin/invitations/${activeInvitation.id}`, {
      method: 'PUT',
      body: JSON.stringify({ ...activeInvitation, ...payload })
    });
    activeInvitation.privacy_type = payload.privacy_type;
    activeInvitation.privacy_password = payload.privacy_password;
    activeInvitation.publish_at = payload.publish_at;
    status.textContent = '✓ Pengaturan privasi berhasil disimpan.';
  } catch (err) {
    status.textContent = err.message;
  }
};

async function loadHistoryTab() {
  if (!activeInvitation) return;
  try {
    const data = await api(`/api/admin/invitations/${activeInvitation.id}/versions`);
    const container = $('versionsList');
    const versions = data.versions || [];

    if (versions.length === 0) {
      container.innerHTML = '<p class="muted">Belum ada snapshot tersimpan. Klik "+ Buat Snapshot Baru".</p>';
      return;
    }

    container.innerHTML = versions.map(v => `
      <div class="card-panel" style="padding:14px;margin-bottom:0;display:flex;justify-content:space-between;align-items:center">
        <div>
          <strong>${esc(v.version_name)}</strong>
          <small style="display:block;color:#6b7280">${new Date(v.created_at).toLocaleString('id-ID')} · oleh ${esc(v.created_by)}</small>
        </div>
        <button class="mini-btn" onclick="restoreVersion(${v.id}, '${esc(v.version_name)}')">⏪ Pulihkan Versi Ini</button>
      </div>
    `).join('');
  } catch (err) {
    alert(err.message);
  }
}

$('btnCreateSnapshot').onclick = async () => {
  if (!activeInvitation) return;
  const name = prompt('Nama snapshot cadangan:', `Snapshot ${new Date().toLocaleDateString('id-ID')}`);
  if (!name) return;

  try {
    await api(`/api/admin/invitations/${activeInvitation.id}/versions`, {
      method: 'POST',
      body: JSON.stringify({ version_name: name })
    });
    await loadHistoryTab();
    alert('Snapshot berhasil disimpan.');
  } catch (err) {
    alert(err.message);
  }
};

window.restoreVersion = async (verId, verName) => {
  if (!confirm(`Pulihkan desain ke versi "${verName}"?`)) return;
  try {
    await api(`/api/admin/invitations/${activeInvitation.id}/versions/${verId}/restore`, { method: 'POST', body: '{}' });
    await loadInitialData();
    alert('Desain berhasil dipulihkan.');
  } catch (err) {
    alert(err.message);
  }
};

// ====================================================================
// 16. MODAL EDIT UNDANGAN UMUM
// ====================================================================
window.openEditInvitationModal = invId => {
  const inv = invId ? invitations.find(x => x.id === invId) : null;
  $('modalInvTitle').textContent = inv ? 'Edit Data Undangan' : 'Undangan Baru';
  $('editInvId').value = inv?.id || '';
  $('editCategoryCode').value = inv?.category_code || 'pernikahan';
  $('editSlug').value = inv?.slug || '';
  $('editEventTitle').value = inv?.event_title || '';
  $('editGroomName').value = inv?.groom_name || '';
  $('editBrideName').value = inv?.bride_name || '';
  $('editGroomParents').value = inv?.groom_parents || '';
  $('editBrideParents').value = inv?.bride_parents || '';
  $('editEventDate').value = inv?.event_date || '';
  $('editEventTime').value = inv?.event_time || '';
  $('editVenue').value = inv?.venue || '';
  $('editAddress').value = inv?.address || '';
  $('editMapsUrl').value = inv?.maps_url || '';
  $('editQuoteText').value = inv?.quote_text || '';
  $('editStoryText').value = inv?.story_text || '';
  $('editCoverImage').value = inv?.cover_image || '';
  $('editGalleryUrls').value = (inv ? safeJson(inv.gallery_json, []) : []).join('\n');
  $('editIsPublished').checked = inv ? !!inv.is_published : true;
  $('editInvStatus').textContent = '';
  $('modalEditInv').hidden = false;
};

$('btnCloseModalInv').onclick = () => $('modalEditInv').hidden = true;

$('formInvData').onsubmit = async e => {
  e.preventDefault();
  const status = $('editInvStatus');
  status.textContent = 'Menyimpan…';

  const invId = $('editInvId').value;
  const payload = {
    slug: $('editSlug').value.trim(),
    category_code: $('editCategoryCode').value,
    event_title: $('editEventTitle').value.trim(),
    groom_name: $('editGroomName').value.trim(),
    bride_name: $('editBrideName').value.trim(),
    groom_parents: $('editGroomParents').value.trim(),
    bride_parents: $('editBrideParents').value.trim(),
    event_date: $('editEventDate').value,
    event_time: $('editEventTime').value.trim(),
    venue: $('editVenue').value.trim(),
    address: $('editAddress').value.trim(),
    maps_url: $('editMapsUrl').value.trim(),
    quote_text: $('editQuoteText').value.trim(),
    story_text: $('editStoryText').value.trim(),
    cover_image: $('editCoverImage').value.trim(),
    gallery_json: JSON.stringify($('editGalleryUrls').value.split('\n').map(s => s.trim()).filter(Boolean)),
    is_published: $('editIsPublished').checked ? 1 : 0
  };

  try {
    if (invId) {
      await api(`/api/admin/invitations/${invId}`, { method: 'PUT', body: JSON.stringify(payload) });
    } else {
      const res = await api('/api/admin/invitations', { method: 'POST', body: JSON.stringify(payload) });
      activeInvitation = { id: res.id, ...payload };
    }
    $('modalEditInv').hidden = true;
    await loadInitialData();
  } catch (err) {
    status.textContent = err.message;
  }
};

window.duplicateInvitation = async invId => {
  if (!confirm('Gandakan undangan ini beserta seluruh pengaturannya?')) return;
  try {
    await api(`/api/admin/invitations/${invId}/duplicate`, { method: 'POST', body: '{}' });
    await loadInitialData();
  } catch (err) {
    alert(err.message);
  }
};

window.togglePublishInvitation = async (invId, publishState) => {
  const inv = invitations.find(x => x.id === invId);
  if (!inv) return;
  try {
    await api(`/api/admin/invitations/${invId}`, {
      method: 'PUT',
      body: JSON.stringify({ ...inv, is_published: publishState })
    });
    await loadInitialData();
  } catch (err) {
    alert(err.message);
  }
};

window.deleteInvitation = async (invId, slugName) => {
  if (!confirm(`Hapus undangan "${slugName}" beserta semua data tamu dan RSVP?`)) return;
  try {
    await api(`/api/admin/invitations/${invId}`, { method: 'DELETE', body: '{}' });
    await loadInitialData();
  } catch (err) {
    alert(err.message);
  }
};

function safeJson(v, fallback) {
  if (typeof v === 'object' && v !== null) return v;
  try {
    return JSON.parse(v || '{}');
  } catch {
    return fallback;
  }
}

// Start
checkAuth();
