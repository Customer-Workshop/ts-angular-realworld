import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import * as articlesService from '../../../services/articles.service';
import { Article } from '../../../models/article.model';

interface FavoriteButtonProps {
  article: Article;
  onToggle: (favorited: boolean) => void;
  children?: React.ReactNode;
  className?: string;
}

export default function FavoriteButton({ article, onToggle, children, className }: FavoriteButtonProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const toggleFavorite = async () => {
    setIsSubmitting(true);

    if (!isAuthenticated) {
      navigate('/register');
      return;
    }

    try {
      if (!article.favorited) {
        await articlesService.favorite(article.slug);
      } else {
        await articlesService.unfavorite(article.slug);
      }
      setIsSubmitting(false);
      onToggle(!article.favorited);
    } catch {
      setIsSubmitting(false);
    }
  };

  return (
    <button
      className={`btn btn-sm ${article.favorited ? 'btn-primary' : 'btn-outline-primary'} ${isSubmitting ? 'disabled' : ''} ${className || ''}`}
      onClick={toggleFavorite}
    >
      <i className="ion-heart"></i> {children}
    </button>
  );
}
