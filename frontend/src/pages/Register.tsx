import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link } from 'react-router';
import { useRegister } from '@/hooks/useRegister';
import { registerSchema, type RegisterFormData } from '@/utils/validation.schemas';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

export default function Register() {
  const { mutate: registerUser, isPending } = useRegister();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    mode: 'onBlur',
  });

  const onSubmit = (data: RegisterFormData) => {
    const { confirmPassword: _cp, ...registerData } = data;
    registerUser(registerData);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-linear-to-br from-purple-50 to-pink-100 px-4 py-12">
      <div className="w-full max-w-md">
        <div className="rounded-2xl bg-white p-8 shadow-xl">
          <div className="mb-8 text-center">
            <h1 className="mb-2 text-3xl font-bold text-gray-900">Crear Cuenta</h1>
            <p className="text-gray-600">Únete a VideoShorts y empieza a crear</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <Input
              label="Nombre"
              type="text"
              placeholder="Juan"
              error={errors.name?.message}
              disabled={isPending}
              autoComplete="true"
              {...register('name')}
            />
            <Input
              label="Apellido"
              type="text"
              placeholder="Pérez"
              error={errors.lastname?.message}
              disabled={isPending}
              {...register('lastname')}
            />
            <Input
              label="Email"
              type="email"
              placeholder="tu@email.com"
              error={errors.email?.message}
              disabled={isPending}
              autoComplete="true"
              {...register('email')}
            />
            <Input
              label="Contraseña"
              type="password"
              placeholder="••••••••"
              helperText="Mínimo 6 caracteres"
              error={errors.password?.message}
              disabled={isPending}
              {...register('password')}
            />
            <Input
              label="Confirmar Contraseña"
              type="password"
              placeholder="••••••••"
              error={errors.confirmPassword?.message}
              disabled={isPending}
              {...register('confirmPassword')}
            />
            <Button type="submit" variant="primary" className="w-full" disabled={isPending}>
              {isPending ? 'Creando cuenta...' : 'Crear Cuenta'}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              ¿Ya tienes una cuenta?{' '}
              <Link
                to="/login"
                className="font-medium text-purple-600 transition-colors hover:text-purple-700">
                Inicia sesión aquí
              </Link>
            </p>
          </div>
        </div>

        <div className="mt-6 text-center">
          <Link to="/" className="text-sm text-gray-600 transition-colors hover:text-gray-900">
            ← Volver al inicio
          </Link>
        </div>
      </div>
    </div>
  );
}
