import { useState } from 'react';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');
    setError('');

    try {
      const response = await fetch('https://localhost:7206/api/auth/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ Email: email }),
      });

      if (!response.ok) {
        throw new Error('Ошибка при отправке письма');
      }

      setMessage('Ссылка для сброса пароля отправлена на вашу почту.');
    } catch (err: any) {
      setError(err.message || 'Произошла ошибка');
    }
  };

  return (
    <div className="form-wrapper">
      <h2>Восстановление пароля</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <input
            type="email"
            placeholder="Введите ваш email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
          />
        </div>
        {message && <p style={{ color: 'green' }}>{message}</p>}
        {error && <p style={{ color: 'red' }}>{error}</p>}
        <div className="form-group">
          <button type="submit">Отправить ссылку</button>
        </div>
      </form>
    </div>
  );
}