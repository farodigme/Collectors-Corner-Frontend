import { useState } from 'react';

export default function RegisterPage() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      const response = await fetch('https://localhost:7206/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          Username: username,
          Email: email,
          Password: password,
        }),
      });

      if (!response.ok) {
        throw new Error('Ошибка регистрации');
      }

      const data = await response.json();
      console.log('Регистрация прошла успешно:', data);

      localStorage.setItem('token', data.token);
      window.location.href = '/';
    } catch (err: any) {
      setError(err.message || 'Ошибка регистрации');
    }
  };

  return (
    <div className="form-wrapper">
      <h2>Регистрация</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Имя пользователя"
          value={username}
          onChange={e => setUsername(e.target.value)}
          required
        />
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Пароль"
          value={password}
          onChange={e => setPassword(e.target.value)}
          required
        />
        {error && <p style={{ color: 'red' }}>{error}</p>}
        <button type="submit">Зарегистрироваться</button>
      </form>
    </div>
  );
}
