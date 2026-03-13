import { z } from 'zod';

const envSchema = z.object({
  VITE_API_URL: z.url({
    message: 'VITE_API_URL debe ser una URL válida',
  }),
});

const parsed = envSchema.safeParse(import.meta.env);

if (!parsed.success) {
  console.error('❌ Variables de entorno inválidas:');
  console.error(z.flattenError(parsed.error));
  // En desarrollo lanzamos el error, en producción logueamos y seguimos
  if (import.meta.env.DEV) {
    throw new Error('Variables de entorno inválidas. Revisá tu archivo .env');
  }
}

export const env = {
  apiUrl: parsed.success ? parsed.data.VITE_API_URL : 'http://localhost:8080/api/v1',
} as const;
