/* main.js — Interactividad mínima para JobParty
   - Validación de formularios (registro/login)
   - Simulación de autenticación con localStorage
   - Render de ofertas y filtrado simple
   - Modal para aplicar a un empleo
   - Preparado para integrarse con Firebase en el futuro
*/

// Datos de ejemplo (simulación de base de datos)
const jobs = [
  { id:1, title:'Frontend Developer', company:'Acme Co.', city:'Bogotá', salary:3000, type:'Tiempo completo', category:'Tecnología', date:'2025-10-01' },
  { id:2, title:'UI/UX Designer', company:'Pixel House', city:'Medellín', salary:2500, type:'Tiempo completo', category:'Diseño', date:'2025-09-20' },
  { id:3, title:'Marketing Specialist', company:'Marketify', city:'Ciudad de México', salary:1800, type:'Medio tiempo', category:'Marketing', date:'2025-08-15' },
  { id:4, title:'Backend Developer', company:'DataWorks', city:'Lima', salary:4000, type:'Tiempo completo', category:'Tecnología', date:'2025-10-08' },
  { id:5, title:'Sales Executive', company:'VentaMax', city:'Bogotá', salary:2200, type:'Ventas', category:'Ventas', date:'2025-07-01' }
];

// --- Utilidades ---
const $ = sel => document.querySelector(sel);
const $$ = sel => Array.from(document.querySelectorAll(sel));

function formatSalary(n){ return n ? `$${n.toLocaleString()}` : 'No especificado'; }

// --- Render de empleos en dashboard ---
function renderJobs(list){
  const root = $('#jobs-list');
  if(!root) return;
  root.innerHTML = '';
  if(list.length === 0){ root.innerHTML = '<p class="muted">No se encontraron ofertas.</p>'; return; }
  list.forEach(job => {
    const el = document.createElement('article');
    el.className = 'job-card';
    el.innerHTML = `
      <div class="job-head">
        <div class="job-tag">${escapeHtml(job.category)}</div>
      </div>
      <h4>${escapeHtml(job.title)}</h4>
      <div class="job-meta">${escapeHtml(job.company)} • ${escapeHtml(job.city)} • ${formatSalary(job.salary)}</div>
      <p class="muted">${escapeHtml(job.type)}</p>
      <div class="job-actions">
        <button class="btn btn-outline btn-details" data-id="${job.id}">Ver</button>
        <button class="btn btn-primary btn-apply" data-id="${job.id}">Aplicar</button>
      </div>
    `;
    root.appendChild(el);
  });
}

// escape simple para seguridad XSS en demos
function escapeHtml(s){ if(!s && s!==0) return ''; return String(s).replace(/[&<>"']/g, c=>({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":"&#39;" })[c]); }

// --- Filtros ---
function applyFilters(){
  const category = $('#category') ? $('#category').value : '';
  const city = $('#city') ? $('#city').value : '';
  const salary = $('#salary-range') ? Number($('#salary-range').value) : Infinity;
  const sort = $('#sort') ? $('#sort').value : 'relevance';

  let results = jobs.filter(j=>{
    if(category && j.category !== category) return false;
    if(city && j.city !== city) return false;
    if(salary && j.salary > salary) return false;
    return true;
  });

  if(sort === 'date') results.sort((a,b)=> new Date(b.date) - new Date(a.date));
  if(sort === 'salary') results.sort((a,b)=> b.salary - a.salary);

  renderJobs(results);
}

// --- Modal aplicar ---
function openApplyModal(jobId){
  const modal = $('#apply-modal');
  if(!modal) return;
  const job = jobs.find(j=>j.id === Number(jobId));
  $('#apply-job-title').textContent = job ? `${job.title} — ${job.company}` : 'Oferta';
  modal.setAttribute('aria-hidden','false');
}
function closeApplyModal(){
  const modal = $('#apply-modal');
  if(!modal) return;
  modal.setAttribute('aria-hidden','true');
}

// --- Simulación de auth ---
function saveUser(user){ localStorage.setItem('jp_user', JSON.stringify(user)); }
function getUser(){ try{return JSON.parse(localStorage.getItem('jp_user')||'null')}catch(e){return null} }
function logout(){ localStorage.removeItem('jp_user'); window.location.href='index.html'; }

// --- Form validations & events ---
function initAuthForms(){
  const reg = $('#register-form');
  if(reg){
    reg.addEventListener('submit', e=>{
      e.preventDefault();
      const name = $('#name').value.trim();
      const email = $('#email').value.trim();
      const pass = $('#password').value;
      const pass2 = $('#password-confirm').value;
      if(!name || !email || !pass) return alert('Completa todos los campos.');
      if(pass.length < 8) return alert('La contraseña debe tener al menos 8 caracteres.');
      if(pass !== pass2) return alert('Las contraseñas no coinciden.');
      // Simula creación de usuario
      saveUser({name,email,role:$('#role').value});
      alert('Cuenta creada. Redirigiendo al dashboard...');
      window.location.href='dashboard.html';
    });
  }

  const login = $('#login-form');
  if(login){
    login.addEventListener('submit', e=>{
      e.preventDefault();
      const email = $('#login-email').value.trim();
      const pass = $('#login-password').value;
      if(!email || !pass) return alert('Completa ambos campos.');
      // Simulación: si hay usuario en localStorage con mismo email, lo 'loguea'
      const user = getUser();
      if(user && user.email === email){
        alert('Inicio de sesión exitoso');
        window.location.href='dashboard.html';
      } else {
        // crear cuenta temporal para demo
        saveUser({name:email.split('@')[0],email});
        alert('Sesión iniciada (demo)');
        window.location.href='dashboard.html';
      }
    });
  }
}

// --- Event wiring ---
function initDashboard(){
  // Render inicial
  renderJobs(jobs);
  // filtros
  const salaryRange = $('#salary-range');
  if(salaryRange){
    salaryRange.addEventListener('input', ()=>{ $('#salary-value').textContent = salaryRange.value; });
  }
  const applyBtn = $('#apply-filters');
  if(applyBtn) applyBtn.addEventListener('click', applyFilters);
  const clearBtn = $('#clear-filters');
  if(clearBtn) clearBtn.addEventListener('click', ()=>{ $('#category').value=''; $('#city').value=''; $('#salary-range').value=10000; $('#salary-value').textContent='10000'; applyFilters(); });

  // Delegación para botones de aplicar
  document.addEventListener('click', e=>{
    const a = e.target.closest && e.target.closest('.btn-apply');
    if(a){ openApplyModal(a.dataset.id); }
    const d = e.target.closest && e.target.closest('.btn-details');
    if(d){ alert('Detalle de la oferta (demo)'); }
  });

  // Modal
  const modal = $('#apply-modal');
  if(modal){
    modal.addEventListener('click', e=>{ if(e.target === modal) closeApplyModal(); });
    $('.modal-close') && $('.modal-close').addEventListener('click', closeApplyModal);
    $('#apply-form') && $('#apply-form').addEventListener('submit', e=>{
      e.preventDefault();
      alert('Aplicación enviada (simulado). ¡Buena suerte!');
      closeApplyModal();
    });
  }
}

// --- Profile page wiring ---
function initProfile(){
  const user = getUser();
  if(user){
    $('#profile-name') && ( $('#profile-name').textContent = user.name || 'Usuario' );
    $('#profile-email') && ( $('#profile-email').textContent = user.email || '' );
  }
  const editBtn = $('#edit-profile');
  if(editBtn){
    editBtn.addEventListener('click', ()=>{
      const newName = prompt('Nombre completo', (user && user.name) || '');
      if(newName){ saveUser(Object.assign({},user,{name:newName})); window.location.reload(); }
    });
  }
}

// --- Small helpers for home page search ---
function initHomeSearch(){
  const form = $('#hero-search');
  if(!form) return;
  form.addEventListener('submit', e=>{
    e.preventDefault();
    const q = $('#q').value.trim();
    const loc = $('#location').value.trim();
    // redirige a dashboard con query params simples
    const params = new URLSearchParams(); if(q) params.set('q',q); if(loc) params.set('loc',loc);
    window.location.href = `dashboard.html?${params.toString()}`;
  });
}

// --- Inicializador global ---
function init(){
  initAuthForms();
  initHomeSearch();
  initProfile();
  initDashboard();

  // Si vienen filtros por query params, aplicarlos
  if(location.pathname.endsWith('dashboard.html')){
    const ps = new URLSearchParams(location.search);
    if(ps.get('q')){ $('#global-search') && ($('#global-search').value = ps.get('q')); }
    if(ps.get('loc')){ $('#city') && ($('#city').value = ps.get('loc')); }
    applyFilters();
  }
}

// Ejecutar cuando el DOM esté listo
if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();

/* Fin de main.js */