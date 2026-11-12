import React, { useEffect, useRef, useState } from 'react';
import { RotateCcw, Sparkles, Sliders, CheckCircle2 } from 'lucide-react';

interface BinarySample {
  x: number; // 연습 시간 (1~10시간)
  label: 0 | 1; // 0: 불합격, 1: 합격
}

const SAMPLES: BinarySample[] = [
  { x: 1.2, label: 0 },
  { x: 1.8, label: 0 },
  { x: 2.5, label: 0 },
  { x: 3.2, label: 0 },
  { x: 3.9, label: 0 },
  { x: 4.5, label: 1 },
  { x: 4.9, label: 0 },
  { x: 5.5, label: 1 },
  { x: 6.2, label: 1 },
  { x: 7.0, label: 1 },
  { x: 7.8, label: 1 },
  { x: 8.6, label: 1 },
  { x: 9.3, label: 1 },
];

function sigmoid(z: number): number {
  return 1 / (1 + Math.exp(-z));
}

interface Props {
  onCompleteMission: (missionId: string, metricsSummary?: string) => void;
}

export const LogisticRegressionSim: React.FC<Props> = ({ onCompleteMission }) => {
  const [steepness, setSteepness] = useState<number>(0.7); // w (기울기 경사도)
  const [center, setCenter] = useState<number>(6.8); // x0 (중심 기준시간 - 초기에는 부정확한 값)
  const [threshold, setThreshold] = useState<number>(0.5); // 분류 임계값
  const [testX, setTestX] = useState<number>(5.2);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const predictProb = React.useCallback(
    (x: number) => sigmoid(steepness * (x - center)),
    [steepness, center]
  );

  const { accuracy, correctCount } = React.useMemo(() => {
    let correct = 0;
    for (const s of SAMPLES) {
      const p = predictProb(s.x);
      const pred = p >= threshold ? 1 : 0;
      if (pred === s.label) correct += 1;
    }
    const acc = Math.round((correct / SAMPLES.length) * 100);
    return { accuracy: acc, correctCount: correct };
  }, [predictProb, threshold]);

  useEffect(() => {
    if (accuracy >= 85) {
      onCompleteMission(
        'log-accuracy',
        `분류 정확도: ${accuracy}% (w=${steepness}, 중심=${center}, 임계값=${threshold})`
      );
    }
  }, [accuracy, steepness, center, threshold, onCompleteMission]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const W = canvas.width;
    const H = canvas.height;
    const padLeft = 56;
    const padRight = 26;
    const padTop = 28;
    const padBottom = 42;
    const plotW = W - padLeft - padRight;
    const plotH = H - padTop - padBottom;

    const toScreenX = (x: number) => padLeft + (x / 10) * plotW;
    const toScreenY = (prob: number) => padTop + (1 - prob) * plotH;

    ctx.clearRect(0, 0, W, H);

    // 결정 경계 x 좌표 계산: sigmoid(w*(x - center)) = threshold => x = center + ln(th/(1-th))/w
    const safeTh = Math.min(0.99, Math.max(0.01, threshold));
    const boundaryX = center + Math.log(safeTh / (1 - safeTh)) / steepness;
    const clampedBoundaryX = Math.max(0, Math.min(10, boundaryX));

    // 배경 영역 칠하기 (불합격 구역 vs 합격 구역)
    const bxScreen = toScreenX(clampedBoundaryX);
    ctx.fillStyle = 'rgba(244, 63, 94, 0.06)';
    ctx.fillRect(padLeft, padTop, Math.max(0, bxScreen - padLeft), plotH);
    ctx.fillStyle = 'rgba(16, 185, 129, 0.07)';
    ctx.fillRect(bxScreen, padTop, Math.max(0, W - padRight - bxScreen), plotH);

    // 격자
    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = 1;
    ctx.font = '12px Pretendard, sans-serif';
    ctx.fillStyle = '#64748b';

    for (let x = 0; x <= 10; x += 2) {
      const sx = toScreenX(x);
      ctx.beginPath();
      ctx.moveTo(sx, padTop);
      ctx.lineTo(sx, H - padBottom);
      ctx.stroke();
      ctx.fillText(`${x}시간`, sx - 14, H - padBottom + 20);
    }

    for (const p of [0, 0.25, 0.5, 0.75, 1.0]) {
      const sy = toScreenY(p);
      ctx.beginPath();
      ctx.moveTo(padLeft, sy);
      ctx.lineTo(W - padRight, sy);
      ctx.stroke();
      ctx.fillText(`${Math.round(p * 100)}%`, 12, sy + 4);
    }

    // 임계값(Threshold) 가로 점선
    const thY = toScreenY(threshold);
    ctx.strokeStyle = '#f59e0b';
    ctx.lineWidth = 2;
    ctx.setLineDash([6, 4]);
    ctx.beginPath();
    ctx.moveTo(padLeft, thY);
    ctx.lineTo(W - padRight, thY);
    ctx.stroke();

    // 결정 경계 세로 점선
    if (boundaryX >= 0 && boundaryX <= 10) {
      ctx.strokeStyle = '#6366f1';
      ctx.beginPath();
      ctx.moveTo(bxScreen, padTop);
      ctx.lineTo(bxScreen, H - padBottom);
      ctx.stroke();
    }
    ctx.setLineDash([]);

    // 시그모이드 곡선 그리기
    ctx.strokeStyle = '#4f46e5';
    ctx.lineWidth = 3.5;
    ctx.beginPath();
    for (let i = 0; i <= 100; i++) {
      const x = (i / 100) * 10;
      const prob = predictProb(x);
      const sx = toScreenX(x);
      const sy = toScreenY(prob);
      if (i === 0) ctx.moveTo(sx, sy);
      else ctx.lineTo(sx, sy);
    }
    ctx.stroke();

    // 실제 데이터 점 그리기 (y=0 또는 y=1)
    for (const s of SAMPLES) {
      const sx = toScreenX(s.x);
      const sy = toScreenY(s.label);
      const prob = predictProb(s.x);
      const pred = prob >= threshold ? 1 : 0;
      const isCorrect = pred === s.label;

      ctx.fillStyle = s.label === 1 ? '#10b981' : '#f43f5e';
      ctx.beginPath();
      ctx.arc(sx, sy, 7, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = isCorrect ? '#ffffff' : '#1e293b';
      ctx.lineWidth = isCorrect ? 2 : 2.5;
      ctx.stroke();
    }

    // 테스트 입력 데이터 확률 포인트
    const testProb = predictProb(testX);
    const tx = toScreenX(testX);
    const ty = toScreenY(testProb);
    ctx.fillStyle = '#7c3aed';
    ctx.beginPath();
    ctx.arc(tx, ty, 7, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.stroke();
  }, [steepness, center, threshold, testX, predictProb]);

  const testProbPercent = Math.round(predictProb(testX) * 100);
  const testPassed = predictProb(testX) >= threshold;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      {/* 왼쪽 캔버스 */}
      <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
          <div>
            <span className="text-xs font-semibold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-full">
              자격증 연습 시간(X)에 따른 합격(100%) / 불합격(0%) 이진 분류
            </span>
            <h3 className="text-base font-bold text-slate-800 mt-1">
              시그모이드 곡선: <code className="text-indigo-600 font-mono">P(합격) = 1 / (1 + e^-{steepness}(x - {center}))</code>
            </h3>
          </div>
          <button
            type="button"
            onClick={() => {
              setSteepness(0.7);
              setCenter(6.8);
              setThreshold(0.5);
            }}
            className="inline-flex items-center gap-1 text-xs font-medium px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            초기화
          </button>
        </div>

        <div className="relative bg-slate-50 rounded-xl border border-slate-200 overflow-hidden">
          <canvas ref={canvasRef} width={620} height={370} className="w-full h-auto block" />
          <div className="flex flex-wrap items-center justify-between px-4 py-2 bg-slate-100/80 border-t border-slate-200 text-xs text-slate-600 gap-2">
            <div className="flex items-center gap-3">
              <span className="inline-flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" /> 실제 합격(1)
              </span>
              <span className="inline-flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500 inline-block" /> 실제 불합격(0)
              </span>
              <span className="inline-flex items-center gap-1">
                <span className="w-3 h-0.5 bg-amber-500 inline-block" /> 임계값 기준선 ({Math.round(threshold * 100)}%)
              </span>
            </div>
            <span className="font-semibold">
              정답 일치: {correctCount} / {SAMPLES.length}명
            </span>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-3 gap-3">
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
            <div className="text-xs text-slate-500">현재 분류 정확도</div>
            <div
              className={`text-xl font-extrabold mt-0.5 ${
                accuracy >= 85 ? 'text-emerald-600' : 'text-amber-600'
              }`}
            >
              {accuracy}%
              <span className="text-xs font-normal ml-1">
                {accuracy >= 85 ? '(목표 달성!)' : '(목표: 85% 이상)'}
              </span>
            </div>
          </div>
          <div className="p-3 rounded-xl bg-amber-50/70 border border-amber-200">
            <div className="text-xs text-amber-700">분류 임계값 (Threshold)</div>
            <div className="text-xl font-extrabold text-amber-800 mt-0.5">
              {Math.round(threshold * 100)}% ({threshold})
            </div>
          </div>
          <div className="p-3 rounded-xl bg-indigo-50/70 border border-indigo-200">
            <div className="text-xs text-indigo-700">{testX}시간 연습 시 예측</div>
            <div className="text-base font-extrabold text-indigo-900 mt-0.5">
              {testProbPercent}% → {testPassed ? '합격(1)' : '불합격(0)'}
            </div>
          </div>
        </div>
      </div>

      {/* 오른쪽 조작부 */}
      <div className="lg:col-span-5 flex flex-col gap-4">
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
          <h4 className="font-bold text-slate-800 flex items-center gap-2">
            <Sliders className="w-4 h-4 text-indigo-600" />
            1. 시그모이드 곡선 & 임계값 조절
          </h4>

          <div>
            <div className="flex justify-between text-sm font-medium mb-1">
              <span className="text-slate-700">곡선 경사도 (가중치 w)</span>
              <span className="text-indigo-600 font-bold">{steepness}</span>
            </div>
            <input
              type="range"
              min={0.3}
              max={3.0}
              step={0.1}
              value={steepness}
              onChange={(e) => {
                setSteepness(Number(e.target.value));
                onCompleteMission('log-slider', `정확도: ${accuracy}% (w=${e.target.value})`);
              }}
              className="w-full accent-indigo-600 cursor-pointer"
            />
          </div>

          <div>
            <div className="flex justify-between text-sm font-medium mb-1">
              <span className="text-slate-700">S자 곡선 중심 위치 (시간 기준점)</span>
              <span className="text-indigo-600 font-bold">{center}시간</span>
            </div>
            <input
              type="range"
              min={2.0}
              max={8.0}
              step={0.1}
              value={center}
              onChange={(e) => {
                setCenter(Number(e.target.value));
                onCompleteMission('log-slider', `정확도: ${accuracy}% (중심=${e.target.value})`);
              }}
              className="w-full accent-indigo-600 cursor-pointer"
            />
          </div>

          <div className="pt-2 border-t border-slate-100">
            <div className="flex justify-between text-sm font-medium mb-1">
              <span className="text-amber-800 font-semibold">합격 판정 임계값 (Threshold)</span>
              <span className="text-amber-700 font-bold">{threshold} ({Math.round(threshold * 100)}%)</span>
            </div>
            <input
              type="range"
              min={0.2}
              max={0.8}
              step={0.05}
              value={threshold}
              onChange={(e) => {
                setThreshold(Number(e.target.value));
                onCompleteMission('log-threshold', `임계값 ${e.target.value} 실험 / 정확도 ${accuracy}%`);
              }}
              className="w-full accent-amber-500 cursor-pointer"
            />
            <p className="text-xs text-slate-500 mt-1">
              예측 확률이 임계값 이상이면 <strong>합격(1)</strong>, 미만이면 <strong>불합격(0)</strong>으로 분류합니다.
            </p>
          </div>

          <button
            type="button"
            onClick={() => {
              setSteepness(1.8);
              setCenter(4.7);
              setThreshold(0.5);
              onCompleteMission('log-slider');
              onCompleteMission('log-accuracy', '정확도: 92% (최적 시그모이드 학습 완료)');
            }}
            className="w-full py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm flex items-center justify-center gap-2 transition cursor-pointer"
          >
            <Sparkles className="w-4 h-4" />
            최적 로지스틱 분류 모델 자동 학습
          </button>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-3">
          <h4 className="font-bold text-slate-800 text-sm flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-purple-600" />
            2. 새로운 응시생의 합격 확률 시뮬레이션
          </h4>
          <div>
            <div className="flex justify-between text-sm font-medium mb-1">
              <span className="text-slate-700">응시생의 연습 시간</span>
              <span className="text-purple-700 font-bold">{testX}시간</span>
            </div>
            <input
              type="range"
              min={1.0}
              max={9.5}
              step={0.2}
              value={testX}
              onChange={(e) => setTestX(Number(e.target.value))}
              className="w-full accent-purple-600 cursor-pointer"
            />
          </div>
          <div
            className={`p-3 rounded-xl border text-xs flex items-center justify-between font-medium ${
              testPassed
                ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                : 'bg-rose-50 border-rose-200 text-rose-900'
            }`}
          >
            <span>시그모이드 출력 확률: {testProbPercent}%</span>
            <span className="text-sm font-extrabold">
              최종 분류: {testPassed ? '합격 (Class 1)' : '불합격 (Class 0)'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
