import { useState, type FormEvent } from 'react';
import type { LoginCredentials } from '../../types';

interface LoginFormProps {
  isLoading: boolean;
  onAuthenticate: (credentials: LoginCredentials) => Promise<void>;
}

function LoginForm({ isLoading, onAuthenticate }: LoginFormProps) {
  // Aqui se guardan los datos del formulario.
  const [credentials, setCredentials] = useState<LoginCredentials>({
    email: '',
    password: ''
  });
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<keyof LoginCredentials, string>>>({});

  // Validacion simple para la demo.
  const validate = () => {
    const nextErrors: Partial<Record<keyof LoginCredentials, string>> = {};

    if (!credentials.email.includes('@')) {
      nextErrors.email = 'Ingresa un email valido.';
    }

    if (credentials.password.trim().length < 6) {
      nextErrors.password = 'La contrasena debe tener al menos 6 caracteres.';
    }

    setFieldErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    // Si algo falla en validacion no se intenta autenticar.
    if (!validate()) {
      return;
    }

    await onAuthenticate(credentials);
  };

  return (
    <form className="login-form" onSubmit={handleSubmit}>
      <div>
        <label className="form-label" htmlFor="loginEmail">
          Email
        </label>
        <input
          // Si hay error pintamos el input en rojo con Bootstrap.
          className={`form-control ${fieldErrors.email ? 'is-invalid' : ''}`}
          id="loginEmail"
          onChange={(event) =>
            setCredentials((current) => ({ ...current, email: event.target.value }))
          }
          placeholder="admin@upgi.com"
          type="email"
          value={credentials.email}
        />
        {fieldErrors.email ? <div className="invalid-feedback d-block">{fieldErrors.email}</div> : null}
      </div>

      <div>
        <label className="form-label" htmlFor="loginPassword">
          Contrasena
        </label>
        <input
          className={`form-control ${fieldErrors.password ? 'is-invalid' : ''}`}
          id="loginPassword"
          onChange={(event) =>
            setCredentials((current) => ({ ...current, password: event.target.value }))
          }
          placeholder="admin123"
          type="password"
          value={credentials.password}
        />
        {fieldErrors.password ? (
          <div className="invalid-feedback d-block">{fieldErrors.password}</div>
        ) : null}
      </div>

      <button className="btn btn-primary w-100 rounded-pill py-2" disabled={isLoading} type="submit">
        {/* El texto cambia segun el estado de carga */}
        {isLoading ? 'Validando...' : 'Entrar al sistema'}
      </button>
    </form>
  );
}

export default LoginForm;
