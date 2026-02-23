import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link } from 'react-router-dom';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import { useForgotPassword } from '@/hooks/useAuth';

const forgotPasswordSchema = z.object({
  email: z
    .string()
    .min(1, 'El email es obligatorio')
    .email('Ingresá un email válido'),
});

type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>;

export default function ForgotPasswordForm() {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const forgotPasswordMutation = useForgotPassword();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: '',
    },
  });

  function onSubmit(data: ForgotPasswordFormValues) {
    forgotPasswordMutation.mutate(data.email, {
      onSuccess: () => {
        setIsSubmitted(true);
      },
    });
  }

  if (isSubmitted) {
    return (
      <div className="space-y-5 text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-success/10">
          <svg
            className="h-7 w-7 text-success"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>

        <div>
          <h3 className="text-lg font-semibold text-secondary">
            ¡Email enviado!
          </h3>
          <p className="mt-2 text-sm text-secondary-light">
            Te enviamos un email con instrucciones para recuperar tu contraseña.
            Revisá tu bandeja de entrada y la carpeta de spam.
          </p>
        </div>

        <Link
          to="/iniciar-sesion"
          className="inline-block text-sm font-medium text-primary hover:text-primary-dark transition-colors"
        >
          Volver a iniciar sesión
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
      <p className="text-sm text-secondary-light">
        Ingresá el email asociado a tu cuenta y te enviaremos instrucciones
        para restablecer tu contraseña.
      </p>

      <Input
        label="Email"
        type="email"
        placeholder="tu@email.com"
        autoComplete="email"
        error={errors.email?.message}
        {...register('email')}
      />

      <Button
        type="submit"
        fullWidth
        isLoading={forgotPasswordMutation.isPending}
      >
        Enviar instrucciones
      </Button>

      <p className="text-center text-sm">
        <Link
          to="/iniciar-sesion"
          className="font-medium text-primary hover:text-primary-dark transition-colors"
        >
          Volver a iniciar sesión
        </Link>
      </p>
    </form>
  );
}
