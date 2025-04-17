import React, { useEffect, useState } from 'react';

interface User {
  username: string;
  email: string;
  createdAt: string;
}

export default function AccountPage() {
  const [user, setUser] = useState<User | null>(null);
  const [nickname, setNickname] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetch('https://localhost:7206/api/account/getuser', {
      headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` },
    })
      .then(res => res.json())
      .then(data => setUser(data));
  }, []);

  const handleNicknameUpdate = () => {
    fetch('https://localhost:7206/api/account/updatenickname', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
      },
      body: JSON.stringify({ username: nickname }),
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setMessage('Никнейм успешно обновлен!');
          setUser(prev => prev && { ...prev, username: nickname });
        } else {
          setMessage('Ошибка при обновлении никнейма.');
        }
      })
      .catch(() => setMessage('Ошибка сервера. Попробуйте позже.'));
  };

  if (!user) return <div className="text-center py-10 text-gray-500">Загрузка...</div>;

  return (
    <div className="max-w-xl mx-auto bg-white rounded-xl shadow-lg p-8 mt-10">
      <div className="flex flex-col items-center mb-6">
        <div className="w-20 h-20 rounded-full bg-indigo-500 text-white flex items-center justify-center text-3xl font-bold mb-4">
          {user.username.charAt(0).toUpperCase()}
        </div>
        <h2 className="text-2xl font-bold text-gray-800">{user.username}</h2>
        <p className="text-gray-500">{user.email}</p>
      </div>

      <div className="border-t border-gray-200 pt-4 mb-6">
        <span className="text-gray-600 font-medium">Дата регистрации:</span>
        <span className="ml-2 font-semibold">
          {new Date(user.createdAt).toLocaleDateString()}
        </span>
      </div>

      <div className="mb-6">
        <label className="block text-gray-700 mb-2 font-medium">Новый никнейм</label>
        <input
          type="text"
          className="w-full border border-gray-300 rounded-md px-4 py-2"
          value={nickname}
          onChange={e => setNickname(e.target.value)}
          placeholder="Введите новый никнейм"
        />
      </div>

      <button
        onClick={handleNicknameUpdate}
        className="w-full bg-indigo-600 text-white py-2 rounded-md hover:bg-indigo-700 transition duration-200"
      >
        Сохранить изменения
      </button>

      {message && (
        <div className="mt-4 text-center text-sm font-medium text-indigo-600">
          {message}
        </div>
      )}
    </div>
  );
}
