# 📖 Documentación de la API

## Base URL

```
http://localhost:3000
```

## Endpoints

### Listar ebooks

```
GET /api/ebooks
```

**Respuesta:**
```json
{
  "success": true,
  "data": [
    { "id": "pdfs-virales", "title": "PDFs Virales", "author": "APPDANPA" }
  ]
}
```

### Obtener un ebook

```
GET /api/ebooks/:id
```

**Parámetros:**
- `id` (string) - Identificador del ebook

**Respuesta:**
```json
{
  "success": true,
  "data": {
    "id": "pdfs-virales",
    "title": "PDFs Virales",
    "author": "APPDANPA",
    "cover": { ... },
    "lessons": [ ... ]
  }
}
```

**Error 404:**
```json
{
  "success": false,
  "error": "Ebook no encontrado"
}
```

### Crear un ebook

```
POST /api/ebooks
```

**Body:** Objeto JSON con la estructura del ebook (ver esquema abajo)

**Respuesta:**
```json
{
  "success": true,
  "data": {
    "id": "ebook-1234567890",
    "title": "Mi Ebook",
    ...
  }
}
```

### Actualizar un ebook

```
PUT /api/ebooks/:id
```

**Parámetros:**
- `id` (string) - Identificador del ebook

**Body:** Campos a actualizar (se hace merge con los existentes)

**Respuesta:**
```json
{
  "success": true,
  "data": { ... }
}
```

### Eliminar un ebook

```
DELETE /api/ebooks/:id
```

**Respuesta:**
```json
{
  "success": true,
  "message": "Ebook eliminado correctamente"
}
```

### Generar HTML

```
GET /generate/:id
```

Retorna el HTML completo del ebook listo para visualizar o imprimir como PDF.

## Esquema de un Ebook

| Campo | Tipo | Requerido | Descripción |
|-------|------|-----------|-------------|
| `id` | string | Sí | Identificador único |
| `title` | string | Sí | Título del ebook |
| `subtitle` | string | No | Subtítulo |
| `author` | string | Sí | Nombre del autor |
| `cover` | object | Sí | Datos de la portada |
| `cover.title` | string | Sí | Título en la portada |
| `cover.tagline` | string | Sí | Frase de impacto |
| `cover.image` | string | No | URL de imagen |
| `cover.color` | string | No | Color de fondo (hex) |
| `lessons` | array | Sí | Lista de lecciones |
| `exercises` | array | No | Lista de ejercicios |
| `checklist` | array | No | Lista de verificación |
| `closing` | object | Sí | Datos de cierre |

## Errores

Todos los errores devuelven HTTP 500 con:
```json
{
  "success": false,
  "error": "Descripción del error"
}
```
