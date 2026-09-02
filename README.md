# 📚 Ebook Generator System

Sistema completo para generar ebooks en HTML a partir de datos JSON estructurados. Incluye interfaz web, API REST y exportación a PDF.

## Características

- **Generación de HTML**: Transforma datos JSON en ebooks profesionales con diseño responsive
- **API REST**: CRUD completo para gestionar ebooks
- **Interfaz web**: Panel de administración para crear, editar y previsualizar ebooks
- **Exportación a PDF**: Los HTML generados incluyen estilos de impresión optimizados
- **Almacenamiento flexible**: Supabase en la nube o archivos locales como fallback
- **Plantillas modulares**: Fácil personalización con templates y partials

## Requisitos

- Node.js 18 o superior
- npm
- (Opcional) Cuenta de Supabase para almacenamiento en la nube

## Instalación

```bash
# Clonar o copiar el proyecto
cd ebook-system

# Instalar dependencias
npm install

# Configurar variables de entorno (opcional)
# Copia .env.example a .env y completa los valores de Supabase
```

## Variables de entorno

Crea un archivo `.env` en la raíz del proyecto:

```
PORT=3000
SUPABASE_URL=https://tu-proyecto.supabase.co
SUPABASE_ANON_KEY=tu-clave-anon-aqui
SUPABASE_TABLE=ebooks
```

> Si no configuras Supabase, el sistema usa archivos JSON locales en `examples/` como almacenamiento.

## Uso

### Iniciar el servidor

```bash
npm start
```

El servidor estará disponible en `http://localhost:3000`

### Interfaz web

Abre `http://localhost:3000` en tu navegador para acceder al panel de administración donde puedes:
- Ver todos los ebooks creados
- Crear nuevos ebooks con el editor JSON
- Editar ebooks existentes
- Previsualizar el HTML generado
- Eliminar ebooks

### API REST

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/api/ebooks` | Listar todos los ebooks |
| GET | `/api/ebooks/:id` | Obtener un ebook por ID |
| POST | `/api/ebooks` | Crear un nuevo ebook |
| PUT | `/api/ebooks/:id` | Actualizar un ebook |
| DELETE | `/api/ebooks/:id` | Eliminar un ebook |
| GET | `/generate/:id` | Generar HTML del ebook |

### Ejemplo con curl

```bash
# Crear un ebook
curl -X POST http://localhost:3000/api/ebooks \
  -H "Content-Type: application/json" \
  -d @examples/pdfs-virales.json

# Listar ebooks
curl http://localhost:3000/api/ebooks

# Generar HTML
curl http://localhost:3000/generate/pdfs-virales
```

## Estructura de un Ebook

```json
{
  "id": "mi-ebook",
  "title": "Título del Ebook",
  "subtitle": "Subtítulo opcional",
  "author": "Nombre del Autor",
  "cover": {
    "title": "Título en portada",
    "tagline": "Frase gancho",
    "color": "#1a1a2e"
  },
  "lessons": [
    {
      "title": "Título de la Lección",
      "icon": "📖",
      "sections": [
        {
          "title": "Título de la sección",
          "content": "Contenido en texto plano.",
          "highlight": false,
          "bullets": ["Punto 1", "Punto 2"]
        }
      ]
    }
  ],
  "exercises": [
    {
      "question": "Pregunta del ejercicio",
      "hint": "Pista opcional",
      "options": ["Opción A", "Opción B"]
    }
  ],
  "checklist": [
    { "task": "Tarea de verificación", "done": false }
  ],
  "closing": {
    "message": "Mensaje de cierre",
    "cta": "Llamada a la acción",
    "links": [
      { "label": "Texto del enlace", "url": "https://ejemplo.com" }
    ]
  }
}
```

## Personalización

### Plantillas

Las plantillas están en `templates/` y usan la sintaxis `{{variable}}` para la interpolación:

- `ebook.html` - Plantilla principal completa
- `partials/cover.html` - Portada
- `partials/lesson.html` - Lecciones
- `partials/exercise.html` - Ejercicios
- `partials/closing.html` - Página de cierre

### Estilos CSS

Los estilos del ebook se incluyen directamente en la plantilla HTML para que cada ebook generado sea un archivo autocontenido. Los estilos de la interfaz web están en `public/css/styles.css`.

## Exportar a PDF

1. Genera el HTML: `http://localhost:3000/generate/tu-ebook-id`
2. Abre el HTML en tu navegador
3. Usa `Ctrl+P` / `Cmd+P` → Guardar como PDF
4. Los estilos de impresión ya están configurados

## Ejemplos incluidos

- **PDFs Virales**: Guía para crear documentos que se comparten masivamente
- **Recetas Saludables**: Ebook de cocina rápida y nutritiva

## Licencia

MIT
