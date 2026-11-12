import React from 'react';
import { CheckCircle2, Printer, X, Cloud, HardDriveDownload } from 'lucide-react';
import { ALGORITHMS } from '../data/algorithms';
import { StudentSubmissionRecord } from '../types/simulator';

interface Props {
  record: StudentSubmissionRecord;
  cloudSynced: boolean;
  onClose: () => void;
}

export const StudentReportModal: React.FC<Props> = ({
  record,
  cloudSynced,
  onClose,
}) => {
  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        <div className="p-5 bg-gradient-to-r from-indigo-600 to-blue-600 text-white flex items-center justify-between">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-bold bg-white/20 px-2.5 py-0.5 rounded-full">
              {cloudSynced ? (
                <>
                  <Cloud className="w-3.5 h-3.5" /> 교사용 실시간 서버(구글 시트) 전송 완료
                </>
              ) : (
                <>
                  <HardDriveDownload className="w-3.5 h-3.5" /> 교사용 대시보드에 제출 저장 완료
                </>
              )}
            </div>
            <h3 className="text-lg font-extrabold mt-1">
              기계학습 알고리즘 실습 수행 결과 확인서
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto space-y-5">
          {/* 학생 인적사항 및 종합 점수 */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 rounded-xl bg-slate-50 border border-slate-200 text-center">
            <div>
              <div className="text-[11px] text-slate-500">학번 / 이름</div>
              <div className="text-sm font-extrabold text-slate-900 mt-0.5">
                {record.studentId} {record.name}
              </div>
            </div>
            <div>
              <div className="text-[11px] text-slate-500">소속 학급</div>
              <div className="text-sm font-bold text-slate-800 mt-0.5">
                {record.schoolClass}
              </div>
            </div>
            <div>
              <div className="text-[11px] text-slate-500">실습 미션 달성률</div>
              <div className="text-sm font-extrabold text-emerald-600 mt-0.5">
                {record.missionProgressPercent}%
              </div>
            </div>
            <div>
              <div className="text-[11px] text-slate-500">개념 퀴즈 총점</div>
              <div className="text-sm font-extrabold text-amber-600 mt-0.5">
                {record.quizTotalScore} / {record.quizMaxScore}점
              </div>
            </div>
          </div>

          {/* 6개 알고리즘별 수행 내역 */}
          <div className="space-y-2.5">
            <h4 className="text-xs font-bold text-slate-700">
              알고리즘별 수행 체크 및 탐구 소감 내역
            </h4>
            {ALGORITHMS.map((alg) => {
              const d = record.algorithmDetails[alg.id];
              const mDone = d?.completedMissions?.length || 0;
              return (
                <div
                  key={alg.id}
                  className="p-3.5 rounded-xl border border-slate-200 bg-white space-y-1.5 text-xs"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 inline mr-1" />
                      {alg.name} ({alg.category})
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="text-indigo-700 font-semibold">
                        미션 {mDone}/{alg.missions.length}
                      </span>
                      <span className="text-amber-700 font-semibold">
                        퀴즈 {d?.quizScore || 0}/{alg.quizzes.length}점
                      </span>
                    </div>
                  </div>
                  <p className="text-slate-600 bg-slate-50 p-2 rounded-lg border border-slate-100">
                    {d?.reflection ? d.reflection : '(작성된 탐구 소감 없음)'}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <span className="text-xs text-slate-500">
            제출 일시: {new Date(record.submittedAt).toLocaleString('ko-KR')}
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => window.print()}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-bold transition cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              보고서 인쇄 / PDF 저장
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition cursor-pointer"
            >
              확인 완료
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
