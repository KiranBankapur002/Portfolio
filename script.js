const revealTargets = document.querySelectorAll(
  '.hero > div, .section-header, .card, .project, .pill-grid > div, .timeline > div, .site-footer .container > div, .site-footer .fine'
);

revealTargets.forEach((el) => el.classList.add('reveal'));

const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        revealObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.14, rootMargin: '0px 0px -8% 0px' }
);

revealTargets.forEach((el) => revealObserver.observe(el));

const progress = document.querySelector('.scroll-progress');
const updateProgress = () => {
  const scrollTop = window.scrollY;
  const fullHeight = document.documentElement.scrollHeight - window.innerHeight;
  const value = fullHeight > 0 ? (scrollTop / fullHeight) * 100 : 0;
  if (progress) progress.style.width = `${value}%`;
};
window.addEventListener('scroll', updateProgress, { passive: true });
updateProgress();

const themeToggle = document.querySelector('.theme-switch');
const savedTheme = localStorage.getItem('portfolio-theme');
if (savedTheme === 'dark') {
  document.body.classList.add('dark');
}

const syncThemeButton = () => {
  if (!themeToggle) return;
  const isDark = document.body.classList.contains('dark');
  themeToggle.setAttribute('aria-pressed', String(isDark));
  themeToggle.setAttribute('aria-label', isDark ? 'Switch to light mode' : 'Switch to dark mode');
};

syncThemeButton();

const applyThemeToggle = () => {
  document.body.classList.toggle('dark');
  localStorage.setItem('portfolio-theme', document.body.classList.contains('dark') ? 'dark' : 'light');
  syncThemeButton();
};

if (themeToggle) {
  themeToggle.addEventListener('click', () => {
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const supportsTransition = typeof document.startViewTransition === 'function';

    const rect = themeToggle.getBoundingClientRect();
    const x = rect.left + rect.width / 2;
    const y = rect.top + rect.height / 2;
    document.documentElement.style.setProperty('--theme-x', `${x}px`);
    document.documentElement.style.setProperty('--theme-y', `${y}px`);

    if (!supportsTransition || reduceMotion) {
      applyThemeToggle();
      return;
    }

    document.startViewTransition(() => {
      applyThemeToggle();
    });
  });
}

const resumeModal = document.querySelector('#resumeModal');
const resumeOpen = document.querySelector('.resume-open');
const resumeCloseTargets = document.querySelectorAll('[data-close-resume]');

const openResume = () => {
  if (!resumeModal) return;
  resumeModal.classList.add('is-open');
  resumeModal.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';
};

const closeResume = () => {
  if (!resumeModal) return;
  resumeModal.classList.remove('is-open');
  resumeModal.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';
};

if (resumeOpen) resumeOpen.addEventListener('click', openResume);
resumeCloseTargets.forEach((el) => el.addEventListener('click', closeResume));

window.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    closeResume();
    closeProof();
  }
});

const proofModal = document.querySelector('#proofModal');
const proofCloseTargets = document.querySelectorAll('[data-close-proof]');
const proofFrame = document.querySelector('#proofFrame');
const proofImage = document.querySelector('#proofImage');
const proofTitle = document.querySelector('#proofTitle');
const proofLinks = document.querySelectorAll('.proof-link');

const isImageFile = (path) => /\.(png|jpg|jpeg|webp|gif|svg)$/i.test(path);

const openProof = (src, title) => {
  if (!proofModal || !proofFrame || !proofImage) return;
  proofTitle.textContent = title || 'Proof Viewer';
  const imageMode = isImageFile(src);

  if (imageMode) {
    proofModal.classList.add('is-image');
    proofImage.src = src;
    proofFrame.src = 'about:blank';
  } else {
    proofModal.classList.remove('is-image');
    proofFrame.src = src;
    proofImage.removeAttribute('src');
  }

  proofModal.classList.add('is-open');
  proofModal.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';
};

const closeProof = () => {
  if (!proofModal || !proofFrame || !proofImage) return;
  proofModal.classList.remove('is-open', 'is-image');
  proofModal.setAttribute('aria-hidden', 'true');
  proofFrame.src = 'about:blank';
  proofImage.removeAttribute('src');
  document.body.style.overflow = '';
};

proofLinks.forEach((link) => {
  link.addEventListener('click', (e) => {
    e.preventDefault();
    const src = link.getAttribute('href');
    const title = link.dataset.title || link.textContent.trim();
    openProof(src, title);
  });
});

proofCloseTargets.forEach((el) => el.addEventListener('click', closeProof));

const projectsTrack = document.querySelector('#projectsTrack');
const projectSlides = document.querySelectorAll('.project-slide');
const prevBtn = document.querySelector('.slider-btn--prev');
const nextBtn = document.querySelector('.slider-btn--next');
let activeSlide = 0;

const getSlideStep = () => {
  if (!projectsTrack || !projectSlides.length) return 0;
  const slideWidth = projectSlides[0].getBoundingClientRect().width;
  const gap = parseFloat(getComputedStyle(projectsTrack).gap || '0');
  return slideWidth + gap;
};

const refreshSliderButtons = () => {
  if (!prevBtn || !nextBtn) return;
  prevBtn.classList.toggle('is-disabled', activeSlide <= 0);
  nextBtn.classList.toggle('is-disabled', activeSlide >= projectSlides.length - 1);
};

const updateSlider = () => {
  if (!projectsTrack) return;
  const offset = getSlideStep() * activeSlide;
  projectsTrack.style.transform = `translateX(-${offset}px)`;
  refreshSliderButtons();
};

if (prevBtn && nextBtn && projectSlides.length) {
  prevBtn.addEventListener('click', () => {
    activeSlide = Math.max(0, activeSlide - 1);
    updateSlider();
  });

  nextBtn.addEventListener('click', () => {
    activeSlide = Math.min(projectSlides.length - 1, activeSlide + 1);
    updateSlider();
  });

  window.addEventListener('resize', () => {
    updateSlider();
  });

  updateSlider();
}

const filterButtons = document.querySelectorAll('.filter-btn');
const projects = document.querySelectorAll('.project');

filterButtons.forEach((btn) => {
  btn.addEventListener('click', () => {
    filterButtons.forEach((b) => b.classList.remove('is-active'));
    btn.classList.add('is-active');
    const tag = btn.dataset.filter;

    projects.forEach((project) => {
      const tags = project.dataset.tags || '';
      const visible = tag === 'all' || tags.includes(tag);
      project.classList.toggle('is-hidden', !visible);
    });
  });
});

const navLinks = document.querySelectorAll('.nav-links a[href^="#"]');
const sections = [...document.querySelectorAll('section[id]')];

const setActiveNav = () => {
  let current = sections[0]?.id;
  sections.forEach((section) => {
    const top = section.getBoundingClientRect().top;
    if (top <= 140) current = section.id;
  });

  navLinks.forEach((link) => {
    const active = link.getAttribute('href') === `#${current}`;
    link.classList.toggle('is-current', active);
  });
};

window.addEventListener('scroll', setActiveNav, { passive: true });
setActiveNav();

const orbs = document.querySelectorAll('.orb');
window.addEventListener(
  'mousemove',
  (e) => {
    const x = (e.clientX / window.innerWidth - 0.5) * 8;
    const y = (e.clientY / window.innerHeight - 0.5) * 8;
    orbs.forEach((orb, index) => {
      const factor = (index + 1) * 0.7;
      orb.style.transform = `translate(${x * factor}px, ${y * factor}px)`;
    });
  },
  { passive: true }
);

// Tilt interaction removed for a stable, non-flickering layout.
