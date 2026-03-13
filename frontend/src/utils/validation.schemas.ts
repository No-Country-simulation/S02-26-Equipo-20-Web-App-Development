import { z } from 'zod';

/**
 * Schema de validación para Login
 */
export const loginSchema = z.object({
  email: z.email('Email inválido'),
  password: z.string().trim().min(6, 'La contraseña debe tener al menos 6 caracteres'),
});

/**
 * Schema de validación para Register
 */
export const registerSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(2, 'El nombre debe tener al menos 2 caracteres')
      .max(50, 'El nombre no puede tener más de 50 caracteres'),
    lastname: z
      .string()
      .trim()
      .min(2, 'El apellido debe tener al menos 2 caracteres')
      .max(50, 'El apellido no puede tener más de 50 caracteres'),
    email: z.email('Email inválido'),
    password: z
      .string()
      .trim()
      .min(6, 'La contraseña debe tener al menos 6 caracteres')
      .max(100, 'La contraseña no puede tener más de 100 caracteres'),
    confirmPassword: z.string().min(1, 'Debes confirmar la contraseña'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Las contraseñas no coinciden',
    path: ['confirmPassword'],
  });

/**
 * Schema de validación para edición de perfil
 */
export const profileSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, 'El nombre es obligatorio')
    .max(50, 'El nombre no puede tener más de 50 caracteres'),
  lastname: z
    .string()
    .trim()
    .min(1, 'El apellido es obligatorio')
    .max(50, 'El apellido no puede tener más de 50 caracteres'),
});

/**
 * Tipos inferidos de los schemas (para TypeScript)
 */
export type LoginFormData = z.infer<typeof loginSchema>;
export type RegisterFormData = z.infer<typeof registerSchema>;
export type ProfileFormData = z.infer<typeof profileSchema>;
