import React, { useCallback, useEffect, useState } from 'react';
import confetti from 'canvas-confetti';
import {
  BrainCircuit,
  CheckCircle2,
  GraduationCap,
  Send,
  ShieldCheck,
  UserCheck,
  BookOpen,
  Lightbulb,
  LogOut,
  Sparkles,
} from 'lucide-react';
import { ALGORITHMS, ALGORITHM_MAP } from './data/algorithms';
import {
  AlgorithmId,
  AlgorithmProgress,
  StudentInfo,
  StudentSubmissionRecord,
} from './types/simulator';
import {
  clearStudentSession,
  loadAllProgress,
  loadStudentInfo,
  parseSchoolClassFromId,
  saveAllProgress,
  saveStudentInfo,
  submitToCloudAndLocal,
} from './utils/storage';
import { LinearRegressionSim } from './components/simulators/LinearRegressionSim';
import { LogisticRegressionSim } from './components/simulators/LogisticRegressionSim';
import { KnnSim } from './components/simulators/KnnSim';
import { DecisionTreeSim } from './components/simulators/DecisionTreeSim';
import { KMeansSim } from './components/simulators/KMeansSim';
import { PerceptronSim } from './components/simulators/PerceptronSim';
import { ChecklistQuizPanel } from './components/ChecklistQuizPanel';
import { TeacherAdminDashboard } from './components/TeacherAdminDashboard';
import { StudentReportModal } from './components/StudentReportModal';

export function App() {
  const [viewMode, setViewMode] = useState<'student' | 'admin'>('student');
  const [student, setStudent] = useState<StudentInfo | null>(() => loadStudentInfo());
  const [studentIdInput, setStudentIdInput] = useState<string>('');
  const [nameInput, setNameInput] = useState<string>('');
  const [classInput, setClassInput] = useState<string>('');
  const [loginError, setLoginError] = useState<string>('');

  const [activeAlgId, setActiveAlgId] = useState<AlgorithmId>('linear-regression');
  const [progress, setProgress] = useState<Record<AlgorithmId, AlgorithmProgress>>(() =>
    loadAllProgress()
  );

  const [submitting, setSubmitting] = useState<boolean>(false);
  const [submittedModalData, setSubmittedModalData] = useState<{
    record: StudentSubmissionRecord;
    cloudSynced: boolean;
  } | null>(null);

  useEffect(() => {
    saveAllProgress(progress);
  }, [progress]);

  // 학번 입력 시 자동으로 학반 추론
  const handleStudentIdChange = (val: string) => {
    setStudentIdInput(val);
    if (/^\d{4,5}$/.test(val.trim())) {
      setClassInput(parseSchoolClassFromId(val.trim()));
    }
  };

  const handleStartStudentSession = (e: React.FormEvent) => {
    e.preventDefault();
    const sId = studentIdInput.trim();
    const sName = nameInput.trim();
    if (!sId || !sName) {
      setLoginError('학번과 이름을 모두 입력해주세요. (예: 10101 / 홍길동)');
      return;
    }
    const info: StudentInfo = {
      studentId: sId,
      name: sName,
      schoolClass: classInput.trim() || parseSchoolClassFromId(sId),
    };
    saveStudentInfo(info);
    setStudent(info);
    setLoginError('');
  };

  // 미션 완료 자동 콜백
  const handleCompleteMission = useCallback(
    (missionId: string, metricsSummary?: string) => {
      setProgress((prev) => {
        const curr = prev[activeAlgId];
        const alreadyHas = curr.completedMissions.includes(missionId);
        const nextMissions = alreadyHas
          ? curr.completedMissions
          : [...curr.completedMissions, missionId];

        if (alreadyHas && (!metricsSummary || metricsSummary === curr.metricsSummary)) {
          return prev;
        }

        return {
          ...prev,
          [activeAlgId]: {
            ...curr,
            completedMissions: nextMissions,
            metricsSummary: metricsSummary || curr.metricsSummary,
            updatedAt: new Date().toISOString(),
          },
        };
      });
    },
    [activeAlgId]
  );

  // 미션 수동 토글
  const handleToggleMissionManual = (missionId: string) => {
    setProgress((prev) => {
      const curr = prev[activeAlgId];
      const exists = curr.completedMissions.includes(missionId);
      const nextMissions = exists
        ? curr.completedMissions.filter((m) => m !== missionId)
        : [...curr.completedMissions, missionId];
      return {
        ...prev,
        [activeAlgId]: {
          ...curr,
          completedMissions: nextMissions,
          updatedAt: new Date().toISOString(),
        },
      };
    });
  };

  // 퀴즈 답안 선택
  const handleSelectQuizAnswer = (questionId: string, optionIdx: number) => {
    setProgress((prev) => {
      const curr = prev[activeAlgId];
      return {
        ...prev,
        [activeAlgId]: {
          ...curr,
          quizAnswers: {
            ...curr.quizAnswers,
            [questionId]: optionIdx,
          },
        },
      };
    });
  };

  // 퀴즈 채점하기
  const handleSubmitQuiz = () => {
    const alg = ALGORITHM_MAP[activeAlgId];
    const curr = progress[activeAlgId];
    let score = 0;
    for (const q of alg.quizzes) {
      if (curr.quizAnswers[q.id] === q.correctIndex) {
        score += 1;
      }
    }
    if (score === alg.quizzes.length) {
      confetti({ particleCount: 45, spread: 60, origin: { y: 0.7 } });
    }
    setProgress((prev) => ({
      ...prev,
      [activeAlgId]: {
        ...prev[activeAlgId],
        quizSubmitted: true,
        quizScore: score,
        updatedAt: new Date().toISOString(),
      },
    }));
  };

  // 서술형 소감 수정
  const handleChangeReflection = (text: string) => {
    setProgress((prev) => ({
      ...prev,
      [activeAlgId]: {
        ...prev[activeAlgId],
        reflection: text,
        updatedAt: new Date().toISOString(),
      },
    }));
  };

  // 수행 결과 최종 제출
  const handleFinalSubmit = async () => {
    if (!student) return;
    setSubmitting(true);
    const res = await submitToCloudAndLocal(student, progress);
    setSubmitting(false);
    confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });
    setSubmittedModalData({
      record: res.record,
      cloudSynced: res.cloudSynced,
    });
  };

  // 전체 진행 통계 계산
  const totalStats = React.useMemo(() => {
    let totalMissions = 0;
    let doneMissions = 0;
    let totalQuiz = 0;
    let scoreQuiz = 0;
    let doneReflections = 0;

    for (const alg of ALGORITHMS) {
      const p = progress[alg.id];
      totalMissions += alg.missions.length;
      doneMissions += p?.completedMissions?.length || 0;
      totalQuiz += alg.quizzes.length;
      scoreQuiz += p?.quizScore || 0;
      if ((p?.reflection || '').trim().length >= 10) {
        doneReflections += 1;
      }
    }
    const percent =
      totalMissions > 0 ? Math.round((doneMissions / totalMissions) * 100) : 0;

    return {
      totalMissions,
      doneMissions,
      totalQuiz,
      scoreQuiz,
      doneReflections,
      percent,
    };
  }, [progress]);

  const activeAlg = ALGORITHM_MAP[activeAlgId];
  const activeProgress = progress[activeAlgId];

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      {/* 상단 고정 헤더 */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-600 to-blue-600 text-white flex items-center justify-center shadow-xs">
              <BrainCircuit className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-md">
                  고등학교 1학년 정보
                </span>
                <span className="hidden sm:inline text-xs text-slate-400">
                  인공지능과 기계학습 실습실
                </span>
              </div>
              <h1 className="text-sm sm:text-base font-extrabold text-slate-900">
                기계학습 알고리즘 인터랙티브 시뮬레이터
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            {student && viewMode === 'student' && (
              <>
                <div className="hidden md:flex items-center gap-3 px-3.5 py-1.5 rounded-xl bg-slate-100 border border-slate-200 text-xs">
                  <span className="font-bold text-indigo-700 flex items-center gap-1">
                    <UserCheck className="w-3.5 h-3.5" />
                    {student.schoolClass} · {student.studentId} {student.name}
                  </span>
                  <span className="text-slate-300">|</span>
                  <span className="text-slate-600">
                    미션 <strong className="text-emerald-600">{totalStats.percent}%</strong>
                  </span>
                  <span className="text-slate-600">
                    퀴즈{' '}
                    <strong className="text-amber-600">
                      {totalStats.scoreQuiz}/{totalStats.totalQuiz}
                    </strong>
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      clearStudentSession();
                      setStudent(null);
                    }}
                    className="text-slate-400 hover:text-rose-600 ml-1 cursor-pointer"
                    title="학번/이름 다시 입력"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                  </button>
                </div>

                <button
                  type="button"
                  onClick={handleFinalSubmit}
                  disabled={submitting}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-xs transition cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  {submitting ? '제출 중...' : '수행 결과 제출하기'}
                </button>
              </>
            )}

            <button
              type="button"
              onClick={() =>
                setViewMode((m) => (m === 'student' ? 'admin' : 'student'))
              }
              className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold border transition cursor-pointer ${
                viewMode === 'admin'
                  ? 'bg-slate-900 text-white border-slate-900'
                  : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
              }`}
            >
              <ShieldCheck className="w-4 h-4 text-indigo-500" />
              {viewMode === 'admin' ? '학생 실습 화면으로' : '교사용 관리'}
            </button>
          </div>
        </div>
      </header>

      {/* 본문 영역 */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6">
        {viewMode === 'admin' ? (
          <TeacherAdminDashboard />
        ) : !student ? (
          /* 학번/이름 입력 시작 화면 */
          <div className="max-w-xl mx-auto my-8 bg-white rounded-3xl border border-slate-200 p-8 shadow-sm">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 text-xs font-bold mb-4">
              <GraduationCap className="w-4 h-4" />
              고1 정보 교과 · 기계학습 수행과정 기록 시스템
            </div>
            <h2 className="text-2xl font-extrabold text-slate-900">
              실습을 시작하기 전 학번과 이름을 입력하세요
            </h2>
            <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
              선형 회귀, 로지스틱 회귀, KNN, 의사결정트리, K-평균 군집화, 인공신경망(퍼셉트론) 6가지 알고리즘을 직접 조작하며 학습하고, 수행 체크리스트와 퀴즈 및 소감을 선생님께 제출합니다.
            </p>

            <form onSubmit={handleStartStudentSession} className="mt-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    학번 (예: 10101)
                  </label>
                  <input
                    type="text"
                    value={studentIdInput}
                    onChange={(e) => handleStudentIdChange(e.target.value)}
                    placeholder="10101"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    autoFocus
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    이름
                  </label>
                  <input
                    type="text"
                    value={nameInput}
                    onChange={(e) => setNameInput(e.target.value)}
                    placeholder="홍길동"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  소속 학반 (학번 입력 시 자동 완성되며 수정 가능)
                </label>
                <input
                  type="text"
                  value={classInput}
                  onChange={(e) => setClassInput(e.target.value)}
                  placeholder="예: 1학년 1반"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              {loginError && (
                <p className="text-xs text-rose-600 font-semibold">{loginError}</p>
              )}

              <button
                type="submit"
                className="w-full py-3 px-5 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white font-bold text-sm shadow-sm flex items-center justify-center gap-2 transition cursor-pointer"
              >
                <Sparkles className="w-4 h-4" />
                기계학습 시뮬레이터 실습 시작하기
              </button>
            </form>

            <div className="mt-6 pt-5 border-t border-slate-100 grid grid-cols-3 gap-2 text-center text-xs text-slate-600">
              <div className="p-2.5 rounded-xl bg-slate-50">
                <div className="font-bold text-slate-800">지도학습(회귀·분류)</div>
                <div className="text-[11px] text-slate-500 mt-0.5">
                  선형/로지스틱/KNN/결정트리
                </div>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-50">
                <div className="font-bold text-slate-800">비지도학습(군집화)</div>
                <div className="text-[11px] text-slate-500 mt-0.5">K-평균 (K-Means)</div>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-50">
                <div className="font-bold text-slate-800">인공신경망</div>
                <div className="text-[11px] text-slate-500 mt-0.5">퍼셉트론 & 다층 신경망</div>
              </div>
            </div>
          </div>
        ) : (
          /* 학생 실습 화면 */
          <div className="space-y-6">
            {/* 알고리즘 6종 선택 탭 */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
              {ALGORITHMS.map((alg) => {
                const p = progress[alg.id];
                const mDone = p.completedMissions.length;
                const mTotal = alg.missions.length;
                const isComplete =
                  mDone === mTotal &&
                  p.quizSubmitted &&
                  p.reflection.trim().length >= 10;
                const isSelected = activeAlgId === alg.id;

                return (
                  <button
                    key={alg.id}
                    type="button"
                    onClick={() => setActiveAlgId(alg.id)}
                    className={`p-3.5 rounded-2xl border text-left transition flex flex-col justify-between cursor-pointer ${
                      isSelected
                        ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                        : 'bg-white text-slate-800 border-slate-200 hover:border-indigo-300 hover:bg-slate-50/70'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-1">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          isSelected
                            ? 'bg-white/15 text-indigo-200'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {alg.category}
                      </span>
                      {isComplete && (
                        <CheckCircle2
                          className={`w-4 h-4 ${
                            isSelected ? 'text-emerald-400' : 'text-emerald-600'
                          }`}
                        />
                      )}
                    </div>
                    <div className="mt-2">
                      <div className="font-extrabold text-sm">{alg.name}</div>
                      <div
                        className={`text-[11px] mt-0.5 ${
                          isSelected ? 'text-slate-300' : 'text-slate-400'
                        }`}
                      >
                        미션 {mDone}/{mTotal} · 퀴즈 {p.quizScore}/{alg.quizzes.length}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* 현재 선택된 알고리즘 개념 요약 배너 */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div className="space-y-1.5">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-indigo-100 text-indigo-800">
                      {activeAlg.category}
                    </span>
                    <h2 className="text-lg font-extrabold text-slate-900">
                      {activeAlg.name}{' '}
                      <span className="text-xs font-normal text-slate-400">
                        ({activeAlg.englishName})
                      </span>
                    </h2>
                  </div>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                    {activeAlg.conceptSummary}
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row lg:flex-col gap-2 shrink-0 lg:max-w-sm">
                  <div className="px-3.5 py-2 rounded-xl bg-amber-50/80 border border-amber-200 text-xs text-amber-950 flex items-start gap-2">
                    <Lightbulb className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold">실생활 예시: </span>
                      {activeAlg.realLifeExample}
                    </div>
                  </div>
                  <div className="px-3.5 py-2 rounded-xl bg-slate-100 border border-slate-200 text-xs font-mono text-slate-700 flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-indigo-600 shrink-0" />
                    <span>{activeAlg.keyFormulaOrRule}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* 알고리즘별 인터랙티브 시뮬레이터 본체 */}
            {activeAlgId === 'linear-regression' && (
              <LinearRegressionSim onCompleteMission={handleCompleteMission} />
            )}
            {activeAlgId === 'logistic-regression' && (
              <LogisticRegressionSim onCompleteMission={handleCompleteMission} />
            )}
            {activeAlgId === 'knn' && (
              <KnnSim onCompleteMission={handleCompleteMission} />
            )}
            {activeAlgId === 'decision-tree' && (
              <DecisionTreeSim onCompleteMission={handleCompleteMission} />
            )}
            {activeAlgId === 'kmeans' && (
              <KMeansSim onCompleteMission={handleCompleteMission} />
            )}
            {activeAlgId === 'perceptron' && (
              <PerceptronSim onCompleteMission={handleCompleteMission} />
            )}

            {/* 하단: 3단계 수행 과정 체크 패널 (미션 + 퀴즈 + 서술형 소감) */}
            <ChecklistQuizPanel
              algorithm={activeAlg}
              progress={activeProgress}
              onToggleMissionManual={handleToggleMissionManual}
              onSelectQuizAnswer={handleSelectQuizAnswer}
              onSubmitQuiz={handleSubmitQuiz}
              onChangeReflection={handleChangeReflection}
            />
          </div>
        )}
      </main>

      {/* 제출 완료 확인서 모달 */}
      {submittedModalData && (
        <StudentReportModal
          record={submittedModalData.record}
          cloudSynced={submittedModalData.cloudSynced}
          onClose={() => setSubmittedModalData(null)}
        />
      )}
    </div>
  );
}

export default App;
