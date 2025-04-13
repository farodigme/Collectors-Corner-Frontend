import { Link } from 'react-router-dom';

export default function LandingPage() {
  return (
    <div className="landing">
      <div className="landing-content">
        <h1>Collectors Corner</h1>
        <p>Добро пожаловать в мир коллекционных карточек. Создавай, собирай и обменивайся!</p>
        <div className="landing-buttons">
          <Link to="/login">Войти</Link>
          <Link to="/register">Зарегистрироваться</Link>
        </div>
      </div>
    </div>
  );
}