export interface PreferenceWeight {
  featureId: string;
  weight: number;
  interactionCount: number;
  lastInteraction: Date;
}

export interface UserPreference {
  userId: string;
  weights: PreferenceWeight[];
  lastUpdated: Date;
}
