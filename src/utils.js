/**
 * Funciones de utilidad del sistema de ebooks
 */

/**
 * Formatea una fecha según el locale español
 * @param {Date} date - Objeto Date a formatear
 * @returns {string} Fecha formateada (ej: "1 de enero de 2025")
 */
function formatDate(date) {
  return date.toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

/**
 * Genera un ID único basado en timestamp
 * @returns {string} ID único
 */
function generateId() {
  return `ebook-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;
}

/**
 * Sanitiza texto para usarlo en HTML (previene XSS básico)
 * @param {string} text - Texto a sanitizar
 * @returns {string} Texto sanitizado
 */
function sanitizeHTML(text) {
  if (!text) return '';
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/**
 * Convierte texto plano en párrafos HTML
 * @param {string} text - Texto con saltos de línea
 * @returns {string} HTML con párrafos
 */
function textToParagraphs(text) {
  if (!text) return '';
  return text
    .split('\n\n')
    .map(p => `<p>${p.replace(/\n/g, '<br>')}</p>`)
    .join('\n');
}

/**
 * Trunca un texto a una longitud máxima
 * @param {string} text - Texto a truncar
 * @param {number} maxLength - Longitud máxima
 * @returns {string} Texto truncado con "..." si es necesario
 */
function truncate(text, maxLength = 150) {
  if (!text || text.length <= maxLength) return text;
  return text.substring(0, maxLength).trim() + '...';
}

module.exports = {
  formatDate,
  generateId,
  sanitizeHTML,
  textToParagraphs,
  truncate
};
