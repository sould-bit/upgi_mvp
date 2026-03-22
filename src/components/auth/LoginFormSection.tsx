import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { LoginCredentials } from '../../types';
import LoginForm from './LoginForm';

function LoginFormSection() {
  const navigate = useNavigate();
  // Estados basicos para mostrar carga y mensajes al usuario.
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('Usa un correo valido para simular el acceso.');
  const [isError, setIsError] = useState(false);

  // Esta funcion simula una autenticacion antes de tener backend real.
  const handleAuthentication = async ({ email, password }: LoginCredentials) => {
    setIsLoading(true);
    setIsError(false);

    try {
      // Simulamos una espera para que se sienta como una peticion real.
      await new Promise((resolve) => window.setTimeout(resolve, 900));

      if (!email || !password) {
        throw new Error('Faltan credenciales.');
      }

      setMessage('Autenticacion simulada con exito. Redirigiendo al admin...');
      // Cuando sale bien lo mandamos al dashboard.
      window.setTimeout(() => navigate('/admin/dashboard'), 600);
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
        <p>Este contenedor centraliza estados de carga, mensajes y el flujo de envio.</p>
      </div>

      <div className={`form-feedback ${isError ? 'is-error' : ''}`}>{message}</div>
      <LoginForm isLoading={isLoading} onAuthenticate={handleAuthentication} />
    </section>
  );
}

export default LoginFormSection;
