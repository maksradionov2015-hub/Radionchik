// Типы данных для приложения "Спектр"

export type Role = 'USER' | 'PSYCHOLOGIST' | 'CONTENT_CURATOR' | 'ADMIN';

export type HexaflexProcess = 
  | 'ACCEPTANCE' 
  | 'DEFUSION' 
  | 'PRESENT_MOMENT' 
  | 'SELF_AS_CONTEXT' 
  | 'VALUES' 
  | 'COMMITTED_ACTION';

export type ExerciseFormat =
  | 'WORD_OF_DAY'
  | 'CATCH_AND_NAME'
  | 'SORTING'
  | 'CHOOSE_REACTION'
  | 'REFRAME'
  | 'MATCHING'
  | 'TIMED_PRACTICE'
  | 'SCALE'
  | 'MICRO_EXPERIMENT'
  | 'VIGNETTE'
  | 'VALUES_CARD_SORT'
  | 'METAPHOR_BUILDER'
  | 'CHECKPOINT_QUIZ';

export type ProgressStatus = 
  | 'NOT_STARTED' 
  | 'IN_PROGRESS' 
  | 'COMPLETED' 
  | 'AWAITING_CHECKIN';

export type RiskLevel = 'NONE' | 'LOW' | 'MODERATE' | 'HIGH' | 'UNKNOWN';

export interface User {
  id: string;
  name: string;
  age: number;
  isMinor: boolean;
  gender?: string;
  email?: string;
  phone?: string;
  role: Role;
  tokenBalance: number;
  createdAt: string;
}

export interface FlexibilityScores {
  acceptance: number;
  defusion: number;
  presentMoment: number;
  selfAsContext: number;
  values: number;
  committedAction: number;
  composite: number;
}

export interface ValuesEntry {
  domain: string;
  textAnswer: string;
  importance: number;
  consistency: number;
  gap: number;
}

export interface DiagnosticResult {
  id: string;
  userId: string;
  type: 'FLEXIBILITY' | 'VALUES';
  version: number;
  computedAt: string;
  flexibilityScore?: FlexibilityScores;
  valuesEntries?: ValuesEntry[];
}

export interface ContextProfile {
  id: string;
  rawText: string;
  domainsMentioned: string[];
  fusionMarkers: string[];
  avoidanceMarkers: string[];
  plianceMarkers: string[];
  safetyFlag?: SafetyFlag;
  createdAt: string;
}

export interface SafetyFlag {
  riskLevel: RiskLevel;
  triggeredAt: string;
  reviewStatus: 'PENDING' | 'REVIEWED' | 'ESCALATED';
}

export interface Exercise {
  id: string;
  process: HexaflexProcess;
  branchLevel: number;
  format: ExerciseFormat;
  title: string;
  bodyTemplate: string;
  allowedSlots: string[];
  contentBankRefs: string[];
  tokenReward: number;
  estimatedMinutes: number;
  requiresRealLifeCheckIn: boolean;
  checkInDelayHours?: number;
}

export interface UserProgress {
  id: string;
  userId: string;
  exerciseId: string;
  status: ProgressStatus;
  personalizedContent?: Record<string, unknown>;
  userResponse?: Record<string, unknown>;
  completedAt?: string;
  checkInDueAt?: string;
  checkInCompletedAt?: string;
}

export interface TokenTransaction {
  id: string;
  amount: number;
  reason: 'EXERCISE_COMPLETED' | 'CHECKIN_BONUS' | 'SUBSCRIPTION_STIPEND' | 'CONSULTATION_REDEMPTION' | 'ADMIN_ADJUSTMENT';
  relatedExerciseId?: string;
  createdAt: string;
}

export interface BranchProgress {
  process: HexaflexProcess;
  currentLevel: number;
  totalLevels: number;
  exercisesCompleted: number;
  exercisesTotal: number;
  priority: number;
}
