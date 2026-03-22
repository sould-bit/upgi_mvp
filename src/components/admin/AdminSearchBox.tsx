import { useState } from 'react';

interface AdminSearchBoxProps {
  onSearch: (value: string) => void;
}

function AdminSearchBox({ onSearch }: AdminSearchBoxProps) {
  // Guarda lo que el usuario escribe en el buscador.
  const [draft, setDraft] = useState('');

  const handleChange = (value: string) => {
    setDraft(value);
    // Normalizamos un poco el texto para filtrar mas facil.
    onSearch(value.trim().toLowerCase());
  };

  return (
    <div className="search-box">
      <i className="bi bi-search" />
      <input
        aria-label="Buscar reservas o usuarios"
        onChange={(event) => handleChange(event.target.value)}
        placeholder="Buscar reservas, usuarios o canchas..."
        type="search"
        value={draft}
      />
      {draft ? (
        <button
          aria-label="Limpiar busqueda"
          className="icon-button"
          onClick={() => handleChange('')}
          type="button"
        >
          <i className="bi bi-x-lg" />
        </button>
      ) : null}
    </div>
  );
}

export default AdminSearchBox;
