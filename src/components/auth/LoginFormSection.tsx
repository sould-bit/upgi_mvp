import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { loginRequest, registerRequest } from '../../lib/api';
import { saveSession } from '../../lib/session';
import type { LoginCredentials, RegisterPayload } from '../../types';
import LoginForm from './LoginForm';
import RegisterForm from './RegisterForm';

type AuthMode = 'login' | 'register';

interface LoginFormSectionProps {
  defaultMode?: AuthMode;
  hideModeSwitch?: boolean;
  redirectOnRegisterTo?: string;
}

function LoginFormSection({
  defaultMode = 'login',
  hideModeSwitch = false,
  redirectOnRegisterTo
}: LoginFormSectionProps) {
  const navigate = useNavigate();
  const [mode, setMode] = useState<AuthMode>(defaultMode);
  // Estados basicos para mostrar carga y mensajes al usuario.
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState(
    defaultMode === 'register'
      ? 'Completa tus datos para registrar una cuenta nueva en la API.'
      : 'Ingresa tus credenciales reales para autenticarte contra la API.'
  );
  const [isError, setIsError] = useState(false);

  const handleModeChange = (nextMode: AuthMode) => {
    setMode(nextMode);
    setIsError(false);
    setMessage(
      nextMode === 'login'
        ? 'Ingresa tus credenciales reales para autenticarte contra la API.'
        : 'Completa tus datos para registrar una cuenta nueva en la API.'
    );
  };

  const handleAuthentication = async ({ email, password }: LoginCredentials) => {
    setIsLoading(true);
    setIsError(false);

    try {
      if (!email || !password) {
        throw new Error('Faltan credenciales.');
      }

      const response = await loginRequest({ email, password });

      if (!response.access_token || !response.user || !response.expires_in) {
        throw new Error('La API no devolvió una sesión válida.');
      }

      saveSession({
        accessToken: response.access_token,
        expiresIn: response.expires_in,
        user: response.user
      });

      const redirectTo = response.user.is_admin ? '/admin/dashboard' : '/reservas';
      setMessage(`${response.message} Redirigiendo...`);
      window.setTimeout(() => navigate(redirectTo), 400);
    } catch (error) {
      setIsError(true);
      setMessage(error instanceof Error ? error.message : 'No fue posible iniciar sesion.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async ({ email, password, nombre, telefono }: RegisterPayload) => {
    setIsLoading(true);
    setIsError(false);

    try {
      const response = await registerRequest({ email, password, nombre, telefono });

      if (redirectOnRegisterTo) {
        setMessage(`${response.message}. Redirigiendo al login...`);
        window.setTimeout(() => navigate(redirectOnRegisterTo), 700);
      } else {
        setMessage(`${response.message}. Ahora inicia sesion con tu cuenta.`);
        setMode('login');
      }
    } catch (error) {
      setIsError(true);
      setMessage(error instanceof Error ? error.message : 'No fue posible crear la cuenta.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section className="login-form-card">
      <div className="section-heading">
        <span className="eyebrow">LoginFormSection</span>
        <h2>{mode === 'login' ? 'Formulario de acceso' : 'Registro de usuario'}</h2>
        <p>
          Este contenedor autentica contra FastAPI, guarda la sesión local y redirige según el rol.
        </p>
      </div>

      {hideModeSwitch ? null : (
        <div className="d-flex gap-2 mb-3">
          <button
            className={`btn rounded-pill px-3 ${mode === 'login' ? 'btn-primary' : 'btn-outline-primary'}`}
            onClick={() => handleModeChange('login')}
            type="button"
          >
            Iniciar sesion
          </button>
          <button
            className={`btn rounded-pill px-3 ${mode === 'register' ? 'btn-primary' : 'btn-outline-primary'}`}
            onClick={() => handleModeChange('register')}
            type="button"
          >
            Registrarme
          </button>
        </div>
      )}

      <div className={`form-feedback ${isError ? 'is-error' : ''}`}>{message}</div>
      {mode === 'login' ? (
        <LoginForm isLoading={isLoading} onAuthenticate={handleAuthentication} />
      ) : (
        <RegisterForm isLoading={isLoading} onRegister={handleRegister} />
      )}

      <p className="auth-flow-switch mb-0 mt-3">
        {mode === 'login' ? (
          <>
            No tenes cuenta? <Link to="/register">Crear cuenta</Link>
          </>
        ) : (
          <>
            Ya tenes cuenta? <Link to="/login">Iniciar sesion</Link>
          </>
        )}
      </p>
    </section>
  );
}

export default LoginFormSection;
