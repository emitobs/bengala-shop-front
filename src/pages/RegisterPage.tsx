import RegisterForm from '@/components/auth/RegisterForm';

export default function RegisterPage() {
  return (
    <div className="flex min-h-[80vh] items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="rounded-[12px] border border-border bg-surface p-8 shadow-sm">
          <div className="mb-8 text-center">
            <h1 className="text-2xl font-extrabold tracking-tight text-primary">
              BENGALA MAX
            </h1>
            <p className="mt-2 text-base text-secondary-light">
              Crea tu cuenta
            </p>
          </div>

          <RegisterForm />
        </div>
      </div>
    </div>
  );
}
