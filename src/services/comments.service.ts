import api from './api';
import { Comment } from '../models/comment.model';

export async function getAll(slug: string): Promise<Comment[]> {
  const response = await api.get<{ comments: Comment[] }>(`/articles/${slug}/comments`);
  return response.data.comments;
}

export async function add(slug: string, body: string): Promise<Comment> {
  const response = await api.post<{ comment: Comment }>(`/articles/${slug}/comments`, {
    comment: { body },
  });
  return response.data.comment;
}

export async function deleteComment(commentId: string, slug: string): Promise<void> {
  await api.delete(`/articles/${slug}/comments/${commentId}`);
}
