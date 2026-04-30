import api from './api';
import { Profile } from '../models/profile.model';

export async function get(username: string): Promise<Profile> {
  const response = await api.get<{ profile: Profile }>(`/profiles/${username}`);
  return response.data.profile;
}

export async function follow(username: string): Promise<Profile> {
  const response = await api.post<{ profile: Profile }>(`/profiles/${username}/follow`, {});
  return response.data.profile;
}

export async function unfollow(username: string): Promise<Profile> {
  const response = await api.delete<{ profile: Profile }>(`/profiles/${username}/follow`);
  return response.data.profile;
}
