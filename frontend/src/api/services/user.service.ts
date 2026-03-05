import api from '../axios.config';
import { API_ENDPOINTS } from '../endpoints';
import type { User } from '@/types/user.types';

export interface UpdateProfileRequest {
  name: string;
  lastname: string;
}

export const userService = {
  async updateProfile(data: UpdateProfileRequest): Promise<User> {
    const response = await api.put<User>(API_ENDPOINTS.USERS.UPDATE_PROFILE, data);
    return response.data;
  },
};
