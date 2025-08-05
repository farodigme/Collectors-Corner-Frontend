import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AvatarDropdown from '../components/AvatarDropdown';

interface User {
  username: string;
  nickname: string;
  email: string;
  avatarUrl?: string;
  created: string;
  collections?: any[];
}

export default function AccountPage() {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Форма обновления данных
  const [formData, setFormData] = useState({
    nickname: '',
    email: ''
  });
  
  // Состояния для модальных окон
  const [showAvatarModal, setShowAvatarModal] = useState(false);
  
  // Состояния для загрузки и сообщений
  const [isUpdating, setIsUpdating] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'success' | 'error'>('success');
  const [avatarFile, setAvatarFile] = useState<File | null>(null);

  const fetchUserData = async () => {
    try {
      setIsLoading(true);
      setError('');
      
      const token = localStorage.getItem('accessToken');
      if (!token) {
        navigate('/login');
        return;
      }

      const response = await fetch('https://localhost:7206/api/account/get-user', {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
        if (response.status === 401) {
          localStorage.clear();
          navigate('/login');
          return;
        }
        throw new Error('Ошибка загрузки данных');
      }

      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.message || 'Ошибка загрузки данных');
      }
      
      setUser(data);
      setFormData({
        nickname: data.nickname || '',
        email: data.email || ''
      });
    } catch (err: any) {
      console.error('Ошибка загрузки данных пользователя:', err);
      setError(err.message || 'Произошла ошибка при загрузке данных');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUserData();
  }, [navigate]);

  const showMessage = (text: string, type: 'success' | 'error') => {
    setMessage(text);
    setMessageType(type);
    setTimeout(() => setMessage(''), 5000);
  };

  const handleUpdateNickname = async () => {
    try {
      setIsUpdating(true);
      setMessage('');
      
      const token = localStorage.getItem('accessToken');
      if (!token) {
        navigate('/login');
        return;
      }

      const response = await fetch('https://localhost:7206/api/account/update-nickname', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          Nickname: formData.nickname
        }),
      });

      if (!response.ok) {
        if (response.status === 401) {
          localStorage.clear();
          navigate('/login');
          return;
        }
        const errorData = await response.json();
        throw new Error(errorData.message || 'Ошибка обновления никнейма');
      }

      const data = await response.json();
      
      if (data.success) {
        showMessage('Никнейм успешно обновлен!', 'success');
        setUser(prev => prev && { ...prev, username: formData.nickname });
      } else {
        throw new Error(data.message || 'Ошибка обновления никнейма');
      }
    } catch (err: any) {
      console.error('Ошибка обновления никнейма:', err);
      showMessage(err.message || 'Произошла ошибка при обновлении никнейма', 'error');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleUpdateEmail = async () => {
    try {
      setIsUpdating(true);
      setMessage('');
      
      const token = localStorage.getItem('accessToken');
      if (!token) {
        navigate('/login');
        return;
      }

      const response = await fetch('https://localhost:7206/api/account/update-email', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          Email: formData.email
        }),
      });

      if (!response.ok) {
        if (response.status === 401) {
          localStorage.clear();
          navigate('/login');
          return;
        }
        const errorData = await response.json();
        throw new Error(errorData.message || 'Ошибка обновления email');
      }

      const data = await response.json();
      
      if (data.success) {
        showMessage('Email успешно обновлен!', 'success');
        setUser(prev => prev && { ...prev, email: formData.email });
      } else {
        throw new Error(data.message || 'Ошибка обновления email');
      }
    } catch (err: any) {
      console.error('Ошибка обновления email:', err);
      showMessage(err.message || 'Произошла ошибка при обновлении email', 'error');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleAvatarUpload = async () => {
    try {
      setIsUpdating(true);
      setMessage('');
      
      if (!avatarFile) {
        showMessage('Выберите файл для загрузки', 'error');
        return;
      }

      const token = localStorage.getItem('accessToken');
      if (!token) {
        navigate('/login');
        return;
      }

      const formData = new FormData();
      formData.append('Image', avatarFile);

      const response = await fetch('https://localhost:7206/api/account/update-avatar', {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      if (!response.ok) {
        if (response.status === 401) {
          localStorage.clear();
          navigate('/login');
          return;
        }
        const errorData = await response.json();
        throw new Error(errorData.message || 'Ошибка загрузки аватара');
      }

      const data = await response.json();
      
      if (data.success) {
        showMessage('Аватар успешно обновлен!', 'success');
        setShowAvatarModal(false);
        setAvatarFile(null);
        fetchUserData(); // Обновляем данные пользователя
      } else {
        throw new Error(data.message || 'Ошибка загрузки аватара');
      }
    } catch (err: any) {
      console.error('Ошибка загрузки аватара:', err);
      showMessage(err.message || 'Произошла ошибка при загрузке аватара', 'error');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        showMessage('Выберите изображение', 'error');
        return;
      }
      if (file.size > 5 * 1024 * 1024) { // 5MB
        showMessage('Размер файла не должен превышать 5MB', 'error');
        return;
      }
      setAvatarFile(file);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Загрузка профиля...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button 
            onClick={fetchUserData}
            className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
          >
            Попробовать снова
          </button>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Данные не найдены</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="nav-bar">
        <div className="nav-container">
          <div className="nav-logo">
            <button 
              onClick={() => navigate('/home')}
              className="flex items-center text-white hover:text-gray-200 transition"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Назад к коллекциям
            </button>
          </div>
          
          <div className="nav-actions">
            <AvatarDropdown username={user.nickname || user.username} />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="account-container">
        <div className="account-card">
          {/* Profile Header */}
          <div className="profile-header">
            <div className="avatar-section">
              <div className="avatar-container">
                {user.avatarUrl ? (
                  <img 
                    src={user.avatarUrl} 
                    alt={user.nickname || user.username}
                    className="avatar-image"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0xMDAgNzBDMTE2LjU2OSA3MCAxMzAgODMuNDMxIDEzMCAxMDBDMTMwIDExNi41NjkgMTE2LjU2OSAxMzAgMTAwIDEzMEM4My40MzEgMTMwIDcwIDExNi41NjkgNzAgMTAwQzcwIDgzLjQzMSA4My40MzEgNzAgMTAwIDcwWiIgZmlsbD0iIzlDQTNBRiIvPgo8L3N2Zz4K';
                    }}
                  />
                ) : (
                  <div className="avatar-placeholder">
                    {(user.nickname || user.username).charAt(0).toUpperCase()}
                  </div>
                )}
                <button
                  onClick={() => setShowAvatarModal(true)}
                  className="avatar-edit-btn"
                  title="Изменить аватар"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                  </svg>
                </button>
              </div>
            </div>
            
            <div className="profile-info">
              <h1 className="profile-title">{user.nickname || user.username}</h1>
              <p className="profile-subtitle">
                Управляйте своими данными и настройками аккаунта
              </p>
              <div className="profile-meta">
                <span className="meta-item">
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  Регистрация: {new Date(user.created).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>

          {/* Profile Form */}
          <div className="profile-form">
            {/* Nickname Section */}
            <div className="form-section">
              <h3 className="section-title">
                <svg className="w-5 h-5 mr-2 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                Имя пользователя
              </h3>
              
              <div className="form-group">
                <label className="form-label">Никнейм</label>
                <input
                  type="text"
                  className="form-input"
                  value={formData.nickname}
                  onChange={(e) => setFormData(prev => ({ ...prev, nickname: e.target.value }))}
                  placeholder="Введите новый никнейм"
                />
              </div>

              <button
                onClick={handleUpdateNickname}
                disabled={isUpdating || !formData.nickname.trim()}
                className="form-btn primary"
              >
                {isUpdating ? (
                  <span className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Обновление...
                  </span>
                ) : (
                  'Обновить никнейм'
                )}
              </button>
            </div>

            {/* Email Section */}
            <div className="form-section">
              <h3 className="section-title">
                <svg className="w-5 h-5 mr-2 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                Email адрес
              </h3>
              
              <div className="form-group">
                <label className="form-label">Email</label>
                <input
                  type="email"
                  className="form-input"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="Введите новый email"
                />
              </div>

              <button
                onClick={handleUpdateEmail}
                disabled={isUpdating || !formData.email.trim()}
                className="form-btn primary"
              >
                {isUpdating ? (
                  <span className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Обновление...
                  </span>
                ) : (
                  'Обновить email'
                )}
              </button>
            </div>

            {/* Avatar Section */}
            <div className="form-section">
              <h3 className="section-title">
                <svg className="w-5 h-5 mr-2 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                Аватар профиля
              </h3>
              
              <div className="avatar-info">
                <p className="avatar-description">
                  Загрузите изображение для вашего профиля. Рекомендуемый размер: 200x200 пикселей.
                </p>
                <button
                  onClick={() => setShowAvatarModal(true)}
                  className="form-btn secondary"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                  Загрузить аватар
                </button>
              </div>
            </div>
          </div>

          {/* Message */}
          {message && (
            <div className={`message ${messageType === 'success' ? 'message-success' : 'message-error'}`}>
              {message}
            </div>
          )}
        </div>
      </main>

      {/* Avatar Upload Modal */}
      {showAvatarModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <button
              onClick={() => setShowAvatarModal(false)}
              disabled={isUpdating}
              className="modal-close-btn"
            >
              &times;
            </button>
            <h2 className="modal-title">Изменить аватар</h2>
            
            <div className="avatar-upload">
              <input
                type="file"
                accept="image/*"
                onChange={handleAvatarChange}
                disabled={isUpdating}
                className="file-input"
              />
              {avatarFile && (
                <div className="file-info">
                  <p>Выбрано: {avatarFile.name}</p>
                  <p>Размер: {(avatarFile.size / 1024 / 1024).toFixed(2)} MB</p>
                </div>
              )}
            </div>

            <div className="modal-actions">
              <button
                onClick={() => setShowAvatarModal(false)}
                disabled={isUpdating}
                className="modal-btn secondary"
              >
                Отмена
              </button>
              <button
                onClick={handleAvatarUpload}
                disabled={isUpdating || !avatarFile}
                className="modal-btn primary"
              >
                {isUpdating ? 'Загрузка...' : 'Загрузить'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
