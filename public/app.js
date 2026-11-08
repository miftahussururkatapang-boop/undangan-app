/**
 * UNDANGAN V2 - Core Client Engine
 * Platform Undangan Digital Multi-Acara
 * "Satu Platform, Beragam Undangan"
 */

const $ = id => document.getElementById(id);
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

const pathSegments = location.pathname.split('/').filter(Boolean);
const slug = (pathSegments[0] === 'i' ? pathSegments[1] : pathSegments[0]) || 'demo';
const urlParams = new URLSearchParams(location.search);
const guestParam = urlParams.get('to');
const tokenParam = urlParams.get('token');
const previewParam = urlParams.get('preview');

let invitationData = null;
let guestToken = null;
let countdownTimer = null;
let audioContext = null;
let particlesAnimationId = null;

// ====================================================================
// 1. INITIALIZATION & DATA FETCHING
// ====================================================================
async function init() {
  try {
    const qs = new URLSearchParams();
    if (guestParam) qs.set('to', guestParam);
    if (tokenParam) qs.set('token', tokenParam);
    if (previewParam) qs.set('preview', previewParam);
    const pw = sessionStorage.getItem(`egw_pw_${slug}`) || urlParams.get('pw');
    if (pw) qs.set('pw', pw);

    const res = await fetch(`/api/invitation/${encodeURIComponent(slug)}${qs.toString() ? `?${qs.toString()}` : ''}`);
    const data = await res.json();

    if (res.status === 401 && data.requires_password) {
      showPasswordPrompt();
      return;
    }

    if (!res.ok) {
      throw new Error(data.error || 'Undangan tidak ditemukan atau belum dibuka.');
    }

    invitationData = data;
    guestToken = data.guestToken || null;

    applyThemeAndStyles(data);
    applyBackgroundAndParticles(data.background_settings);
    setupAudio(data.sound_settings, data.invitation.music_url);
    renderInvitation(data);
    setupScrollAnimations(data.animation_settings);

    $('loading').hidden = true;
    $('app').hidden = false;

  } catch (err) {
    $('loadingText').textContent = err.message;
  }
}

function showPasswordPrompt() {
  $('loading').hidden = true;
  $('passwordPanel').hidden = false;

  $('passwordForm').onsubmit = async e => {
    e.preventDefault();
    const pw = $('invPasswordInput').value.trim();
    if (!pw) return;
    sessionStorage.setItem(`egw_pw_${slug}`, pw);
    $('passwordPanel').hidden = true;
    $('loading').hidden = false;
    $('loadingText').textContent = 'Memverifikasi kata sandi…';
    init();
  };
}

// ====================================================================
// 2. THEME ENGINE & CUSTOM STYLING
// ====================================================================
function applyThemeAndStyles(data) {
  const themeCode = data.theme_code || 'emerald_gold';
  document.body.className = `invitation-page theme-${themeCode}`;

  const theme = data.theme || {};
  const colors = theme.colors || {};
  const fonts = theme.fonts || {};
  const root = document.documentElement;

  if (colors.primary) root.style.setProperty('--primary', colors.primary);
  if (colors.secondary) root.style.setProperty('--secondary', colors.secondary);
  if (colors.gold || colors.accent) root.style.setProperty('--gold', colors.gold || colors.accent);
  if (colors.gold_gradient) root.style.setProperty('--gold-gradient', colors.gold_gradient);
  if (colors.bg_cover) root.style.setProperty('--bg-cover', colors.bg_cover);
  if (colors.bg_content) root.style.setProperty('--bg-content', colors.bg_content);
  if (colors.bg_card) root.style.setProperty('--bg-card', colors.bg_card);
  if (colors.text_primary) root.style.setProperty('--text-primary', colors.text_primary);
  if (colors.text_muted) root.style.setProperty('--text-muted', colors.text_muted);
  if (colors.text_eyebrow) root.style.setProperty('--text-eyebrow', colors.text_eyebrow);
  if (colors.btn_bg) root.style.setProperty('--btn-bg', colors.btn_bg);
  if (colors.btn_text) root.style.setProperty('--btn-text', colors.btn_text);
  if (colors.line) root.style.setProperty('--line', colors.line);
  if (colors.ornament) root.style.setProperty('--ornament', colors.ornament);

  if (fonts.heading) root.style.setProperty('--font-heading', `'${fonts.heading}', serif`);
  if (fonts.body) root.style.setProperty('--font-body', `'${fonts.body}', sans-serif`);

  const design = data.design_settings || {};
  if (design.button_radius) root.style.setProperty('--btn-radius', design.button_radius);
  if (design.card_radius) root.style.setProperty('--card-radius', design.card_radius);

  // Set page title
  const inv = data.invitation;
  const isWed = (data.category_code || 'pernikahan') === 'pernikahan';
  const pageTitle = inv.event_title || (isWed ? `The Wedding of ${inv.groom_name} & ${inv.bride_name}` : (inv.groom_name || 'Undangan Digital'));
  document.title = pageTitle;
}

// ====================================================================
// 3. BACKGROUND & PARTICLES STUDIO
// ====================================================================
function applyBackgroundAndParticles(bgSettings = {}) {
  const canvas = $('particlesCanvas');
  if (!canvas) return;

  const particlesType = bgSettings.particles || 'gold_dust';
  if (particlesType === 'none' || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    canvas.hidden = true;
    return;
  }

  canvas.hidden = false;
  const ctx = canvas.getContext('2d');
  let width = canvas.width = window.innerWidth;
  let height = canvas.height = window.innerHeight;

  window.addEventListener('resize', () => {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
  });

  const particlesCount = particlesType === 'gold_dust' ? 45 : 25;
  const particles = [];

  for (let i = 0; i < particlesCount; i++) {
    particles.push({
      x: Math.random() * width,
      y: Math.random() * height,
      size: Math.random() * 3 + 1,
      speedY: Math.random() * 0.8 + 0.3,
      speedX: (Math.random() - 0.5) * 0.5,
      alpha: Math.random() * 0.7 + 0.3,
      color: particlesType === 'falling_petals' ? '#fcd5dc' : '#f0d99e'
    });
  }

  function animate() {
    ctx.clearRect(0, 0, width, height);
    for (let p of particles) {
      ctx.save();
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fillStyle = p.color;
      ctx.globalAlpha = p.alpha;
      ctx.shadowBlur = 6;
      ctx.shadowColor = p.color;
      ctx.fill();
      ctx.restore();

      p.y += p.speedY;
      p.x += p.speedX;
      if (p.y > height) {
        p.y = -10;
        p.x = Math.random() * width;
      }
      if (p.x > width) p.x = 0;
      if (p.x < 0) p.x = width;
    }
    particlesAnimationId = requestAnimationFrame(animate);
  }
  animate();
}

// ====================================================================
// 4. MUSIC & SOUND STUDIO
// ====================================================================
function setupAudio(soundSettings = {}, directMusicUrl = '') {
  const audio = $('musicAudio');
  const toggle = $('musicToggle');
  const icon = $('musicIcon');

  const musicUrl = soundSettings.music_url || directMusicUrl;
  if (!musicUrl) {
    toggle.hidden = true;
    return;
  }

  audio.src = musicUrl;
  audio.volume = soundSettings.volume !== undefined ? Number(soundSettings.volume) : 0.75;
  toggle.hidden = false;

  const iconType = soundSettings.button_icon || 'vinyl';
  const iconMap = { vinyl: '💿', note: '♫', clef: '𝄞', speaker: '🔊' };
  icon.textContent = iconMap[iconType] || '♫';

  toggle.className = `music-toggle pos-${soundSettings.button_pos || 'bottom-right'}`;

  toggle.onclick = async () => {
    if (audio.paused) {
      try {
        await audio.play();
        toggle.classList.add('playing');
      } catch {
        playSynthesizedAmbient();
      }
    } else {
      audio.pause();
      toggle.classList.remove('playing');
    }
  };
}

function playSynthesizedAmbient() {
  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;
    if (!audioContext) audioContext = new AudioCtx();
    if (audioContext.state === 'suspended') audioContext.resume();

    const osc = audioContext.createOscillator();
    const gain = audioContext.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(440, audioContext.currentTime);
    gain.gain.setValueAtTime(0.05, audioContext.currentTime);
    osc.connect(gain);
    gain.connect(audioContext.destination);
    osc.start();
    $('musicToggle').classList.add('playing');
  } catch {}
}

// ====================================================================
// 5. ANIMATION STUDIO & OPENING TRIGGER
// ====================================================================
function setupScrollAnimations(animSettings = {}) {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
      }
    });
  }, { threshold: 0.15 });

  document.querySelectorAll('.anim-fade-up, .anim-slide-left-right, .anim-soft-zoom').forEach(el => {
    observer.observe(el);
  });
}

function handleOpenInvitation(animSettings = {}, soundSettings = {}) {
  const openingType = animSettings.opening?.type || 'envelope';

  const finishOpen = () => {
    $('cover').hidden = true;
    $('invitationContent').hidden = false;
    $('invitationContent').scrollIntoView({ behavior: 'smooth' });

    const audio = $('musicAudio');
    if (audio.src) {
      audio.play().then(() => {
        $('musicToggle').classList.add('playing');
      }).catch(() => {});
    }
  };

  if (openingType === 'curtain') {
    const curtains = $('curtainsWrap');
    curtains.hidden = false;
    setTimeout(() => {
      document.body.classList.add('curtains-open');
      setTimeout(finishOpen, 1200);
    }, 50);
  } else if (openingType === 'door_3d') {
    const doors = $('doorsWrap');
    doors.hidden = false;
    setTimeout(() => {
      document.body.classList.add('doors-open');
      setTimeout(finishOpen, 1300);
    }, 50);
  } else if (openingType === 'envelope') {
    const envWrap = $('envelopeContainer');
    if (envWrap && !envWrap.hidden) {
      envWrap.classList.add('open');
      setTimeout(finishOpen, 1000);
    } else {
      finishOpen();
    }
  } else {
    $('cover').style.transition = 'opacity 0.8s ease, transform 0.8s ease';
    $('cover').style.opacity = '0';
    $('cover').style.transform = openingType === 'zoom_in' ? 'scale(1.1)' : 'translateY(-20px)';
    setTimeout(finishOpen, 750);
  }
}

// ====================================================================
// 6. SECTION BUILDER COMPONENT RENDERER (ADAPTIF MULTI-ACARA)
// ====================================================================
function renderInvitation(data) {
  const inv = data.invitation;
  const sections = data.sections || [];
  const anim = data.animation_settings || {};
  const sound = data.sound_settings || {};
  const design = data.design_settings || {};
  const isWedding = (data.category_code || 'pernikahan') === 'pernikahan';

  // Setup Dynamic Cover
  const mainTitle = inv.event_title || (isWedding ? `${inv.groom_name} & ${inv.bride_name}` : (inv.groom_name || 'Undangan'));
  const categoryLabel = (data.category_name || (isWedding ? 'THE WEDDING OF' : 'UNDANGAN RESMI')).toUpperCase();

  $('coverEyebrow').textContent = isWedding ? 'THE WEDDING OF' : categoryLabel;
  $('coverNames').textContent = mainTitle;
  $('coverDate').textContent = formatDate(inv.event_date);
  $('guestName').textContent = data.guest?.name || guestParam || 'Tamu Undangan';

  if (inv.cover_image) {
    $('coverPhoto').style.backgroundImage = `url("${inv.cover_image.replace(/["\\]/g, '')}")`;
  }
  const photoFrameStyle = design.photo_frame || 'arch';
  $('coverPhoto').className = `cover-photo frame-${photoFrameStyle}`;

  if (anim.opening?.type === 'envelope') {
    $('envelopeContainer').hidden = false;
    $('envelopeContainer').onclick = () => handleOpenInvitation(anim, sound);
  }

  $('openInvitation').onclick = () => handleOpenInvitation(anim, sound);

  // Render semua seksi dinamis
  const container = $('dynamicSections');
  container.innerHTML = '';

  sections.forEach((sec, idx) => {
    const html = renderSingleSection(sec, inv, data, idx);
    if (html) {
      const wrapper = document.createElement('div');
      wrapper.innerHTML = html;
      container.appendChild(wrapper.firstElementChild);
    }
  });

  attachSectionEvents(data);
}

function renderSingleSection(sec, inv, data, idx) {
  const key = sec.key;
  const c = sec.content || {};
  const isAlt = idx % 2 === 1 ? 'section-alt' : '';

  switch (key) {
    case 'salam':
      return `
        <header class="section ${isAlt} anim-fade-up">
          <p class="eyebrow" style="font-family:var(--font-arabic);font-size:18px">${esc(c.bismillah || 'بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ')}</p>
          <p class="section-subtitle">${esc(c.greeting || 'Assalamu’alaikum Warahmatullahi Wabarakatuh')}</p>
          <div class="divider">
            <svg viewBox="0 0 240 24" fill="none" stroke="currentColor"><path d="M0,12 L100,12 M140,12 L240,12" stroke-width="1"/><path d="M120,4 L128,12 L120,20 L112,12 Z" fill="currentColor"/></svg>
          </div>
          <p class="section-subtitle" style="max-width:540px;margin:20px auto;font-style:italic;line-height:1.7">“${esc(c.quote_verse || inv.quote_text || 'Dengan memohon rahmat dan ridha Allah SWT, kami mengundang Bapak/Ibu/Saudara/i untuk menghadiri acara kami.')}”</p>
          ${c.quote_source ? `<small style="color:var(--gold);font-weight:600">${esc(c.quote_source)}</small>` : ''}
        </header>
      `;

    case 'profile':
      const groom = c.groom || {};
      const bride = c.bride || {};
      return `
        <section class="section ${isAlt} anim-fade-up">
          <p class="eyebrow">PASANGAN MEMPELAI</p>
          <h2 class="section-title">${esc(sec.title || 'Mempelai Pengantin')}</h2>
          <p class="section-subtitle">${esc(sec.subtitle || 'Dengan memohon rahmat Allah SWT, kami mengikat janji suci')}</p>
          
          <div class="profiles-wrap">
            <div class="profile-card">
              <div class="profile-photo frame-${data.design_settings?.photo_frame || 'arch'}" style="background-image:url('${esc(groom.photo || inv.cover_image || '')}')"></div>
              <h3 class="profile-name">${esc(groom.name || inv.groom_name)}</h3>
              <p class="profile-parents">${esc(groom.parents || inv.groom_parents || '')}</p>
              ${groom.instagram ? `<a href="https://instagram.com/${groom.instagram.replace('@','')}" target="_blank" rel="noopener" class="social-tag">Instagram ${esc(groom.instagram)} ↗</a>` : ''}
            </div>

            <div class="profile-card">
              <div class="profile-photo frame-${data.design_settings?.photo_frame || 'arch'}" style="background-image:url('${esc(bride.photo || inv.cover_image || '')}')"></div>
              <h3 class="profile-name">${esc(bride.name || inv.bride_name)}</h3>
              <p class="profile-parents">${esc(bride.parents || inv.bride_parents || '')}</p>
              ${bride.instagram ? `<a href="https://instagram.com/${bride.instagram.replace('@','')}" target="_blank" rel="noopener" class="social-tag">Instagram ${esc(bride.instagram)} ↗</a>` : ''}
            </div>
          </div>
        </section>
      `;

    case 'profile_person':
    case 'profile_child':
    case 'profile_baby':
    case 'profile_speaker':
      const personName = c.name || inv.groom_name || inv.event_title || 'Tokoh / Subjek Acara';
      const personParents = c.parents || c.institution || c.credentials || inv.groom_parents || '';
      return `
        <section class="section ${isAlt} anim-fade-up">
          <p class="eyebrow">${esc(sec.subtitle || 'PROFIL ACARA')}</p>
          <h2 class="section-title">${esc(sec.title || personName)}</h2>
          <div class="card-panel" style="max-width:440px;margin:24px auto;text-align:center;padding:28px 20px">
            <div class="profile-photo frame-${data.design_settings?.photo_frame || 'arch'}" style="background-image:url('${esc(c.photo || inv.cover_image || '')}')"></div>
            <h3 class="profile-name">${esc(personName)}</h3>
            ${personParents ? `<p class="profile-parents">${esc(personParents)}</p>` : ''}
            ${c.bio ? `<p class="section-subtitle" style="margin-top:12px;line-height:1.7">${esc(c.bio)}</p>` : ''}
          </div>
        </section>
      `;

    case 'description':
      return `
        <section class="section ${isAlt} anim-fade-up">
          <p class="eyebrow">${esc(sec.subtitle || 'TENTANG ACARA')}</p>
          <h2 class="section-title">${esc(sec.title || 'Deskripsi Acara')}</h2>
          <p class="body-copy" style="max-width:620px;margin:20px auto;line-height:1.9">${esc(c.intro || inv.story_text || '')}</p>
        </section>
      `;

    case 'countdown':
      const eventDate = c.event_date || (inv.event_date ? `${inv.event_date}T08:00:00` : '');
      return `
        <section class="section ${isAlt} anim-fade-up">
          <p class="eyebrow">SAVE THE DATE</p>
          <h2 class="section-title">${esc(sec.title || 'Menghitung Hari')}</h2>
          <p class="section-subtitle">${esc(formatDate(inv.event_date))}</p>

          <div class="countdown-grid" id="countdownGrid" data-date="${esc(eventDate)}">
            <div class="countdown-box"><b id="cdDays">00</b><span>Hari</span></div>
            <div class="countdown-box"><b id="cdHours">00</b><span>Jam</span></div>
            <div class="countdown-box"><b id="cdMinutes">00</b><span>Menit</span></div>
            <div class="countdown-box"><b id="cdSeconds">00</b><span>Detik</span></div>
          </div>
        </section>
      `;

    case 'event_detail':
    case 'akad':
    case 'reception':
      const badge = c.badge || (key === 'akad' ? 'Prosesi Akad' : (key === 'reception' ? 'Walimatul ‘Ursy' : 'Jadwal Acara'));
      return `
        <section class="section ${isAlt} anim-fade-up">
          <p class="eyebrow">${esc(sec.subtitle || 'WAKTU & TEMPAT')}</p>
          <h2 class="section-title">${esc(sec.title || 'Jadwal Pelaksanaan')}</h2>
          
          <div class="event-box" style="max-width:500px;margin:20px auto 0">
            <span class="event-badge">${esc(badge)}</span>
            <div class="event-time">${esc(c.date || formatDate(inv.event_date))} · ${esc(c.time || inv.event_time || '')}</div>
            <h3 class="event-venue">${esc(c.venue || inv.venue || '')}</h3>
            <p class="event-address">${esc(c.address || inv.address || '')}</p>
            ${c.dresscode ? `<p style="font-size:12px;color:var(--gold);font-weight:600">👗 Dress Code: ${esc(c.dresscode)}</p>` : ''}
            
            <div style="display:flex;gap:10px;justify-content:center;margin-top:16px;flex-wrap:wrap">
              ${(c.maps_url || inv.maps_url) ? `<a href="${esc(c.maps_url || inv.maps_url)}" target="_blank" rel="noopener" class="btn btn-gold" style="padding:8px 16px;font-size:12px">Lihat Google Maps ↗</a>` : ''}
              <a href="https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(inv.event_title || inv.groom_name || 'Acara')}&location=${encodeURIComponent(c.venue || inv.venue || '')}" target="_blank" rel="noopener" class="btn btn-outline" style="padding:8px 16px;font-size:12px">📅 Simpan Kalender</a>
            </div>
          </div>
        </section>
      `;

    case 'rundown':
      const rundownItems = c.items || [
        { time: "09.00 - 09.30", title: "Registrasi & Pembukaan" },
        { time: "09.30 - 11.00", title: "Acara Inti" },
        { time: "11.00 - selesai", title: "Ramah Tamah & Doa Penutup" }
      ];
      return `
        <section class="section ${isAlt} anim-fade-up">
          <p class="eyebrow">AGENDA ACARA</p>
          <h2 class="section-title">${esc(sec.title || 'Susunan Acara')}</h2>
          <p class="section-subtitle">${esc(sec.subtitle || 'Rangkaian kegiatan yang akan berlangsung')}</p>
          <div class="card-panel" style="max-width:540px;margin:20px auto;text-align:left;padding:20px">
            ${rundownItems.map(item => `
              <div style="display:flex;gap:14px;padding:10px 0;border-bottom:1px solid var(--line)">
                <b style="color:var(--gold);min-width:110px;font-size:13px">${esc(item.time)}</b>
                <span style="font-size:13px;color:var(--text-primary)">${esc(item.title)}</span>
              </div>
            `).join('')}
          </div>
        </section>
      `;

    case 'location':
      return `
        <section class="section ${isAlt} anim-fade-up">
          <p class="eyebrow">PETUNJUK LOKASI</p>
          <h2 class="section-title">${esc(sec.title || 'Lokasi Acara')}</h2>
          <p class="section-subtitle">${esc(c.venue || inv.venue || '')}<br><span style="color:var(--text-muted)">${esc(c.address || inv.address || '')}</span></p>

          <div style="display:flex;gap:12px;justify-content:center;margin-top:20px;flex-wrap:wrap">
            <a href="${esc(c.maps_url || inv.maps_url || 'https://maps.google.com')}" target="_blank" rel="noopener" class="btn btn-gold">
              📍 Buka di Google Maps
            </a>
            ${c.waze_url ? `<a href="${esc(c.waze_url)}" target="_blank" rel="noopener" class="btn btn-outline">🚗 Navigasi via Waze</a>` : ''}
          </div>
        </section>
      `;

    case 'story':
      const milestones = c.milestones || [];
      return `
        <section class="section ${isAlt} anim-fade-up">
          <p class="eyebrow">LINTAS PERJALANAN</p>
          <h2 class="section-title">${esc(sec.title || 'Kisah Kami')}</h2>
          <p class="section-subtitle">${esc(c.intro || inv.story_text || '')}</p>

          <div class="timeline">
            ${milestones.map(m => `
              <div class="timeline-item">
                <div class="timeline-dot"></div>
                <div class="timeline-year">${esc(m.year)}</div>
                <h4 class="timeline-title">${esc(m.title)}</h4>
                <p class="timeline-desc">${esc(m.description)}</p>
              </div>
            `).join('')}
          </div>
        </section>
      `;

    case 'gallery':
      const photos = c.photos || safeJson(inv.gallery_json, []);
      return `
        <section class="section ${isAlt} anim-fade-up">
          <p class="eyebrow">DOKUMENTASI</p>
          <h2 class="section-title">${esc(sec.title || 'Galeri Momen')}</h2>
          <p class="section-subtitle">${esc(sec.subtitle || 'Kenangan manis kebersamaan kami')}</p>

          <div class="gallery-grid ${photos.length > 4 ? 'cols-3' : ''}">
            ${photos.map(p => `
              <img src="${esc(p)}" class="gallery-item" loading="lazy" alt="Foto Galeri" data-full="${esc(p)}">
            `).join('')}
          </div>
        </section>
      `;

    case 'video':
      return `
        <section class="section ${isAlt} anim-fade-up">
          <p class="eyebrow">VIDEO TEASER</p>
          <h2 class="section-title">${esc(sec.title || 'Video Dokumentasi')}</h2>
          <p class="section-subtitle">${esc(c.caption || 'Cuplikan momen kebersamaan kami')}</p>

          <div class="video-wrap">
            <iframe src="${esc(c.video_url || 'https://www.youtube.com/embed/dQw4w9WgXcQ')}" allowfullscreen allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"></iframe>
          </div>
        </section>
      `;

    case 'rsvp':
      return `
        <section class="section ${isAlt} anim-fade-up" id="rsvpSection">
          <p class="eyebrow">KONFIRMASI KEHADIRAN</p>
          <h2 class="section-title">${esc(sec.title || 'RSVP')}</h2>
          <p class="section-subtitle">${esc(c.note || 'Mohon doa restu dan konfirmasi kehadiran Anda')}</p>

          <div class="rsvp-box">
            <form id="rsvpForm">
              <div class="form-group">
                <label for="rsvpName">Nama Anda</label>
                <input id="rsvpName" class="form-control" maxlength="100" required value="${esc(data.guest?.name || guestParam || '')}">
              </div>
              <div class="form-group">
                <label for="attendance">Konfirmasi Kehadiran</label>
                <select id="attendance" class="form-control" required>
                  <option value="hadir">InsyaAllah Hadir</option>
                  <option value="tidak_hadir">Maaf, Belum Bisa Hadir</option>
                  <option value="ragu">Masih Ragu</option>
                </select>
              </div>
              <div class="form-group">
                <label for="guestCount">Jumlah Tamu yang Hadir</label>
                <input type="number" id="guestCount" class="form-control" min="1" max="10" value="1" required>
              </div>
              <div class="form-group">
                <label for="message">Doa & Ucapan Selamat</label>
                <textarea id="message" class="form-control" rows="3" maxlength="500" placeholder="Tuliskan ucapan dan doa terbaik Anda…"></textarea>
              </div>
              <button type="submit" class="btn btn-gold" style="width:100%">Kirim Konfirmasi Kehadiran</button>
              <p id="rsvpStatus" class="form-status" aria-live="polite"></p>
            </form>
          </div>
        </section>
      `;

    case 'guestbook':
      return `
        <section class="section ${isAlt} anim-fade-up">
          <p class="eyebrow">WISHES & PRAYERS</p>
          <h2 class="section-title">${esc(sec.title || 'Buku Tamu & Ucapan')}</h2>
          <p class="section-subtitle">${esc(sec.subtitle || 'Untaian doa dan ucapan dari para tamu terkasih')}</p>

          <div class="guestbook-feed" id="guestbookFeed">
            <p class="section-subtitle">Memuat ucapan doa…</p>
          </div>
        </section>
      `;

    case 'envelope':
      const accounts = c.accounts || [];
      return `
        <section class="section ${isAlt} anim-fade-up">
          <p class="eyebrow">TANDA KASIH</p>
          <h2 class="section-title">${esc(sec.title || 'Amplop Digital & Kado')}</h2>
          <p class="section-subtitle">${esc(c.note || 'Kehadiran dan doa Anda adalah karunia terindah bagi kami.')}</p>

          <div class="envelope-cards-grid">
            ${accounts.map(acc => `
              <div class="bank-card">
                <div class="bank-header">
                  <span class="bank-name">${esc(acc.bank)}</span>
                  <span style="font-size:18px">💳</span>
                </div>
                <div class="bank-number" id="acc_${esc(acc.number)}">${esc(acc.number)}</div>
                <div class="bank-holder">a.n. ${esc(acc.holder)}</div>
                <button class="btn btn-outline copy-btn" data-copy="${esc(acc.number)}">📋 Salin Nomor Rekening</button>
              </div>
            `).join('')}
          </div>

          ${c.shipping_address ? `
            <div class="bank-card" style="max-width:500px;margin:20px auto 0;text-align:center">
              <span class="bank-name">📦 Alamat Pengiriman Kado Fisik</span>
              <p style="font-size:13px;margin:8px 0;line-height:1.6">${esc(c.shipping_address)}</p>
              <button class="btn btn-outline copy-btn" data-copy="${esc(c.shipping_address)}">📋 Salin Alamat</button>
            </div>
          ` : ''}
        </section>
      `;

    case 'health_protocol':
      const items = c.items || [];
      return `
        <section class="section ${isAlt} anim-fade-up">
          <p class="eyebrow">PANDUAN ACARA</p>
          <h2 class="section-title">${esc(sec.title || 'Kenyamanan Acara')}</h2>
          <p class="section-subtitle">${esc(sec.subtitle || 'Demi kelancaran dan kenyamanan bersama:')}</p>

          <div class="protocol-grid">
            ${items.map(it => `
              <div class="protocol-item">
                <div class="protocol-icon">${it.icon || '✨'}</div>
                <div class="protocol-title">${esc(it.title)}</div>
                <div class="protocol-desc">${esc(it.desc)}</div>
              </div>
            `).join('')}
          </div>
        </section>
      `;

    case 'closing':
      const footerTitle = inv.event_title || (inv.groom_name ? (inv.bride_name ? `${inv.groom_name} & ${inv.bride_name}` : inv.groom_name) : 'UNDANGAN');
      return `
        <footer class="footer anim-fade-up">
          <p class="section-subtitle" style="color:#d8e4dc">${esc(c.message || 'Merupakan suatu kehormatan dan kebahagiaan bagi kami apabila Anda berkenan hadir.')}</p>
          <div class="footer-names">${esc(c.footer_names || footerTitle)}</div>
          <small>${esc(c.family_closing || 'UNDANGAN · Satu Platform, Beragam Undangan')}</small>
        </footer>
      `;

    default:
      return '';
  }
}

// ====================================================================
// 7. EVENT LISTENERS FOR DYNAMIC COMPONENTS
// ====================================================================
function attachSectionEvents(data) {
  const cdElement = $('countdownGrid');
  if (cdElement && cdElement.dataset.date) {
    startCountdown(cdElement.dataset.date);
  }

  const rsvpForm = $('rsvpForm');
  if (rsvpForm) {
    rsvpForm.onsubmit = async e => {
      e.preventDefault();
      const status = $('rsvpStatus');
      status.textContent = 'Mengirim konfirmasi kehadiran…';

      const payload = {
        slug,
        guest_token: guestToken,
        guest_name: $('rsvpName').value.trim(),
        attendance: $('attendance').value,
        guest_count: Number($('guestCount').value) || 1,
        message: $('message').value.trim()
      };

      try {
        const res = await fetch('/api/rsvp', {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify(payload)
        });
        const resData = await res.json();
        if (!res.ok) throw new Error(resData.error || 'Gagal mengirim RSVP.');

        status.style.color = '#15803d';
        status.textContent = 'Terima kasih, konfirmasi Anda berhasil disimpan!';
        loadGuestbook();
      } catch (err) {
        status.style.color = '#dc2626';
        status.textContent = err.message;
      }
    };
  }

  loadGuestbook();

  document.querySelectorAll('[data-copy]').forEach(btn => {
    btn.onclick = async () => {
      const text = btn.dataset.copy;
      await navigator.clipboard.writeText(text);
      const original = btn.textContent;
      btn.textContent = '✓ Tersalin!';
      setTimeout(() => btn.textContent = original, 2000);
    };
  });

  document.querySelectorAll('.gallery-item').forEach(img => {
    img.onclick = () => {
      $('lightboxImg').src = img.dataset.full || img.src;
      $('lightboxModal').hidden = false;
    };
  });
  $('lightboxClose').onclick = () => $('lightboxModal').hidden = true;
  $('lightboxModal').onclick = e => {
    if (e.target === $('lightboxModal')) $('lightboxModal').hidden = true;
  };

  $('waShareBtn').onclick = () => {
    const inv = data.invitation;
    const isWed = (data.category_code || 'pernikahan') === 'pernikahan';
    const title = inv.event_title || (isWed ? `${inv.groom_name} & ${inv.bride_name}` : inv.groom_name);
    const msg = `Kepada Yth. Bapak/Ibu/Saudara/i,\n\nTanpa mengurangi rasa hormat, perkenankan kami mengundang Anda untuk menghadiri acara kami:\n*${title}*\n\nBuka undangan digital melalui tautan:\n${location.origin}/i/${inv.slug}${guestParam ? `?to=${encodeURIComponent(guestParam)}` : ''}\n\nTerima kasih atas doa dan kehadirannya.`;
    window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, '_blank');
  };

  $('printBtn').onclick = () => window.print();
}

async function loadGuestbook() {
  const feed = $('guestbookFeed');
  if (!feed) return;

  try {
    const res = await fetch(`/api/guestbook/${encodeURIComponent(slug)}`);
    const data = await res.json();
    if (!res.ok) return;

    if (!data.guestbook || data.guestbook.length === 0) {
      feed.innerHTML = '<p class="section-subtitle">Belum ada ucapan doa. Jadilah yang pertama memberikan doa restu!</p>';
      return;
    }

    feed.innerHTML = data.guestbook.map(g => `
      <div class="guestbook-card">
        <div class="guestbook-header">
          <span class="guestbook-author">${esc(g.guest_name)}</span>
          <span class="badge-attendance badge-${esc(g.attendance)}">${esc(g.attendance === 'hadir' ? 'Hadir' : (g.attendance === 'tidak_hadir' ? 'Berhalangan' : 'Ragu'))}</span>
        </div>
        <p class="guestbook-message">${esc(g.message)}</p>
        <div class="guestbook-time">${new Date(g.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</div>
      </div>
    `).join('');
  } catch {}
}

function startCountdown(dateStr) {
  if (!dateStr) return;
  const target = new Date(dateStr).getTime();
  if (isNaN(target)) return;

  const tick = () => {
    const diff = Math.max(0, target - Date.now());
    const days = Math.floor(diff / 86400000);
    const hours = Math.floor((diff % 86400000) / 3600000);
    const minutes = Math.floor((diff % 3600000) / 60000);
    const seconds = Math.floor((diff % 60000) / 1000);

    if ($('cdDays')) $('cdDays').textContent = String(days).padStart(2, '0');
    if ($('cdHours')) $('cdHours').textContent = String(hours).padStart(2, '0');
    if ($('cdMinutes')) $('cdMinutes').textContent = String(minutes).padStart(2, '0');
    if ($('cdSeconds')) $('cdSeconds').textContent = String(seconds).padStart(2, '0');
  };

  tick();
  clearInterval(countdownTimer);
  countdownTimer = setInterval(tick, 1000);
}

function formatDate(v) {
  if (!v) return 'Tanggal Menyusul';
  try {
    return new Date(v + 'T00:00:00').toLocaleDateString('id-ID', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  } catch {
    return v;
  }
}

function safeJson(v, fallback) {
  if (typeof v === 'object' && v !== null) return v;
  try {
    return JSON.parse(v || '[]');
  } catch {
    return fallback;
  }
}

init();
