import { Link } from 'react-router-dom';
import { Comment } from '../../../models/comment.model';
import { useAuth } from '../../../context/AuthContext';
import { defaultImage } from '../../../utils/default-image';

interface ArticleCommentProps {
  comment: Comment;
  onDelete: () => void;
}

export default function ArticleComment({ comment, onDelete }: ArticleCommentProps) {
  const { currentUser } = useAuth();
  const canModify = currentUser?.username === comment.author.username;

  return (
    <div className="card">
      <div className="card-block">
        <p className="card-text">{comment.body}</p>
      </div>
      <div className="card-footer">
        <Link className="comment-author" to={`/profile/${comment.author.username}`}>
          <img src={defaultImage(comment.author.image)} className="comment-author-img" alt={comment.author.username} />
        </Link>
        &nbsp;
        <Link className="comment-author" to={`/profile/${comment.author.username}`}>
          {comment.author.username}
        </Link>
        <span className="date-posted">
          {new Date(comment.createdAt).toLocaleDateString('en-US', { dateStyle: 'long' })}
        </span>
        {canModify && (
          <span className="mod-options">
            <i className="ion-trash-a" onClick={onDelete}></i>
          </span>
        )}
      </div>
    </div>
  );
}
