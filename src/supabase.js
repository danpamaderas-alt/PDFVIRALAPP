/**
 * Cliente de Supabase para operaciones CRUD de ebooks
 * Maneja la conexión y operaciones con la base de datos
 */

const { createClient } = require('@supabase/supabase-js');

// Configuración del cliente Supabase
const SUPABASE_URL = process.env.SUPABASE_URL || '';
const SUPABASE_KEY = process.env.SUPABASE_ANON_KEY || '';
const TABLE = process.env.SUPABASE_TABLE || 'ebooks';

let supabase = null;

/**
 * Inicializa el cliente de Supabase
 * Solo se conecta si las variables de entorno están configuradas
 */
function getClient() {
  if (!SUPABASE_URL || !SUPABASE_KEY) {
    console.log('⚠️  Supabase no configurado. Usando almacenamiento local.');
    return null;
  }
  if (!supabase) {
    supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
  }
  return supabase;
}

/**
 * Obtiene todos los ebooks
 * @returns {Promise<Array>} Lista de ebooks
 */
async function getAllEbooks() {
  const client = getClient();
  if (!client) {
    // Sin Supabase: devolver ejemplos locales
    const fs = require('fs');
    const path = require('path');
    const examplesDir = path.join(__dirname, '..', 'examples');
    const files = fs.readdirSync(examplesDir).filter(f => f.endsWith('.json'));
    return files.map(file => {
      const data = JSON.parse(fs.readFileSync(path.join(examplesDir, file), 'utf-8'));
      return { id: data.id, title: data.title, author: data.author };
    });
  }

  const { data, error } = await client
    .from(TABLE)
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
}

/**
 * Obtiene un ebook por su ID
 * @param {string} id - ID del ebook
 * @returns {Promise<object|null>} Datos del ebook o null
 */
async function getEbook(id) {
  const client = getClient();
  if (!client) {
    // Sin Supabase: buscar en ejemplos locales
    const fs = require('fs');
    const path = require('path');
    const filePath = path.join(__dirname, '..', 'examples', `${id}.json`);
    if (fs.existsSync(filePath)) {
      return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    }
    return null;
  }

  // Obtener ebook con todas sus relaciones
  const { data: ebook, error: ebookError } = await client
    .from('ebooks')
    .select('*')
    .eq('id', id)
    .single();

  if (ebookError) {
    if (ebookError.code === 'PGRST116') return null;
    throw ebookError;
  }

  // Obtener lecciones
  const { data: lessons } = await client
    .from('lessons')
    .select('*')
    .eq('ebook_id', id)
    .order('order_num');

  // Obtener ejercicios para cada lección
  const lessonsWithExercises = [];
  for (const lesson of (lessons || [])) {
    const { data: exercises } = await client
      .from('exercises')
      .select('*')
      .eq('lesson_id', lesson.id)
      .limit(1);
    
    lessonsWithExercises.push({
      ...lesson,
      exercise: exercises?.[0] || null
    });
  }

  // Obtener checklist
  const { data: checklist } = await client
    .from('checklist_items')
    .select('*')
    .eq('ebook_id', id);

  // Obtener mensaje de cierre
  const { data: closing } = await client
    .from('closing_messages')
    .select('*')
    .eq('ebook_id', id)
    .limit(1);

  // Transformar al formato que espera el generador
  return {
    ...ebook,
    cover: {
      title: ebook.title,
      tagline: ebook.description,
      color: ebook.theme?.primary_color || '#1a365d'
    },
    lessons: lessonsWithExercises.map(l => ({
      title: l.title,
      subtitle: l.subtitle,
      icon: '📚',
      sections: [
        {
          title: 'Objetivo',
          content: l.objective,
          highlight: true
        },
        {
          title: 'Conceptos Clave',
          content: '',
          bullets: (l.concepts || []).map(c => `<strong>${c.title}:</strong> ${c.text}`)
        },
        {
          title: 'Plan de Implementacion',
          content: '',
          bullets: (l.implementation || []).map(i => `<strong>Paso ${i.step}: ${i.title}</strong> - ${i.text}`)
        }
      ]
    })),
    exercises: lessonsWithExercises
      .filter(l => l.exercise)
      .map(l => ({
        question: l.exercise.title,
        hint: l.exercise.description,
        options: (l.exercise.examples || []).map(e => `<strong>${e.type}:</strong> ${e.action}`)
      })),
    checklist: (checklist || []).map(c => ({
      task: c.text,
      done: false
    })),
    closing: closing?.[0] ? {
      message: closing[0].message,
      cta: closing[0].title,
      links: (closing[0].next_steps || []).map(s => ({
        label: s.title,
        url: '#'
      }))
    } : {
      message: 'Gracias por leer este ebook.',
      cta: '¡Comienza tu viaje!',
      links: []
    }
  };
}

/**
 * Crea un nuevo ebook
 * @param {object} ebook - Datos del ebook
 * @returns {Promise<object>} Resultado de la operación
 */
async function createEbook(ebook) {
  const client = getClient();
  if (!client) {
    // Sin Supabase: guardar como archivo local
    const fs = require('fs');
    const path = require('path');
    const id = ebook.id || `ebook-${Date.now()}`;
    ebook.id = id;
    ebook.created_at = new Date().toISOString();
    const filePath = path.join(__dirname, '..', 'examples', `${id}.json`);
    fs.writeFileSync(filePath, JSON.stringify(ebook, null, 2), 'utf-8');
    return { data: ebook, error: null };
  }

  const { data, error } = await client
    .from(TABLE)
    .insert([ebook])
    .select();

  if (error) throw error;
  return { data: data?.[0], error: null };
}

/**
 * Actualiza un ebook existente
 * @param {string} id - ID del ebook
 * @param {object} updates - Campos a actualizar
 * @returns {Promise<object>} Resultado de la operación
 */
async function updateEbook(id, updates) {
  const client = getClient();
  if (!client) {
    // Sin Supabase: actualizar archivo local
    const fs = require('fs');
    const path = require('path');
    const filePath = path.join(__dirname, '..', 'examples', `${id}.json`);
    if (!fs.existsSync(filePath)) {
      return { data: null, error: { message: 'No encontrado' } };
    }
    const existing = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    const updated = { ...existing, ...updates, updated_at: new Date().toISOString() };
    fs.writeFileSync(filePath, JSON.stringify(updated, null, 2), 'utf-8');
    return { data: updated, error: null };
  }

  updates.updated_at = new Date().toISOString();

  const { data, error } = await client
    .from(TABLE)
    .update(updates)
    .eq('id', id)
    .select();

  if (error) throw error;
  return { data: data?.[0], error: null };
}

/**
 * Elimina un ebook
 * @param {string} id - ID del ebook
 * @returns {Promise<object>} Resultado de la operación
 */
async function deleteEbook(id) {
  const client = getClient();
  if (!client) {
    // Sin Supabase: eliminar archivo local
    const fs = require('fs');
    const path = require('path');
    const filePath = path.join(__dirname, '..', 'examples', `${id}.json`);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
    return { error: null };
  }

  const { error } = await client
    .from(TABLE)
    .delete()
    .eq('id', id);

  if (error) throw error;
  return { error: null };
}

module.exports = {
  getClient,
  getAllEbooks,
  getEbook,
  createEbook,
  updateEbook,
  deleteEbook
};
