import api from './api';

export async function getAll(): Promise<string[]> {
  const response = await api.get<{ tags: string[] }>('/tags');
  return response.data.tags;
}
