import React from 'react';
import {
  CheckCircle2,
  Circle,
  HelpCircle,
  BookOpenCheck,
  PenLine,
  Award,
} from 'lucide-react';
import { AlgorithmMeta, AlgorithmProgress } from '../types/simulator';

interface Props {
  algorithm: AlgorithmMeta;
  progress: AlgorithmProgress;
  onToggleMissionManual: (missionId: string) => void;
  onSelectQuizAnswer: (questionId: string, optionIdx: number) => void;
  onSubmitQuiz: () => void;
  onChangeReflection: (text: string) => void;
}

export const ChecklistQuizPanel: React.FC<Props> = ({
  algorithm,
  progress,
  onToggleMissionManual,
  onSelectQuizAnswer,
  onSubmitQuiz,
  onChangeReflection,
}) => {
  const completedCount = progress.completedMissions.length;
  const totalMissions = algorithm.missions.length;
  const allQuizzesAnswered = algorithm.quizzes.every(
    (q) => progress.quizAnswers[q.id] !== undefined
  );
  const reflectionReady = progress.reflection.trim().length >= 10;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-6">
      {/* 1. 단계별 실습 미션 체크리스트 */}
      <div className="lg:col-span-4 bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-bold text-slate-800 flex items-center gap-2 text-base">
              <BookOpenCheck className="w-5 h-5 text-indigo-600" />
              수행 과정 1: 실습 미션 체크
            </h3>
            <span
              className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                completedCount === totalMissions
                  ? 'bg-emerald-100 text-emerald-700'
                  : 'bg-indigo-50 text-indigo-700'
              }`}
            >
              {completedCount} / {totalMissions} 완료
            </span>
          </div>
          <p className="text-xs text-slate-500 mb-4">
            위 시뮬레이터를 조작하면 자동으로 체크됩니다. 직접 수행을 확인하며 클릭해도 됩니다.
          </p>

          <div className="space-y-2.5">
            {algorithm.missions.map((m) => {
              const isDone = progress.completedMissions.includes(m.id);
              return (
                <div
                  key={m.id}
                  onClick={() => onToggleMissionManual(m.id)}
                  className={`p-3.5 rounded-xl border transition cursor-pointer flex items-start gap-3 ${
                    isDone
                      ? 'bg-emerald-50/70 border-emerald-200 text-emerald-950'
                      : 'bg-slate-50/70 border-slate-200 hover:bg-slate-100 text-slate-800'
                  }`}
                >
                  {isDone ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                  ) : (
                    <Circle className="w-5 h-5 text-slate-400 shrink-0 mt-0.5" />
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-bold">{m.title}</span>
                    </div>
                    <p className="text-xs text-slate-600 mt-1 leading-relaxed">{m.description}</p>
                    <span className="inline-block mt-1.5 text-[11px] font-semibold px-2 py-0.5 rounded bg-white border border-slate-200 text-slate-600">
                      #{m.badgeText}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <span>최근 실습 기록</span>
          <span className="font-mono font-semibold text-slate-700">{progress.metricsSummary}</span>
        </div>
      </div>

      {/* 2. 핵심 개념 확인 미니 퀴즈 */}
      <div className="lg:col-span-4 bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-bold text-slate-800 flex items-center gap-2 text-base">
              <HelpCircle className="w-5 h-5 text-amber-600" />
              수행 과정 2: 개념 확인 퀴즈
            </h3>
            {progress.quizSubmitted ? (
              <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-amber-100 text-amber-800 inline-flex items-center gap-1">
                <Award className="w-3.5 h-3.5" />
                {progress.quizScore} / {algorithm.quizzes.length}점
              </span>
            ) : (
              <span className="text-xs font-medium text-slate-500">
                {algorithm.quizzes.length}문항
              </span>
            )}
          </div>

          <div className="space-y-4">
            {algorithm.quizzes.map((q, qIdx) => {
              const selected = progress.quizAnswers[q.id];
              const isCorrect = selected === q.correctIndex;

              return (
                <div
                  key={q.id}
                  className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2"
                >
                  <div className="text-xs font-bold text-slate-800 leading-snug">
                    Q{qIdx + 1}. {q.question}
                  </div>
                  <div className="space-y-1.5">
                    {q.options.map((opt, optIdx) => {
                      const isPicked = selected === optIdx;
                      let btnStyle =
                        'bg-white border-slate-200 text-slate-700 hover:bg-slate-100';
                      if (progress.quizSubmitted) {
                        if (optIdx === q.correctIndex) {
                          btnStyle =
                            'bg-emerald-50 border-emerald-400 text-emerald-900 font-bold';
                        } else if (isPicked && !isCorrect) {
                          btnStyle = 'bg-rose-50 border-rose-300 text-rose-800 line-through';
                        }
                      } else if (isPicked) {
                        btnStyle =
                          'bg-indigo-600 border-indigo-600 text-white font-semibold';
                      }

                      return (
                        <button
                          key={optIdx}
                          type="button"
                          onClick={() => onSelectQuizAnswer(q.id, optIdx)}
                          className={`w-full text-left px-3 py-2 rounded-lg border text-xs transition cursor-pointer ${btnStyle}`}
                        >
                          {optIdx + 1}. {opt}
                        </button>
                      );
                    })}
                  </div>
                  {progress.quizSubmitted && (
                    <div
                      className={`mt-2 p-2.5 rounded-lg text-[11px] leading-relaxed ${
                        isCorrect
                          ? 'bg-emerald-100/70 text-emerald-900'
                          : 'bg-amber-100/70 text-amber-950'
                      }`}
                    >
                      <strong>{isCorrect ? '정답입니다! ' : '오답 해설: '}</strong>
                      {q.explanation}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <button
          type="button"
          onClick={onSubmitQuiz}
          disabled={!allQuizzesAnswered}
          className={`mt-4 w-full py-2.5 px-4 rounded-xl font-bold text-xs transition cursor-pointer ${
            allQuizzesAnswered
              ? 'bg-amber-500 hover:bg-amber-600 text-white shadow-xs'
              : 'bg-slate-100 text-slate-400 cursor-not-allowed'
          }`}
        >
          {progress.quizSubmitted ? '퀴즈 다시 채점하기' : '정답 제출 및 채점하기'}
        </button>
      </div>

      {/* 3. 서술형 실험 분석 및 느낀 점 */}
      <div className="lg:col-span-4 bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-bold text-slate-800 flex items-center gap-2 text-base">
              <PenLine className="w-5 h-5 text-emerald-600" />
              수행 과정 3: 탐구 분석 및 소감
            </h3>
            <span
              className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                reflectionReady
                  ? 'bg-emerald-100 text-emerald-700'
                  : 'bg-slate-100 text-slate-600'
              }`}
            >
              {reflectionReady ? '작성 완료' : '10자 이상 작성'}
            </span>
          </div>

          <div className="p-3.5 rounded-xl bg-indigo-50/70 border border-indigo-100 mb-3">
            <div className="text-xs font-bold text-indigo-950 mb-1">💡 탐구 질문</div>
            <p className="text-xs text-indigo-900 leading-relaxed">
              {algorithm.reflectionPrompt}
            </p>
          </div>

          <textarea
            rows={7}
            value={progress.reflection}
            onChange={(e) => onChangeReflection(e.target.value)}
            placeholder={algorithm.reflectionExampleHint}
            className="w-full rounded-xl border border-slate-200 p-3.5 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 leading-relaxed resize-none"
          />
        </div>

        <div className="mt-3 flex items-center justify-between text-xs text-slate-500">
          <span>입력한 내용은 자동 저장되며 제출 시 선생님께 전송됩니다.</span>
          <span
            className={`font-semibold ${
              reflectionReady ? 'text-emerald-600' : 'text-slate-400'
            }`}
          >
            {progress.reflection.trim().length}자
          </span>
        </div>
      </div>
    </div>
  );
};
