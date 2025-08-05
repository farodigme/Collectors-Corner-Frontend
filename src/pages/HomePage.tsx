import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AvatarDropdown from '../components/AvatarDropdown';
import CreateCollectionModal from '../components/CreateCollectionModal';
import AddCardModal from '../components/AddCardModal';

export default function HomePage() {
  const [userData, setUserData] = useState<any>(null);
  const [showModal, setShowModal] = useState(false);
  const [showAddCardModal, setShowAddCardModal] = useState(false);
  const [selectedCollection, setSelectedCollection] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

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
      
      setUserData(data);
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

  const handleCollectionCreated = () => {
    setShowModal(false);
    fetchUserData();
  };

  const handleCardAdded = () => {
    setShowAddCardModal(false);
    setSelectedCollection(null);
    fetchUserData();
  };

  const handleViewCollection = (collection: any) => {
    navigate(`/collection/${collection.id}`);
  };

  const handleAddCard = (collection: any) => {
    setSelectedCollection(collection);
    setShowAddCardModal(true);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Загрузка коллекций...</p>
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

  if (!userData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Данные не найдены</p>
        </div>
      </div>
    );
  }

  return (
    <div className="home-wrapper">
      <header className="nav-bar">
        <div className="nav-container">
          <div className="nav-logo">
            <h1 className="text-xl font-bold">Collectors Corner</h1>
          </div>
          
          <div className="nav-actions">
            <button
              className="nav-btn primary"
              onClick={() => setShowModal(true)}
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Новая коллекция
            </button>
            
            <div className="nav-stats">
              <span className="stat-item">
                <span className="stat-number">{userData.collections?.length || 0}</span>
                <span className="stat-label">Коллекций</span>
              </span>
              <span className="stat-item">
                <span className="stat-number">
                  {userData.collections?.reduce((total: number, col: any) => total + (col.cardsCount || 0), 0) || 0}
                </span>
                <span className="stat-label">Карточек</span>
              </span>
            </div>
            
            <AvatarDropdown username={userData.username} />
          </div>
        </div>
      </header>

      {showModal && (
        <CreateCollectionModal
          onClose={() => setShowModal(false)}
          onSuccess={handleCollectionCreated}
        />
      )}

      {showAddCardModal && selectedCollection && (
        <AddCardModal
          collection={selectedCollection}
          onClose={() => {
            setShowAddCardModal(false);
            setSelectedCollection(null);
          }}
          onSuccess={handleCardAdded}
        />
      )}

      <main className="collections-container">
        {userData.collections && userData.collections.length > 0 ? (
          <div className="collections-grid">
            {userData.collections.map((col: any) => (
              <div className="collection-card" key={col.id}>
                <div className="card-image">
                  <img
                    src={col.imageUrl}
                    alt={col.title}
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0xMDAgNzBDMTE2LjU2OSA3MCAxMzAgODMuNDMxIDEzMCAxMDBDMTMwIDExNi41NjkgMTE2LjU2OSAxMzAgMTAwIDEzMEM4My40MzEgMTMwIDcwIDExNi41NjkgNzAgMTAwQzcwIDgzLjQzMSA4My40MzEgNzAgMTAwIDcwWiIgZmlsbD0iIzlDQTNBRiIvPgo8L3N2Zz4K';
                    }}
                  />
                  <div className="card-overlay">
                    <div className="overlay-actions">
                      <button 
                        className="overlay-btn view-btn"
                        onClick={() => handleViewCollection(col)}
                        title="Просмотреть карточки"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                        Просмотр
                      </button>
                      <button 
                        className="overlay-btn add-btn"
                        onClick={() => handleAddCard(col)}
                        title="Добавить карточку"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                        Добавить
                      </button>
                    </div>
                  </div>
                </div>
                
                <div className="card-content">
                  <h3 className="card-title">{col.title}</h3>
                  <p className="card-description">{col.description}</p>
                  
                  <div className="card-stats">
                    <span className="stat-badge">
                      <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                      </svg>
                      {col.cardsCount || 0} карточек
                    </span>
                  </div>
                  
                  <div className="card-badges">
                    <span className="badge category-badge">
                      {col.category}
                    </span>
                    {col.isPublic && (
                      <span className="badge public-badge">
                        <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                        Публичная
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <div className="empty-icon">
              <svg className="w-16 h-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
            <h3 className="empty-title">У вас пока нет коллекций</h3>
            <p className="empty-description">Создайте свою первую коллекцию, чтобы начать собирать карточки!</p>
            <button
              onClick={() => setShowModal(true)}
              className="empty-btn"
            >
              Создать коллекцию
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
