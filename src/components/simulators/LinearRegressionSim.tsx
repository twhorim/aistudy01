import React, { useEffect, useRef, useState } from 'react';
import { RotateCcw, Sparkles, PlusCircle, Eye, TrendingUp } from 'lucide-react';

interface Point {
  x: number; // 1 ~ 10 (공부 시간)
  y: number; // 20 ~ 100 (점수)
  isCustom?: boolean;
}

const INITIAL_POINTS: Point[] = [
  { x: 1.5, y: 38 },
  { x: 2.2, y: 45 },
  { x: 3.0, y: 50 },
  { x: 4.0, y: 58 },
  { x: 4.8, y: 62 },
  { x: 5.5, y: 70 },
  { x: 6.5, y: 74 },
  { x: 7.5, y: 85 },
  { x: 8.5, y: 90 },
  { x: 9.2, y: 95 },
];

interface Props {
  onCompleteMission: (missionId: string, metricsSummary?: string) => void;
}

export const LinearRegressionSim: React.FC<Props> = ({ onCompleteMission }) => {
  const [points, setPoints] = useState<Point[]>(INITIAL_POINTS);
  const [slope, setSlope] = useState<number>(4.0); // 초기에는 약간 틀어진 값
  const [intercept, setIntercept] = useState<number>(45.0);
  const [showResiduals, setShowResiduals] = useState<boolean>(true);
  const [testHour, setTestHour] = useState<number>(6.0);
  const [isAnimating, setIsAnimating] = useState<boolean>(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // 평균제곱오차 (MSE) 계산
  const mse = React.useMemo(() => {
    if (points.length === 0) return 0;
    const sumSq = points.reduce((acc, pt) => {
      const pred = slope * pt.x + intercept;
      const err = pt.y - pred;
      return acc + err * err;
    }, 0);
    return Number((sumSq / points.length).toFixed(1));
  }, [points, slope, intercept]);

  // 최소제곱법(OLS) 최적 해 계산
  const optimalParams = React.useMemo(() => {
    const n = points.length;
    if (n < 2) return { w: 7.2, b: 28 };
    const meanX = points.reduce((s, p) => s + p.x, 0) / n;
    const meanY = points.reduce((s, p) => s + p.y, 0) / n;
    let num = 0;
    let den = 0;
    for (const p of points) {
      num += (p.x - meanX) * (p.y - meanY);
      den += (p.x - meanX) * (p.x - meanX);
    }
    const w = den === 0 ? 0 : num / den;
    const b = meanY - w * meanX;
    return { w: Number(w.toFixed(2)), b: Number(b.toFixed(1)) };
  }, [points]);

  useEffect(() => {
    if (mse <= 35 && points.length >= 5) {
      onCompleteMission('lr-optimal', `MSE: ${mse} (w=${slope}, b=${intercept})`);
    }
  }, [mse, slope, intercept, points.length, onCompleteMission]);

  // 캔버스 렌더링
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const W = canvas.width;
    const H = canvas.height;
    const padLeft = 52;
    const padRight = 24;
    const padTop = 24;
    const padBottom = 42;
    const plotW = W - padLeft - padRight;
    const plotH = H - padTop - padBottom;

    const toScreenX = (x: number) => padLeft + (x / 10) * plotW;
    const toScreenY = (y: number) => padTop + ((100 - y) / 80) * plotH; // Y: 20 ~ 100

    ctx.clearRect(0, 0, W, H);

    // 배경 격자
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

    for (let y = 20; y <= 100; y += 20) {
      const sy = toScreenY(y);
      ctx.beginPath();
      ctx.moveTo(padLeft, sy);
      ctx.lineTo(W - padRight, sy);
      ctx.stroke();
      ctx.fillText(`${y}점`, 12, sy + 4);
    }

    // 잔차(오차) 점선 표시
    if (showResiduals) {
      for (const pt of points) {
        const predY = slope * pt.x + intercept;
        const sx = toScreenX(pt.x);
        const syActual = toScreenY(pt.y);
        const syPred = toScreenY(Math.max(20, Math.min(100, predY)));

        ctx.strokeStyle = 'rgba(239, 68, 68, 0.55)';
        ctx.lineWidth = 2;
        ctx.setLineDash([4, 3]);
        ctx.beginPath();
        ctx.moveTo(sx, syActual);
        ctx.lineTo(sx, syPred);
        ctx.stroke();
        ctx.setLineDash([]);
      }
    }

    // 추세선 y = wx + b
    const y0 = slope * 0 + intercept;
    const y10 = slope * 10 + intercept;
    ctx.strokeStyle = '#2563eb';
    ctx.lineWidth = 3.5;
    ctx.beginPath();
    ctx.moveTo(toScreenX(0), toScreenY(y0));
    ctx.lineTo(toScreenX(10), toScreenY(y10));
    ctx.stroke();

    // 예측 테스트 포인트 (보라색 다이아몬드)
    const testPredY = Math.max(0, Math.min(100, slope * testHour + intercept));
    const tx = toScreenX(testHour);
    const ty = toScreenY(Math.max(20, testPredY));
    ctx.strokeStyle = '#7c3aed';
    ctx.setLineDash([3, 3]);
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(tx, H - padBottom);
    ctx.lineTo(tx, ty);
    ctx.stroke();
    ctx.setLineDash([]);

    ctx.fillStyle = '#7c3aed';
    ctx.beginPath();
    ctx.arc(tx, ty, 6, 0, Math.PI * 2);
    ctx.fill();

    // 데이터 점 그리기
    for (const pt of points) {
      const sx = toScreenX(pt.x);
      const sy = toScreenY(pt.y);
      ctx.fillStyle = pt.isCustom ? '#f59e0b' : '#0f172a';
      ctx.beginPath();
      ctx.arc(sx, sy, 6.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.stroke();
    }
  }, [points, slope, intercept, showResiduals, testHour]);

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const clickX = (e.clientX - rect.left) * scaleX;
    const clickY = (e.clientY - rect.top) * scaleY;

    const padLeft = 52;
    const padRight = 24;
    const padTop = 24;
    const padBottom = 42;
    const plotW = canvas.width - padLeft - padRight;
    const plotH = canvas.height - padTop - padBottom;

    const xVal = ((clickX - padLeft) / plotW) * 10;
    const yVal = 100 - ((clickY - padTop) / plotH) * 80;

    if (xVal >= 0.3 && xVal <= 9.8 && yVal >= 20 && yVal <= 100) {
      const newPt: Point = {
        x: Number(xVal.toFixed(1)),
        y: Number(yVal.toFixed(0)),
        isCustom: true,
      };
      setPoints((prev) => [...prev, newPt]);
      onCompleteMission('lr-add-point', `데이터 ${points.length + 1}개 / MSE: ${mse}`);
    }
  };

  const handleAutoFit = () => {
    if (isAnimating) return;
    setIsAnimating(true);
    const startW = slope;
    const startB = intercept;
    const targetW = optimalParams.w;
    const targetB = optimalParams.b;
    let step = 0;
    const totalSteps = 20;

    const timer = setInterval(() => {
      step += 1;
      const ratio = step / totalSteps;
      const ease = 1 - Math.pow(1 - ratio, 3);
      setSlope(Number((startW + (targetW - startW) * ease).toFixed(2)));
      setIntercept(Number((startB + (targetB - startB) * ease).toFixed(1)));
      if (step >= totalSteps) {
        clearInterval(timer);
        setIsAnimating(false);
        onCompleteMission('lr-optimal', `최적화 완료 MSE: ${mse} (w=${targetW}, b=${targetB})`);
      }
    }, 35);
  };

  const predictedScore = Math.min(100, Math.max(0, Number((slope * testHour + intercept).toFixed(1))));

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      {/* 왼쪽: 인터랙티브 캔버스 */}
      <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
          <div>
            <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full">
              공부 시간(X)에 따른 시험 성적(Y) 예측
            </span>
            <h3 className="text-base font-bold text-slate-800 mt-1">
              추세선: <code className="text-blue-600 font-mono">ŷ = {slope}x + {intercept}</code>
            </h3>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowResiduals((v) => !v)}
              className={`inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg border transition ${
                showResiduals
                  ? 'bg-red-50 text-red-700 border-red-200'
                  : 'bg-slate-50 text-slate-600 border-slate-200'
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              오차(잔차) 선 {showResiduals ? '켜짐' : '꺼짐'}
            </button>
            <button
              type="button"
              onClick={() => {
                setPoints(INITIAL_POINTS);
                setSlope(4.0);
                setIntercept(45.0);
              }}
              className="inline-flex items-center gap-1 text-xs font-medium px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              초기화
            </button>
          </div>
        </div>

        <div className="relative bg-slate-50 rounded-xl border border-slate-200 overflow-hidden">
          <canvas
            ref={canvasRef}
            width={620}
            height={380}
            onClick={handleCanvasClick}
            className="w-full h-auto cursor-crosshair block"
          />
          <div className="flex items-center justify-between px-4 py-2 bg-slate-100/80 border-t border-slate-200 text-xs text-slate-600">
            <span className="inline-flex items-center gap-1.5">
              <PlusCircle className="w-3.5 h-3.5 text-amber-600" />
              그래프 빈 곳을 클릭하면 <strong>새로운 학생 데이터(주황색 점)</strong>가 추가됩니다!
            </span>
            <span className="font-semibold text-slate-700">총 데이터: {points.length}개</span>
          </div>
        </div>

        {/* MSE 상태 표시 바 */}
        <div className="mt-4 grid grid-cols-3 gap-3">
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
            <div className="text-xs text-slate-500">현재 평균제곱오차 (MSE)</div>
            <div
              className={`text-xl font-extrabold mt-0.5 ${
                mse <= 35 ? 'text-emerald-600' : mse <= 80 ? 'text-amber-600' : 'text-rose-600'
              }`}
            >
              {mse}
              <span className="text-xs font-normal ml-1">
                {mse <= 35 ? '(목표 달성!)' : '(35 이하로 낮춰보세요)'}
              </span>
            </div>
          </div>
          <div className="p-3 rounded-xl bg-blue-50/60 border border-blue-100">
            <div className="text-xs text-blue-600">최적 기울기 / 절편 힌트</div>
            <div className="text-sm font-bold text-slate-800 mt-1">
              w ≈ {optimalParams.w}, b ≈ {optimalParams.b}
            </div>
          </div>
          <div className="p-3 rounded-xl bg-purple-50/60 border border-purple-100">
            <div className="text-xs text-purple-600">{testHour}시간 공부 시 예상 점수</div>
            <div className="text-xl font-extrabold text-purple-700 mt-0.5">{predictedScore}점</div>
          </div>
        </div>
      </div>

      {/* 오른쪽: 파라미터 조작 패널 */}
      <div className="lg:col-span-5 flex flex-col gap-4">
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-5">
          <div className="flex items-center justify-between">
            <h4 className="font-bold text-slate-800 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-blue-600" />
              1. 추세선 파라미터 직접 조절
            </h4>
            <span className="text-xs text-slate-500">y = wx + b</span>
          </div>

          <div>
            <div className="flex justify-between text-sm font-medium mb-1.5">
              <span className="text-slate-700">기울기 (가중치 w)</span>
              <span className="text-blue-600 font-bold">{slope}</span>
            </div>
            <input
              type="range"
              min={-2}
              max={12}
              step={0.1}
              value={slope}
              onChange={(e) => {
                setSlope(Number(e.target.value));
                onCompleteMission('lr-adjust', `MSE: ${mse} (w=${e.target.value}, b=${intercept})`);
              }}
              className="w-full accent-blue-600 cursor-pointer"
            />
            <div className="flex justify-between text-[11px] text-slate-400 mt-0.5">
              <span>완만함 (-2)</span>
              <span>가파름 (+12)</span>
            </div>
          </div>

          <div>
            <div className="flex justify-between text-sm font-medium mb-1.5">
              <span className="text-slate-700">Y절편 (편향 b - 기본 점수)</span>
              <span className="text-blue-600 font-bold">{intercept}</span>
            </div>
            <input
              type="range"
              min={0}
              max={80}
              step={0.5}
              value={intercept}
              onChange={(e) => {
                setIntercept(Number(e.target.value));
                onCompleteMission('lr-adjust', `MSE: ${mse} (w=${slope}, b=${e.target.value})`);
              }}
              className="w-full accent-blue-600 cursor-pointer"
            />
            <div className="flex justify-between text-[11px] text-slate-400 mt-0.5">
              <span>0점</span>
              <span>80점</span>
            </div>
          </div>

          <button
            type="button"
            onClick={handleAutoFit}
            disabled={isAnimating}
            className="w-full py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm flex items-center justify-center gap-2 shadow-xs transition cursor-pointer"
          >
            <Sparkles className="w-4 h-4" />
            최적 추세선 자동 학습 (최소제곱법 실행)
          </button>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-3">
          <h4 className="font-bold text-slate-800 text-sm">2. 완성한 회귀 모델로 미래 점수 예측하기</h4>
          <p className="text-xs text-slate-600">
            새로운 학생의 공부 시간을 입력하면 현재 추세선(<code className="font-mono">ŷ = {slope}x + {intercept}</code>)을 바탕으로 성적을 예측합니다.
          </p>
          <div>
            <div className="flex justify-between text-sm font-medium mb-1">
              <span className="text-slate-700">예측할 공부 시간 (x)</span>
              <span className="text-purple-700 font-bold">{testHour}시간</span>
            </div>
            <input
              type="range"
              min={0.5}
              max={10}
              step={0.5}
              value={testHour}
              onChange={(e) => setTestHour(Number(e.target.value))}
              className="w-full accent-purple-600 cursor-pointer"
            />
          </div>
          <div className="p-3 rounded-xl bg-purple-50 border border-purple-200 text-xs text-purple-900 flex items-center justify-between">
            <span>계산식: {slope} × {testHour} + {intercept}</span>
            <span className="text-sm font-bold">예측 결과: {predictedScore}점</span>
          </div>
        </div>
      </div>
    </div>
  );
};
