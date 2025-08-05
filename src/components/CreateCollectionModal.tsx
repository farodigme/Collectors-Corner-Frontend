import React, { useState } from 'react';

interface Props {
  onClose: () => void;
  onSuccess: () => void;
}

const CreateCollectionModal: React.FC<Props> = ({ onClose, onSuccess }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [isPublic, setIsPublic] = useState(false);
  const [image, setImage] = useState<File | null>(null);
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{[key: string]: string}>({});

  const validateForm = () => {
    const newErrors: {[key: string]: string} = {};
    
    if (!title.trim()) {
      newErrors.title = 'Название обязательно';
    } else if (title.length < 3) {
      newErrors.title = 'Название должно быть не менее 3 символов';
    }
    
    if (!description.trim()) {
      newErrors.description = 'Описание обязательно';
    } else if (description.length < 10) {
      newErrors.description = 'Описание должно быть не менее 10 символов';
    }
    
    if (!category.trim()) {
      newErrors.category = 'Категория обязательна';
    }
    
    if (!image) {
      newErrors.image = 'Изображение обязательно';
    } else if (image.size > 5 * 1024 * 1024) { // 5MB
      newErrors.image = 'Размер изображения не должен превышать 5MB';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');
    setErrors({});
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      const formData = new FormData();
      formData.append('title', title.trim());
      formData.append('description', description.trim());
      formData.append('category', category.trim());
      formData.append('ispublic', isPublic.toString());
      if (image) formData.append('image', image);

      const token = localStorage.getItem('accessToken');
      
      if (!token) {
        throw new Error('Токен авторизации не найден');
      }

      const response = await fetch('https://localhost:7206/api/collection/create', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Необходима авторизация');
        } else if (response.status === 400) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Неверные данные');
        } else {
          throw new Error(`Ошибка сервера: ${response.status}`);
        }
      }

      const result = await response.json();

      if (result.success) {
        setMessage('Коллекция успешно создана!');
        setTimeout(() => {
          onSuccess();
        }, 1000);
      } else {
        throw new Error(result.message || 'Ошибка при создании коллекции');
      }
    } catch (error: any) {
      console.error('Ошибка создания коллекции:', error);
      setMessage(error.message || 'Произошла ошибка при создании коллекции');
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        setErrors({...errors, image: 'Выберите изображение'});
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        setErrors({...errors, image: 'Размер изображения не должен превышать 5MB'});
        return;
      }
      setImage(file);
      setErrors({...errors, image: ''});
    }
  };

  const modalOverlayStyle = {
    position: 'fixed' as const,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
    padding: '20px'
  };

  const modalContentStyle = {
    background: 'white',
    borderRadius: '12px',
    padding: '32px',
    width: '100%',
    maxWidth: '500px',
    maxHeight: '90vh',
    overflowY: 'auto' as const,
    position: 'relative' as const,
    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
  };

  const modalCloseBtnStyle = {
    position: 'absolute' as const,
    top: '12px',
    right: '16px',
    background: 'none',
    border: 'none',
    fontSize: '24px',
    color: '#9ca3af',
    cursor: 'pointer',
    padding: '4px',
    borderRadius: '4px',
    transition: 'color 0.2s'
  };

  const modalTitleStyle = {
    fontSize: '24px',
    fontWeight: 'bold',
    textAlign: 'center' as const,
    marginBottom: '24px',
    color: '#1f2937'
  };

  const modalFormStyle = {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '20px'
  };

  const formFieldStyle = {
    display: 'flex',
    flexDirection: 'column' as const
  };

  const formLabelStyle = {
    fontSize: '14px',
    fontWeight: 500,
    color: '#374151',
    marginBottom: '4px'
  };

  const formInputStyle = (hasError: boolean) => ({
    width: '100%',
    padding: '12px 16px',
    border: `1px solid ${hasError ? '#ef4444' : '#d1d5db'}`,
    borderRadius: '8px',
    fontSize: '16px',
    transition: 'border-color 0.2s, box-shadow 0.2s',
    boxSizing: 'border-box' as const
  });

  const formTextareaStyle = (hasError: boolean) => ({
    ...formInputStyle(hasError),
    resize: 'none' as const,
    height: '96px',
    fontFamily: 'inherit'
  });

  const formCheckboxStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  };

  const checkboxInputStyle = {
    width: '16px',
    height: '16px',
    accentColor: '#6366f1'
  };

  const checkboxLabelStyle = {
    fontSize: '14px',
    color: '#374151'
  };

  const fileInputStyle = {
    width: '100%',
    padding: '8px',
    border: '1px solid #d1d5db',
    borderRadius: '8px',
    fontSize: '14px'
  };

  const submitBtnStyle = {
    width: '100%',
    backgroundColor: '#6366f1',
    color: 'white',
    fontWeight: 600,
    padding: '12px',
    border: 'none',
    borderRadius: '8px',
    fontSize: '16px',
    cursor: 'pointer',
    transition: 'background-color 0.2s',
    opacity: isLoading ? 0.5 : 1
  };

  const loadingContentStyle = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '12px'
  };

  const spinnerStyle = {
    width: '20px',
    height: '20px',
    border: '2px solid transparent',
    borderTop: '2px solid white',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite'
  };

  const errorMessageStyle = {
    color: '#ef4444',
    fontSize: '14px',
    marginTop: '4px'
  };

  const successMessageStyle = {
    color: '#10b981',
    fontSize: '14px',
    marginTop: '4px'
  };

  const messageStyle = (isSuccess: boolean) => ({
    textAlign: 'center' as const,
    fontSize: '14px',
    marginTop: '8px',
    padding: '8px',
    borderRadius: '4px',
    backgroundColor: isSuccess ? '#d1fae5' : '#fee2e2',
    color: isSuccess ? '#065f46' : '#991b1b'
  });

  return (
    <div style={modalOverlayStyle}>
      <div style={modalContentStyle}>
        <button
          onClick={onClose}
          disabled={isLoading}
          style={modalCloseBtnStyle}
          onMouseEnter={(e) => {
            if (!isLoading) e.currentTarget.style.color = '#374151';
          }}
          onMouseLeave={(e) => {
            if (!isLoading) e.currentTarget.style.color = '#9ca3af';
          }}
        >
          &times;
        </button>
        <h2 style={modalTitleStyle}>
          Новая коллекция
        </h2>
        <form onSubmit={handleSubmit} style={modalFormStyle}>
          <div style={formFieldStyle}>
            <label style={formLabelStyle}>
              Название *
            </label>
            <input
              type="text"
              placeholder="Например: Комиксы Marvel"
              style={formInputStyle(!!errors.title)}
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                if (errors.title) setErrors({...errors, title: ''});
              }}
              disabled={isLoading}
              required
            />
            {errors.title && (
              <p style={errorMessageStyle}>{errors.title}</p>
            )}
          </div>
    
          <div style={formFieldStyle}>
            <label style={formLabelStyle}>
              Описание *
            </label>
            <textarea
              placeholder="Добавьте описание вашей коллекции"
              style={formTextareaStyle(!!errors.description)}
              value={description}
              onChange={(e) => {
                setDescription(e.target.value);
                if (errors.description) setErrors({...errors, description: ''});
              }}
              disabled={isLoading}
              required
            />
            {errors.description && (
              <p style={errorMessageStyle}>{errors.description}</p>
            )}
          </div>
    
          <div style={formFieldStyle}>
            <label style={formLabelStyle}>
              Категория *
            </label>
            <input
              type="text"
              placeholder="Например: Комиксы, Фигурки, Монеты"
              style={formInputStyle(!!errors.category)}
              value={category}
              onChange={(e) => {
                setCategory(e.target.value);
                if (errors.category) setErrors({...errors, category: ''});
              }}
              disabled={isLoading}
              required
            />
            {errors.category && (
              <p style={errorMessageStyle}>{errors.category}</p>
            )}
          </div>
    
          <div style={formCheckboxStyle}>
            <input
              type="checkbox"
              id="isPublic"
              checked={isPublic}
              onChange={(e) => setIsPublic(e.target.checked)}
              disabled={isLoading}
              style={checkboxInputStyle}
            />
            <label htmlFor="isPublic" style={checkboxLabelStyle}>
              Сделать коллекцию публичной
            </label>
          </div>
    
          <div style={formFieldStyle}>
            <label style={formLabelStyle}>
              Изображение *
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              disabled={isLoading}
              style={fileInputStyle}
              required
            />
            {errors.image && (
              <p style={errorMessageStyle}>{errors.image}</p>
            )}
            {image && (
              <p style={successMessageStyle}>
                Выбрано: {image.name} ({(image.size / 1024 / 1024).toFixed(2)} MB)
              </p>
            )}
          </div>
    
          <button
            type="submit"
            disabled={isLoading}
            style={submitBtnStyle}
            onMouseEnter={(e) => {
              if (!isLoading) e.currentTarget.style.backgroundColor = '#5855eb';
            }}
            onMouseLeave={(e) => {
              if (!isLoading) e.currentTarget.style.backgroundColor = '#6366f1';
            }}
          >
            {isLoading ? (
              <span style={loadingContentStyle}>
                <div style={spinnerStyle}></div>
                Создание...
              </span>
            ) : (
              'Создать коллекцию'
            )}
          </button>
    
          {message && (
            <p style={messageStyle(message.includes('успешно'))}>
              {message}
            </p>
          )}
        </form>
      </div>
    </div>
  );
};

export default CreateCollectionModal;
