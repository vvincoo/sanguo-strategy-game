export const GAME_NAME = 'War Dominion';

export type Faction = 'wei' | 'shu' | 'wu' | 'neutral';
export type ResourceType = 'food' | 'wood' | 'iron' | 'stone' | 'gold' | 'gem';
export type BuildingType =
  | 'main_hall'
  | 'farm'
  | 'lumber_mill'
  | 'iron_mine'
  | 'stone_quarry'
  | 'warehouse'
  | 'barracks'
  | 'institute';

export interface ApiSuccessResponse<T> {
  success: true;
  message: string;
  timestamp: string;
  data: T;
}

export interface ApiErrorResponse {
  success: false;
  message: string | string[];
  timestamp: string;
  path: string;
}
