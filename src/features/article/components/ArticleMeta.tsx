import { Link } from 'react-router-dom';
import { Article } from '../../../models/article.model';
import { defaultImage } from '../../../utils/default-image';

interface ArticleMetaProps {
  article: Article;
  children?: React.ReactNode;
}

export default function ArticleMeta({ article, children }: ArticleMetaProps) {
  return (
    <div className="article-meta">
      <Link to={`/profile/${article.author.username}`}>
        <img src={defaultImage(article.author.image)} alt={article.author.username} />
      </Link>

      <div className="info">
        <Link className="author" to={`/profile/${article.author.username}`}>
          {article.author.username}
        </Link>
        <span className="date">{new Date(article.createdAt).toLocaleDateString('en-US', { dateStyle: 'long' })}</span>
      </div>

      {children}
    </div>
  );
}
