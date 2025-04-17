import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface AvatarDropdownProps {
  username: string;
}

export default function AvatarDropdown({ username }: AvatarDropdownProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  return (
    <div className="nav-user relative" ref={menuRef}>
      <div
        className="nav-avatar cursor-pointer rounded-full bg-gray-500 text-white w-10 h-10 flex items-center justify-center select-none"
        title={username}
        onClick={() => setMenuOpen(prev => !prev)}
      >
        {username.charAt(0).toUpperCase()}
      </div>
      {menuOpen && (
        <div className="nav-dropdown absolute right-0 mt-2 w-48 bg-white shadow-md rounded-lg overflow-hidden z-20">
          <button
            onClick={() => navigate('/home')}
            className="block px-4 py-2 text-left hover:bg-gray-100 w-full"
          >
            Мои коллекции
          </button>
          <button
            onClick={() => navigate('/account')}
            className="block px-4 py-2 text-left hover:bg-gray-100 w-full"
          >
            Аккаунт
          </button>
          <button
            onClick={() => navigate('/settings')}
            className="block px-4 py-2 text-left hover:bg-gray-100 w-full"
          >
            Настройки
          </button>
          <button
            onClick={handleLogout}
            className="block px-4 py-2 text-left hover:bg-gray-100 w-full"
          >
            Выйти
          </button>
        </div>
      )}
    </div>
  );
}
