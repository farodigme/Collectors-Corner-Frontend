import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import AvatarDropdown from '../components/AvatarDropdown';
import AddCardModal from '../components/AddCardModal';

interface Card {
  id: number;
  title: string;
  description: string;
  category: string;
  imageUrl: string;
  isPublic: boolean;
}

interface Collection {
  id: number;
  title: string;
  description: string;
  category: string;
  isPublic: boolean;
  imageUrl: string;
  cardsCount: number;
}

export default function CollectionViewPage() {
  const { collectionId } = useParams();
  const navigate = useNavigate();
  const [collection, setCollection] = useState<Collection | null>(null);
  const [cards, setCards] = useState<Card[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [showAddCardModal, setShowAddCardModal] = useState(false);

  const fetchCollectionData = async () => {
    try {
      setIsLoading(true);
      setError('');
      
      const token = localStorage.getItem('accessToken');
      if (!token) {
        navigate('/login');
        return;
      }

      // Загружаем карточки коллекции
      const cardsResponse = await fetch(`https://localhost:7206/api/card/get?collectionId=${collectionId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!cardsResponse.ok) {
        if (cardsResponse.status === 401) {
          localStorage.clear();
          navigate('/login');
          return;
        }
        throw new Error('Ошибка загрузки карточек');
      }

      const cardsData = await cardsResponse.json();
      
      if (cardsData.success) {
        setCards(cardsData.cards || []);
        
        // Если в ответе есть данные о коллекции, используем их
        if (cardsData.collection) {
          setCollection(cardsData.collection);
        } else {
          // Если данных о коллекции нет, создаем базовый объект
          setCollection({
            id: parseInt(collectionId!),
            title: 'Коллекция',
            description: 'Описание коллекции',
            category: 'Общая',
            isPublic: false,
            imageUrl: '',
            cardsCount: cardsData.cards?.length || 0
          });
        }
      } else {
        setCards([]);
        setCollection(null);
      }
      
    } catch (err: any) {
      console.error('Ошибка загрузки данных:', err);
      setError(err.message || 'Произошла ошибка при загрузке данных');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (collectionId) {
      fetchCollectionData();
    }
  }, [collectionId, navigate]);

  const handleCardAdded = () => {
    setShowAddCardModal(false);
    fetchCollectionData(); // Обновляем данные
  };

  const handleBackToCollections = () => {
    navigate('/home');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Загрузка коллекции...</p>
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
            onClick={handleBackToCollections}
            className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
          >
            Вернуться к коллекциям
          </button>
        </div>
      </div>
    );
  }

  if (!collection) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Коллекция не найдена</p>
          <button 
            onClick={handleBackToCollections}
            className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
          >
            Вернуться к коллекциям
          </button>
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
              onClick={handleBackToCollections}
              className="flex items-center text-white hover:text-gray-200 transition"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Назад к коллекциям
            </button>
          </div>
          
          <div className="nav-actions">
            <button
              className="nav-btn primary"
              onClick={() => setShowAddCardModal(true)}
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Добавить карточку
            </button>
            
            <div className="nav-stats">
              <span className="stat-item">
                <span className="stat-number">{cards.length}</span>
                <span className="stat-label">Карточек</span>
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Collection Info */}
      <div className="collection-header">
        <div className="collection-info">
          <div className="collection-image">
            <img 
              src={collection.imageUrl} 
              alt={collection.title}
              onError={(e) => {
                (e.target as HTMLImageElement).src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0xMDAgNzBDMTE2LjU2OSA3MCAxMzAgODMuNDMxIDEzMCAxMDBDMTMwIDExNi41NjkgMTE2LjU2OSAxMzAgMTAwIDEzMEM4My40MzEgMTMwIDcwIDExNi41NjkgNzAgMTAwQzcwIDgzLjQzMSA4My40MzEgNzAgMTAwIDcwWiIgZmlsbD0iIzlDQTNBRiIvPgo8L3N2Zz4K';
              }}
            />
          </div>
          <div className="collection-details">
            <h1 className="collection-title">{collection.title}</h1>
            <p className="collection-description">{collection.description}</p>
            <div className="collection-meta">
              <span className="badge category-badge">{collection.category}</span>
              {collection.isPublic && (
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
      </div>

      {/* Cards Grid */}
      <main className="cards-container">
        {cards.length > 0 ? (
          <div className="cards-grid">
            {cards.map((card) => (
              <div key={card.id} className="card-item">
                <div className="card-image">
                  <img 
                    src={card.imageUrl} 
                    alt={card.title}
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0xMDAgNzBDMTE2LjU2OSA3MCAxMzAgODMuNDMxIDEzMCAxMDBDMTMwIDExNi41NjkgMTE2LjU2OSAxMzAgMTAwIDEzMEM4My40MzEgMTMwIDcwIDExNi41NjkgNzAgMTAwQzcwIDgzLjQzMSA4My40MzEgNzAgMTAwIDcwWiIgZmlsbD0iIzlDQTNBRiIvPgo8L3N2Zz4K';
                    }}
                  />
                </div>
                <div className="card-content">
                  <h3 className="card-title">{card.title}</h3>
                  <p className="card-description">{card.description}</p>
                  <div className="card-badges">
                    <span className="badge category-badge">{card.category}</span>
                    {card.isPublic && (
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
          <div className="empty-cards">
            <div className="empty-icon">
              <svg className="w-16 h-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="empty-title">В этой коллекции пока нет карточек</h3>
            <p className="empty-description">Добавьте первую карточку, чтобы начать собирать!</p>
            <button
              onClick={() => setShowAddCardModal(true)}
              className="empty-btn"
            >
              Добавить карточку
            </button>
          </div>
        )}
      </main>

      {/* Add Card Modal */}
      {showAddCardModal && (
        <AddCardModal
          collection={collection}
          onClose={() => setShowAddCardModal(false)}
          onSuccess={handleCardAdded}
        />
      )}
    </div>
  );
} 