import React, { useEffect, useRef, useState } from 'react';
import { Compass, Layers, MapPin, RotateCcw } from 'lucide-react';

interface FruitSample {
  id: number;
  x: number; // 당도 (1~10)
  y: number; // 크기 (1~10)
  label: 'apple' | 'tangerine';
}

const INITIAL_FRUITS: FruitSample[] = [
  // 사과 (대체로 크기가 크고 당도가 중간~높음)
  { id: 1, x: 5.8, y: 7.5, label: 'apple' },
  { id: 2, x: 6.8, y: 8.2, label: 'apple' },
  { id: 3, x: 7.5, y: 6.8, label: 'apple' },
  { id: 4, x: 8.2, y: 7.9, label: 'apple' },
  { id: 5, x: 6.2, y: 6.4, label: 'apple' },
  { id: 6, x: 7.1, y: 5.8, label: 'apple' },
  // 경계 근처 노이즈성 데이터 (K=1과 K=5의 차이를 체감하기 좋음)
  { id: 7, x: 4.9, y: 4.8, label: 'apple' },
  // 한라봉/귤 (대체로 크기가 작거나 당도가 다양함)
  { id: 8, x: 2.5, y: 3.2, label: 'tangerine' },
  { id: 9, x: 3.4, y: 4.1, label: 'tangerine' },
  { id: 10, x: 4.2, y: 3.5, label: 'tangerine' },
  { id: 11, x: 3.8, y: 5.2, label: 'tangerine' },
  { id: 12, x: 5.2, y: 3.9, label: 'tangerine' },
  { id: 13, x: 4.5, y: 5.5, label: 'tangerine' },
  { id: 14, x: 6.0, y: 4.2, label: 'tangerine' },
];

interface Props {
  onCompleteMission: (missionId: string, metricsSummary?: string) => void;
}

export const KnnSim: React.FC<Props> = ({ onCompleteMission }) => {
  const [samples, setSamples] = useState<FruitSample[]>(INITIAL_FRUITS);
  const [kValue, setKValue] = useState<number>(3);
  const [testedKSet, setTestedKSet] = useState<number[]>([3]);
  const [metric, setMetric] = useState<'euclidean' | 'manhattan'>('euclidean');
  const [showBoundary, setShowBoundary] = useState<boolean>(false);
  const [target, setTarget] = useState<{ x: number; y: number }>({ x: 5.0, y: 4.9 });
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const calcDist = React.useCallback(
    (ax: number, ay: number, bx: number, by: number) => {
      if (metric === 'manhattan') {
        return Math.abs(ax - bx) + Math.abs(ay - by);
      }
      return Math.hypot(ax - bx, ay - by);
    },
    [metric]
  );

  // 가까운 K개 이웃 계산
  const neighborsInfo = React.useMemo(() => {
    const withDist = samples.map((s) => ({
      ...s,
      dist: calcDist(target.x, target.y, s.x, s.y),
    }));
    withDist.sort((a, b) => a.dist - b.dist);
    const nearest = withDist.slice(0, kValue);
    const appleVotes = nearest.filter((n) => n.label === 'apple').length;
    const tangerineVotes = nearest.length - appleVotes;
    const winner: 'apple' | 'tangerine' = appleVotes >= tangerineVotes ? 'apple' : 'tangerine';
    const maxRadius = nearest.length > 0 ? nearest[nearest.length - 1].dist : 0;

    return { nearest, appleVotes, tangerineVotes, winner, maxRadius };
  }, [samples, target, kValue, calcDist]);

  // 캔버스 렌더링
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const W = canvas.width;
    const H = canvas.height;
    const padLeft = 48;
    const padRight = 24;
    const padTop = 24;
    const padBottom = 40;
    const plotW = W - padLeft - padRight;
    const plotH = H - padTop - padBottom;

    const toScreenX = (x: number) => padLeft + (x / 10) * plotW;
    const toScreenY = (y: number) => padTop + ((10 - y) / 10) * plotH;

    ctx.clearRect(0, 0, W, H);

    // 결정 경계 배경 히트맵
    if (showBoundary) {
      const step = 10;
      for (let px = padLeft; px < W - padRight; px += step) {
        for (let py = padTop; py < H - padBottom; py += step) {
          const gx = ((px - padLeft) / plotW) * 10;
          const gy = 10 - ((py - padTop) / plotH) * 10;
          const dists = samples
            .map((s) => ({ label: s.label, d: calcDist(gx, gy, s.x, s.y) }))
            .sort((a, b) => a.d - b.d)
            .slice(0, kValue);
          const apples = dists.filter((d) => d.label === 'apple').length;
          ctx.fillStyle =
            apples > kValue / 2 ? 'rgba(239, 68, 68, 0.13)' : 'rgba(245, 158, 11, 0.14)';
          ctx.fillRect(px, py, step, step);
        }
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
      ctx.fillText(`당도 ${i}`, sx - 16, H - padBottom + 20);

      const sy = toScreenY(i);
      ctx.beginPath();
      ctx.moveTo(padLeft, sy);
      ctx.lineTo(W - padRight, sy);
      ctx.stroke();
      ctx.fillText(`크기 ${i}`, 6, sy + 4);
    }

    const tx = toScreenX(target.x);
    const ty = toScreenY(target.y);

    // K번째 이웃까지의 탐색 반경 표시
    if (neighborsInfo.maxRadius > 0 && metric === 'euclidean') {
      const rx = (neighborsInfo.maxRadius / 10) * plotW;
      const ry = (neighborsInfo.maxRadius / 10) * plotH;
      ctx.strokeStyle = 'rgba(79, 70, 229, 0.35)';
      ctx.fillStyle = 'rgba(79, 70, 229, 0.05)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.ellipse(tx, ty, rx, ry, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    }

    // K개 최근접 이웃 연결선
    for (const nb of neighborsInfo.nearest) {
      const nx = toScreenX(nb.x);
      const ny = toScreenY(nb.y);
      ctx.strokeStyle = nb.label === 'apple' ? '#ef4444' : '#f59e0b';
      ctx.lineWidth = 2.2;
      ctx.setLineDash([4, 3]);
      ctx.beginPath();
      ctx.moveTo(tx, ty);
      ctx.lineTo(nx, ny);
      ctx.stroke();
      ctx.setLineDash([]);
    }

    // 기존 과일 데이터 점
    for (const s of samples) {
      const sx = toScreenX(s.x);
      const sy = toScreenY(s.y);
      const isSelected = neighborsInfo.nearest.some((n) => n.id === s.id);

      ctx.fillStyle = s.label === 'apple' ? '#ef4444' : '#f59e0b';
      ctx.beginPath();
      ctx.arc(sx, sy, isSelected ? 8.5 : 6.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = isSelected ? '#1e1b4b' : '#ffffff';
      ctx.lineWidth = isSelected ? 2.5 : 1.5;
      ctx.stroke();
    }

    // 타겟 데이터 (★ 모양 대신 눈에 잘 띄는 보라색 링+중심점)
    ctx.fillStyle = neighborsInfo.winner === 'apple' ? '#ef4444' : '#f59e0b';
    ctx.beginPath();
    ctx.arc(tx, ty, 11, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#1e1b4b';
    ctx.lineWidth = 3;
    ctx.stroke();

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 11px sans-serif';
    ctx.fillText('★', tx - 5.5, ty + 4);
  }, [samples, target, kValue, metric, showBoundary, neighborsInfo, calcDist]);

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const clickX = (e.clientX - rect.left) * scaleX;
    const clickY = (e.clientY - rect.top) * scaleY;

    const padLeft = 48;
    const padRight = 24;
    const padTop = 24;
    const padBottom = 40;
    const plotW = canvas.width - padLeft - padRight;
    const plotH = canvas.height - padTop - padBottom;

    const gx = ((clickX - padLeft) / plotW) * 10;
    const gy = 10 - ((clickY - padTop) / plotH) * 10;

    if (gx >= 0.5 && gx <= 9.5 && gy >= 0.5 && gy <= 9.5) {
      setTarget({ x: Number(gx.toFixed(1)), y: Number(gy.toFixed(1)) });
      onCompleteMission(
        'knn-place',
        `K=${kValue} (${metric === 'euclidean' ? '유클리드' : '맨해튼'}) / 예측: ${
          neighborsInfo.winner === 'apple' ? '사과' : '한라봉'
        }`
      );
    }
  };

  const handleSelectK = (k: number) => {
    setKValue(k);
    const nextSet = Array.from(new Set([...testedKSet, k]));
    setTestedKSet(nextSet);
    if (nextSet.length >= 2) {
      onCompleteMission('knn-change-k', `K=${k} 실험 완료 (${nextSet.join(', ')} 비교)`);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      {/* 왼쪽 캔버스 */}
      <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
          <div>
            <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full">
              과일 당도(X)와 크기(Y)를 이용한 품종 다수결 분류
            </span>
            <h3 className="text-base font-bold text-slate-800 mt-1">
              가장 가까운 이웃 <span className="text-emerald-600">{kValue}개(K={kValue})</span>의 다수결 투표
            </h3>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                const next = !showBoundary;
                setShowBoundary(next);
                if (next) {
                  onCompleteMission('knn-boundary', `결정 경계 확인 완료 (K=${kValue})`);
                }
              }}
              className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg border transition cursor-pointer ${
                showBoundary
                  ? 'bg-emerald-600 text-white border-emerald-600'
                  : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              결정 경계 배경 {showBoundary ? '켜짐' : '보기'}
            </button>
            <button
              type="button"
              onClick={() => {
                setSamples(INITIAL_FRUITS);
                setTarget({ x: 5.0, y: 4.9 });
                setKValue(3);
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
            className="w-full h-auto cursor-pointer block"
          />
          <div className="flex flex-wrap items-center justify-between px-4 py-2 bg-slate-100/80 border-t border-slate-200 text-xs text-slate-600 gap-2">
            <span className="inline-flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-indigo-600" />
              캔버스 원하는 위치를 클릭해 <strong>새로운 과일(★)</strong>을 배치해보세요!
            </span>
            <div className="flex items-center gap-3">
              <span className="inline-flex items-center gap-1 font-medium text-red-600">
                ● 사과(Apple)
              </span>
              <span className="inline-flex items-center gap-1 font-medium text-amber-600">
                ● 한라봉(Tangerine)
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 오른쪽 조작 패널 */}
      <div className="lg:col-span-5 flex flex-col gap-4">
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
          <h4 className="font-bold text-slate-800 flex items-center gap-2">
            <Compass className="w-4 h-4 text-emerald-600" />
            1. 하이퍼파라미터 K값 및 거리 측정 방식
          </h4>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-2">
              이웃의 개수 (K값 선택 — 홀수 권장)
            </label>
            <div className="grid grid-cols-4 gap-2">
              {[1, 3, 5, 7].map((k) => (
                <button
                  key={k}
                  type="button"
                  onClick={() => handleSelectK(k)}
                  className={`py-2.5 rounded-xl font-bold text-sm border transition cursor-pointer ${
                    kValue === k
                      ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  K = {k}
                </button>
              ))}
            </div>
            <p className="text-xs text-slate-500 mt-2">
              팁: 기본 위치(5.0, 4.9)에서 <strong>K=1</strong>일 때와 <strong>K=3, 5</strong>일 때 분류 결과가 어떻게 달라지는지 비교해보세요!
            </p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-2">
              거리 계산 공식 선택
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => {
                  setMetric('euclidean');
                  onCompleteMission('knn-boundary', `유클리드 거리 / K=${kValue}`);
                }}
                className={`py-2 px-3 rounded-xl text-xs font-semibold border transition cursor-pointer ${
                  metric === 'euclidean'
                    ? 'bg-indigo-600 text-white border-indigo-600'
                    : 'bg-slate-50 text-slate-700 border-slate-200'
                }`}
              >
                유클리드 거리 (직선 거리)
              </button>
              <button
                type="button"
                onClick={() => {
                  setMetric('manhattan');
                  onCompleteMission('knn-boundary', `맨해튼 거리 / K=${kValue}`);
                }}
                className={`py-2 px-3 rounded-xl text-xs font-semibold border transition cursor-pointer ${
                  metric === 'manhattan'
                    ? 'bg-indigo-600 text-white border-indigo-600'
                    : 'bg-slate-50 text-slate-700 border-slate-200'
                }`}
              >
                맨해튼 거리 (격자 이동 거리)
              </button>
            </div>
          </div>
        </div>

        {/* 다수결 투표 결과 카드 */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-bold text-slate-800 text-sm">
              2. ★({target.x}, {target.y}) 주변 K={kValue} 투표 결과
            </h4>
            <span
              className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                neighborsInfo.winner === 'apple'
                  ? 'bg-red-100 text-red-700'
                  : 'bg-amber-100 text-amber-800'
              }`}
            >
              최종 판정: {neighborsInfo.winner === 'apple' ? '🍎 사과' : '🍊 한라봉'}
            </span>
          </div>

          <div className="space-y-2">
            <div>
              <div className="flex justify-between text-xs font-semibold text-red-600 mb-1">
                <span>🍎 사과 (Apple)</span>
                <span>{neighborsInfo.appleVotes}표</span>
              </div>
              <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-red-500 transition-all duration-300"
                  style={{ width: `${(neighborsInfo.appleVotes / kValue) * 100}%` }}
                />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-xs font-semibold text-amber-600 mb-1">
                <span>🍊 한라봉 (Tangerine)</span>
                <span>{neighborsInfo.tangerineVotes}표</span>
              </div>
              <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-amber-500 transition-all duration-300"
                  style={{ width: `${(neighborsInfo.tangerineVotes / kValue) * 100}%` }}
                />
              </div>
            </div>
          </div>

          <div className="bg-slate-50 rounded-xl p-3 border border-slate-200">
            <div className="text-xs font-semibold text-slate-600 mb-1.5">
              가장 가까운 {kValue}개 이웃 목록 (거리순)
            </div>
            <div className="space-y-1 max-h-28 overflow-y-auto text-xs">
              {neighborsInfo.nearest.map((n, idx) => (
                <div key={n.id} className="flex items-center justify-between text-slate-700">
                  <span>
                    {idx + 1}위: {n.label === 'apple' ? '🍎 사과' : '🍊 한라봉'} ({n.x}, {n.y})
                  </span>
                  <span className="font-mono font-semibold text-slate-900">
                    거리 {n.dist.toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
