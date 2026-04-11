import { apiRequest } from './api-client';

export type Faction = 'wei' | 'shu' | 'wu' | 'neutral';
export type BuildingType =
  | 'main_hall'
  | 'farm'
  | 'lumber_mill'
  | 'iron_mine'
  | 'stone_quarry'
  | 'warehouse'
  | 'barracks'
  | 'institute';

export interface AuthResult {
  accessToken: string;
  tokenType: 'Bearer';
  user: {
    id: string;
    email: string;
    nickname: string;
  };
}

export interface RegisterPayload {
  email: string;
  password: string;
  nickname: string;
  faction: Faction;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface PlayerHome {
  user: {
    id: string;
    email: string;
  };
  profile: {
    id: string;
    nickname: string;
    faction: Faction;
    level: number;
    power: number;
  };
  city: {
    id: string;
    name: string;
    level: number;
    warehouseLevel: number;
  } | null;
}

export interface CityInfo {
  id: string;
  name: string;
  level: number;
  warehouseLevel: number;
  queueSlots: number;
  owner: {
    userId: string;
    nickname: string;
  };
}

export interface ResourceInfo {
  lastCollectedAt: string;
  current: Record<'food' | 'wood' | 'iron' | 'stone' | 'gold' | 'gem', number>;
  perHour: Record<'food' | 'wood' | 'iron' | 'stone' | 'gold' | 'gem', number>;
  capacity: Record<'food' | 'wood' | 'iron' | 'stone' | 'gold' | 'gem', number>;
}

export interface BuildingItem {
  id: string;
  type: BuildingType;
  name: string;
  level: number;
  isUpgrading: boolean;
  maxLevel: number;
  nextUpgrade: {
    toLevel: number;
    durationSeconds: number;
    cost: Record<'food' | 'wood' | 'iron' | 'stone' | 'gold' | 'gem', number>;
  } | null;
}

export interface BuildingQueueItem {
  id: string;
  buildingType: BuildingType;
  status: 'pending' | 'completed' | 'cancelled';
  fromLevel: number;
  toLevel: number;
  startAt: string;
  finishAt: string;
  remainingSeconds: number;
}

export const authApi = {
  register(payload: RegisterPayload) {
    return apiRequest<AuthResult>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  },
  login(payload: LoginPayload) {
    return apiRequest<AuthResult>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  },
  getMe(token: string) {
    return apiRequest<PlayerHome>('/player/me', { method: 'GET' }, token);
  },
  getCity(token: string) {
    return apiRequest<CityInfo>('/city/me', { method: 'GET' }, token);
  },
  getResources(token: string) {
    return apiRequest<ResourceInfo>('/city/resources', { method: 'GET' }, token);
  },
  getBuildings(token: string) {
    return apiRequest<BuildingItem[]>('/buildings', { method: 'GET' }, token);
  },
  getBuildingQueues(token: string) {
    return apiRequest<BuildingQueueItem[]>('/buildings/queue', { method: 'GET' }, token);
  },
  startUpgrade(token: string, type: BuildingType) {
    return apiRequest('/buildings/' + type + '/upgrade', { method: 'POST' }, token);
  },
  settleBuildingQueue(token: string) {
    return apiRequest<{ completed: number }>('/buildings/settle', { method: 'POST' }, token);
  }
};
