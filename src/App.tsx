import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import ProtectedRoute from './components/ProtectedRoute';
import GuestRoute from './components/GuestRoute';
import HomePage from './features/home/HomePage';
import AuthPage from './features/auth/AuthPage';
import SettingsPage from './features/settings/SettingsPage';
import EditorPage from './features/editor/EditorPage';
import ArticlePage from './features/article/ArticlePage';
import ProfilePage from './features/profile/ProfilePage';
import ProfileArticles from './features/profile/ProfileArticles';
import ProfileFavorites from './features/profile/ProfileFavorites';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Header />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/tag/:tag" element={<HomePage />} />
          <Route
            path="/login"
            element={
              <GuestRoute>
                <AuthPage />
              </GuestRoute>
            }
          />
          <Route
            path="/register"
            element={
              <GuestRoute>
                <AuthPage />
              </GuestRoute>
            }
          />
          <Route
            path="/settings"
            element={
              <ProtectedRoute>
                <SettingsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/editor"
            element={
              <ProtectedRoute>
                <EditorPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/editor/:slug"
            element={
              <ProtectedRoute>
                <EditorPage />
              </ProtectedRoute>
            }
          />
          <Route path="/article/:slug" element={<ArticlePage />} />
          <Route path="/profile/:username" element={<ProfilePage />}>
            <Route index element={<ProfileArticles />} />
            <Route path="favorites" element={<ProfileFavorites />} />
          </Route>
        </Routes>
        <Footer />
      </AuthProvider>
    </BrowserRouter>
  );
}
