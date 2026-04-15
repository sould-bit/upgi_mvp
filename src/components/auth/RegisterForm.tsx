import { useState, type FormEvent } from 'react';
import type { RegisterPayload } from '../../types';

interface RegisterFormProps {
  isLoading: boolean;
  onRegister: (payload: RegisterPayload) => Promise<void>;
}

function RegisterForm({ isLoading, onRegister }: RegisterFormProps) {
  const [formData, setFormData] = useState<RegisterPayload>({
    email: '',
    password: '',
    nombre: '',
    telefono: ''
  });
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<keyof RegisterPayload, string>>>({});

  const validate = () => {
    const nextErrors: Partial<Record<keyof RegisterPayload, string>> = {};

    if (!formData.nombre.trim()) {
      nextErrors.nombre = 'Ingresa tu nombre.';
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      nextErrors.email = 'Ingresa un email valido.';
    }

    if (formData.password.trim().length < 8) {
      nextErrors.password = 'La contrasena debe tener al menos 8 caracteres.';
    } else if (
      !/[A-Z]/.test(formData.password) ||
      !/[a-z]/.test(formData.password) ||
      !/\d/.test(formData.password) ||
      !/[@$!%*?&]/.test(formData.password)
    ) {
      nextErrors.password = 'Usa mayuscula, minuscula, numero y un simbolo (@$!%*?&).';
    }

    setFieldErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!validate()) {
      return;
    }

    const payload: RegisterPayload = {
      email: formData.email.trim(),
      password: formData.password,
      nombre: formData.nombre.trim()
    };

    if (formData.telefono?.trim()) {
      payload.telefono = formData.telefono.trim();
    }

    await onRegister(payload);
  };

  return (
    <form className="login-form" noValidate onSubmit={handleSubmit}>
      <div>
        <label className="form-label" htmlFor="registerName">
          Nombre
        </label>
        <input
          className={`form-control ${fieldErrors.nombre ? 'is-invalid' : ''}`}
          id="registerName"
          onChange={(event) => setFormData((current) => ({ ...current, nombre: event.target.value }))}
          placeholder="Tu nombre"
          value={formData.nombre}
        />
        {fieldErrors.nombre ? <div className="invalid-feedback d-block">{fieldErrors.nombre}</div> : null}
      </div>

      <div>
        <label className="form-label" htmlFor="registerEmail">
          Email
        </label>
        <input
          className={`form-control ${fieldErrors.email ? 'is-invalid' : ''}`}
          id="registerEmail"
          onChange={(event) => setFormData((current) => ({ ...current, email: event.target.value }))}
          placeholder="usuario@upgi.com"
          type="email"
          value={formData.email}
        />
        {fieldErrors.email ? <div className="invalid-feedback d-block">{fieldErrors.email}</div> : null}
      </div>

      <div>
        <label className="form-label" htmlFor="registerPhone">
          Telefono (opcional)
        </label>
        <input
          className={`form-control ${fieldErrors.telefono ? 'is-invalid' : ''}`}
          id="registerPhone"
          onChange={(event) => setFormData((current) => ({ ...current, telefono: event.target.value }))}
          placeholder="3001234567"
          value={formData.telefono ?? ''}
        />
        {fieldErrors.telefono ? <div className="invalid-feedback d-block">{fieldErrors.telefono}</div> : null}
      </div>

      <div>
        <label className="form-label" htmlFor="registerPassword">
          Contrasena
        </label>
        <input
          className={`form-control ${fieldErrors.password ? 'is-invalid' : ''}`}
          id="registerPassword"
          onChange={(event) => setFormData((current) => ({ ...current, password: event.target.value }))}
          placeholder="Password*123"
          type="password"
          value={formData.password}
        />
        {fieldErrors.password ? <div className="invalid-feedback d-block">{fieldErrors.password}</div> : null}
      </div>

      <button className="btn btn-primary w-100 rounded-pill py-2" disabled={isLoading} type="submit">
        {isLoading ? 'Registrando...' : 'Crear cuenta'}
      </button>
    </form>
  );
}

export default RegisterForm;
