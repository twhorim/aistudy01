import React, { useEffect, useState } from 'react';
import {
  ShieldCheck,
  RefreshCw,
  Download,
  Search,
  Database,
  Eye,
  Trash2,
  Copy,
  Check,
  X,
  Users,
  Award,
  CheckCircle2,
  FileSpreadsheet,
  Lock,
} from 'lucide-react';
import { ALGORITHMS } from '../data/algorithms';
import { StudentSubmissionRecord } from '../types/simulator';
import {
  deleteLocalSubmission,
  fetchSubmissionsFromCloud,
  getAdminPin,
  getCloudScriptUrl,
  SAMPLE_SUBMISSIONS,
  setAdminPin,
  setCloudScriptUrl,
} from '../utils/storage';

const GOOGLE_APPS_SCRIPT_TEMPLATE = `// [고1 정보 기계학습 시뮬레이터] 실시간 구글 시트 연동 스크립트
// 1. 새 구글 스프레드시트를 만들고 상단 메뉴 [확장 프로그램] -> [Apps Script]를 클릭하세요.
// 2. 기존 코드를 지우고 이 코드를 붙여넣은 뒤 저장(Ctrl+S)하세요.
// 3. 우측 상단 [배포] -> [새 배포] -> 유형: [웹 앱] 선택
// 4. 다음 사용자정보로 실행: [나], 액세스 권한이 있는 사용자: [모든 사용자]로 설정 후 배포!
// 5. 발급된 웹 앱 URL을 복사하여 시뮬레이터 교사용 관리 페이지(또는 Vercel 환경변수 VITE_GOOGLE_SCRIPT_URL)에 등록하세요.

function doPost(e) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  if (sheet.getLastRow() === 0) {
    sheet.appendRow([
      '제출일시', '학번', '이름', '학반', '미션달성률(%)', '퀴즈점수', '서술형작성수',
      '선형회귀_소감', '로지스틱_소감', 'KNN_소감', '결정트리_소감', 'K평균_소감', '퍼셉트론_소감', '전체JSON'
    ]);
  }
  var body = JSON.parse(e.postData.contents);
  var r = body.payload;
  var d = r.algorithmDetails || {};
  sheet.appendRow([
    r.submittedAt,
    r.studentId,
    r.name,
    r.schoolClass,
    r.missionProgressPercent,
    r.quizTotalScore + '/' + r.quizMaxScore,
    r.reflectionCount,
    (d['linear-regression'] && d['linear-regression'].reflection) || '',
    (d['logistic-regression'] && d['logistic-regression'].reflection) || '',
    (d['knn'] && d['knn'].reflection) || '',
    (d['decision-tree'] && d['decision-tree'].reflection) || '',
    (d['kmeans'] && d['kmeans'].reflection) || '',
    (d['perceptron'] && d['perceptron'].reflection) || '',
    JSON.stringify(r)
  ]);
  return ContentService.createTextOutput(JSON.stringify({ ok: true }))
    .setMimeType(ContentService.MimeType.JSON);
}

function doGet(e) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  var rows = sheet.getDataRange().getValues();
  var records = [];
  for (var i = 1; i < rows.length; i++) {
    var rawJson = rows[i][13];
    if (rawJson) {
      try { records.push(JSON.parse(rawJson)); } catch (err) {}
    }
  }
  return ContentService.createTextOutput(JSON.stringify({ ok: true, records: records }))
    .setMimeType(ContentService.MimeType.JSON);
}`;

export const TeacherAdminDashboard: React.FC = () => {
  const [authenticated, setAuthenticated] = useState<boolean>(false);
  const [pinInput, setPinInput] = useState<string>('');
  const [pinError, setPinError] = useState<string>('');

  const [records, setRecords] = useState<StudentSubmissionRecord[]>([]);
  const [includeSampleData, setIncludeSampleData] = useState<boolean>(true);
  const [loading, setLoading] = useState<boolean>(false);
  const [cloudStatus, setCloudStatus] = useState<string>('');

  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedClass, setSelectedClass] = useState<string>('ALL');
  const [sortBy, setSortBy] = useState<'time' | 'studentId' | 'score'>('time');

  const [selectedStudent, setSelectedStudent] =
    useState<StudentSubmissionRecord | null>(null);
  const [showCloudSetupModal, setShowCloudSetupModal] = useState<boolean>(false);
  const [cloudUrlInput, setCloudUrlInput] = useState<string>(getCloudScriptUrl());
  const [newPinInput, setNewPinInput] = useState<string>(getAdminPin());
  const [copiedScript, setCopiedScript] = useState<boolean>(false);

  const refreshData = async () => {
    setLoading(true);
    const res = await fetchSubmissionsFromCloud();
    setRecords(res.records);
    if (res.fromCloud) {
      setCloudStatus('구글 시트 클라우드 실시간 동기화 완료');
    } else if (res.error) {
      setCloudStatus(`로컬 데이터 표시 중 (클라우드 오류: ${res.error})`);
    } else {
      setCloudStatus('현재 브라우저 제출 데이터 표시 중 (구글 시트 연동 시 전 학급 실시간 취합)');
    }
    setLoading(false);
  };

  useEffect(() => {
    if (authenticated) {
      refreshData();
    }
  }, [authenticated]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (pinInput.trim() === getAdminPin()) {
      setAuthenticated(true);
      setPinError('');
    } else {
      setPinError('비밀번호가 일치하지 않습니다.');
    }
  };

  const combinedRecords = React.useMemo(() => {
    const map = new Map<string, StudentSubmissionRecord>();
    if (includeSampleData) {
      for (const s of SAMPLE_SUBMISSIONS) {
        map.set(s.studentId, s);
      }
    }
    for (const r of records) {
      map.set(r.studentId, r);
    }
    let list = Array.from(map.values());

    if (selectedClass !== 'ALL') {
      list = list.filter((item) => item.schoolClass === selectedClass);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      list = list.filter(
        (item) =>
          item.studentId.toLowerCase().includes(q) ||
          item.name.toLowerCase().includes(q)
      );
    }

    list.sort((a, b) => {
      if (sortBy === 'studentId') return a.studentId.localeCompare(b.studentId);
      if (sortBy === 'score') {
        return (
          b.missionProgressPercent +
          b.quizTotalScore * 5 -
          (a.missionProgressPercent + a.quizTotalScore * 5)
        );
      }
      return new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime();
    });

    return list;
  }, [records, includeSampleData, selectedClass, searchQuery, sortBy]);

  const classOptions = React.useMemo(() => {
    const set = new Set<string>();
    for (const r of [...records, ...(includeSampleData ? SAMPLE_SUBMISSIONS : [])]) {
      if (r.schoolClass) set.add(r.schoolClass);
    }
    return Array.from(set).sort();
  }, [records, includeSampleData]);

  const handleDownloadCsv = () => {
    const headers = [
      '학번',
      '이름',
      '학반',
      '제출일시',
      '전체미션달성률(%)',
      '퀴즈총점',
      '서술형작성수(6개중)',
      ...ALGORITHMS.flatMap((a) => [
        `${a.name}_미션수`,
        `${a.name}_퀴즈점수`,
        `${a.name}_탐구소감`,
      ]),
    ];

    const escapeCsv = (val: string | number) => {
      const str = String(val ?? '').replace(/"/g, '""');
      return `"${str}"`;
    };

    const rows = combinedRecords.map((r) => {
      const algCols = ALGORITHMS.flatMap((a) => {
        const d = r.algorithmDetails?.[a.id];
        return [
          `${d?.completedMissions?.length || 0}/${a.missions.length}`,
          `${d?.quizScore || 0}/${a.quizzes.length}`,
          d?.reflection || '',
        ];
      });

      return [
        r.studentId,
        r.name,
        r.schoolClass,
        new Date(r.submittedAt).toLocaleString('ko-KR'),
        `${r.missionProgressPercent}%`,
        `${r.quizTotalScore}/${r.quizMaxScore}`,
        `${r.reflectionCount}/6`,
        ...algCols,
      ]
        .map(escapeCsv)
        .join(',');
    });

    const csvContent = '\uFEFF' + [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `고1정보_기계학습시뮬레이터_제출현황_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (!authenticated) {
    return (
      <div className="max-w-md mx-auto my-12 bg-white rounded-2xl border border-slate-200 p-7 shadow-sm">
        <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-4">
          <Lock className="w-6 h-6" />
        </div>
        <h2 className="text-xl font-extrabold text-slate-900">교사용 실시간 관리 페이지</h2>
        <p className="text-xs text-slate-500 mt-1 mb-5">
          학생들의 학번별 기계학습 실습 미션 달성률, 퀴즈 점수, 서술형 탐구 소감을 실시간으로 조회하고 엑셀(CSV)로 다운로드합니다.
        </p>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              교사 인증 비밀번호 입력
            </label>
            <input
              type="password"
              value={pinInput}
              onChange={(e) => setPinInput(e.target.value)}
              placeholder="비밀번호를 입력하세요"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              autoFocus
            />
            {pinError && <p className="text-xs text-rose-600 mt-1.5 font-medium">{pinError}</p>}
          </div>
          <button
            type="submit"
            className="w-full py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm transition cursor-pointer"
          >
            관리자 대시보드 입장하기
          </button>
        </form>
      </div>
    );
  }

  const avgMission =
    combinedRecords.length > 0
      ? Math.round(
          combinedRecords.reduce((s, r) => s + r.missionProgressPercent, 0) /
            combinedRecords.length
        )
      : 0;

  const avgQuiz =
    combinedRecords.length > 0
      ? (
          combinedRecords.reduce((s, r) => s + r.quizTotalScore, 0) /
          combinedRecords.length
        ).toFixed(1)
      : '0.0';

  return (
    <div className="space-y-6">
      {/* 상단 요약 배너 */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <span className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-700 bg-indigo-50 px-3 py-1 rounded-full">
              <ShieldCheck className="w-3.5 h-3.5" />
              교사용 수행평가 · 실시간 학습 모니터링
            </span>
            <h2 className="text-xl font-extrabold text-slate-900 mt-2">
              학생 수행 과정 및 제출 결과 현황판
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">{cloudStatus}</p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              onClick={() => setShowCloudSetupModal(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 transition cursor-pointer"
            >
              <Database className="w-4 h-4" />
              구글 시트(무료 DB) 실시간 연동 설정
            </button>
            <button
              type="button"
              onClick={refreshData}
              disabled={loading}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 transition cursor-pointer"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              새로고침
            </button>
            <button
              type="button"
              onClick={handleDownloadCsv}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs transition cursor-pointer"
            >
              <FileSpreadsheet className="w-4 h-4" />
              엑셀(CSV) 채점표 다운로드
            </button>
          </div>
        </div>

        {/* 요약 통계 카드 */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-5">
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
            <div>
              <div className="text-xs text-slate-500 font-medium">조회된 제출 학생 수</div>
              <div className="text-2xl font-extrabold text-slate-900 mt-1">
                {combinedRecords.length}명
              </div>
            </div>
            <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
            <div>
              <div className="text-xs text-slate-500 font-medium">학급 평균 실습 미션 달성률</div>
              <div className="text-2xl font-extrabold text-emerald-600 mt-1">{avgMission}%</div>
            </div>
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
            <div>
              <div className="text-xs text-slate-500 font-medium">학급 평균 개념 퀴즈 점수</div>
              <div className="text-2xl font-extrabold text-amber-600 mt-1">
                {avgQuiz} <span className="text-xs font-normal text-slate-500">/ 12점 만점</span>
              </div>
            </div>
            <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center">
              <Award className="w-5 h-5" />
            </div>
          </div>
        </div>
      </div>

      {/* 필터 & 검색 바 */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="학번 또는 이름 검색..."
              className="pl-9 pr-3 py-1.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <select
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 bg-white"
          >
            <option value="ALL">전체 학급 보기</option>
            {classOptions.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as 'time' | 'studentId' | 'score')}
            className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 bg-white"
          >
            <option value="time">최신 제출순</option>
            <option value="studentId">학번 오름차순</option>
            <option value="score">성취도 높은순</option>
          </select>
        </div>

        <label className="inline-flex items-center gap-2 text-xs font-semibold text-slate-600 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={includeSampleData}
            onChange={(e) => setIncludeSampleData(e.target.checked)}
            className="rounded accent-indigo-600"
          />
          예시 학생 데이터(3명) 함께 표시
        </label>
      </div>

      {/* 제출 목록 테이블 */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold">
                <th className="py-3.5 px-4">학번 / 이름</th>
                <th className="py-3.5 px-3">학반</th>
                <th className="py-3.5 px-3">미션 달성률</th>
                <th className="py-3.5 px-3">퀴즈 점수</th>
                <th className="py-3.5 px-3">탐구 소감</th>
                <th className="py-3.5 px-4">6대 알고리즘별 수행 요약</th>
                <th className="py-3.5 px-3">제출 시각</th>
                <th className="py-3.5 px-4 text-right">상세 보기</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200/70">
              {combinedRecords.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    아직 제출된 학생 기록이 없습니다.
                  </td>
                </tr>
              ) : (
                combinedRecords.map((rec) => {
                  const isSample = rec.id.startsWith('sample_');
                  return (
                    <tr key={rec.id} className="hover:bg-slate-50/80 transition">
                      <td className="py-3.5 px-4">
                        <div className="font-extrabold text-slate-900 text-sm">
                          {rec.studentId} {rec.name}
                        </div>
                        {isSample && (
                          <span className="inline-block text-[10px] font-semibold bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded mt-0.5">
                            예시 데이터
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-3 font-medium text-slate-600">
                        {rec.schoolClass}
                      </td>
                      <td className="py-3.5 px-3">
                        <div className="flex items-center gap-2">
                          <div className="w-20 h-2 bg-slate-100 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-emerald-500"
                              style={{ width: `${rec.missionProgressPercent}%` }}
                            />
                          </div>
                          <span className="font-bold text-slate-800">
                            {rec.missionProgressPercent}%
                          </span>
                        </div>
                      </td>
                      <td className="py-3.5 px-3">
                        <span className="font-bold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-full">
                          {rec.quizTotalScore} / {rec.quizMaxScore}점
                        </span>
                      </td>
                      <td className="py-3.5 px-3 font-semibold text-slate-700">
                        {rec.reflectionCount} / 6개 작성
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="flex flex-wrap gap-1">
                          {ALGORITHMS.map((alg) => {
                            const d = rec.algorithmDetails?.[alg.id];
                            const mDone = (d?.completedMissions?.length || 0) === alg.missions.length;
                            const hasRef = (d?.reflection || '').trim().length >= 10;
                            return (
                              <span
                                key={alg.id}
                                title={`${alg.name}: 미션 ${d?.completedMissions?.length || 0}/${
                                  alg.missions.length
                                }, 퀴즈 ${d?.quizScore || 0}점`}
                                className={`px-2 py-0.5 rounded text-[11px] font-bold border ${
                                  mDone && hasRef
                                    ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
                                    : (d?.completedMissions?.length || 0) > 0
                                    ? 'bg-blue-50 border-blue-200 text-blue-700'
                                    : 'bg-slate-50 border-slate-200 text-slate-400'
                                }`}
                              >
                                {alg.name}
                              </span>
                            );
                          })}
                        </div>
                      </td>
                      <td className="py-3.5 px-3 text-slate-500">
                        {new Date(rec.submittedAt).toLocaleTimeString('ko-KR', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </td>
                      <td className="py-3.5 px-4 text-right space-x-1">
                        <button
                          type="button"
                          onClick={() => setSelectedStudent(rec)}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold transition cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          상세/소감
                        </button>
                        {!isSample && (
                          <button
                            type="button"
                            onClick={() => {
                              const next = deleteLocalSubmission(rec.studentId);
                              setRecords(next);
                            }}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                            title="기록 삭제"
                          >
                            <Trash2 className="w-3.5 h-3.5 inline" />
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 학생 개별 상세 보기 모달 */}
      {selectedStudent && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[88vh] flex flex-col shadow-xl overflow-hidden">
            <div className="p-5 bg-slate-900 text-white flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold text-indigo-300">
                  {selectedStudent.schoolClass} · 제출시각:{' '}
                  {new Date(selectedStudent.submittedAt).toLocaleString('ko-KR')}
                </span>
                <h3 className="text-lg font-extrabold mt-0.5">
                  {selectedStudent.studentId} {selectedStudent.name} 학생 수행 결과 상세 리포트
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedStudent(null)}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 overflow-y-auto space-y-4">
              {ALGORITHMS.map((alg) => {
                const detail = selectedStudent.algorithmDetails?.[alg.id];
                const mCount = detail?.completedMissions?.length || 0;
                return (
                  <div
                    key={alg.id}
                    className="p-4 rounded-xl border border-slate-200 bg-slate-50/70 space-y-2"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="font-bold text-slate-900 text-sm">
                        [{alg.category}] {alg.name} ({alg.englishName})
                      </div>
                      <div className="flex items-center gap-2 text-xs">
                        <span className="px-2.5 py-0.5 rounded-full bg-indigo-100 text-indigo-800 font-bold">
                          실습 미션: {mCount} / {alg.missions.length}
                        </span>
                        <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 font-bold">
                          퀴즈: {detail?.quizScore || 0} / {alg.quizzes.length}점
                        </span>
                        {detail?.metricsSummary && (
                          <span className="px-2.5 py-0.5 rounded-full bg-white border border-slate-200 text-slate-600 font-mono">
                            {detail.metricsSummary}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="p-3 rounded-lg bg-white border border-slate-200 text-xs text-slate-800">
                      <div className="font-bold text-slate-500 mb-1">학생 작성 탐구 소감:</div>
                      {detail?.reflection ? (
                        <p className="leading-relaxed whitespace-pre-wrap">{detail.reflection}</p>
                      ) : (
                        <p className="text-slate-400 italic">작성된 서술형 소감이 없습니다.</p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* 구글 시트 실시간 연동 설정 모달 */}
      {showCloudSetupModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-xl overflow-hidden">
            <div className="p-5 bg-indigo-950 text-white flex items-center justify-between">
              <div>
                <h3 className="text-base font-extrabold">
                  구글 스프레드시트(무료 실시간 DB) 1분 연동 및 관리자 설정
                </h3>
                <p className="text-xs text-indigo-200 mt-0.5">
                  별도 유료 DB 없이 선생님의 구글 드라이브 시트로 전교생 제출 데이터를 실시간 수집합니다.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowCloudSetupModal(false)}
                className="p-1.5 rounded-lg bg-indigo-900 hover:bg-indigo-800 text-indigo-200 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 overflow-y-auto space-y-5 text-xs">
              <div className="space-y-2">
                <label className="block font-bold text-slate-800 text-sm">
                  1. Google Apps Script 웹 앱 URL 등록
                </label>
                <p className="text-slate-600">
                  아래 URL을 입력하거나 Vercel 배포 시 환경변수{' '}
                  <code className="px-1.5 py-0.5 bg-slate-100 rounded font-mono text-indigo-700">
                    VITE_GOOGLE_SCRIPT_URL
                  </code>
                  에 등록하면 모든 학생 기기에서 즉시 해당 시트로 실시간 전송됩니다.
                </p>
                <input
                  type="url"
                  value={cloudUrlInput}
                  onChange={(e) => setCloudUrlInput(e.target.value)}
                  placeholder="https://script.google.com/macros/s/AKfycb.../exec"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-800 text-sm">
                    2. 구글 시트 확장 프로그램(Apps Script) 붙여넣기용 코드
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(GOOGLE_APPS_SCRIPT_TEMPLATE);
                      setCopiedScript(true);
                      setTimeout(() => setCopiedScript(false), 2000);
                    }}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-bold transition cursor-pointer"
                  >
                    {copiedScript ? (
                      <>
                        <Check className="w-3.5 h-3.5" /> 복사 완료!
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" /> 스크립트 코드 복사하기
                      </>
                    )}
                  </button>
                </div>
                <pre className="p-3 rounded-xl bg-slate-900 text-slate-100 font-mono text-[11px] overflow-x-auto max-h-48 leading-relaxed">
                  {GOOGLE_APPS_SCRIPT_TEMPLATE}
                </pre>
              </div>

              <div className="pt-3 border-t border-slate-200 space-y-2">
                <label className="block font-bold text-slate-800 text-sm">
                  3. 교사용 관리자 비밀번호 변경
                </label>
                <input
                  type="text"
                  value={newPinInput}
                  onChange={(e) => setNewPinInput(e.target.value)}
                  className="w-48 px-3 py-2 rounded-xl border border-slate-200 text-xs font-mono"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setCloudScriptUrl(cloudUrlInput);
                    setAdminPin(newPinInput);
                    setShowCloudSetupModal(false);
                    refreshData();
                  }}
                  className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs cursor-pointer"
                >
                  설정 저장 및 동기화
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
