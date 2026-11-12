export type AlgorithmId =
  | 'linear-regression'
  | 'logistic-regression'
  | 'knn'
  | 'decision-tree'
  | 'kmeans'
  | 'perceptron';

export type AlgorithmCategory =
  | '지도학습 · 회귀'
  | '지도학습 · 분류'
  | '비지도학습 · 군집화'
  | '인공신경망 · 딥러닝 기초';

export interface MissionItem {
  id: string;
  title: string;
  description: string;
  badgeText: string;
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface AlgorithmMeta {
  id: AlgorithmId;
  name: string;
  englishName: string;
  category: AlgorithmCategory;
  color: string;
  shortDesc: string;
  conceptSummary: string;
  realLifeExample: string;
  keyFormulaOrRule: string;
  missions: MissionItem[];
  quizzes: QuizQuestion[];
  reflectionPrompt: string;
  reflectionExampleHint: string;
}

export interface AlgorithmProgress {
  completedMissions: string[];
  quizAnswers: Record<string, number>;
  quizSubmitted: boolean;
  quizScore: number;
  reflection: string;
  metricsSummary: string;
  updatedAt: string;
}

export interface StudentInfo {
  studentId: string; // 예: 10101 (1학년 1반 1번)
  name: string;
  schoolClass: string; // 예: 1학년 1반
}

export interface StudentSubmissionRecord {
  id: string;
  studentId: string;
  name: string;
  schoolClass: string;
  submittedAt: string;
  missionProgressPercent: number;
  quizTotalScore: number;
  quizMaxScore: number;
  reflectionCount: number;
  algorithmDetails: Record<AlgorithmId, AlgorithmProgress>;
}
