import { z } from 'zod';

const envSchema = z.object({
  VITE_API_URL: z.string().url('VITE_API_URL debe ser una URL válida'),
});

const parsed = envSchema.safeParse(import.meta.env);

if (!parsed.success) {
  console.error('❌ Variables de entorno inválidas:');
  console.error(parsed.error.flatten().fieldErrors);
  // En desarrollo lanzamos el error, en producción logueamos y seguimos
  if (import.meta.env.DEV) {
    throw new Error('Variables de entorno inválidas. Revisá tu archivo .env');
  }
}

export const env = {
  apiUrl: import.meta.env.VITE_API_URL ?? 'http://localhost:8080/api/v1',
} as const;
