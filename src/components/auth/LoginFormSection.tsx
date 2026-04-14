import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { loginRequest } from '../../lib/api';
import { saveSession } from '../../lib/session';
import type { LoginCredentials } from '../../types';
import LoginForm from './LoginForm';

function LoginFormSection() {
  const navigate = useNavigate();
  // Estados basicos para mostrar carga y mensajes al usuario.
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('Ingresá tus credenciales reales para autenticarte contra la API.');
  const [isError, setIsError] = useState(false);

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

  return (
    <section className="login-form-card">
      <div className="section-heading">
        <span className="eyebrow">LoginFormSection</span>
        <h2>Formulario de acceso</h2>
        <p>Este contenedor autentica contra FastAPI, guarda la sesión local y redirige según el rol.</p>
      </div>

      <div className={`form-feedback ${isError ? 'is-error' : ''}`}>{message}</div>
      <LoginForm isLoading={isLoading} onAuthenticate={handleAuthentication} />
    </section>
  );
}

export default LoginFormSection;
