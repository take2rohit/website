const dataFiles = {
  about: '_data/aboutme.yml',
  news: '_data/news.yml',
  experience: '_data/experience.yml',
  projects: '_data/projects.yml',
  publications: '_data/publications.yml',
  patents: '_data/patents.yml',
  courses: '_data/courses.yml',
  skills: '_data/skills.yml'
};

const keywordPalette = [
  { key: 'paper', label: 'Publications' },
  { key: 'model', label: 'AI Models' },
  { key: 'award', label: 'Awards' },
  { key: 'accepted', label: 'Conferences' },
  { key: 'released', label: 'Releases' }
];

async function loadYaml(path) {
  const response = await fetch(path);
  if (!response.ok) {
    throw new Error(`Failed to load ${path}`);
  }
  const text = await response.text();
  return jsyaml.load(text);
}

function createElement(tag, options = {}) {
  const el = document.createElement(tag);
  if (options.className) el.className = options.className;
  if (options.html) el.innerHTML = options.html;
  if (options.text) el.textContent = options.text;
  if (options.attrs) {
    Object.entries(options.attrs).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        el.setAttribute(key, value);
      }
    });
  }
  return el;
}

function parseMarkdownLinks(text = '') {
  if (!text) return '';
  return text
    .replace(/\n/g, '<br>')
    .replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>');
}

function renderBio(about) {
  const bioCard = document.getElementById('bio-card');
  const mapCard = document.getElementById('map-card');

  const bioHeader = createElement('div', { className: 'bio-header fade-in' });
  const avatar = createElement('img', {
    attrs: { src: about['DP_Link'], alt: `${about['Name']} portrait` }
  });
  avatar.addEventListener('error', () => {
    const initials = (about['Name'] || '')
      .split(' ')
      .filter(Boolean)
      .map(part => part[0])
      .join('')
      .slice(0, 2)
      .toUpperCase();
    const fallback = createElement('div', {
      className: 'avatar-fallback',
      text: initials || 'RL'
    });
    avatar.replaceWith(fallback);
  }, { once: true });
  const heading = createElement('div');
  heading.innerHTML = `
    <h1>${about['Name']}<span>${about['Area_Of_Expertise'] ?? ''}</span></h1>
  `;

  bioHeader.append(avatar, heading);

  const aboutText = createElement('p', {
    className: 'bio-description fade-in',
    html: parseMarkdownLinks(about['About'])
  });

  const socials = createElement('div', { className: 'socials fade-in' });
  const socialEntries = [
    { icon: 'fa-brands fa-github', label: 'GitHub', url: about['Github'] },
    { icon: 'fa-brands fa-linkedin', label: 'LinkedIn', url: about['LinkedIn'] },
    { icon: 'fa-solid fa-envelope', label: 'Email', url: about['Email'] },
    { icon: 'fa-brands fa-x-twitter', label: 'X', url: about['Twitter'] },
    { icon: 'fa-solid fa-graduation-cap', label: 'Scholar', url: about['Scholar'] }
  ];

  socialEntries
    .filter(item => item.url && item.url !== '#')
    .forEach(item => {
      const link = createElement('a', {
        className: 'button',
        attrs: { href: item.url, target: '_blank', rel: 'noopener' }
      });
      link.innerHTML = `<i class="${item.icon}"></i>${item.label}`;
      socials.appendChild(link);
    });

  bioCard.append(bioHeader, aboutText, socials);

  if (about['Map_Location_Link']) {
    const iframe = createElement('iframe', {
      attrs: {
        src: about['Map_Location_Link'],
        loading: 'lazy',
        referrerpolicy: 'no-referrer-when-downgrade',
        allowfullscreen: ''
      }
    });
    const locationText = parseMarkdownLinks(about['Work_Location']);
    const location = createElement('div', {
      className: 'fade-in',
      html: `<h3>Workspace</h3><p class="section-subtitle">${locationText ?? ''}</p>`
    });
    mapCard.append(location, iframe);
  }
}

function renderNews(newsData) {
  const latestList = document.getElementById('news-latest-list');
  const archiveList = document.getElementById('news-archive-list');
  const filtersRow = document.getElementById('news-filters');

  const { k = 6, news = [] } = newsData ?? {};
  const latest = news.slice(0, k);
  const archive = news.slice(k);

  const allChip = createElement('button', {
    className: 'chip active',
    text: 'All',
    attrs: { 'data-keyword': 'all' }
  });
  allChip.addEventListener('click', () => {
    document.querySelectorAll('.chip').forEach(c => c.classList.remove('active'));
    allChip.classList.add('active');
    populateNewsList(latestList, latest);
    populateNewsList(archiveList, archive);
  });
  filtersRow.appendChild(allChip);

  keywordPalette.forEach(keyword => {
    const chip = createElement('button', {
      className: 'chip',
      text: keyword.label,
      attrs: { 'data-keyword': keyword.key }
    });
    chip.addEventListener('click', () => {
      document.querySelectorAll('.chip').forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      applyNewsFilter(keyword.key, latest, archive, latestList, archiveList);
    });
    filtersRow.appendChild(chip);
  });

  populateNewsList(latestList, latest);
  populateNewsList(archiveList, archive);
}

function populateNewsList(container, items) {
  container.innerHTML = '';
  items.forEach(item => {
    const card = createElement('article', { className: 'news-card fade-in' });
    const time = createElement('time', { text: item.date });
    const description = createElement('p', { html: parseMarkdownLinks(item.description) });
    card.append(time, description);
    container.appendChild(card);
  });
}

function applyNewsFilter(keyword, latest, archive, latestContainer, archiveContainer) {
  if (!keyword) return;
  const filterItems = items =>
    items.filter(item => (item.description ?? '').toLowerCase().includes(keyword));
  populateNewsList(latestContainer, filterItems(latest));
  populateNewsList(archiveContainer, filterItems(archive));
}

function renderExperience(entries) {
  const timeline = document.getElementById('experience-timeline');
  entries.forEach(entry => {
    const item = createElement('div', { className: 'timeline-item fade-in' });
    const dot = createElement('div', { className: 'timeline-dot' });
    const card = createElement('div', { className: 'timeline-card' });

    const title = createElement('h3');
    title.innerHTML = entry.url
      ? `<a href="${entry.url}" target="_blank" rel="noopener">${entry.company}</a>`
      : entry.company;
    const role = createElement('span', { className: 'section-subtitle', text: entry.title ?? '' });
    title.appendChild(role);

    const meta = createElement('div', { className: 'timeline-meta' });
    if (entry.date) meta.appendChild(createElement('span', { text: entry.date }));
    if (entry.location) meta.appendChild(createElement('span', { text: entry.location }));

    const description = createElement('p', { html: parseMarkdownLinks(entry.description) });

    card.append(title, meta, description);
    item.append(dot, card);
    timeline.appendChild(item);
  });
}

function renderProjects(projects) {
  const grid = document.getElementById('projects-grid');
  projects.forEach(project => {
    const card = createElement('article', { className: 'project-card fade-in' });

    if (project.image) {
      const img = createElement('img', {
        className: 'card-image',
        attrs: { src: project.image, alt: `${project.title} visual`, loading: 'lazy' }
      });
      img.addEventListener('error', () => {
        img.remove();
        const placeholder = createElement('div', {
          className: 'card-placeholder',
          html: '<i class="fa-solid fa-diagram-project"></i>'
        });
        card.prepend(placeholder);
      }, { once: true });
      card.appendChild(img);
    }

    const title = createElement('h3', { text: project.title });
    const summary = createElement('p', {
      className: 'section-subtitle',
      html: parseMarkdownLinks(project.abstract)
    });

    const actions = createElement('div', { className: 'card-actions' });
    [
      { label: 'Paper', icon: 'fa-regular fa-file-lines', url: project.paper },
      { label: 'Video', icon: 'fa-solid fa-circle-play', url: project.video },
      { label: 'Code', icon: 'fa-brands fa-github', url: project.github }
    ].forEach(link => {
      if (link.url && link.url.trim() && link.url !== '#') {
        const button = createElement('a', {
          className: 'button',
          attrs: { href: link.url, target: '_blank', rel: 'noopener' }
        });
        button.innerHTML = `<i class="${link.icon}"></i>${link.label}`;
        actions.appendChild(button);
      }
    });

    card.append(title, summary, actions);
    grid.appendChild(card);
  });
}

function renderPublications(publications) {
  const stack = document.getElementById('publications-stack');
  publications
    .filter(item => typeof item === 'object' && item.paper)
    .forEach(item => {
      const card = createElement('article', { className: 'publication-card fade-in' });
      const title = createElement('h3', { text: item.paper });
      const meta = createElement('div', { className: 'publication-meta' });
      if (item.pub) meta.appendChild(createElement('span', { text: item.pub }));
      if (item.type) meta.appendChild(createElement('span', { text: item.type }));
      if (item.author) meta.appendChild(createElement('span', { text: item.author }));

      const actions = createElement('div', { className: 'card-actions' });
      [
        { label: 'Paper', icon: 'fa-regular fa-file-lines', url: item.paper_link },
        { label: 'Project', icon: 'fa-solid fa-globe', url: item.project_page },
        { label: 'Code', icon: 'fa-brands fa-github', url: item.code_link },
        { label: 'BibTeX', icon: 'fa-solid fa-quote-right', url: item.bibtex },
        { label: 'Video', icon: 'fa-solid fa-circle-play', url: item.video }
      ].forEach(link => {
        if (link.url && link.url.trim() && link.url !== '#') {
          const button = createElement('a', {
            className: 'button',
            attrs: { href: link.url, target: '_blank', rel: 'noopener' }
          });
          button.innerHTML = `<i class="${link.icon}"></i>${link.label}`;
          actions.appendChild(button);
        }
      });

      card.append(title, meta, actions);
      stack.appendChild(card);
    });
}

function renderAchievements(patents, newsData) {
  const grid = document.getElementById('achievements-grid');
  const notableKeywords = ['accepted', 'released', 'awarded', 'winner', 'spotlight', 'joined', 'delivered'];
  const notableNews = (newsData.news || []).filter(item =>
    notableKeywords.some(keyword => (item.description ?? '').toLowerCase().includes(keyword))
  ).slice(0, 8);

  patents.forEach(patent => {
    const card = createElement('article', { className: 'achievement-card fade-in' });
    card.appendChild(createElement('h3', { text: patent.patent }));
    const meta = createElement('p', {
      className: 'section-subtitle',
      html: `${patent.author ?? ''}<br><small>${patent.issued ?? ''} • ${patent.number ?? ''}</small>`
    });

    const actions = createElement('div', { className: 'card-actions' });
    [
      { label: 'Patent File', icon: 'fa-regular fa-file-lines', url: patent.file },
      { label: 'Demo', icon: 'fa-solid fa-circle-play', url: patent.video }
    ].forEach(link => {
      if (link.url && link.url.trim() && link.url !== '#') {
        const button = createElement('a', {
          className: 'button',
          attrs: { href: link.url, target: '_blank', rel: 'noopener' }
        });
        button.innerHTML = `<i class="${link.icon}"></i>${link.label}`;
        actions.appendChild(button);
      }
    });

    card.append(meta, actions);
    grid.appendChild(card);
  });

  notableNews.forEach(item => {
    const card = createElement('article', { className: 'achievement-card fade-in' });
    card.appendChild(createElement('h3', { text: `Highlight — ${item.date}` }));
    card.appendChild(createElement('p', {
      className: 'section-subtitle',
      html: parseMarkdownLinks(item.description)
    }));
    grid.appendChild(card);
  });
}

function renderCourses(courses) {
  const container = document.getElementById('courses-list');
  courses.forEach(course => {
    const card = createElement('div', { className: 'course-card fade-in' });
    card.appendChild(createElement('h3', { text: course.title }));

    const metaParts = [];
    if (course.source) {
      if (course.source_url) {
        metaParts.push(`<a href="${course.source_url}" target="_blank" rel="noopener">${course.source}</a>`);
      } else {
        metaParts.push(course.source);
      }
    }
    if (course.instructor) {
      if (course.instructor_url) {
        metaParts.push(`<a href="${course.instructor_url}" target="_blank" rel="noopener">${course.instructor}</a>`);
      } else {
        metaParts.push(course.instructor);
      }
    }

    if (metaParts.length) {
      card.appendChild(createElement('p', {
        className: 'section-subtitle',
        html: metaParts.join(' • ')
      }));
    }

    if (course.certificate && course.certificate !== '#') {
      const button = createElement('a', {
        className: 'button',
        attrs: { href: course.certificate, target: '_blank', rel: 'noopener' }
      });
      button.innerHTML = '<i class="fa-solid fa-award"></i>Certificate';
      card.appendChild(createElement('div', { className: 'card-actions' })).appendChild(button);
    }

    container.appendChild(card);
  });
}

function renderSkills(skills) {
  const container = document.getElementById('skills-cloud');
  skills.forEach(skill => {
    const pill = createElement('div', { className: 'skill-pill fade-in' });
    if (skill.image) {
      const img = createElement('img', { attrs: { src: skill.image, alt: `${skill.name} icon`, loading: 'lazy' } });
      img.addEventListener('error', () => img.remove(), { once: true });
      pill.appendChild(img);
    }
    pill.appendChild(createElement('span', { text: skill.name }));
    container.appendChild(pill);
  });
}

function setupNavToggle() {
  const toggle = document.querySelector('.nav-toggle');
  const links = document.querySelector('.nav-links');
  toggle.addEventListener('click', () => {
    links.classList.toggle('open');
  });
  links.querySelectorAll('a').forEach(anchor => {
    anchor.addEventListener('click', () => links.classList.remove('open'));
  });
}

function setupScrollAnimations() {
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.2,
    rootMargin: '0px 0px -50px 0px'
  });

  document.querySelectorAll('.fade-in').forEach(el => observer.observe(el));
}

function updateFooterYear() {
  document.getElementById('footer-year').textContent = new Date().getFullYear();
}

async function init() {
  try {
    const [about, news, experience, projects, publications, patents, courses, skills] = await Promise.all([
      loadYaml(dataFiles.about),
      loadYaml(dataFiles.news),
      loadYaml(dataFiles.experience),
      loadYaml(dataFiles.projects),
      loadYaml(dataFiles.publications),
      loadYaml(dataFiles.patents),
      loadYaml(dataFiles.courses),
      loadYaml(dataFiles.skills)
    ]);

    renderBio(about);
    renderNews(news);
    renderExperience(experience);
    renderProjects(projects);
    renderPublications(publications);
    renderAchievements(patents, news);
    renderCourses(courses);
    renderSkills(skills);
    updateFooterYear();
    setupNavToggle();
    setupScrollAnimations();
  } catch (error) {
    console.error('Failed to initialise page', error);
  }
}

init();
