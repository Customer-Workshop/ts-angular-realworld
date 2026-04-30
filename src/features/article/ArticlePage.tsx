import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Article } from '../../models/article.model';
import { Comment } from '../../models/comment.model';
import { Errors } from '../../models/errors.model';
import { Profile } from '../../models/profile.model';
import * as articlesService from '../../services/articles.service';
import * as commentsService from '../../services/comments.service';
import { renderMarkdown } from '../../utils/markdown';
import { defaultImage } from '../../utils/default-image';
import ArticleMeta from './components/ArticleMeta';
import ArticleComment from './components/ArticleComment';
import FavoriteButton from './components/FavoriteButton';
import FollowButton from '../../features/profile/components/FollowButton';
import ListErrors from '../../components/ListErrors';

export default function ArticlePage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { currentUser, isAuthenticated } = useAuth();

  const [article, setArticle] = useState<Article | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [errors, setErrors] = useState<Errors | null>(null);
  const [commentBody, setCommentBody] = useState('');
  const [commentFormErrors, setCommentFormErrors] = useState<Errors | null>(null);
  const [deleteCommentErrors, setDeleteCommentErrors] = useState<Errors | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [renderedBody, setRenderedBody] = useState('');

  const canModify = currentUser?.username === article?.author.username;

  useEffect(() => {
    if (!slug) return;

    Promise.all([articlesService.get(slug), commentsService.getAll(slug)])
      .then(([articleData, commentsData]) => {
        setArticle(articleData);
        setComments(commentsData);
      })
      .catch(err => {
        setErrors(err.errors || { errors: { error: 'Failed to load article' } });
      });
  }, [slug]);

  useEffect(() => {
    if (article?.body) {
      renderMarkdown(article.body).then(setRenderedBody);
    }
  }, [article?.body]);

  const onToggleFavorite = (favorited: boolean) => {
    setArticle(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        favorited,
        favoritesCount: favorited ? prev.favoritesCount + 1 : prev.favoritesCount - 1,
      };
    });
  };

  const toggleFollowing = (profile: Profile) => {
    setArticle(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        author: { ...prev.author, following: profile.following },
      };
    });
  };

  const deleteArticle = async () => {
    if (!article) return;
    setIsDeleting(true);
    await articlesService.deleteArticle(article.slug);
    navigate('/');
  };

  const addComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!article) return;

    setIsSubmitting(true);
    setCommentFormErrors(null);

    try {
      const comment = await commentsService.add(article.slug, commentBody);
      setComments(prev => [comment, ...prev]);
      setCommentBody('');
      setIsSubmitting(false);
    } catch (err: unknown) {
      setIsSubmitting(false);
      setCommentFormErrors(err as Errors);
    }
  };

  const deleteComment = async (comment: Comment) => {
    if (!article) return;

    setDeleteCommentErrors(null);
    try {
      await commentsService.deleteComment(comment.id, article.slug);
      setComments(prev => prev.filter(c => c !== comment));
    } catch (err: unknown) {
      setDeleteCommentErrors(err as Errors);
    }
  };

  const renderArticleActions = () => {
    if (!article) return null;

    if (canModify) {
      return (
        <span>
          <Link className="btn btn-sm btn-outline-secondary" to={`/editor/${article.slug}`}>
            <i className="ion-edit"></i> Edit Article
          </Link>

          <button className={`btn btn-sm btn-outline-danger ${isDeleting ? 'disabled' : ''}`} onClick={deleteArticle}>
            <i className="ion-trash-a"></i> Delete Article
          </button>
        </span>
      );
    }

    return (
      <span>
        <FollowButton profile={article.author} onToggle={toggleFollowing} />

        <FavoriteButton article={article} onToggle={onToggleFavorite}>
          {article.favorited ? 'Unfavorite' : 'Favorite'} Article
          <span className="counter">({article.favoritesCount})</span>
        </FavoriteButton>
      </span>
    );
  };

  return (
    <div className="article-page">
      {errors && (
        <div className="container">
          <div className="row">
            <div className="col-md-12">
              <ListErrors errors={errors} />
            </div>
          </div>
        </div>
      )}
      {article && (
        <>
          <div className="banner">
            <div className="container">
              <h1>{article.title}</h1>
              <ArticleMeta article={article}>{renderArticleActions()}</ArticleMeta>
            </div>
          </div>

          <div className="container page">
            <div className="row article-content">
              <div className="col-md-12">
                <div dangerouslySetInnerHTML={{ __html: renderedBody }} />

                <ul className="tag-list">
                  {article.tagList.map(tag => (
                    <li key={tag} className="tag-default tag-pill tag-outline">
                      {tag}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <hr />

            <div className="article-actions">
              <ArticleMeta article={article}>{renderArticleActions()}</ArticleMeta>
            </div>

            <div className="row">
              <div className="col-xs-12 col-md-8 offset-md-2">
                {isAuthenticated && (
                  <div>
                    <ListErrors errors={commentFormErrors} />
                    <form className="card comment-form" onSubmit={addComment}>
                      <fieldset disabled={isSubmitting}>
                        <div className="card-block">
                          <textarea
                            className="form-control"
                            placeholder="Write a comment..."
                            rows={3}
                            name="comment"
                            value={commentBody}
                            onChange={e => setCommentBody(e.target.value)}
                          ></textarea>
                        </div>
                        <div className="card-footer">
                          <img
                            src={defaultImage(currentUser?.image)}
                            className="comment-author-img"
                            alt={currentUser?.username}
                          />
                          <button className="btn btn-sm btn-primary" type="submit">
                            Post Comment
                          </button>
                        </div>
                      </fieldset>
                    </form>
                  </div>
                )}

                {!isAuthenticated && (
                  <div>
                    <Link to="/login">Sign in</Link> or <Link to="/register">sign up</Link> to add comments on this
                    article.
                  </div>
                )}

                <ListErrors errors={deleteCommentErrors} />

                {comments.map(comment => (
                  <ArticleComment key={comment.id} comment={comment} onDelete={() => deleteComment(comment)} />
                ))}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
