/**
 * Archivo principal del servidor Express
 * Punto de entrada del sistema de generación de ebooks
 */

require('dotenv').config();
const express = require('express');
const path = require('path');
const { generateEbookHTML, listEbooks } = require('./generator');
const { getEbook, getAllEbooks, createEbook, updateEbook, deleteEbook } = require('./supabase');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.static(path.join(__dirname, '..', 'public')));

// ─── Rutas de la interfaz web ───────────────────────────────────

// Página principal
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public', 'index.html'));
});

// ─── API REST para CRUD de ebooks ───────────────────────────────

// Listar todos los ebooks
app.get('/api/ebooks', async (req, res) => {
  try {
    const ebooks = await getAllEbooks();
    res.json({ success: true, data: ebooks });
  } catch (error) {
    console.error('Error al listar ebooks:', error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Obtener un ebook por ID
app.get('/api/ebooks/:id', async (req, res) => {
  try {
    const ebook = await getEbook(req.params.id);
    if (!ebook) {
      return res.status(404).json({ success: false, error: 'Ebook no encontrado' });
    }
    res.json({ success: true, data: ebook });
  } catch (error) {
    console.error('Error al obtener ebook:', error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Crear un nuevo ebook
app.post('/api/ebooks', async (req, res) => {
  try {
    const { data, error } = await createEbook(req.body);
    if (error) throw error;
    res.status(201).json({ success: true, data });
  } catch (error) {
    console.error('Error al crear ebook:', error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Actualizar un ebook existente
app.put('/api/ebooks/:id', async (req, res) => {
  try {
    const { data, error } = await updateEbook(req.params.id, req.body);
    if (error) throw error;
    res.json({ success: true, data });
  } catch (error) {
    console.error('Error al actualizar ebook:', error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Eliminar un ebook
app.delete('/api/ebooks/:id', async (req, res) => {
  try {
    const { error } = await deleteEbook(req.params.id);
    if (error) throw error;
    res.json({ success: true, message: 'Ebook eliminado correctamente' });
  } catch (error) {
    console.error('Error al eliminar ebook:', error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ─── Generación de HTML ─────────────────────────────────────────

// Generar el HTML del ebook (vista previa / exportación)
app.get('/generate/:id', async (req, res) => {
  try {
    const ebook = await getEbook(req.params.id);
    if (!ebook) {
      return res.status(404).send('<h1>Ebook no encontrado</h1>');
    }
    const html = generateEbookHTML(ebook);
    res.type('html').send(html);
  } catch (error) {
    console.error('Error al generar ebook:', error.message);
    res.status(500).send('<h1>Error al generar el ebook</h1>');
  }
});

// ─── Iniciar servidor ───────────────────────────────────────────

app.listen(PORT, () => {
  console.log(`\n📚 Servidor de ebooks iniciado`);
  console.log(`   → http://localhost:${PORT}`);
  console.log(`   → API: http://localhost:${PORT}/api/ebooks\n`);
});

module.exports = app;
