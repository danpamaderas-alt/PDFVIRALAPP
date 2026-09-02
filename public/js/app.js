/**
 * app.js - Interfaz web del sistema de generación de ebooks
 * Maneja las operaciones CRUD a través de la API REST
 */

const API = '/api/ebooks';
let currentEbooks = [];

// ─── Inicialización ─────────────────────────────────────────────

document.addEventListener('DOMContentLoaded', () => {
  loadEbooks();
});

// ─── Funciones de la API ────────────────────────────────────────

/**
 * Carga la lista de ebooks desde el servidor
 */
async function loadEbooks() {
  try {
    const res = await fetch(API);
    const json = await res.json();
    currentEbooks = json.data || [];
    renderEbookList(currentEbooks);
  } catch (err) {
    showToast('Error al cargar ebooks', 'error');
  }
}

/**
 * Carga un ebook específico y abre el editor
 * @param {string} id - ID del ebook
 */
async function loadEbook(id) {
  try {
    const res = await fetch(`${API}/${id}`);
    const json = await res.json();
    if (json.success) {
      openEditor(json.data);
    } else {
      showToast('Ebook no encontrado', 'error');
    }
  } catch (err) {
    showToast('Error al cargar el ebook', 'error');
  }
}

/**
 * Guarda un ebook (crea o actualiza)
 * @param {object} ebook - Datos del ebook
 */
async function saveEbook(ebook) {
  try {
    const method = ebook.id ? 'PUT' : 'POST';
    const url = ebook.id ? `${API}/${ebook.id}` : API;

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(ebook)
    });

    const json = await res.json();
    if (json.success) {
      showToast(ebook.id ? 'Ebook actualizado' : 'Ebook creado', 'success');
      loadEbooks();
      closeEditor();
    } else {
      showToast('Error al guardar', 'error');
    }
  } catch (err) {
    showToast('Error de conexión', 'error');
  }
}

/**
 * Elimina un ebook
 * @param {string} id - ID del ebook
 */
async function deleteEbook(id) {
  if (!confirm('¿Estás seguro de que deseas eliminar este ebook?')) return;

  try {
    const res = await fetch(`${API}/${id}`, { method: 'DELETE' });
    const json = await res.json();
    if (json.success) {
      showToast('Ebook eliminado', 'success');
      loadEbooks();
    }
  } catch (err) {
    showToast('Error al eliminar', 'error');
  }
}

// ─── Renderizado ────────────────────────────────────────────────

/**
 * Renderiza la lista de ebooks en la cuadrícula
 * @param {Array} ebooks - Lista de ebooks
 */
function renderEbookList(ebooks) {
  const grid = document.getElementById('ebook-grid');
  if (!grid) return;

  if (!ebooks || ebooks.length === 0) {
    grid.innerHTML = `
      <div class="empty-state">
        <div class="icon">📚</div>
        <h3>No hay ebooks todavía</h3>
        <p>Crea tu primer ebook para comenzar</p>
      </div>`;
    return;
  }

  grid.innerHTML = ebooks.map(ebook => `
    <div class="ebook-card">
      <div class="ebook-card-header">
        <h3>${escapeHTML(ebook.title)}</h3>
        <div class="author">${escapeHTML(ebook.author || 'Sin autor')}</div>
      </div>
      <div class="ebook-card-body">
        <div class="meta">
          ID: ${ebook.id}
        </div>
        <div class="ebook-card-actions">
          <a href="/generate/${ebook.id}" target="_blank" class="btn btn-outline" style="font-size:0.85rem;">
            👁️ Vista previa
          </a>
          <button onclick="loadEbook('${ebook.id}')" class="btn btn-secondary" style="font-size:0.85rem;">
            ✏️ Editar
          </button>
          <button onclick="deleteEbook('${ebook.id}')" class="btn btn-danger" style="font-size:0.85rem;">
            🗑️
          </button>
        </div>
      </div>
    </div>
  `).join('');
}

// ─── Editor ─────────────────────────────────────────────────────

/**
 * Abre el editor con los datos de un ebook
 * @param {object} ebook - Datos del ebook (null para crear nuevo)
 */
function openEditor(ebook = null) {
  const editor = document.getElementById('editor-section');
  const list = document.getElementById('list-section');
  const title = document.getElementById('editor-title');
  const textarea = document.getElementById('json-editor');

  if (list) list.style.display = 'none';
  if (editor) editor.style.display = 'block';

  if (ebook) {
    title.textContent = 'Editar Ebook';
    textarea.value = JSON.stringify(ebook, null, 2);
  } else {
    title.textContent = 'Nuevo Ebook';
    textarea.value = JSON.stringify(getDefaultEbook(), null, 2);
  }
}

/**
 * Cierra el editor y vuelve a la lista
 */
function closeEditor() {
  const editor = document.getElementById('editor-section');
  const list = document.getElementById('list-section');

  if (editor) editor.style.display = 'none';
  if (list) list.style.display = 'block';
  loadEbooks();
}

/**
 * Guarda el contenido del editor JSON
 */
function saveFromEditor() {
  const textarea = document.getElementById('json-editor');
  try {
    const ebook = JSON.parse(textarea.value);
    saveEbook(ebook);
  } catch (err) {
    showToast('JSON inválido. Verifica la sintaxis.', 'error');
  }
}

// ─── Utilidades ─────────────────────────────────────────────────

/**
 * Retorna un ebook por defecto para crear uno nuevo
 */
function getDefaultEbook() {
  return {
    id: `ebook-${Date.now()}`,
    title: 'Mi Nuevo Ebook',
    subtitle: 'Un subtítulo descriptivo',
    author: 'Tu Nombre',
    cover: {
      title: 'Mi Nuevo Ebook',
      tagline: 'Una frase gancho',
      color: '#1a1a2e'
    },
    lessons: [
      {
        title: 'Primera Lección',
        icon: '📖',
        sections: [
          {
            title: 'Introducción',
            content: 'Escribe el contenido de esta sección aquí.'
          }
        ]
      }
    ],
    exercises: [
      {
        question: 'Escribe tu primera pregunta de ejercicio aquí',
        hint: 'Una pista opcional'
      }
    ],
    checklist: [
      { task: 'Tarea de ejemplo', done: false }
    ],
    closing: {
      message: '¡Felicidades por completar este ebook!',
      cta: '¡Compártelo con tus amigos!',
      links: []
    }
  };
}

/**
 * Escapa caracteres especiales de HTML
 */
function escapeHTML(str) {
  if (!str) return '';
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

/**
 * Muestra una notificación toast
 * @param {string} message - Mensaje a mostrar
 * @param {string} type - Tipo: 'success', 'error', 'info'
 */
function showToast(message, type = 'info') {
  // Eliminar toasts anteriores
  document.querySelectorAll('.toast').forEach(t => t.remove());

  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.textContent = message;
  document.body.appendChild(toast);

  setTimeout(() => toast.remove(), 3500);
}
