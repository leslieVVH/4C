/* ----------------------------------------------------
   RecoTrash — Interacciones y efectos
   - Menú móvil accesible
   - Reveal on Scroll con IntersectionObserver
   - KPIs (counter)
   - Barra de progreso animada al entrar en viewport
   - Slider táctil con ARIA + dots + teclado
   - Parallax sutil en el hero
   - Validación básica del formulario (sin backend)
----------------------------------------------------- */

// Utilidad: seleccionar
const $ = (sel, ctx=document) => ctx.querySelector(sel);
const $$ = (sel, ctx=document) => Array.from(ctx.querySelectorAll(sel));

// Año en footer
$('#year').textContent = new Date().getFullYear();

/* Menú móvil accesible */
const header = document.body;
const navToggle = $('.nav-toggle');
const nav = $('#nav');
navToggle?.addEventListener('click', () => {
  const open = header.classList.toggle('nav-open');
  navToggle.setAttribute('aria-expanded', String(open));
  if(open) $('a', nav)?.focus();
});
nav?.addEventListener('click', e=>{
  if(e.target.matches('a')) header.classList.remove('nav-open');
});

/* Reveal on Scroll */
const io = new IntersectionObserver((entries)=>{
  entries.forEach(entry=>{
    if(entry.isIntersecting){
      entry.target.classList.add('visible');
      io.unobserve(entry.target);
    }
  });
},{threshold:0.14});
$$('.reveal').forEach(el=>io.observe(el));

/* Contadores KPI */
const counters = $$('.kpi-number');
const ioCount = new IntersectionObserver((entries)=>{
  entries.forEach(entry=>{
    if(!entry.isIntersecting) return;
    const el = entry.target;
    const target = +el.dataset.target;
    const duration = 1000;
    const start = performance.now();
    const step = (t)=>{
      const p = Math.min(1, (t-start)/duration);
      el.textContent = Math.floor(p*target);
      if(p<1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
    ioCount.unobserve(el);
  });
},{threshold:0.6});
counters.forEach(el=>ioCount.observe(el));

/* Barras de progreso animadas */
const ioProg = new IntersectionObserver((entries)=>{
  entries.forEach(entry=>{
    if(entry.isIntersecting){
      $$('span', entry.target).forEach(span=>{
        span.style.width = (span.style.getPropertyValue('--value') || '0') + '%';
      });
      ioProg.unobserve(entry.target);
    }
  });
},{threshold:0.5});
$$('.progress').forEach(p=>ioProg.observe(p));

/* Slider táctil accesible */
(function slider(){
  const root = $('#galeria .slider');
  if(!root) return;
  const slidesEl = $('.slides', root);
  const slides = $$('.slide', slidesEl);
  const prev = $('.prev', root);
  const next = $('.next', root);
  const dots = $('.dots', root);
  let index = 0, lock = false, startX = 0, dx = 0;

  // Dots
  slides.forEach((_,i)=>{
    const b = document.createElement('button');
    b.type = 'button';
    b.setAttribute('role','tab');
    b.setAttribute('aria-label', `Ir a la diapositiva ${i+1}`);
    if(i===0) b.setAttribute('aria-selected','true');
    b.addEventListener('click', ()=>go(i));
    dots.appendChild(b);
  });

  const update = ()=>{
    slidesEl.style.transform = `translateX(${index*-100}%)`;
    $$('.slide', slidesEl).forEach((s,i)=> s.classList.toggle('current', i===index));
    $$('.dots button', root).forEach((d,i)=> d.setAttribute('aria-selected', String(i===index)));
  };

  const go = (i)=>{
    if(lock) return; lock = true;
    index = (i+slides.length) % slides.length;
    update();
    setTimeout(()=>lock=false, 350);
  };

  prev.addEventListener('click', ()=>go(index-1));
  next.addEventListener('click', ()=>go(index+1));
  root.addEventListener('keydown', (e)=>{
    if(e.key==='ArrowLeft') go(index-1);
    if(e.key==='ArrowRight') go(index+1);
  });

  // Drag / touch
  const onStart = (x)=>{ startX = x; dx = 0; slidesEl.style.transition='none'; };
  const onMove  = (x)=>{ dx = x - startX; slidesEl.style.transform = `translateX(calc(${index*-100}% + ${dx}px))`; };
  const onEnd   = ()=>{
    slidesEl.style.transition='';
    if(Math.abs(dx) > 60) go(index + (dx<0 ? 1 : -1)); else update();
  };
  slidesEl.addEventListener('pointerdown', e=>{slidesEl.setPointerCapture(e.pointerId); onStart(e.clientX);});
  slidesEl.addEventListener('pointermove', e=>{ if(e.pressure>0) onMove(e.clientX); });
  slidesEl.addEventListener('pointerup', onEnd);
  update();
})();

/* Parallax sutil en hero */
(function parallax(){
  const hero = $('.hero');
  const bg = $('.hero-bg', hero);
  if(!hero || !bg) return;
  window.addEventListener('scroll', ()=>{
    const y = Math.min(1, window.scrollY / (window.innerHeight*1.2));
    bg.style.transform = `translateY(${y*20}px) scale(${1 + y*0.02})`;
  }, {passive:true});
})();

/* Validación de formulario (demo) */
$('.form')?.addEventListener('submit', (e)=>{
  e.preventDefault();
  const form = e.currentTarget;
  const status = $('.form-status', form);
  const data = Object.fromEntries(new FormData(form).entries());
  // Validación simple
  if(!data.nombre || !data.email || !data.mensaje){
    status.textContent = 'Completa todos los campos.';
    return;
  }
  // Simular envío
  status.textContent = '¡Gracias! Te contactaremos pronto.';
  form.reset();
});