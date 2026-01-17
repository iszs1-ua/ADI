-- Migración SQL para Supabase: Habit Tracker
-- Esta migración crea las tablas necesarias para el habit-tracker

-- ============================================
-- TABLA: users (extensión de auth.users)
-- ============================================
-- Nota: Supabase tiene auth.users por defecto, pero podemos crear una tabla
-- pública para almacenar datos adicionales como username
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE,
  name TEXT,
  avatar TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Habilitar RLS en users
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Políticas para users (los usuarios solo pueden ver/editar su propio perfil)
CREATE POLICY "Users can view their own profile" ON users
  FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON users
  FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" ON users
  FOR INSERT
  WITH CHECK (auth.uid() = id);

-- ============================================
-- TABLA: habitos
-- ============================================
CREATE TABLE IF NOT EXISTS habitos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nombre TEXT NOT NULL,
  descripcion TEXT,
  frecuencia TEXT CHECK (frecuencia IN ('daily', 'weekly', '3-times-a-week')) DEFAULT 'daily',
  completado BOOLEAN DEFAULT FALSE NOT NULL,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ============================================
-- TABLA: marcas (para tracking de hábitos)
-- ============================================
CREATE TABLE IF NOT EXISTS marcas (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  usuario_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  habit_id UUID NOT NULL REFERENCES habitos(id) ON DELETE CASCADE,
  fecha TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(usuario_id, habit_id, DATE(fecha))
);

-- ============================================
-- ÍNDICES para mejorar rendimiento
-- ============================================
CREATE INDEX IF NOT EXISTS idx_habitos_user_id ON habitos(user_id);
CREATE INDEX IF NOT EXISTS idx_habitos_frecuencia ON habitos(frecuencia);
CREATE INDEX IF NOT EXISTS idx_habitos_completado ON habitos(completado);
CREATE INDEX IF NOT EXISTS idx_habitos_created_at ON habitos(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_marcas_usuario_id ON marcas(usuario_id);
CREATE INDEX IF NOT EXISTS idx_marcas_habit_id ON marcas(habit_id);
CREATE INDEX IF NOT EXISTS idx_marcas_fecha ON marcas(fecha);

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================
ALTER TABLE habitos ENABLE ROW LEVEL SECURITY;
ALTER TABLE marcas ENABLE ROW LEVEL SECURITY;

-- Políticas para habitos
-- Los usuarios solo pueden ver/crear/actualizar/eliminar sus propios hábitos
CREATE POLICY "Users can view their own habits" ON habitos
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own habits" ON habitos
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own habits" ON habitos
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own habits" ON habitos
  FOR DELETE
  USING (auth.uid() = user_id);

-- Políticas para marcas
CREATE POLICY "Users can view their own marks" ON marcas
  FOR SELECT
  USING (auth.uid() = usuario_id);

CREATE POLICY "Users can create their own marks" ON marcas
  FOR INSERT
  WITH CHECK (auth.uid() = usuario_id);

CREATE POLICY "Users can delete their own marks" ON marcas
  FOR DELETE
  USING (auth.uid() = usuario_id);

-- ============================================
-- FUNCIONES Y TRIGGERS
-- ============================================

-- Función para actualizar updated_at automáticamente en habitos
CREATE OR REPLACE FUNCTION update_habitos_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger para actualizar updated_at en habitos
CREATE TRIGGER update_habitos_updated_at
  BEFORE UPDATE ON habitos
  FOR EACH ROW
  EXECUTE FUNCTION update_habitos_updated_at();

-- ============================================
-- COMENTARIOS (para documentación)
-- ============================================
COMMENT ON TABLE habitos IS 'Tabla principal de hábitos del usuario';
COMMENT ON TABLE marcas IS 'Tabla para tracking de completados diarios de hábitos';
COMMENT ON COLUMN habitos.frecuencia IS 'Frecuencia del hábito: daily, weekly, o 3-times-a-week';
COMMENT ON COLUMN marcas.fecha IS 'Fecha en la que se marcó el hábito como completado';

