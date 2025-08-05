import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AvatarDropdown from '../components/AvatarDropdown';

interface User {
  username: string;
  email: string;
  avatarUrl?: string;
  createdAt: string;
}

export default function AccountPage() {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Форма обновления данных
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    currentPassword: '',
    newPassword: ''
  });
  
  // Состояния для модальных окон
  const [showAvatarModal, setShowAvatarModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  
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
        username: data.username || '',
        email: data.email || '',
        currentPassword: '',
        newPassword: ''
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

  const handleUpdateProfile = async () => {
    try {
      setIsUpdating(true);
      setMessage('');
      
      const token = localStorage.getItem('accessToken');
      if (!token) {
        navigate('/login');
        return;
      }

      const response = await fetch('https://localhost:7206/api/account/update-profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          username: formData.username,
          email: formData.email
        }),
      });

      if (!response.ok) {
        if (response.status === 401) {
          localStorage.clear();
          navigate('/login');
          return;
        }
        const errorData = await response.json();
        throw new Error(errorData.message || 'Ошибка обновления профиля');
      }

      const data = await response.json();
      
      if (data.success) {
        showMessage('Профиль успешно обновлен!', 'success');
        setUser(prev => prev && { ...prev, username: formData.username, email: formData.email });
      } else {
        throw new Error(data.message || 'Ошибка обновления профиля');
      }
    } catch (err: any) {
      console.error('Ошибка обновления профиля:', err);
      showMessage(err.message || 'Произошла ошибка при обновлении профиля', 'error');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleUpdatePassword = async () => {
    try {
      setIsUpdating(true);
      setMessage('');
      
      const token = localStorage.getItem('accessToken');
      if (!token) {
        navigate('/login');
        return;
      }

      const response = await fetch('https://localhost:7206/api/account/update-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          currentPassword: formData.currentPassword,
          newPassword: formData.newPassword
        }),
      });

      if (!response.ok) {
        if (response.status === 401) {
          localStorage.clear();
          navigate('/login');
          return;
        }
        const errorData = await response.json();
        throw new Error(errorData.message || 'Ошибка обновления пароля');
      }

      const data = await response.json();
      
      if (data.success) {
        showMessage('Пароль успешно обновлен!', 'success');
        setShowPasswordModal(false);
        setFormData(prev => ({ ...prev, currentPassword: '', newPassword: '' }));
      } else {
        throw new Error(data.message || 'Ошибка обновления пароля');
      }
    } catch (err: any) {
      console.error('Ошибка обновления пароля:', err);
      showMessage(err.message || 'Произошла ошибка при обновлении пароля', 'error');
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
      formData.append('avatar', avatarFile);

      const response = await fetch('https://localhost:7206/api/account/update-avatar', {
        method: 'POST',
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
            <AvatarDropdown username={user.username} />
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
                    alt={user.username}
                    className="avatar-image"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0xMDAgNzBDMTE2LjU2OSA3MCAxMzAgODMuNDMxIDEzMCAxMDBDMTMwIDExNi41NjkgMTE2LjU2OSAxMzAgMTAwIDEzMEM4My40MzEgMTMwIDcwIDExNi41NjkgNzAgMTAwQzcwIDgzLjQzMSA4My40MzEgNzAgMTAwIDcwWiIgZmlsbD0iIzlDQTNBRiIvPgo8L3N2Zz4K';
                    }}
                  />
                ) : (
                  <div className="avatar-placeholder">
                    {user.username.charAt(0).toUpperCase()}
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
              <h1 className="profile-title">Настройки профиля</h1>
              <p className="profile-subtitle">
                Управляйте своими данными и настройками аккаунта
              </p>
              <div className="profile-meta">
                <span className="meta-item">
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  Регистрация: {new Date(user.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>

          {/* Profile Form */}
          <div className="profile-form">
            <div className="form-section">
              <h3 className="section-title">Основная информация</h3>
              
              <div className="form-group">
                <label className="form-label">Имя пользователя</label>
                <input
                  type="text"
                  className="form-input"
                  value={formData.username}
                  onChange={(e) => setFormData(prev => ({ ...prev, username: e.target.value }))}
                  placeholder="Введите имя пользователя"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Email</label>
                <input
                  type="email"
                  className="form-input"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="Введите email"
                />
              </div>

              <button
                onClick={handleUpdateProfile}
                disabled={isUpdating}
                className="form-btn primary"
              >
                {isUpdating ? (
                  <span className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Обновление...
                  </span>
                ) : (
                  'Сохранить изменения'
                )}
              </button>
            </div>

            <div className="form-section">
              <h3 className="section-title">Безопасность</h3>
              
              <button
                onClick={() => setShowPasswordModal(true)}
                className="form-btn secondary"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                Изменить пароль
              </button>
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

      {/* Password Change Modal */}
      {showPasswordModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <button
              onClick={() => setShowPasswordModal(false)}
              disabled={isUpdating}
              className="modal-close-btn"
            >
              &times;
            </button>
            <h2 className="modal-title">Изменить пароль</h2>
            
            <div className="form-group">
              <label className="form-label">Текущий пароль</label>
              <input
                type="password"
                className="form-input"
                value={formData.currentPassword}
                onChange={(e) => setFormData(prev => ({ ...prev, currentPassword: e.target.value }))}
                placeholder="Введите текущий пароль"
                disabled={isUpdating}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Новый пароль</label>
              <input
                type="password"
                className="form-input"
                value={formData.newPassword}
                onChange={(e) => setFormData(prev => ({ ...prev, newPassword: e.target.value }))}
                placeholder="Введите новый пароль"
                disabled={isUpdating}
              />
            </div>

            <div className="modal-actions">
              <button
                onClick={() => setShowPasswordModal(false)}
                disabled={isUpdating}
                className="modal-btn secondary"
              >
                Отмена
              </button>
              <button
                onClick={handleUpdatePassword}
                disabled={isUpdating || !formData.currentPassword || !formData.newPassword}
                className="modal-btn primary"
              >
                {isUpdating ? 'Обновление...' : 'Изменить пароль'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
