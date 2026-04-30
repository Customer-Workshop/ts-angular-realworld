import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArticleListConfig } from '../../../models/article-list-config.model';
import { Article } from '../../../models/article.model';
import { LoadingState } from '../../../models/loading-state.model';
import * as articlesService from '../../../services/articles.service';
import ArticlePreview from './ArticlePreview';

interface ArticleListProps {
  limit: number;
  config: ArticleListConfig;
  currentPage?: number;
  isFollowingFeed?: boolean;
  onPageChange?: (page: number) => void;
}

export default function ArticleList({
  limit,
  config,
  currentPage = 1,
  isFollowingFeed = false,
  onPageChange,
}: ArticleListProps) {
  const [results, setResults] = useState<Article[]>([]);
  const [totalPages, setTotalPages] = useState<number[]>([]);
  const [loading, setLoading] = useState<LoadingState>(LoadingState.NOT_LOADED);
  const [page, setPage] = useState(currentPage);

  useEffect(() => {
    setPage(currentPage);
  }, [currentPage]);

  useEffect(() => {
    let cancelled = false;

    const runQuery = async () => {
      setLoading(LoadingState.LOADING);
      setResults([]);

      const queryConfig = {
        ...config,
        filters: {
          ...config.filters,
          limit,
          offset: limit * (page - 1),
        },
      };

      try {
        const data = await articlesService.query(queryConfig);
        if (!cancelled) {
          setLoading(LoadingState.LOADED);
          setResults(data.articles);
          setTotalPages(Array.from(new Array(Math.ceil(data.articlesCount / limit)), (_, index) => index + 1));
        }
      } catch {
        if (!cancelled) {
          setLoading(LoadingState.LOADED);
          setResults([]);
          setTotalPages([]);
        }
      }
    };

    runQuery();
    return () => {
      cancelled = true;
    };
  }, [config, page, limit]);

  const setPageTo = (pageNumber: number) => {
    if (pageNumber !== page) {
      setPage(pageNumber);
      onPageChange?.(pageNumber);
    }
  };

  if (loading === LoadingState.LOADING) {
    return <div className="article-preview">Loading articles...</div>;
  }

  if (loading === LoadingState.LOADED) {
    return (
      <>
        {results.length === 0 ? (
          <div className="article-preview empty-feed-message">
            {isFollowingFeed ? (
              <>
                Your feed is empty. Follow some users to see their articles here, or check out the{' '}
                <Link to="/">Global Feed</Link>!
              </>
            ) : (
              'No articles are here... yet.'
            )}
          </div>
        ) : (
          results.map(article => <ArticlePreview key={article.slug} article={article} />)
        )}

        <nav>
          <ul className="pagination">
            {totalPages.map(pageNumber => (
              <li key={pageNumber} className={`page-item ${pageNumber === page ? 'active' : ''}`}>
                <button className="page-link" style={{ cursor: 'pointer' }} onClick={() => setPageTo(pageNumber)}>
                  {pageNumber}
                </button>
              </li>
            ))}
          </ul>
        </nav>
      </>
    );
  }

  return null;
}
