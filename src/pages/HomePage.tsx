// src/pages/HomePage.tsx
import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function HomePage() {
  const [userData, setUserData] = useState<any>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      navigate('/login');
      return;
    }

    fetch('https://localhost:7206/api/account/getuser', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then(res => res.json())
      .then(data => {
        if (!data.success) throw new Error('Ошибка загрузки данных');
        setUserData(data);
      })
      .catch(() => navigate('/login'));
  }, [navigate]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!userData) return <div className="form-wrapper">Загрузка...</div>;

  return (
    <div className="home-wrapper">
      <header className="nav-bar">
        <div className="nav-logo">Collectors Corner</div>
        <div className="nav-user" ref={menuRef}>
          <div
            className="nav-avatar"
            title={userData.username}
            onClick={() => setMenuOpen(prev => !prev)}
          >
            {userData.username.slice(0, 1).toUpperCase()}
          </div>
          {menuOpen && (
            <div className="nav-dropdown">
              <a href="/home">Мои коллекции</a>
              <a href="/account">Аккаунт</a>
              <a href="/settings">Настройки</a>
              <button
                onClick={() => {
                  localStorage.clear();
                  navigate('/login');
                }}
              >
                Выйти
              </button>
            </div>
          )}
        </div>
      </header>
      <main className="collections-container">
        {userData.collections.map((col: any) => (
          <div className="collection-card" key={col.id}>
            <img
              src={`https://localhost:7210/api/image/get/${col.imageUrl}`}
              alt={col.title}
            />
            <div className="collection-content">
              <h3>{col.title}</h3>
              <p>{col.description}</p>
              <span className="badge">{col.category}</span>
            </div>
          </div>
        ))}
      </main>
    </div>
  );
}
