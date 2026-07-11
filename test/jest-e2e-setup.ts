// No se puede usar un archivo .env* (el sandbox de esta máquina bloquea
// escribirlos). Estas env vars son solo para el Postgres local de
// docker-compose (puerto 5433) — nunca tocan Supabase.
process.env.DATABASE_URL ??=
  'postgresql://lubricadora:lubricadora@localhost:5433/lubricadora';
process.env.DIRECT_URL ??= process.env.DATABASE_URL;
process.env.JWT_ACCESS_SECRET ??= 'test-secret';
process.env.JWT_REFRESH_SECRET ??= 'test-refresh-secret';
