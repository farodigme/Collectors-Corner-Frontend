import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

export default function ResetPasswordPage() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const isValidPassword = (pwd: string) => {
    return /^.*(?=.{8,16})(?=.*[a-zA-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).*$/.test(pwd);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');
    setError('');

    if (token == null){
      setError('Неизвестная ошибка');
      return;
    }

    if (password !== confirmPassword) {
      setError('Пароли не совпадают');
      return;
    }

    if (!isValidPassword(password)) {
      setError('Пароль должен быть от 8 до 16 символов и содержать буквы, цифры и спецсимволы');
      return;
    }

    try {
      const response = await fetch('https://localhost:7206/api/auth/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ResetToken: token,
          NewPassword: password,
          ConfirmPassword: confirmPassword,
        }),
      });

      if (!response.ok) {
        throw new Error('Ошибка при сбросе пароля');
      }

      navigate('/login');
    } catch (err: any) {
      setError(err.message || 'Произошла ошибка');
    }
  };

  return (
    <div className="form-wrapper">
      <h2>Сброс пароля</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <input
            type="password"
            placeholder="Введите пароль"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <input
            type="password"
            placeholder="Подтвердите пароль"
            value={confirmPassword}
            onChange={e => setConfirmPassword(e.target.value)}
            required
          />
        </div>
        {message && <p style={{ color: 'green' }}>{message}</p>}
        {error && <p style={{ color: 'red' }}>{error}</p>}
        <div className="form-group">
          <button type="submit">Выполнить</button>
        </div>
      </form>
    </div>
  );
}
