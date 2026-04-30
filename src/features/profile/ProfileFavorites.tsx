import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { ArticleListConfig } from '../../models/article-list-config.model';
import ArticleList from '../article/components/ArticleList';

export default function ProfileFavorites() {
  const { username } = useParams<{ username: string }>();
  const [config, setConfig] = useState<ArticleListConfig | null>(null);

  useEffect(() => {
    if (username) {
      setConfig({
        type: 'all',
        filters: { favorited: username },
      });
    }
  }, [username]);

  if (!config) return null;

  return <ArticleList limit={10} config={config} />;
}
