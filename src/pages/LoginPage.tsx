import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      const response = await fetch('https://localhost:7206/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          Username: username,
          Password: password,
        }),
      });

      if (!response.ok) {
        throw new Error('Неверный логин или пароль');
      }

      const data = await response.json();

      if (!data.success) {
        throw new Error('Неизвестная ошибка');
      }

      localStorage.setItem('accessToken', data.accessToken);
      localStorage.setItem('accessTokenExpires', data.accessTokenExpires);
      localStorage.setItem('refreshToken', data.refreshToken);
      localStorage.setItem('refreshTokenExpires', data.refreshTokenExpires);

      navigate('/home');
    } catch (err: any) {
      setError(err.message || 'Ошибка входа');
    }
  };

  return (
    <div className="form-wrapper">
      <h2>Вход</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <input
            type="text"
            placeholder="Имя пользователя"
            value={username}
            onChange={e => setUsername(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <input
            type="password"
            placeholder="Пароль"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
          />
        </div>
        {error && <p style={{ color: 'red' }}>{error}</p>}
        <div className="form-group">
          <button type="submit">Войти</button>
        </div>
        <div className="form-footer">
          <Link to="/forgot-password">Забыли пароль?</Link>
        </div>
      </form>
    </div>
  );
}
