import React, { useEffect, useRef, useState } from 'react';
import { Play, StepForward, RotateCcw, PlusCircle, CheckCircle2 } from 'lucide-react';

interface UnlabeledPoint {
  x: number;
  y: number;
  cluster: number; // -1: 미배정, 0 ~ K-1: 배정된 군집 번호
}

interface Centroid {
  x: number;
  y: number;
  prevX?: number;
  prevY?: number;
}

const CLUSTER_COLORS = ['#8b5cf6', '#10b981', '#f59e0b', '#ef4444'];

const INITIAL_RAW_POINTS: Array<{ x: number; y: number }> = [
  // 좌하단 그룹
  { x: 2.0, y: 2.2 },
  { x: 2.6, y: 2.8 },
  { x: 1.8, y: 3.1 },
  { x: 2.9, y: 1.9 },
  { x: 3.2, y: 2.6 },
  { x: 2.3, y: 3.5 },
  // 우하단 그룹
  { x: 7.4, y: 2.3 },
  { x: 8.1, y: 2.9 },
  { x: 7.8, y: 1.8 },
  { x: 8.6, y: 2.4 },
  { x: 6.9, y: 2.7 },
  { x: 7.6, y: 3.4 },
  // 상단 중앙 그룹
  { x: 4.8, y: 7.6 },
  { x: 5.4, y: 8.2 },
  { x: 5.9, y: 7.3 },
  { x: 4.4, y: 6.9 },
  { x: 5.2, y: 6.8 },
  { x: 6.1, y: 8.0 },
];

function makeInitialCentroids(k: number): Centroid[] {
  // 일부러 한쪽에 치우친 초기 중심점을 배치하여 이동 과정이 극적으로 보이도록 함
  const presets: Centroid[] = [
    { x: 1.5, y: 7.5 },
    { x: 8.2, y: 7.8 },
    { x: 5.0, y: 1.5 },
    { x: 5.0, y: 5.0 },
  ];
  return presets.slice(0, k);
}

interface Props {
  onCompleteMission: (missionId: string, metricsSummary?: string) => void;
}

export const KMeansSim: React.FC<Props> = ({ onCompleteMission }) => {
  const [kCount, setKCount] = useState<number>(3);
  const [points, setPoints] = useState<UnlabeledPoint[]>(() =>
    INITIAL_RAW_POINTS.map((p) => ({ ...p, cluster: -1 }))
  );
  const [centroids, setCentroids] = useState<Centroid[]>(() => makeInitialCentroids(3));
  const [stepCount, setStepCount] = useState<number>(0);
  const [nextPhase, setNextPhase] = useState<'assign' | 'move'>('assign');
  const [converged, setConverged] = useState<boolean>(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const resetWithK = (newK: number, randomize = false) => {
    setKCount(newK);
    setPoints((prev) => prev.map((p) => ({ ...p, cluster: -1 })));
    if (randomize) {
      const rand: Centroid[] = Array.from({ length: newK }, () => ({
        x: Number((1.5 + Math.random() * 7.0).toFixed(1)),
        y: Number((1.5 + Math.random() * 7.0).toFixed(1)),
      }));
      setCentroids(rand);
    } else {
      setCentroids(makeInitialCentroids(newK));
    }
    setStepCount(0);
    setNextPhase('assign');
    setConverged(false);
    onCompleteMission('km-init', `K=${newK} 초기 중심점 설정`);
  };

  // 한 단계 진행 (데이터 배정 <-> 중심점 이동)
  const executeSingleStep = () => {
    if (converged) return;

    if (nextPhase === 'assign') {
      // 각 데이터를 가장 가까운 중심점 클러스터에 배정
      const updated = points.map((pt) => {
        let bestCluster = 0;
        let minDist = Infinity;
        centroids.forEach((c, idx) => {
          const d = Math.hypot(pt.x - c.x, pt.y - c.y);
          if (d < minDist) {
            minDist = d;
            bestCluster = idx;
          }
        });
        return { ...pt, cluster: bestCluster };
      });
      setPoints(updated);
      setNextPhase('move');
      setStepCount((s) => s + 1);
    } else {
      // 각 군집에 속한 데이터의 평균 위치로 중심점 이동
      let maxShift = 0;
      const newCentroids = centroids.map((c, idx) => {
        const members = points.filter((p) => p.cluster === idx);
        if (members.length === 0) return c;
        const avgX = Number(
          (members.reduce((sum, m) => sum + m.x, 0) / members.length).toFixed(2)
        );
        const avgY = Number(
          (members.reduce((sum, m) => sum + m.y, 0) / members.length).toFixed(2)
        );
        const shift = Math.hypot(avgX - c.x, avgY - c.y);
        if (shift > maxShift) maxShift = shift;
        return { x: avgX, y: avgY, prevX: c.x, prevY: c.y };
      });

      setCentroids(newCentroids);
      setNextPhase('assign');
      setStepCount((s) => s + 1);

      if (maxShift < 0.05) {
        setConverged(true);
        onCompleteMission('km-step', `K=${kCount} 군집화 수렴 완료 (${stepCount + 1}단계)`);
      }
    }
  };

  // 수렴할 때까지 자동 실행
  const runToConvergence = () => {
    let currPts = [...points];
    let currCents = [...centroids];
    let loops = 0;

    while (loops < 15) {
      loops += 1;
      // 1. 배정
      currPts = currPts.map((pt) => {
        let best = 0;
        let minD = Infinity;
        currCents.forEach((c, idx) => {
          const d = Math.hypot(pt.x - c.x, pt.y - c.y);
          if (d < minD) {
            minD = d;
            best = idx;
          }
        });
        return { ...pt, cluster: best };
      });

      // 2. 이동
      let maxShift = 0;
      currCents = currCents.map((c, idx) => {
        const members = currPts.filter((p) => p.cluster === idx);
        if (members.length === 0) return c;
        const avgX = Number(
          (members.reduce((sum, m) => sum + m.x, 0) / members.length).toFixed(2)
        );
        const avgY = Number(
          (members.reduce((sum, m) => sum + m.y, 0) / members.length).toFixed(2)
        );
        const shift = Math.hypot(avgX - c.x, avgY - c.y);
        if (shift > maxShift) maxShift = shift;
        return { x: avgX, y: avgY, prevX: c.x, prevY: c.y };
      });

      if (maxShift < 0.05) break;
    }

    setPoints(currPts);
    setCentroids(currCents);
    setStepCount((s) => s + loops * 2);
    setConverged(true);
    onCompleteMission('km-init');
    onCompleteMission('km-step', `K=${kCount} 자동 수렴 완료`);
  };

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

    // 보로노이(Voronoi) 스타일 군집 영역 배경 표시 (데이터 배정 후)
    if (points.some((p) => p.cluster >= 0)) {
      const step = 10;
      for (let px = padLeft; px < W - padRight; px += step) {
        for (let py = padTop; py < H - padBottom; py += step) {
          const gx = ((px - padLeft) / plotW) * 10;
          const gy = 10 - ((py - padTop) / plotH) * 10;
          let best = 0;
          let minD = Infinity;
          centroids.forEach((c, idx) => {
            const d = Math.hypot(gx - c.x, gy - c.y);
            if (d < minD) {
              minD = d;
              best = idx;
            }
          });
          ctx.fillStyle = `${CLUSTER_COLORS[best]}18`;
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
      ctx.fillText(`특성X ${i}`, sx - 18, H - padBottom + 20);

      const sy = toScreenY(i);
      ctx.beginPath();
      ctx.moveTo(padLeft, sy);
      ctx.lineTo(W - padRight, sy);
      ctx.stroke();
      ctx.fillText(`특성Y ${i}`, 4, sy + 4);
    }

    // 데이터와 소속 중심점 연결선
    for (const pt of points) {
      if (pt.cluster >= 0 && centroids[pt.cluster]) {
        const c = centroids[pt.cluster];
        ctx.strokeStyle = `${CLUSTER_COLORS[pt.cluster]}66`;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(toScreenX(pt.x), toScreenY(pt.y));
        ctx.lineTo(toScreenX(c.x), toScreenY(c.y));
        ctx.stroke();
      }
    }

    // 데이터 점 그리기
    for (const pt of points) {
      const sx = toScreenX(pt.x);
      const sy = toScreenY(pt.y);
      ctx.fillStyle = pt.cluster >= 0 ? CLUSTER_COLORS[pt.cluster] : '#94a3b8';
      ctx.beginPath();
      ctx.arc(sx, sy, 6.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.stroke();
    }

    // 중심점 (Centroid) 그리기 (이전 위치 화살표 흔적 포함)
    centroids.forEach((c, idx) => {
      const cx = toScreenX(c.x);
      const cy = toScreenY(c.y);

      if (c.prevX !== undefined && c.prevY !== undefined) {
        const px = toScreenX(c.prevX);
        const py = toScreenY(c.prevY);
        ctx.strokeStyle = CLUSTER_COLORS[idx];
        ctx.setLineDash([3, 3]);
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(px, py);
        ctx.lineTo(cx, cy);
        ctx.stroke();
        ctx.setLineDash([]);
      }

      ctx.fillStyle = CLUSTER_COLORS[idx];
      ctx.beginPath();
      ctx.arc(cx, cy, 12, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#0f172a';
      ctx.lineWidth = 3;
      ctx.stroke();

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 12px sans-serif';
      ctx.fillText(`C${idx + 1}`, cx - 8, cy + 4);
    });
  }, [points, centroids]);

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
      setPoints((prev) => [
        ...prev,
        { x: Number(gx.toFixed(1)), y: Number(gy.toFixed(1)), cluster: -1 },
      ]);
      setConverged(false);
      setNextPhase('assign');
      onCompleteMission('km-add', `데이터 ${points.length + 1}개 / K=${kCount}`);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      {/* 왼쪽 캔버스 */}
      <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
          <div>
            <span className="text-xs font-semibold text-purple-700 bg-purple-50 px-2.5 py-1 rounded-full">
              정답 레이블이 없는 학생 체력 데이터의 비지도 군집화
            </span>
            <h3 className="text-base font-bold text-slate-800 mt-1 flex items-center gap-2">
              군집 수 K={kCount} | 진행 단계: {stepCount}회
              {converged && (
                <span className="inline-flex items-center gap-1 text-xs font-bold bg-emerald-100 text-emerald-700 px-2.5 py-0.5 rounded-full">
                  <CheckCircle2 className="w-3.5 h-3.5" /> 수렴 완료!
                </span>
              )}
            </h3>
          </div>
          <button
            type="button"
            onClick={() => {
              setPoints(INITIAL_RAW_POINTS.map((p) => ({ ...p, cluster: -1 })));
              resetWithK(3, false);
            }}
            className="inline-flex items-center gap-1 text-xs font-medium px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            전체 초기화
          </button>
        </div>

        <div className="relative bg-slate-50 rounded-xl border border-slate-200 overflow-hidden">
          <canvas
            ref={canvasRef}
            width={620}
            height={380}
            onClick={handleCanvasClick}
            className="w-full h-auto cursor-crosshair block"
          />
          <div className="flex flex-wrap items-center justify-between px-4 py-2 bg-slate-100/80 border-t border-slate-200 text-xs text-slate-600 gap-2">
            <span className="inline-flex items-center gap-1.5">
              <PlusCircle className="w-3.5 h-3.5 text-purple-600" />
              캔버스 빈 곳을 클릭하면 <strong>정답 없는 새 데이터(회색 점)</strong>가 추가됩니다.
            </span>
            <span>큰 원(C1~C{kCount}) = 각 군집의 중심점(Centroid)</span>
          </div>
        </div>
      </div>

      {/* 오른쪽 조작부 */}
      <div className="lg:col-span-5 flex flex-col gap-4">
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
          <h4 className="font-bold text-slate-800 text-sm">
            1. 군집 개수(K) 설정 및 초기 중심점 배치
          </h4>
          <div className="grid grid-cols-3 gap-2">
            {[2, 3, 4].map((k) => (
              <button
                key={k}
                type="button"
                onClick={() => resetWithK(k, false)}
                className={`py-2.5 rounded-xl font-bold text-sm border transition cursor-pointer ${
                  kCount === k
                    ? 'bg-purple-600 text-white border-purple-600'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                K = {k}개 군집
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={() => resetWithK(kCount, true)}
            className="w-full py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition cursor-pointer"
          >
            🎲 초기 중심점(Centroid) 무작위 위치에 새로 찍기
          </button>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
          <h4 className="font-bold text-slate-800 text-sm">
            2. K-Means 알고리즘 단계별 실행
          </h4>
          <div className="p-3 rounded-xl bg-purple-50 border border-purple-200 text-xs text-purple-900 space-y-1">
            <div className="font-bold">
              {converged
                ? '🎉 중심점이 더 이상 이동하지 않고 수렴했습니다!'
                : nextPhase === 'assign'
                ? '👉 다음 차례: [1단계] 각 데이터를 가장 가까운 중심점 색깔로 배정하기'
                : '👉 다음 차례: [2단계] 같은 색깔 데이터들의 평균 좌표로 중심점(C) 이동하기'}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-2.5">
            <button
              type="button"
              onClick={executeSingleStep}
              disabled={converged}
              className={`w-full py-2.5 px-4 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition cursor-pointer ${
                converged
                  ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                  : 'bg-purple-600 hover:bg-purple-700 text-white shadow-xs'
              }`}
            >
              <StepForward className="w-4 h-4" />
              {nextPhase === 'assign'
                ? '다음 단계: 가까운 중심점에 데이터 배정'
                : '다음 단계: 군집 평균 위치로 중심점 이동'}
            </button>

            <button
              type="button"
              onClick={runToConvergence}
              disabled={converged}
              className={`w-full py-2.5 px-4 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 border transition cursor-pointer ${
                converged
                  ? 'bg-slate-50 text-slate-400 border-slate-200 cursor-not-allowed'
                  : 'bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border-indigo-200'
              }`}
            >
              <Play className="w-4 h-4" />
              수렴할 때까지 한 번에 자동 실행
            </button>
          </div>

          <div className="pt-2 border-t border-slate-100 space-y-1.5">
            <div className="text-xs font-semibold text-slate-600">현재 군집별 중심점 좌표 및 소속 데이터 수</div>
            {centroids.map((c, idx) => {
              const count = points.filter((p) => p.cluster === idx).length;
              return (
                <div
                  key={idx}
                  className="flex items-center justify-between text-xs px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200"
                >
                  <span className="font-bold" style={{ color: CLUSTER_COLORS[idx] }}>
                    ● 군집 C{idx + 1} 중심점
                  </span>
                  <span className="font-mono text-slate-700">
                    ({c.x}, {c.y}) · 데이터 {count}개
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
