import LoginFormSection from '../components/auth/LoginFormSection';
import LoginHeaderSection from '../components/auth/LoginHeaderSection';

function LoginPage() {
  return (
    // Separamos el login en dos columnas: una informativa y otra funcional.
    <section className="section-shell">
      <div className="container">
        <div className="row g-4 align-items-stretch">
          <div className="col-lg-6">
            <LoginHeaderSection />
          </div>
          <div className="col-lg-6">
            <LoginFormSection />
          </div>
        </div>
      </div>
    </section>
  );
}

export default LoginPage;
