import { Link, NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { defaultImage } from '../../utils/default-image';

export default function Header() {
  const { currentUser, authState } = useAuth();

  return (
    <nav className="navbar navbar-light">
      <div className="container">
        <Link className="navbar-brand" to="/">
          conduit
        </Link>

        {authState === 'unauthenticated' && (
          <ul className="nav navbar-nav pull-xs-right">
            <li className="nav-item">
              <NavLink className="nav-link" to="/">
                Home
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink className="nav-link" to="/login">
                Sign in
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink className="nav-link" to="/register">
                Sign up
              </NavLink>
            </li>
          </ul>
        )}

        {authState === 'authenticated' && (
          <ul className="nav navbar-nav pull-xs-right">
            <li className="nav-item">
              <NavLink className="nav-link" to="/" end>
                Home
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink className="nav-link" to="/editor">
                <i className="ion-compose"></i>&nbsp;New Article
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink className="nav-link" to="/settings">
                <i className="ion-gear-a"></i>&nbsp;Settings
              </NavLink>
            </li>
            {currentUser && (
              <li className="nav-item">
                <NavLink className="nav-link" to={`/profile/${currentUser.username}`}>
                  <img src={defaultImage(currentUser.image)} className="user-pic" alt={currentUser.username} />
                  {currentUser.username}
                </NavLink>
              </li>
            )}
          </ul>
        )}

        {authState === 'unavailable' && (
          <ul className="nav navbar-nav pull-xs-right">
            <li className="nav-item">
              <NavLink className="nav-link" to="/" end>
                Home
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink className="nav-link" to="/editor">
                <i className="ion-compose"></i>&nbsp;New Article
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink className="nav-link" to="/settings">
                <i className="ion-gear-a"></i>&nbsp;Settings
              </NavLink>
            </li>
            <li className="nav-item">
              <span className="nav-link" title="Auth unavailable - retrying automatically">
                <i className="ion-load-c"></i>&nbsp;Connecting...
              </span>
            </li>
          </ul>
        )}

        {authState === 'loading' && (
          <ul className="nav navbar-nav pull-xs-right">
            <li className="nav-item">
              <NavLink className="nav-link" to="/">
                Home
              </NavLink>
            </li>
            <li className="nav-item">
              <span className="nav-link">Loading...</span>
            </li>
          </ul>
        )}
      </div>
    </nav>
  );
}
