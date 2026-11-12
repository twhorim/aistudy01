import React, { useEffect, useRef, useState } from 'react';
import { GitBranch, Sparkles, RotateCcw, HelpCircle } from 'lucide-react';

interface TreeSample {
  id: number;
  x: number; // 주간 운동 시간 (1~10)
  y: number; // 하루 수면 시간 (1~10)
  label: 'healthy' | 'tired'; // 활력군 vs 피로군
}

const TREE_SAMPLES: TreeSample[] = [
  // 운동 충분(X >= 5) + 수면 충분(Y >= 5.5) => 활력군
  { id: 1, x: 6.2, y: 7.5, label: 'healthy' },
  { id: 2, x: 7.5, y: 8.0, label: 'healthy' },
  { id: 3, x: 8.4, y: 6.8, label: 'healthy' },
  { id: 4, x: 5.8, y: 6.2, label: 'healthy' },
  { id: 5, x: 9.0, y: 7.2, label: 'healthy' },
  { id: 6, x: 6.8, y: 8.8, label: 'healthy' },
  { id: 7, x: 7.9, y: 6.0, label: 'healthy' },
  // 운동은 많으나 수면 부족(X >= 5, Y < 5.5) => 피로군
  { id: 8, x: 6.5, y: 3.2, label: 'tired' },
  { id: 9, x: 8.0, y: 4.0, label: 'tired' },
  { id: 10, x: 7.2, y: 2.8, label: 'tired' },
  // 운동 부족(X < 5) => 대체로 피로군
  { id: 11, x: 2.0, y: 4.5, label: 'tired' },
  { id: 12, x: 3.2, y: 6.5, label: 'tired' },
  { id: 13, x: 4.1, y: 3.8, label: 'tired' },
  { id: 14, x: 2.8, y: 7.8, label: 'tired' },
  { id: 15, x: 3.9, y: 5.2, label: 'tired' },
  { id: 16, x: 1.8, y: 3.0, label: 'tired' },
];

interface Props {
  onCompleteMission: (missionId: string, metricsSummary?: string) => void;
}

export const DecisionTreeSim: React.FC<Props> = ({ onCompleteMission }) => {
  const [depth, setDepth] = useState<1 | 2>(1);
  const [split1Axis, setSplit1Axis] = useState<'x' | 'y'>('x');
  const [split1Val, setSplit1Val] = useState<number>(3.5); // 초기값은 약간 어긋나게
  const [split2Val, setSplit2Val] = useState<number>(5.3); // 2단계 보조 질문 기준값
  const [testPoint, setTestPoint] = useState<{ x: number; y: number }>({ x: 7.0, y: 7.0 });
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // 트리 규칙에 따른 예측 함수
  const predictSample = React.useCallback(
    (x: number, y: number): { pred: 'healthy' | 'tired'; path: string[] } => {
      if (split1Axis === 'x') {
        if (x < split1Val) {
          return {
            pred: 'tired',
            path: [`Q1: 운동시간(${x}) < ${split1Val} (아니오)`, '리프 노드: 피로군'],
          };
        }
        if (depth === 1) {
          return {
            pred: 'healthy',
            path: [`Q1: 운동시간(${x}) ≥ ${split1Val} (예)`, '리프 노드: 활력군'],
          };
        }
        // depth === 2: 두 번째 질문은 수면시간(y) 기준
        if (y >= split2Val) {
          return {
            pred: 'healthy',
            path: [
              `Q1: 운동(${x}) ≥ ${split1Val} (예)`,
              `Q2: 수면(${y}) ≥ ${split2Val} (예)`,
              '리프 노드: 활력군',
            ],
          };
        } else {
          return {
            pred: 'tired',
            path: [
              `Q1: 운동(${x}) ≥ ${split1Val} (예)`,
              `Q2: 수면(${y}) < ${split2Val} (아니오)`,
              '리프 노드: 피로군',
            ],
          };
        }
      } else {
        // 루트가 Y축(수면시간) 분할인 경우
        if (y < split1Val) {
          return {
            pred: 'tired',
            path: [`Q1: 수면시간(${y}) < ${split1Val} (아니오)`, '리프 노드: 피로군'],
          };
        }
        if (depth === 1) {
          return {
            pred: 'healthy',
            path: [`Q1: 수면시간(${y}) ≥ ${split1Val} (예)`, '리프 노드: 활력군'],
          };
        }
        if (x >= split2Val) {
          return {
            pred: 'healthy',
            path: [
              `Q1: 수면(${y}) ≥ ${split1Val} (예)`,
              `Q2: 운동(${x}) ≥ ${split2Val} (예)`,
              '리프 노드: 활력군',
            ],
          };
        } else {
          return {
            pred: 'tired',
            path: [
              `Q1: 수면(${y}) ≥ ${split1Val} (예)`,
              `Q2: 운동(${x}) < ${split2Val} (아니오)`,
              '리프 노드: 피로군',
            ],
          };
        }
      }
    },
    [depth, split1Axis, split1Val, split2Val]
  );

  // 정확도 및 지니 불순도 계산
  const metrics = React.useMemo(() => {
    let correct = 0;
    for (const s of TREE_SAMPLES) {
      const { pred } = predictSample(s.x, s.y);
      if (pred === s.label) correct += 1;
    }
    const accuracy = Math.round((correct / TREE_SAMPLES.length) * 100);
    return { accuracy, correct };
  }, [predictSample]);

  const testResult = React.useMemo(
    () => predictSample(testPoint.x, testPoint.y),
    [testPoint, predictSample]
  );

  // 캔버스 그리기
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const W = canvas.width;
    const H = canvas.height;
    const padLeft = 50;
    const padRight = 24;
    const padTop = 24;
    const padBottom = 40;
    const plotW = W - padLeft - padRight;
    const plotH = H - padTop - padBottom;

    const toScreenX = (x: number) => padLeft + (x / 10) * plotW;
    const toScreenY = (y: number) => padTop + ((10 - y) / 10) * plotH;

    ctx.clearRect(0, 0, W, H);

    // 영역 색상 채우기
    const step = 8;
    for (let px = padLeft; px < W - padRight; px += step) {
      for (let py = padTop; py < H - padBottom; py += step) {
        const gx = ((px - padLeft) / plotW) * 10;
        const gy = 10 - ((py - padTop) / plotH) * 10;
        const { pred } = predictSample(gx, gy);
        ctx.fillStyle =
          pred === 'healthy' ? 'rgba(16, 185, 129, 0.14)' : 'rgba(245, 158, 11, 0.14)';
        ctx.fillRect(px, py, step, step);
      }
    }

    // 격자
    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = 1;
    ctx.font = '12px Pretendard, sans-serif';
    ctx.fillStyle = '#64748b';

    for (let i = 0; i <= 10; i += 2) {
      const sx = toScreenX(i);
      ctx.beginPath();
      ctx.moveTo(sx, padTop);
      ctx.lineTo(sx, H - padBottom);
      ctx.stroke();
      ctx.fillText(`운동 ${i}`, sx - 16, H - padBottom + 20);

      const sy = toScreenY(i);
      ctx.beginPath();
      ctx.moveTo(padLeft, sy);
      ctx.lineTo(W - padRight, sy);
      ctx.stroke();
      ctx.fillText(`수면 ${i}`, 6, sy + 4);
    }

    // 1단계 분할선
    ctx.strokeStyle = '#d97706';
    ctx.lineWidth = 3;
    ctx.beginPath();
    if (split1Axis === 'x') {
      const sx = toScreenX(split1Val);
      ctx.moveTo(sx, padTop);
      ctx.lineTo(sx, H - padBottom);
    } else {
      const sy = toScreenY(split1Val);
      ctx.moveTo(padLeft, sy);
      ctx.lineTo(W - padRight, sy);
    }
    ctx.stroke();

    // 2단계 분할선 (depth === 2)
    if (depth === 2) {
      ctx.strokeStyle = '#2563eb';
      ctx.lineWidth = 2.5;
      ctx.setLineDash([6, 4]);
      ctx.beginPath();
      if (split1Axis === 'x') {
        const sx = toScreenX(split1Val);
        const sy = toScreenY(split2Val);
        ctx.moveTo(sx, sy);
        ctx.lineTo(W - padRight, sy);
      } else {
        const sy = toScreenY(split1Val);
        const sx = toScreenX(split2Val);
        ctx.moveTo(sx, padTop);
        ctx.lineTo(sx, sy);
      }
      ctx.stroke();
      ctx.setLineDash([]);
    }

    // 샘플 점 그리기
    for (const s of TREE_SAMPLES) {
      const sx = toScreenX(s.x);
      const sy = toScreenY(s.y);
      const { pred } = predictSample(s.x, s.y);
      const isCorrect = pred === s.label;

      ctx.fillStyle = s.label === 'healthy' ? '#10b981' : '#f59e0b';
      ctx.beginPath();
      ctx.arc(sx, sy, 7, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = isCorrect ? '#ffffff' : '#ef4444';
      ctx.lineWidth = isCorrect ? 2 : 2.5;
      ctx.stroke();
    }

    // 테스트 데이터 (★)
    const tx = toScreenX(testPoint.x);
    const ty = toScreenY(testPoint.y);
    ctx.fillStyle = '#4f46e5';
    ctx.beginPath();
    ctx.arc(tx, ty, 10, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2.5;
    ctx.stroke();
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 11px sans-serif';
    ctx.fillText('★', tx - 5.5, ty + 4);
  }, [depth, split1Axis, split1Val, split2Val, testPoint, predictSample]);

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const clickX = (e.clientX - rect.left) * scaleX;
    const clickY = (e.clientY - rect.top) * scaleY;

    const padLeft = 50;
    const padRight = 24;
    const padTop = 24;
    const padBottom = 40;
    const plotW = canvas.width - padLeft - padRight;
    const plotH = canvas.height - padTop - padBottom;

    const gx = ((clickX - padLeft) / plotW) * 10;
    const gy = 10 - ((clickY - padTop) / plotH) * 10;

    if (gx >= 0.5 && gx <= 9.5 && gy >= 0.5 && gy <= 9.5) {
      setTestPoint({ x: Number(gx.toFixed(1)), y: Number(gy.toFixed(1)) });
      onCompleteMission('dt-test', `깊이 ${depth} / 정확도 ${metrics.accuracy}%`);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      {/* 왼쪽 캔버스 */}
      <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
          <div>
            <span className="text-xs font-semibold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-full">
              운동 시간(X)과 수면 시간(Y) 조건 분기를 통한 건강 상태 분류
            </span>
            <h3 className="text-base font-bold text-slate-800 mt-1">
              현재 트리 깊이: <span className="text-amber-600">Depth {depth}</span> | 분류 정확도:{' '}
              <span className="text-emerald-600">{metrics.accuracy}%</span> ({metrics.correct}/
              {TREE_SAMPLES.length})
            </h3>
          </div>
          <button
            type="button"
            onClick={() => {
              setDepth(1);
              setSplit1Axis('x');
              setSplit1Val(3.5);
              setSplit2Val(5.3);
            }}
            className="inline-flex items-center gap-1 text-xs font-medium px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            초기화
          </button>
        </div>

        <div className="relative bg-slate-50 rounded-xl border border-slate-200 overflow-hidden">
          <canvas
            ref={canvasRef}
            width={620}
            height={360}
            onClick={handleCanvasClick}
            className="w-full h-auto cursor-pointer block"
          />
          <div className="flex flex-wrap items-center justify-between px-4 py-2 bg-slate-100/80 border-t border-slate-200 text-xs text-slate-600 gap-2">
            <span>캔버스를 클릭해 테스트 학생(★)의 조건 분기 경로를 확인하세요!</span>
            <div className="flex items-center gap-3">
              <span className="text-emerald-600 font-semibold">● 활력군(Healthy)</span>
              <span className="text-amber-600 font-semibold">● 피로군(Tired)</span>
            </div>
          </div>
        </div>

        {/* 시각적 의사결정트리 구조도 */}
        <div className="mt-4 p-4 rounded-xl bg-slate-50 border border-slate-200">
          <div className="text-xs font-bold text-slate-700 mb-2 flex items-center justify-between">
            <span>의사결정트리 분기 다이어그램 (★ 테스트 학생 경로 하이라이트)</span>
            <span className="text-indigo-600">★({testPoint.x}, {testPoint.y})</span>
          </div>
          <div className="flex flex-col items-center text-xs space-y-2">
            <div className="px-4 py-2 rounded-xl bg-amber-100 border-2 border-amber-400 font-bold text-amber-950 shadow-2xs">
              [루트 노드 Q1] {split1Axis === 'x' ? '운동 시간(X)' : '수면 시간(Y)'} ≥ {split1Val} 인가?
            </div>
            <div className="grid grid-cols-2 gap-6 w-full max-w-md pt-1">
              <div className="flex flex-col items-center">
                <span className="text-[11px] font-bold text-rose-600 mb-1">아니오 (No) ↓</span>
                <div className="px-3 py-2 rounded-lg bg-amber-50 border border-amber-300 font-semibold text-amber-900 text-center w-full">
                  🍂 리프 노드: <strong>피로군</strong>
                </div>
              </div>
              <div className="flex flex-col items-center">
                <span className="text-[11px] font-bold text-emerald-600 mb-1">예 (Yes) ↓</span>
                {depth === 1 ? (
                  <div className="px-3 py-2 rounded-lg bg-emerald-50 border border-emerald-300 font-semibold text-emerald-900 text-center w-full">
                    🍃 리프 노드: <strong>활력군</strong>
                  </div>
                ) : (
                  <div className="w-full flex flex-col items-center space-y-1.5">
                    <div className="px-3 py-1.5 rounded-lg bg-blue-100 border border-blue-400 font-bold text-blue-900 text-center w-full">
                      [Q2] {split1Axis === 'x' ? '수면(Y)' : '운동(X)'} ≥ {split2Val} ?
                    </div>
                    <div className="grid grid-cols-2 gap-2 w-full">
                      <div className="p-1.5 rounded bg-amber-50 border border-amber-300 text-center font-semibold text-amber-900">
                        No → 피로군
                      </div>
                      <div className="p-1.5 rounded bg-emerald-50 border border-emerald-300 text-center font-semibold text-emerald-900">
                        Yes → 활력군
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 오른쪽 조작 패널 */}
      <div className="lg:col-span-5 flex flex-col gap-4">
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
          <h4 className="font-bold text-slate-800 flex items-center gap-2">
            <GitBranch className="w-4 h-4 text-amber-600" />
            1. 질문(조건 분기) 및 트리 깊이 설정
          </h4>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">
              1단계 루트 노드 질문 속성 선택
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => {
                  setSplit1Axis('x');
                  onCompleteMission('dt-split', `루트 질문: 운동시간 ≥ ${split1Val}`);
                }}
                className={`py-2 px-3 rounded-xl text-xs font-bold border transition cursor-pointer ${
                  split1Axis === 'x'
                    ? 'bg-amber-600 text-white border-amber-600'
                    : 'bg-slate-50 text-slate-700 border-slate-200'
                }`}
              >
                운동 시간 (X축 분할)
              </button>
              <button
                type="button"
                onClick={() => {
                  setSplit1Axis('y');
                  onCompleteMission('dt-split', `루트 질문: 수면시간 ≥ ${split1Val}`);
                }}
                className={`py-2 px-3 rounded-xl text-xs font-bold border transition cursor-pointer ${
                  split1Axis === 'y'
                    ? 'bg-amber-600 text-white border-amber-600'
                    : 'bg-slate-50 text-slate-700 border-slate-200'
                }`}
              >
                수면 시간 (Y축 분할)
              </button>
            </div>
          </div>

          <div>
            <div className="flex justify-between text-sm font-medium mb-1">
              <span className="text-slate-700">
                1단계 질문 기준값 ({split1Axis === 'x' ? '운동 시간' : '수면 시간'})
              </span>
              <span className="text-amber-600 font-bold">{split1Val}시간 이상</span>
            </div>
            <input
              type="range"
              min={1.5}
              max={8.5}
              step={0.1}
              value={split1Val}
              onChange={(e) => {
                setSplit1Val(Number(e.target.value));
                onCompleteMission('dt-split', `1단계 기준값 ${e.target.value} / 정확도 ${metrics.accuracy}%`);
              }}
              className="w-full accent-amber-600 cursor-pointer"
            />
          </div>

          <div className="pt-2 border-t border-slate-100">
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">
              트리 깊이 (질문 단계 수)
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setDepth(1)}
                className={`py-2 rounded-xl text-xs font-bold border transition cursor-pointer ${
                  depth === 1
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'bg-slate-50 text-slate-700 border-slate-200'
                }`}
              >
                Depth 1 (질문 1개)
              </button>
              <button
                type="button"
                onClick={() => {
                  setDepth(2);
                  onCompleteMission('dt-depth', `깊이 2 확장 / 정확도 ${metrics.accuracy}%`);
                }}
                className={`py-2 rounded-xl text-xs font-bold border transition cursor-pointer ${
                  depth === 2
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'bg-slate-50 text-slate-700 border-slate-200'
                }`}
              >
                Depth 2 (질문 2개 연쇄)
              </button>
            </div>
          </div>

          {depth === 2 && (
            <div>
              <div className="flex justify-between text-sm font-medium mb-1">
                <span className="text-slate-700">
                  2단계 질문 기준값 ({split1Axis === 'x' ? '수면 시간' : '운동 시간'})
                </span>
                <span className="text-blue-600 font-bold">{split2Val}시간 이상</span>
              </div>
              <input
                type="range"
                min={2.0}
                max={8.5}
                step={0.1}
                value={split2Val}
                onChange={(e) => setSplit2Val(Number(e.target.value))}
                className="w-full accent-blue-600 cursor-pointer"
              />
            </div>
          )}

          <button
            type="button"
            onClick={() => {
              setSplit1Axis('x');
              setSplit1Val(5.0);
              setDepth(2);
              setSplit2Val(5.3);
              onCompleteMission('dt-split');
              onCompleteMission('dt-depth', '최적 의사결정트리 완성 (정확도 100%)');
            }}
            className="w-full py-2.5 px-4 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-semibold text-sm flex items-center justify-center gap-2 transition cursor-pointer"
          >
            <Sparkles className="w-4 h-4" />
            최적 의사결정트리 자동 생성 (불순도 최소화)
          </button>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-2">
          <h4 className="font-bold text-slate-800 text-sm flex items-center gap-1.5">
            <HelpCircle className="w-4 h-4 text-indigo-600" />
            2. ★({testPoint.x}, {testPoint.y}) 데이터 스무고개 판정 과정
          </h4>
          <div className="space-y-1.5 pt-1">
            {testResult.path.map((stepText, i) => (
              <div
                key={i}
                className="px-3 py-2 rounded-lg bg-slate-50 border border-slate-200 text-xs font-medium text-slate-800"
              >
                {i + 1}단계: {stepText}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
