# 🗄️ Guía de Configuración de Supabase

## ¿Qué es Supabase?

Supabase es una alternativa open-source a Firebase que proporciona base de datos PostgreSQL, autenticación y almacenamiento. En este sistema se usa para persistir los ebooks en la nube.

## Pasos para configurar

### 1. Crear cuenta y proyecto

1. Ve a [supabase.com](https://supabase.com) y crea una cuenta gratuita
2. Crea un nuevo proyecto
3. Anota la **URL del proyecto** y la **clave anónima** (Settings → API)

### 2. Crear la tabla de ebooks

En el SQL Editor de Supabase, ejecuta:

```sql
CREATE TABLE ebooks (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  subtitle TEXT,
  author TEXT,
  cover JSONB,
  lessons JSONB,
  exercises JSONB,
  checklist JSONB,
  closing JSONB,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Habilitar RLS (Row Level Security)
ALTER TABLE ebooks ENABLE ROW LEVEL SECURITY;

-- Política para lectura pública (ajusta según tus necesidades)
CREATE POLICY "Lectura pública" ON ebooks
  FOR SELECT USING (true);

-- Política para escritura (restringe según tu caso de uso)
-- IMPORTANTE: En producción, restringe esto con autenticación
CREATE POLICY "Escritura autenticada" ON ebooks
  FOR ALL USING (true);
```

### 3. Configurar el entorno

Crea el archivo `.env` en la raíz del proyecto:

```env
PORT=3000
SUPABASE_URL=https://tu-proyecto-id.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.tu-clave-aqui
SUPABASE_TABLE=ebooks
```

### 4. Reiniciar el servidor

```bash
npm start
```

## Sin Supabase (modo local)

Si no configuras las variables de entorno de Supabase, el sistema funciona automáticamente en modo local:

- Los ebooks se guardan como archivos JSON en `examples/`
- No requiere configuración adicional
- Ideal para desarrollo y pruebas

## Seguridad

### Recomendaciones para producción

1. **Habilita la autenticación** en las políticas RLS
2. **Nunca expongas la clave de servicio** (service_role key)
3. **Usa Row Level Security** para controlar el acceso
4. **Configura CORS** adecuadamente
5. **Haz backup** periódico de tu base de datos

### Ejemplo de política más segura

```sql
-- Solo usuarios autenticados pueden escribir
CREATE POLICY "Solo autenticados" ON ebooks
  FOR ALL
  USING (auth.role() = 'authenticated');
```

## Verificación

Para verificar que Supabase está conectado correctamente:

```bash
# Listar ebooks (debe retornar los que creaste en Supabase)
curl http://localhost:3000/api/ebooks

# Crear un ebook de prueba
curl -X POST http://localhost:3000/api/ebooks \
  -H "Content-Type: application/json" \
  -d '{"id":"test","title":"Test","author":"Test","cover":{"title":"Test","tagline":"Test","color":"#000"},"lessons":[{"title":"L1","sections":[{"title":"S1","content":"C1"}]}],"closing":{"message":"Fin"}}'
```
