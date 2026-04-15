import LoginFormSection from '../components/auth/LoginFormSection';
import LoginHeaderSection from '../components/auth/LoginHeaderSection';

function RegisterPage() {
  return (
    <section className="section-shell">
      <div className="container">
        <div className="row g-4 align-items-stretch">
          <div className="col-lg-6">
            <LoginHeaderSection mode="register" />
          </div>
          <div className="col-lg-6">
            <LoginFormSection
              defaultMode="register"
              hideModeSwitch
              redirectOnRegisterTo="/login"
            />
          </div>
        </div>
      </div>
    </section>
  );
}

export default RegisterPage;
