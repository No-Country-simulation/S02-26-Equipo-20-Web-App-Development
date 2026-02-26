import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuth } from '@/hooks/useAuth';
import { useUpdateProfile } from '@/hooks/useUpdateProfile';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { profileSchema, type ProfileFormData } from '@/utils/validation.schemas';

export default function Profile() {
  const { user, logout } = useAuth();
  const { mutate: updateProfile, isPending } = useUpdateProfile();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user?.name ?? '',
      lastname: user?.lastname ?? '',
    },
  });

  // Sincronizar el form si el user cambia en el contexto
  useEffect(() => {
    if (user) {
      reset({ name: user.name, lastname: user.lastname });
    }
  }, [user, reset]);

  const onSubmit = (data: ProfileFormData) => {
    updateProfile(data);
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-12">
        <div className="mx-auto max-w-2xl">
          {/* Header */}
          <div className="mb-6">
            <h1 className="mb-2 text-3xl font-bold text-gray-900">Mi Perfil</h1>
            <p className="text-gray-600">Gestiona tu información personal</p>
          </div>

          {/* Información del Usuario */}
          <Card className="mb-6">
            <CardHeader>
              <h2 className="text-xl font-semibold text-gray-900">Información Personal</h2>
            </CardHeader>
            <CardContent>
              <dl className="space-y-4">
                <div>
                  <dt className="mb-1 text-sm font-medium text-gray-700">Nombre Completo</dt>
                  <dd className="text-gray-900">
                    {user?.name} {user?.lastname}
                  </dd>
                </div>
                <div>
                  <dt className="mb-1 text-sm font-medium text-gray-700">Email</dt>
                  <dd className="text-gray-900">{user?.email}</dd>
                </div>
                <div>
                  <dt className="mb-1 text-sm font-medium text-gray-700">ID de Usuario</dt>
                  <dd className="text-sm text-gray-500">#{user?.id}</dd>
                </div>
              </dl>
            </CardContent>
          </Card>

          {/* Editar Perfil */}
          <Card className="mb-6">
            <CardHeader>
              <h2 className="text-xl font-semibold text-gray-900">Editar Perfil</h2>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <Input
                  label="Nombre"
                  placeholder="Juan"
                  error={errors.name?.message}
                  disabled={isPending}
                  autoComplete="given-name"
                  {...register('name')}
                />
                <Input
                  label="Apellido"
                  placeholder="Pérez"
                  error={errors.lastname?.message}
                  disabled={isPending}
                  autoComplete="family-name"
                  {...register('lastname')}
                />
                <div className="flex justify-end gap-3 pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    disabled={isPending || !isDirty}
                    onClick={() => reset()}>
                    Cancelar
                  </Button>
                  <Button type="submit" variant="primary" disabled={isPending || !isDirty}>
                    {isPending ? 'Guardando...' : 'Guardar cambios'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Acciones */}
          <Card>
            <CardHeader>
              <h2 className="text-xl font-semibold text-gray-900">Configuración de Cuenta</h2>
            </CardHeader>
            <CardContent>
              <div className="flex w-full flex-col gap-y-4">
                <Button variant="outline" className="w-full justify-start" disabled>
                  <svg
                    className="mr-2 h-5 w-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"
                    />
                  </svg>
                  Cambiar Contraseña (Próximamente)
                </Button>
                <Button variant="danger" className="w-full justify-center" onClick={handleLogout}>
                  <svg
                    className="mr-2 h-5 w-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                    />
                  </svg>
                  Cerrar Sesión
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
