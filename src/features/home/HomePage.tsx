import { useState, useEffect } from 'react';
import { Link, useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ArticleListConfig } from '../../models/article-list-config.model';
import * as tagsService from '../../services/tags.service';
import ArticleList from '../article/components/ArticleList';

export default function HomePage() {
  const { tag } = useParams<{ tag: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const feed = searchParams.get('feed');
  const pageParam = searchParams.get('page');
  const currentPage = pageParam ? parseInt(pageParam, 10) : 1;

  const [tags, setTags] = useState<string[]>([]);
  const [tagsLoaded, setTagsLoaded] = useState(false);

  useEffect(() => {
    if (feed === 'following' && !isAuthenticated) {
      navigate('/login');
      return;
    }
  }, [feed, isAuthenticated, navigate]);

  const [listConfig, setListConfig] = useState<ArticleListConfig>({ type: 'all', filters: {} });
  const [isFollowingFeed, setIsFollowingFeed] = useState(false);

  useEffect(() => {
    let type: string;
    let filters: { tag?: string } = {};

    if (tag) {
      type = 'all';
      filters = { tag };
    } else if (feed === 'following') {
      type = 'feed';
    } else {
      type = 'all';
    }

    setListConfig({ type, filters });
    setIsFollowingFeed(type === 'feed');
  }, [tag, feed]);

  useEffect(() => {
    tagsService.getAll().then(data => {
      setTags(data);
      setTagsLoaded(true);
    });
  }, []);

  const onPageChange = (page: number) => {
    const newParams: Record<string, string> = {};
    if (feed) newParams.feed = feed;
    if (page > 1) newParams.page = String(page);
    setSearchParams(newParams);
  };

  return (
    <div className="home-page">
      {!isAuthenticated && (
        <div className="banner">
          <div className="container">
            <h1 className="logo-font">conduit</h1>
            <p>A place to share your knowledge.</p>
          </div>
        </div>
      )}

      <div className="container page">
        <div className="row">
          <div className="col-md-9">
            <div className="feed-toggle">
              <ul className="nav nav-pills outline-active">
                {isAuthenticated && (
                  <li className="nav-item">
                    <Link
                      className={`nav-link ${listConfig.type === 'feed' ? 'active' : ''}`}
                      to="/?feed=following"
                      style={{ cursor: 'pointer' }}
                    >
                      Your Feed
                    </Link>
                  </li>
                )}
                <li className="nav-item">
                  <Link
                    className={`nav-link ${listConfig.type === 'all' && !listConfig.filters.tag ? 'active' : ''}`}
                    to="/"
                    style={{ cursor: 'pointer' }}
                  >
                    Global Feed
                  </Link>
                </li>
                {listConfig.filters.tag && (
                  <li className="nav-item">
                    <a className="nav-link active">
                      <i className="ion-pound"></i> {listConfig.filters.tag}
                    </a>
                  </li>
                )}
              </ul>
            </div>

            <ArticleList
              limit={10}
              config={listConfig}
              currentPage={currentPage}
              isFollowingFeed={isFollowingFeed}
              onPageChange={onPageChange}
            />
          </div>

          <div className="col-md-3">
            <div className="sidebar">
              <p>Popular Tags</p>

              <div className="tag-list">
                {tags.map(t => (
                  <Link key={t} className="tag-default tag-pill" to={`/tag/${t}`} style={{ cursor: 'pointer' }}>
                    {t}
                  </Link>
                ))}
              </div>

              {!tagsLoaded && <div>Loading tags...</div>}

              {tagsLoaded && tags.length === 0 && <div>No tags are here... yet.</div>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
