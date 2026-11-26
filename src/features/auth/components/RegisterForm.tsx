import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate, Link } from 'react-router';
import { useAuth } from '../context/AuthContext';
import { parseProblemDetails, type ProblemDetails } from '@/lib/rfc7807';

const registerSchema = z.object({
  name: z.string().min(2, 'O nome deve ter no mínimo 2 caracteres'),
  email: z.string().min(1, 'E-mail é obrigatório').email('Formato de e-mail inválido'),
  password: z.string().min(12, 'A senha deve ter no mínimo 12 caracteres'),
});

type RegisterFormData = z.infer<typeof registerSchema>;

export const RegisterForm: React.FC = () => {
  const { register: registerAuth } = useAuth();
  const navigate = useNavigate();
  const [serverError, setServerError] = useState<ProblemDetails | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
    },
  });

  const onSubmit = async (data: RegisterFormData) => {
    setServerError(null);
    try {
      await registerAuth(data);
      navigate('/dashboard');
    } catch (err: unknown) {
      setServerError(parseProblemDetails(err));
    }
  };

  return (
    <div className="w-full max-w-md p-8 bg-white rounded-xl shadow-lg border border-slate-100">
      <div className="text-center mb-6">
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Criar Conta Wallet</h1>
        <p className="text-sm text-slate-500 mt-1">Crie sua carteira digital instantânea</p>
      </div>

      {serverError && (
        <div
          role="alert"
          className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg"
        >
          <strong className="font-semibold block">{serverError.title}:</strong>
          {serverError.detail}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        <div>
          <label htmlFor="reg-name" className="block text-sm font-medium text-slate-700 mb-1">
            Nome Completo
          </label>
          <input
            id="reg-name"
            type="text"
            autoComplete="name"
            aria-invalid={!!errors.name}
            aria-describedby={errors.name ? 'reg-name-error' : undefined}
            {...register('name')}
            className={`w-full px-3 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-colors ${
              errors.name ? 'border-red-400 focus:ring-red-400' : 'border-slate-300'
            }`}
          />
          {errors.name && (
            <p id="reg-name-error" className="mt-1 text-xs text-red-600">
              {errors.name.message}
            </p>
          )}
        </div>

        <div>
          <label htmlFor="reg-email" className="block text-sm font-medium text-slate-700 mb-1">
            E-mail
          </label>
          <input
            id="reg-email"
            type="email"
            autoComplete="email"
            aria-invalid={!!errors.email}
            aria-describedby={errors.email ? 'reg-email-error' : undefined}
            {...register('email')}
            className={`w-full px-3 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-colors ${
              errors.email ? 'border-red-400 focus:ring-red-400' : 'border-slate-300'
            }`}
          />
          {errors.email && (
            <p id="reg-email-error" className="mt-1 text-xs text-red-600">
              {errors.email.message}
            </p>
          )}
        </div>

        <div>
          <label htmlFor="reg-password" className="block text-sm font-medium text-slate-700 mb-1">
            Senha
          </label>
          <input
            id="reg-password"
            type="password"
            autoComplete="new-password"
            aria-invalid={!!errors.password}
            aria-describedby={errors.password ? 'reg-password-error' : undefined}
            {...register('password')}
            className={`w-full px-3 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-colors ${
              errors.password ? 'border-red-400 focus:ring-red-400' : 'border-slate-300'
            }`}
          />
          {errors.password && (
            <p id="reg-password-error" className="mt-1 text-xs text-red-600">
              {errors.password.message}
            </p>
          )}
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          aria-busy={isSubmitting}
          className="w-full mt-2 py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-medium rounded-lg shadow transition-colors flex justify-center items-center"
        >
          {isSubmitting ? 'Cadastrando...' : 'Cadastrar'}
        </button>
      </form>

      <div className="mt-6 text-center text-sm text-slate-600">
        Já tem uma conta?{' '}
        <Link to="/login" className="text-emerald-600 hover:underline font-medium">
          Entrar
        </Link>
      </div>
    </div>
  );
};
