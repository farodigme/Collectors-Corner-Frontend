import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AvatarDropdown from '../components/AvatarDropdown';


export default function HomePage() {
  const [userData, setUserData] = useState<any>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      navigate('/login');
      return;
    }

    fetch('https://localhost:7206/api/account/getuser', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(res => res.json())
      .then(data => {
        if (!data.success) throw new Error('Ошибка загрузки данных');
        setUserData(data);
      })
      .catch(() => navigate('/login'));
  }, [navigate]);

  if (!userData) return <div className="form-wrapper">Загрузка...</div>;

  return (
    <div className="home-wrapper">
      <header className="nav-bar flex justify-between items-center px-4 py-2 shadow-md">
        <div className="nav-logo font-bold">Collectors Corner</div>
        <AvatarDropdown username={userData.username} />
      </header>

      <main className="collections-container grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 p-4">
        {userData.collections.map((col: any) => (
          <div className="collection-card bg-white shadow-md rounded-lg overflow-hidden" key={col.id}>
            <img
              src={col.imageUrl}
              alt={col.title}
              className="w-full h-48 object-cover"
            />
            <div className="collection-content p-3">
              <h3 className="font-semibold text-lg">{col.title}</h3>
              <p className="text-sm text-gray-600">{col.description}</p>
              <span className="badge inline-block mt-2 bg-blue-100 text-blue-800 rounded px-2 py-1 text-xs">
                {col.category}
              </span>
            </div>
          </div>
        ))}
      </main>
    </div>
  );
}
