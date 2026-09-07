import { Link } from 'react-router-dom';
import RegisterForm from '../components/RegisterForm';

function Register() {
  return (
    <div className="auth-page">
      <div className="card">
        <h2>Регистрация</h2>
        <RegisterForm />
        <p className='auth-footer'>
          Уже есть аккаунт? <Link to="/login">Войти</Link>
        </p>
      </div>
    </div>
  );
}

export default Register;