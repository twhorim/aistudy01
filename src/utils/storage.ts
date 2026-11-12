import { ALGORITHMS } from '../data/algorithms';
import {
  AlgorithmId,
  AlgorithmProgress,
  StudentInfo,
  StudentSubmissionRecord,
} from '../types/simulator';

const STUDENT_KEY = 'ml_sim_student_v1';
const PROGRESS_KEY = 'ml_sim_progress_v1';
const SUBMISSIONS_KEY = 'ml_sim_submissions_v1';
const CLOUD_URL_KEY = 'ml_sim_cloud_url_v1';
const ADMIN_PIN_KEY = 'ml_sim_admin_pin_v1';

// Vercel 환경변수로 설정된 구글 시트 웹앱 URL이 있으면 기본값으로 사용
const ENV_CLOUD_URL =
  (import.meta as unknown as { env?: Record<string, string> }).env
    ?.VITE_GOOGLE_SCRIPT_URL || '';

export function createInitialProgress(): Record<AlgorithmId, AlgorithmProgress> {
  const initial: Partial<Record<AlgorithmId, AlgorithmProgress>> = {};
  for (const alg of ALGORITHMS) {
    initial[alg.id] = {
      completedMissions: [],
      quizAnswers: {},
      quizSubmitted: false,
      quizScore: 0,
      reflection: '',
      metricsSummary: '실습 전',
      updatedAt: new Date().toISOString(),
    };
  }
  return initial as Record<AlgorithmId, AlgorithmProgress>;
}

export function parseSchoolClassFromId(studentId: string): string {
  const cleaned = studentId.trim();
  // 5자리 학번 (예: 10315 -> 1학년 3반 15번) 또는 4자리 학번 (예: 1205 -> 1학년 2반 5번)
  if (/^\d{5}$/.test(cleaned)) {
    const grade = cleaned[0];
    const cls = parseInt(cleaned.slice(1, 3), 10);
    return `${grade}학년 ${cls}반`;
  }
  if (/^\d{4}$/.test(cleaned)) {
    const grade = cleaned[0];
    const cls = cleaned[1];
    return `${grade}학년 ${cls}반`;
  }
  return '1학년 공통반';
}

export function loadStudentInfo(): StudentInfo | null {
  try {
    const raw = localStorage.getItem(STUDENT_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as StudentInfo;
  } catch {
    return null;
  }
}

export function saveStudentInfo(info: StudentInfo): void {
  localStorage.setItem(STUDENT_KEY, JSON.stringify(info));
}

export function clearStudentSession(): void {
  localStorage.removeItem(STUDENT_KEY);
}

export function loadAllProgress(): Record<AlgorithmId, AlgorithmProgress> {
  try {
    const raw = localStorage.getItem(PROGRESS_KEY);
    const base = createInitialProgress();
    if (!raw) return base;
    const parsed = JSON.parse(raw) as Partial<Record<AlgorithmId, AlgorithmProgress>>;
    for (const alg of ALGORITHMS) {
      if (parsed[alg.id]) {
        base[alg.id] = {
          ...base[alg.id],
          ...parsed[alg.id],
        };
      }
    }
    return base;
  } catch {
    return createInitialProgress();
  }
}

export function saveAllProgress(progress: Record<AlgorithmId, AlgorithmProgress>): void {
  localStorage.setItem(PROGRESS_KEY, JSON.stringify(progress));
}

export function getCloudScriptUrl(): string {
  return localStorage.getItem(CLOUD_URL_KEY) || ENV_CLOUD_URL || '';
}

export function setCloudScriptUrl(url: string): void {
  localStorage.setItem(CLOUD_URL_KEY, url.trim());
}

export function getAdminPin(): string {
  return localStorage.getItem(ADMIN_PIN_KEY) || '1234';
}

export function setAdminPin(pin: string): void {
  localStorage.setItem(ADMIN_PIN_KEY, pin.trim() || '1234');
}

export function buildSubmissionRecord(
  student: StudentInfo,
  progress: Record<AlgorithmId, AlgorithmProgress>
): StudentSubmissionRecord {
  let totalMissions = 0;
  let completedMissions = 0;
  let quizTotalScore = 0;
  let quizMaxScore = 0;
  let reflectionCount = 0;

  for (const alg of ALGORITHMS) {
    const p = progress[alg.id];
    totalMissions += alg.missions.length;
    completedMissions += p?.completedMissions?.length || 0;
    quizMaxScore += alg.quizzes.length;
    quizTotalScore += p?.quizScore || 0;
    if ((p?.reflection || '').trim().length >= 10) {
      reflectionCount += 1;
    }
  }

  const missionProgressPercent =
    totalMissions > 0 ? Math.round((completedMissions / totalMissions) * 100) : 0;

  return {
    id: `${student.studentId}_${Date.now()}`,
    studentId: student.studentId,
    name: student.name,
    schoolClass: student.schoolClass || parseSchoolClassFromId(student.studentId),
    submittedAt: new Date().toISOString(),
    missionProgressPercent,
    quizTotalScore,
    quizMaxScore,
    reflectionCount,
    algorithmDetails: progress,
  };
}

export function loadLocalSubmissions(): StudentSubmissionRecord[] {
  try {
    const raw = localStorage.getItem(SUBMISSIONS_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as StudentSubmissionRecord[];
  } catch {
    return [];
  }
}

export function saveLocalSubmission(record: StudentSubmissionRecord): StudentSubmissionRecord[] {
  const existing = loadLocalSubmissions();
  // 동일 학번이 다시 제출하면 최신 기록으로 업데이트
  const filtered = existing.filter((item) => item.studentId !== record.studentId);
  const updated = [record, ...filtered];
  localStorage.setItem(SUBMISSIONS_KEY, JSON.stringify(updated));
  return updated;
}

export function deleteLocalSubmission(studentId: string): StudentSubmissionRecord[] {
  const existing = loadLocalSubmissions();
  const updated = existing.filter((item) => item.studentId !== studentId);
  localStorage.setItem(SUBMISSIONS_KEY, JSON.stringify(updated));
  return updated;
}

export async function submitToCloudAndLocal(
  student: StudentInfo,
  progress: Record<AlgorithmId, AlgorithmProgress>
): Promise<{
  record: StudentSubmissionRecord;
  cloudSynced: boolean;
  cloudError?: string;
}> {
  const record = buildSubmissionRecord(student, progress);
  saveLocalSubmission(record);

  const cloudUrl = getCloudScriptUrl();
  if (!cloudUrl) {
    return { record, cloudSynced: false };
  }

  try {
    // Google Apps Script Web App은 Content-Type: text/plain 전송 시 CORS preflight 없이 원활히 수신됨
    const response = await fetch(cloudUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'text/plain;charset=utf-8',
      },
      body: JSON.stringify({
        action: 'submit',
        payload: record,
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    return { record, cloudSynced: true };
  } catch (err) {
    return {
      record,
      cloudSynced: false,
      cloudError: err instanceof Error ? err.message : '네트워크 오류',
    };
  }
}

export async function fetchSubmissionsFromCloud(): Promise<{
  records: StudentSubmissionRecord[];
  fromCloud: boolean;
  error?: string;
}> {
  const localRecords = loadLocalSubmissions();
  const cloudUrl = getCloudScriptUrl();

  if (!cloudUrl) {
    return { records: localRecords, fromCloud: false };
  }

  try {
    const response = await fetch(`${cloudUrl}?action=list&t=${Date.now()}`, {
      method: 'GET',
    });
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    const data = await response.json();
    const cloudRecords: StudentSubmissionRecord[] = Array.isArray(data.records)
      ? data.records
      : [];

    // 학번 기준으로 최신 데이터 병합
    const map = new Map<string, StudentSubmissionRecord>();
    for (const r of [...localRecords, ...cloudRecords]) {
      const prev = map.get(r.studentId);
      if (!prev || new Date(r.submittedAt) >= new Date(prev.submittedAt)) {
        map.set(r.studentId, r);
      }
    }
    const merged = Array.from(map.values()).sort(
      (a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime()
    );
    localStorage.setItem(SUBMISSIONS_KEY, JSON.stringify(merged));
    return { records: merged, fromCloud: true };
  } catch (err) {
    return {
      records: localRecords,
      fromCloud: false,
      error: err instanceof Error ? err.message : '클라우드 조회 실패',
    };
  }
}

export const SAMPLE_SUBMISSIONS: StudentSubmissionRecord[] = [
  {
    id: 'sample_10101',
    studentId: '10101',
    name: '김민준',
    schoolClass: '1학년 1반',
    submittedAt: new Date(Date.now() - 1000 * 60 * 12).toISOString(),
    missionProgressPercent: 100,
    quizTotalScore: 12,
    quizMaxScore: 12,
    reflectionCount: 6,
    algorithmDetails: {
      'linear-regression': {
        completedMissions: ['lr-adjust', 'lr-add-point', 'lr-optimal'],
        quizAnswers: { 'lr-q1': 1, 'lr-q2': 0 },
        quizSubmitted: true,
        quizScore: 2,
        reflection:
          '기울기와 절편을 조절하여 MSE를 18.4까지 줄였습니다. 이상치 점을 멀리 찍으면 직선이 그 점으로 끌려가 오차가 커진다는 점을 확인했습니다.',
        metricsSummary: 'MSE: 18.4 (w=8.2, b=24.5)',
        updatedAt: new Date().toISOString(),
      },
      'logistic-regression': {
        completedMissions: ['log-slider', 'log-threshold', 'log-accuracy'],
        quizAnswers: { 'log-q1': 1, 'log-q2': 1 },
        quizSubmitted: true,
        quizScore: 2,
        reflection:
          '시그모이드 함수를 쓰면 결과가 0~100% 확률로 나와서 합격/불합격 기준을 정하기 좋았습니다. 임계값을 0.7로 올리니 합격 판정이 더 엄격해졌습니다.',
        metricsSummary: '정확도: 92% (임계값 0.5)',
        updatedAt: new Date().toISOString(),
      },
      knn: {
        completedMissions: ['knn-place', 'knn-change-k', 'knn-boundary'],
        quizAnswers: { 'knn-q1': 1, 'knn-q2': 0 },
        quizSubmitted: true,
        quizScore: 2,
        reflection:
          'K=1일 때는 주변의 튀는 점 하나 때문에 분류가 바뀌었는데 K=5로 설정하니 경계가 매끄러워지고 안정적으로 다수결 분류가 되었습니다.',
        metricsSummary: 'K=5 (유클리드 거리)',
        updatedAt: new Date().toISOString(),
      },
      'decision-tree': {
        completedMissions: ['dt-split', 'dt-depth', 'dt-test'],
        quizAnswers: { 'dt-q1': 0, 'dt-q2': 1 },
        quizSubmitted: true,
        quizScore: 2,
        reflection:
          '스무고개처럼 당도와 크기를 차례대로 물어보며 영역을 직사각형으로 나누는 과정이 직관적이었습니다. 깊이 2에서 정확도가 94%가 되었습니다.',
        metricsSummary: '깊이 2 / 정확도 94%',
        updatedAt: new Date().toISOString(),
      },
      kmeans: {
        completedMissions: ['km-init', 'km-step', 'km-add'],
        quizAnswers: { 'km-q1': 0, 'km-q2': 0 },
        quizSubmitted: true,
        quizScore: 2,
        reflection:
          '정답 레이블이 없는 회색 점들이 중심점 이동을 4번 반복하자 3개의 뚜렷한 그룹으로 스스로 묶이는 것이 신기했습니다.',
        metricsSummary: 'K=3 (4단계 수렴 완료)',
        updatedAt: new Date().toISOString(),
      },
      perceptron: {
        completedMissions: ['pc-weights', 'pc-gate', 'pc-xor'],
        quizAnswers: { 'pc-q1': 0, 'pc-q2': 0 },
        quizSubmitted: true,
        quizScore: 2,
        reflection:
          'AND와 OR 게이트는 직선 하나로 쉽게 나뉘었지만 XOR은 직선 하나로 나눌 수 없어 은닉층을 가진 다층 퍼셉트론이 필요하다는 것을 이해했습니다.',
        metricsSummary: 'AND/OR/XOR 실습 완료',
        updatedAt: new Date().toISOString(),
      },
    },
  },
  {
    id: 'sample_10102',
    studentId: '10102',
    name: '이서연',
    schoolClass: '1학년 1반',
    submittedAt: new Date(Date.now() - 1000 * 60 * 25).toISOString(),
    missionProgressPercent: 83,
    quizTotalScore: 10,
    quizMaxScore: 12,
    reflectionCount: 5,
    algorithmDetails: {
      'linear-regression': {
        completedMissions: ['lr-adjust', 'lr-add-point', 'lr-optimal'],
        quizAnswers: { 'lr-q1': 1, 'lr-q2': 0 },
        quizSubmitted: true,
        quizScore: 2,
        reflection: '최소제곱법으로 찾은 추세선이 내가 손으로 맞춘 것보다 MSE가 더 낮게 나왔습니다.',
        metricsSummary: 'MSE: 21.0',
        updatedAt: new Date().toISOString(),
      },
      'logistic-regression': {
        completedMissions: ['log-slider', 'log-threshold', 'log-accuracy'],
        quizAnswers: { 'log-q1': 1, 'log-q2': 1 },
        quizSubmitted: true,
        quizScore: 2,
        reflection: '합격 확률이 50%가 되는 지점이 결정 경계가 된다는 것을 그래프를 통해 확인했습니다.',
        metricsSummary: '정확도: 88%',
        updatedAt: new Date().toISOString(),
      },
      knn: {
        completedMissions: ['knn-place', 'knn-change-k', 'knn-boundary'],
        quizAnswers: { 'knn-q1': 1, 'knn-q2': 0 },
        quizSubmitted: true,
        quizScore: 2,
        reflection: 'K를 홀수로 해야 동점이 안 나온다는 점이 인상 깊었습니다.',
        metricsSummary: 'K=3',
        updatedAt: new Date().toISOString(),
      },
      'decision-tree': {
        completedMissions: ['dt-split', 'dt-depth'],
        quizAnswers: { 'dt-q1': 0, 'dt-q2': 1 },
        quizSubmitted: true,
        quizScore: 2,
        reflection: '조건 기준선을 움직일 때마다 리프 노드의 불순도가 바뀌는 것을 보았습니다.',
        metricsSummary: '깊이 2 / 정확도 90%',
        updatedAt: new Date().toISOString(),
      },
      kmeans: {
        completedMissions: ['km-init', 'km-step'],
        quizAnswers: { 'km-q1': 0, 'km-q2': 0 },
        quizSubmitted: true,
        quizScore: 2,
        reflection: '비지도학습은 정답을 알려주지 않아도 거리 계산만으로 군집을 나눈다는 차이가 있습니다.',
        metricsSummary: 'K=3 수렴 완료',
        updatedAt: new Date().toISOString(),
      },
      perceptron: {
        completedMissions: ['pc-weights'],
        quizAnswers: {},
        quizSubmitted: false,
        quizScore: 0,
        reflection: '',
        metricsSummary: '가중치 실험 중',
        updatedAt: new Date().toISOString(),
      },
    },
  },
  {
    id: 'sample_10207',
    studentId: '10207',
    name: '박지훈',
    schoolClass: '1학년 2반',
    submittedAt: new Date(Date.now() - 1000 * 60 * 40).toISOString(),
    missionProgressPercent: 94,
    quizTotalScore: 11,
    quizMaxScore: 12,
    reflectionCount: 6,
    algorithmDetails: {
      'linear-regression': {
        completedMissions: ['lr-adjust', 'lr-add-point', 'lr-optimal'],
        quizAnswers: { 'lr-q1': 1, 'lr-q2': 0 },
        quizSubmitted: true,
        quizScore: 2,
        reflection: '공부 시간이 늘어날수록 예상 점수가 선형적으로 증가하는 추세선을 직접 그려보았습니다.',
        metricsSummary: 'MSE: 19.2',
        updatedAt: new Date().toISOString(),
      },
      'logistic-regression': {
        completedMissions: ['log-slider', 'log-threshold', 'log-accuracy'],
        quizAnswers: { 'log-q1': 1, 'log-q2': 1 },
        quizSubmitted: true,
        quizScore: 2,
        reflection: '임계값을 조절하면 민감하게 합격/불합격 경계가 이동하는 원리를 배웠습니다.',
        metricsSummary: '정확도: 92%',
        updatedAt: new Date().toISOString(),
      },
      knn: {
        completedMissions: ['knn-place', 'knn-change-k', 'knn-boundary'],
        quizAnswers: { 'knn-q1': 1, 'knn-q2': 0 },
        quizSubmitted: true,
        quizScore: 2,
        reflection: '맨해튼 거리와 유클리드 거리에 따라 결정 경계 모양이 조금씩 달라지는 점이 흥미로웠습니다.',
        metricsSummary: 'K=5 (맨해튼 거리)',
        updatedAt: new Date().toISOString(),
      },
      'decision-tree': {
        completedMissions: ['dt-split', 'dt-depth', 'dt-test'],
        quizAnswers: { 'dt-q1': 0, 'dt-q2': 0 },
        quizSubmitted: true,
        quizScore: 1,
        reflection: '트리 구조가 눈에 보여서 컴퓨터가 어떤 기준으로 분류했는지 설명하기 쉬웠습니다.',
        metricsSummary: '깊이 2 / 정확도 94%',
        updatedAt: new Date().toISOString(),
      },
      kmeans: {
        completedMissions: ['km-init', 'km-step', 'km-add'],
        quizAnswers: { 'km-q1': 0, 'km-q2': 0 },
        quizSubmitted: true,
        quizScore: 2,
        reflection: '군집 개수 K를 2개에서 4개로 바꾸니 데이터가 더 세밀한 그룹으로 나뉘었습니다.',
        metricsSummary: 'K=4 수렴 완료',
        updatedAt: new Date().toISOString(),
      },
      perceptron: {
        completedMissions: ['pc-weights', 'pc-gate'],
        quizAnswers: { 'pc-q1': 0, 'pc-q2': 0 },
        quizSubmitted: true,
        quizScore: 2,
        reflection: '입력에 가중치를 곱하고 편향을 더한 값이 0보다 크면 뉴런이 활성화되는 원리를 확인했습니다.',
        metricsSummary: 'AND/OR 게이트 통과',
        updatedAt: new Date().toISOString(),
      },
    },
  },
];
