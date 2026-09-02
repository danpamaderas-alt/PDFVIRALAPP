/**
 * Generador de HTML para ebooks
 * Lee plantillas y reemplaza variables con los datos del ebook
 */

const fs = require('fs');
const path = require('path');
const { formatDate } = require('./utils');

// Directorio raíz del proyecto
const ROOT = path.join(__dirname, '..');

/**
 * Lee una plantilla del directorio templates
 * @param {string} templateName - Nombre del archivo de plantilla
 * @returns {string} Contenido de la plantilla
 */
function readTemplate(templateName) {
  const templatePath = path.join(ROOT, 'templates', templateName);
  return fs.readFileSync(templatePath, 'utf-8');
}

/**
 * Lee una plantilla parcial
 * @param {string} partialName - Nombre del archivo parcial
 * @returns {string} Contenido de la plantilla parcial
 */
function readPartial(partialName) {
  const partialPath = path.join(ROOT, 'templates', 'partials', partialName);
  return fs.readFileSync(partialPath, 'utf-8');
}

/**
 * Genera el HTML de la página de portada
 * @param {object} cover - Datos de la portada
 * @param {string} author - Nombre del autor
 * @returns {string} HTML de la portada
 */
function generateCover(cover, author) {
  let html = readPartial('cover.html');
  const color = cover.color || '#1a1a2e';

  html = html.replace(/\{\{cover\.title\}\}/g, cover.title);
  html = html.replace(/\{\{cover\.tagline\}\}/g, cover.tagline);
  html = html.replace(/\{\{author\}\}/g, author);
  html = html.replace(/\{\{cover\.color\}\}/g, color);

  // Si hay imagen de portada, reemplazar el placeholder
  if (cover.image) {
    html = html.replace(/\{\{cover\.image\}\}/g, cover.image);
    html = html.replace(/<!-- Si no hay imagen -->[\s\S]*?<!-- \/Si no hay imagen -->/g,
      `<img src="${cover.image}" alt="${cover.title}" class="cover-image">`);
  } else {
    html = html.replace(/\{\{cover\.image\}\}/g, '');
  }

  return html;
}

/**
 * Genera el HTML de una lección completa
 * @param {object} lesson - Datos de la lección
 * @param {number} index - Número de la lección (0-indexed)
 * @returns {string} HTML de la lección
 */
function generateLesson(lesson, index) {
  const lessonTemplate = readPartial('lesson.html');
  const exerciseTemplate = readPartial('exercise.html');

  let sectionsHTML = '';

  // Generar cada sección de la lección
  if (lesson.sections && lesson.sections.length > 0) {
    lesson.sections.forEach((section, sIndex) => {
      let sectionHTML = `
        <div class="section">
          <h3>${section.title}</h3>
          <p>${section.content}</p>`;

      // Si hay viñetas, renderizarlas como lista
      if (section.bullets && section.bullets.length > 0) {
        sectionHTML += '<ul>';
        section.bullets.forEach(bullet => {
          sectionHTML += `<li>${bullet}</li>`;
        });
        sectionHTML += '</ul>';
      }

      // Si es un contenido destacado, envolverlo
      if (section.highlight) {
        sectionHTML = `<div class="highlight-box">${sectionHTML}</div>`;
      }

      sectionHTML += '</div>';
      sectionsHTML += sectionHTML;
    });
  }

  // Ensamblar la lección completa
  let html = lessonTemplate
    .replace(/\{\{lesson\.number\}\}/g, String(index + 1).padStart(2, '0'))
    .replace(/\{\{lesson\.title\}\}/g, lesson.title)
    .replace(/\{\{lesson\.icon\}\}/g, lesson.icon || '')
    .replace(/\{\{lesson\.sections\}\}/g, sectionsHTML);

  return html;
}

/**
 * Genera el HTML de los ejercicios
 * @param {Array} exercises - Lista de ejercicios
 * @returns {string} HTML de los ejercicios
 */
function generateExercises(exercises) {
  if (!exercises || exercises.length === 0) return '';

  let html = `
    <div class="exercises-section" id="exercises">
      <h2>📝 Ejercicios Prácticos</h2>`;

  exercises.forEach((exercise, index) => {
    let optionsHTML = '';
    if (exercise.options && exercise.options.length > 0) {
      optionsHTML = '<ul class="exercise-options">';
      exercise.options.forEach(opt => {
        optionsHTML += `<li>${opt}</li>`;
      });
      optionsHTML += '</ul>';
    }

    html += `
      <div class="exercise">
        <h3>Ejercicio ${index + 1}</h3>
        <p class="exercise-question">${exercise.question}</p>
        ${optionsHTML}
        ${exercise.hint ? `<p class="exercise-hint">💡 Pista: ${exercise.hint}</p>` : ''}
      </div>`;
  });

  html += '</div>';
  return html;
}

/**
 * Genera el HTML del checklist
 * @param {Array} checklist - Lista de tareas
 * @returns {string} HTML del checklist
 */
function generateChecklist(checklist) {
  if (!checklist || checklist.length === 0) return '';

  let html = `
    <div class="checklist-section" id="checklist">
      <h2>✅ Lista de Verificación</h2>
      <div class="checklist">`;

  checklist.forEach(item => {
    const checked = item.done ? 'checked' : '';
    html += `
        <label class="checklist-item">
          <input type="checkbox" ${checked} disabled>
          <span>${item.task}</span>
        </label>`;
  });

  html += `
      </div>
    </div>`;

  return html;
}

/**
 * Genera el HTML de la página de cierre
 * @param {object} closing - Datos de cierre
 * @returns {string} HTML del cierre
 */
function generateClosing(closing) {
  let html = readPartial('closing.html');

  html = html.replace(/\{\{closing\.message\}\}/g, closing.message);
  html = html.replace(/\{\{closing\.cta\}\}/g, closing.cta || '');

  // Enlaces de cierre
  let linksHTML = '';
  if (closing.links && closing.links.length > 0) {
    closing.links.forEach(link => {
      linksHTML += `<a href="${link.url}" class="cta-button">${link.label}</a> `;
    });
  }
  html = html.replace(/\{\{closing\.links\}\}/g, linksHTML);

  return html;
}

/**
 * Genera el HTML completo de un ebook
 * @param {object} ebook - Objeto con todos los datos del ebook
 * @returns {string} HTML completo listo para visualizar o imprimir
 */
function generateEbookHTML(ebook) {
  // Leer la plantilla principal
  let template = readTemplate('ebook.html');

  // Generar las partes del ebook
  const coverHTML = generateCover(ebook.cover, ebook.author);
  let lessonsHTML = '';
  if (ebook.lessons) {
    ebook.lessons.forEach((lesson, index) => {
      lessonsHTML += generateLesson(lesson, index);
    });
  }
  const exercisesHTML = generateExercises(ebook.exercises);
  const checklistHTML = generateChecklist(ebook.checklist);
  const closingHTML = generateClosing(ebook.closing);

  // Reemplazar variables en la plantilla principal
  template = template.replace(/\{\{ebook\.title\}\}/g, ebook.title);
  template = template.replace(/\{\{ebook\.subtitle\}\}/g, ebook.subtitle || '');
  template = template.replace(/\{\{ebook\.author\}\}/g, ebook.author);
  template = template.replace(/\{\{cover\}\}/g, coverHTML);
  template = template.replace(/\{\{lessons\}\}/g, lessonsHTML);
  template = template.replace(/\{\{exercises\}\}/g, exercisesHTML);
  template = template.replace(/\{\{checklist\}\}/g, checklistHTML);
  template = template.replace(/\{\{closing\}\}/g, closingHTML);
  template = template.replace(/\{\{generatedDate\}\}/g, formatDate(new Date()));

  return template;
}

/**
 * Genera una lista de ebooks disponibles (para demo sin Supabase)
 * @returns {Array} Lista de ebooks de ejemplo
 */
function listEbooks() {
  const examplesDir = path.join(ROOT, 'examples');
  const files = fs.readdirSync(examplesDir).filter(f => f.endsWith('.json'));

  return files.map(file => {
    const data = JSON.parse(fs.readFileSync(path.join(examplesDir, file), 'utf-8'));
    return { id: data.id, title: data.title, author: data.author };
  });
}

module.exports = {
  generateEbookHTML,
  listEbooks,
  readTemplate,
  readPartial
};
