import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { KeyRound, LogOut } from 'lucide-react';
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
    <div className="container mx-auto bg-gray-50 px-4 py-8 md:py-14">
      <div className="mx-auto max-w-2xl">
        <div className="mb-6">
          <h1 className="mb-2 text-2xl font-bold text-gray-900">Mi Perfil</h1>
          <p className="text-gray-600">Gestiona tu información personal</p>
        </div>
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
        <Card>
          <CardHeader>
            <h2 className="text-xl font-semibold text-gray-900">Configuración de Cuenta</h2>
          </CardHeader>
          <CardContent>
            <div className="flex w-full flex-col gap-y-4">
              <Button
                variant="outline"
                className="w-full justify-start gap-2 text-xs sm:text-base"
                disabled>
                <KeyRound className="h-5 w-5" />
                Cambiar Contraseña (Próximamente)
              </Button>
              <Button
                variant="danger"
                className="w-full justify-center gap-2"
                onClick={handleLogout}>
                <LogOut className="h-5 w-5" />
                Cerrar Sesión
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
