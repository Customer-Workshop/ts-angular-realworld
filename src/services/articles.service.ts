import api from './api';
import { ArticleListConfig } from '../models/article-list-config.model';
import { Article } from '../models/article.model';

export async function query(config: ArticleListConfig): Promise<{ articles: Article[]; articlesCount: number }> {
  const params: Record<string, string | number> = {};
  Object.keys(config.filters).forEach(key => {
    const value = config.filters[key as keyof typeof config.filters];
    if (value !== undefined) {
      params[key] = value;
    }
  });

  const response = await api.get<{ articles: Article[]; articlesCount: number }>(
    '/articles' + (config.type === 'feed' ? '/feed' : ''),
    { params },
  );
  return response.data;
}

export async function get(slug: string): Promise<Article> {
  const response = await api.get<{ article: Article }>(`/articles/${slug}`);
  return response.data.article;
}

export async function deleteArticle(slug: string): Promise<void> {
  await api.delete(`/articles/${slug}`);
}

export async function create(article: Partial<Article>): Promise<Article> {
  const response = await api.post<{ article: Article }>('/articles/', { article });
  return response.data.article;
}

export async function update(article: Partial<Article>): Promise<Article> {
  const response = await api.put<{ article: Article }>(`/articles/${article.slug}`, { article });
  return response.data.article;
}

export async function favorite(slug: string): Promise<Article> {
  const response = await api.post<{ article: Article }>(`/articles/${slug}/favorite`, {});
  return response.data.article;
}

export async function unfavorite(slug: string): Promise<void> {
  await api.delete(`/articles/${slug}/favorite`);
}
