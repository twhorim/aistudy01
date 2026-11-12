import React, { useEffect, useRef, useState } from 'react';
import { Cpu, Sparkles, CheckCircle2, XCircle, Layers } from 'lucide-react';

type GateType = 'AND' | 'OR' | 'NAND' | 'XOR';

const GATE_TARGETS: Record<GateType, number[]> = {
  AND: [0, 0, 0, 1],
  OR: [0, 1, 1, 1],
  NAND: [1, 1, 1, 0],
  XOR: [0, 1, 1, 0],
};

const INPUT_PAIRS: Array<[number, number]> = [
  [0, 0],
  [0, 1],
  [1, 0],
  [1, 1],
];

interface Props {
  onCompleteMission: (missionId: string, metricsSummary?: string) => void;
}

export const PerceptronSim: React.FC<Props> = ({ onCompleteMission }) => {
  const [gate, setGate] = useState<GateType>('AND');
  const [x1, setX1] = useState<number>(1);
  const [x2, setX2] = useState<number>(1);
  const [w1, setW1] = useState<number>(0.4); // 초기에는 AND를 통과하지 못하는 값으로 시작
  const [w2, setW2] = useState<number>(0.4);
  const [bias, setBias] = useState<number>(-0.2);
  const [useHiddenLayerForXor, setUseHiddenLayerForXor] = useState<boolean>(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const calcSinglePerceptron = React.useCallback(
    (in1: number, in2: number) => {
      const z = Number((in1 * w1 + in2 * w2 + bias).toFixed(2));
      const out = z >= 0 ? 1 : 0;
      return { z, out };
    },
    [w1, w2, bias]
  );

  // 다층 퍼셉트론 (은닉층: h1=NAND, h2=OR -> 출력=AND)
  const calcMlpXor = (in1: number, in2: number) => {
    const h1 = -1.0 * in1 + -1.0 * in2 + 1.5 >= 0 ? 1 : 0; // NAND
    const h2 = 1.0 * in1 + 1.0 * in2 - 0.5 >= 0 ? 1 : 0; // OR
    const zOut = 1.0 * h1 + 1.0 * h2 - 1.5;
    const out = zOut >= 0 ? 1 : 0; // AND(h1, h2) = XOR
    return { h1, h2, z: Number(zOut.toFixed(2)), out };
  };

  const currentSignal =
    gate === 'XOR' && useHiddenLayerForXor
      ? calcMlpXor(x1, x2)
      : calcSinglePerceptron(x1, x2);

  // 진리표 4개 조합 평가
  const truthEvaluation = React.useMemo(() => {
    const targets = GATE_TARGETS[gate];
    const rows = INPUT_PAIRS.map(([in1, in2], idx) => {
      const res =
        gate === 'XOR' && useHiddenLayerForXor
          ? calcMlpXor(in1, in2)
          : calcSinglePerceptron(in1, in2);
      const target = targets[idx];
      return {
        in1,
        in2,
        z: res.z,
        pred: res.out,
        target,
        correct: res.out === target,
      };
    });
    const allCorrect = rows.every((r) => r.correct);
    return { rows, allCorrect };
  }, [gate, useHiddenLayerForXor, calcSinglePerceptron]);

  useEffect(() => {
    if (truthEvaluation.allCorrect && (gate === 'AND' || gate === 'OR' || gate === 'NAND')) {
      onCompleteMission('pc-gate', `${gate} 게이트 100% 완성 (w1=${w1}, w2=${w2}, b=${bias})`);
    }
    if (gate === 'XOR' && useHiddenLayerForXor) {
      onCompleteMission('pc-xor', '다층 퍼셉트론(은닉층)으로 XOR 해결 확인');
    }
  }, [truthEvaluation.allCorrect, gate, useHiddenLayerForXor, w1, w2, bias, onCompleteMission]);

  // 2D 결정 경계 캔버스 렌더링
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const W = canvas.width;
    const H = canvas.height;
    const pad = 44;
    const plotW = W - pad * 2;
    const plotH = H - pad * 2;

    // 좌표계: -0.3 ~ 1.3
    const toScreenX = (v: number) => pad + ((v + 0.3) / 1.6) * plotW;
    const toScreenY = (v: number) => pad + ((1.3 - v) / 1.6) * plotH;

    ctx.clearRect(0, 0, W, H);

    // 영역 색상 표시
    const step = 6;
    for (let px = pad; px < W - pad; px += step) {
      for (let py = pad; py < H - pad; py += step) {
        const gx = ((px - pad) / plotW) * 1.6 - 0.3;
        const gy = 1.3 - ((py - pad) / plotH) * 1.6;
        let active = false;
        if (gate === 'XOR' && useHiddenLayerForXor) {
          const h1 = -1.0 * gx + -1.0 * gy + 1.5 >= 0 ? 1 : 0;
          const h2 = 1.0 * gx + 1.0 * gy - 0.5 >= 0 ? 1 : 0;
          active = h1 + h2 - 1.5 >= 0;
        } else {
          active = gx * w1 + gy * w2 + bias >= 0;
        }
        ctx.fillStyle = active ? 'rgba(16, 185, 129, 0.16)' : 'rgba(244, 63, 94, 0.10)';
        ctx.fillRect(px, py, step, step);
      }
    }

    // 축 그리기
    ctx.strokeStyle = '#cbd5e1';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(toScreenX(0), pad);
    ctx.lineTo(toScreenX(0), H - pad);
    ctx.moveTo(pad, toScreenY(0));
    ctx.lineTo(W - pad, toScreenY(0));
    ctx.stroke();

    // 직선 결정 경계 그리기
    if (gate === 'XOR' && useHiddenLayerForXor) {
      // 은닉층 2개의 직선 표시
      ctx.strokeStyle = '#6366f1';
      ctx.lineWidth = 2.5;
      ctx.setLineDash([5, 4]);
      // 직선 1: x1 + x2 = 1.5
      ctx.beginPath();
      ctx.moveTo(toScreenX(0.2), toScreenY(1.3));
      ctx.lineTo(toScreenX(1.3), toScreenY(0.2));
      ctx.stroke();
      // 직선 2: x1 + x2 = 0.5
      ctx.beginPath();
      ctx.moveTo(toScreenX(-0.3), toScreenY(0.8));
      ctx.lineTo(toScreenX(0.8), toScreenY(-0.3));
      ctx.stroke();
      ctx.setLineDash([]);
    } else if (Math.abs(w2) > 0.01) {
      // w1*x + w2*y + b = 0 => y = (-w1*x - b)/w2
      const xStart = -0.3;
      const yStart = (-w1 * xStart - bias) / w2;
      const xEnd = 1.3;
      const yEnd = (-w1 * xEnd - bias) / w2;
      ctx.strokeStyle = '#e11d48';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(toScreenX(xStart), toScreenY(yStart));
      ctx.lineTo(toScreenX(xEnd), toScreenY(yEnd));
      ctx.stroke();
    }

    // 4개 진리표 좌표 (0,0), (0,1), (1,0), (1,1) 그리기
    const targets = GATE_TARGETS[gate];
    INPUT_PAIRS.forEach(([ix, iy], idx) => {
      const sx = toScreenX(ix);
      const sy = toScreenY(iy);
      const targetVal = targets[idx];
      const isSelectedInput = ix === x1 && iy === x2;

      ctx.fillStyle = targetVal === 1 ? '#10b981' : '#f43f5e';
      ctx.beginPath();
      ctx.arc(sx, sy, isSelectedInput ? 13 : 10, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = isSelectedInput ? '#1e1b4b' : '#ffffff';
      ctx.lineWidth = isSelectedInput ? 3 : 2;
      ctx.stroke();

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 11px sans-serif';
      ctx.fillText(String(targetVal), sx - 3.5, sy + 4);

      ctx.fillStyle = '#334155';
      ctx.font = '11px Pretendard, sans-serif';
      ctx.fillText(`(${ix},${iy})`, sx - 14, sy + 24);
    });
  }, [gate, w1, w2, bias, x1, x2, useHiddenLayerForXor]);

  const applyPresetForGate = (targetGate: GateType) => {
    setGate(targetGate);
    if (targetGate === 'AND') {
      setUseHiddenLayerForXor(false);
      setW1(0.6);
      setW2(0.6);
      setBias(-0.9);
      onCompleteMission('pc-gate', 'AND 게이트 완성');
    } else if (targetGate === 'OR') {
      setUseHiddenLayerForXor(false);
      setW1(0.8);
      setW2(0.8);
      setBias(-0.4);
      onCompleteMission('pc-gate', 'OR 게이트 완성');
    } else if (targetGate === 'NAND') {
      setUseHiddenLayerForXor(false);
      setW1(-0.6);
      setW2(-0.6);
      setBias(0.9);
      onCompleteMission('pc-gate', 'NAND 게이트 완성');
    } else {
      setUseHiddenLayerForXor(true);
      onCompleteMission('pc-xor', '다층 퍼셉트론 XOR 해결 확인');
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      {/* 왼쪽: 인공신경망 다이어그램 + 결정 경계 */}
      <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <span className="text-xs font-semibold text-rose-700 bg-rose-50 px-2.5 py-1 rounded-full">
              뉴런의 가중합(z)과 활성화 함수를 통한 논리 게이트 학습
            </span>
            <h3 className="text-base font-bold text-slate-800 mt-1">
              목표 논리 게이트: <span className="text-rose-600">{gate} Gate</span>{' '}
              {truthEvaluation.allCorrect ? (
                <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full ml-1">
                  ✅ 진리표 4개 모두 통과!
                </span>
              ) : (
                <span className="text-xs bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full ml-1">
                  슬라이더를 조절해 4개 조합을 모두 맞춰보세요
                </span>
              )}
            </h3>
          </div>
        </div>

        {/* 뉴런 시각적 구조 카드 */}
        <div className="p-4 rounded-xl bg-slate-900 text-white">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-3">
            <span>입력층 (Inputs)</span>
            <span>가중치 곱셈 및 합산 (Σ)</span>
            <span>활성화 함수 (계단 함수)</span>
            <span>출력층 (Output)</span>
          </div>

          <div className="grid grid-cols-12 items-center gap-2">
            {/* 입력 스위치 */}
            <div className="col-span-3 space-y-2">
              <button
                type="button"
                onClick={() => setX1((v) => (v === 1 ? 0 : 1))}
                className={`w-full py-2 px-3 rounded-lg font-mono text-xs font-bold flex items-center justify-between border transition cursor-pointer ${
                  x1 === 1
                    ? 'bg-emerald-500/20 border-emerald-400 text-emerald-300'
                    : 'bg-slate-800 border-slate-700 text-slate-300'
                }`}
              >
                <span>입력 x₁</span>
                <span className="text-sm">{x1}</span>
              </button>
              <button
                type="button"
                onClick={() => setX2((v) => (v === 1 ? 0 : 1))}
                className={`w-full py-2 px-3 rounded-lg font-mono text-xs font-bold flex items-center justify-between border transition cursor-pointer ${
                  x2 === 1
                    ? 'bg-emerald-500/20 border-emerald-400 text-emerald-300'
                    : 'bg-slate-800 border-slate-700 text-slate-300'
                }`}
              >
                <span>입력 x₂</span>
                <span className="text-sm">{x2}</span>
              </button>
            </div>

            {/* 가중치 표시 */}
            <div className="col-span-3 text-center space-y-2 text-xs font-mono">
              <div className="bg-slate-800 py-1.5 px-2 rounded border border-slate-700 text-rose-300">
                × w₁ ({w1})
              </div>
              <div className="bg-slate-800 py-1.5 px-2 rounded border border-slate-700 text-rose-300">
                × w₂ ({w2})
              </div>
              <div className="text-[11px] text-amber-300">+ 편향 b ({bias})</div>
            </div>

            {/* 뉴런 본체 (가중합 z) */}
            <div className="col-span-3 flex flex-col items-center">
              <div className="w-20 h-20 rounded-full bg-indigo-600/30 border-2 border-indigo-400 flex flex-col items-center justify-center">
                <span className="text-[10px] text-indigo-200">가중합 z</span>
                <span className="text-base font-extrabold font-mono text-white">
                  {currentSignal.z}
                </span>
              </div>
            </div>

            {/* 최종 출력 */}
            <div className="col-span-3 flex flex-col items-center">
              <div
                className={`w-16 h-16 rounded-2xl flex flex-col items-center justify-center font-extrabold border-2 ${
                  currentSignal.out === 1
                    ? 'bg-emerald-500 text-white border-emerald-300 shadow-lg shadow-emerald-500/20'
                    : 'bg-rose-500/80 text-white border-rose-300'
                }`}
              >
                <span className="text-[10px] font-normal opacity-90">출력 y</span>
                <span className="text-xl">{currentSignal.out}</span>
              </div>
              <span className="text-[10px] text-slate-400 mt-1">
                {currentSignal.z >= 0 ? 'z ≥ 0 (활성화!)' : 'z < 0 (비활성)'}
              </span>
            </div>
          </div>
        </div>

        {/* 2D 결정 경계 + 진리표 나란히 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
          <div className="bg-slate-50 rounded-xl border border-slate-200 p-2 flex flex-col items-center">
            <div className="text-xs font-bold text-slate-700 mb-1">
              2차원 좌표 평면의 분류 경계선
            </div>
            <canvas ref={canvasRef} width={260} height={220} className="w-full max-w-[260px] h-auto" />
          </div>

          <div className="bg-slate-50 rounded-xl border border-slate-200 p-3">
            <div className="text-xs font-bold text-slate-700 mb-2">
              {gate} 게이트 진리표 실시간 검증
            </div>
            <table className="w-full text-xs text-center border-collapse">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500">
                  <th className="py-1.5">x₁</th>
                  <th className="py-1.5">x₂</th>
                  <th className="py-1.5">목표 정답</th>
                  <th className="py-1.5">뉴런 출력</th>
                  <th className="py-1.5">판정</th>
                </tr>
              </thead>
              <tbody>
                {truthEvaluation.rows.map((r, i) => (
                  <tr
                    key={i}
                    onClick={() => {
                      setX1(r.in1);
                      setX2(r.in2);
                    }}
                    className="border-b border-slate-200/60 hover:bg-slate-100 cursor-pointer"
                  >
                    <td className="py-2 font-mono font-bold">{r.in1}</td>
                    <td className="py-2 font-mono font-bold">{r.in2}</td>
                    <td className="py-2 font-mono text-slate-600">{r.target}</td>
                    <td className="py-2 font-mono font-extrabold text-indigo-700">{r.pred}</td>
                    <td className="py-2">
                      {r.correct ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 inline" />
                      ) : (
                        <XCircle className="w-4 h-4 text-rose-500 inline" />
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* 오른쪽: 가중치 및 게이트 선택 패널 */}
      <div className="lg:col-span-5 flex flex-col gap-4">
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
          <h4 className="font-bold text-slate-800 flex items-center gap-2">
            <Cpu className="w-4 h-4 text-rose-600" />
            1. 목표 논리 게이트 선택
          </h4>
          <div className="grid grid-cols-4 gap-2">
            {(['AND', 'OR', 'NAND', 'XOR'] as GateType[]).map((g) => (
              <button
                key={g}
                type="button"
                onClick={() => {
                  setGate(g);
                  if (g !== 'XOR') setUseHiddenLayerForXor(false);
                }}
                className={`py-2 rounded-xl font-bold text-xs border transition cursor-pointer ${
                  gate === g
                    ? 'bg-rose-600 text-white border-rose-600'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                {g}
              </button>
            ))}
          </div>

          {gate === 'XOR' && (
            <div className="p-3.5 rounded-xl bg-indigo-50 border border-indigo-200 space-y-2">
              <div className="text-xs font-bold text-indigo-950 flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-indigo-600" />
                XOR 문제: 단층 퍼셉트론의 한계와 은닉층(Hidden Layer)
              </div>
              <p className="text-xs text-indigo-900 leading-relaxed">
                XOR은 (0,1)과 (1,0)만 1이어야 하므로 <strong>직선 1개로는 절대 나눌 수 없습니다.</strong> 은닉층을 추가한 <strong>다층 퍼셉트론(MLP)</strong>을 켜면 직선 2개를 조합해 해결합니다!
              </p>
              <button
                type="button"
                onClick={() => {
                  const next = !useHiddenLayerForXor;
                  setUseHiddenLayerForXor(next);
                  if (next) {
                    onCompleteMission('pc-xor', '다층 퍼셉트론(은닉층)으로 XOR 해결');
                  }
                }}
                className={`w-full py-2 px-3 rounded-lg text-xs font-bold transition cursor-pointer ${
                  useHiddenLayerForXor
                    ? 'bg-indigo-600 text-white'
                    : 'bg-white text-indigo-700 border border-indigo-300 hover:bg-indigo-100'
                }`}
              >
                {useHiddenLayerForXor
                  ? '✅ 다층 퍼셉트론 (은닉층 NAND + OR 조합) 활성화됨'
                  : '👉 [클릭] 은닉층(Hidden Layer) 추가하여 XOR 해결하기'}
              </button>
            </div>
          )}
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
          <h4 className="font-bold text-slate-800 text-sm">
            2. 가중치(w₁, w₂)와 편향(b) 조절
          </h4>

          <div>
            <div className="flex justify-between text-sm font-medium mb-1">
              <span className="text-slate-700">가중치 w₁ (입력 x₁의 중요도)</span>
              <span className="text-rose-600 font-bold">{w1}</span>
            </div>
            <input
              type="range"
              min={-1.5}
              max={1.5}
              step={0.1}
              value={w1}
              onChange={(e) => {
                setW1(Number(e.target.value));
                onCompleteMission('pc-weights', `가중치 실험 (w1=${e.target.value}, w2=${w2}, b=${bias})`);
              }}
              className="w-full accent-rose-600 cursor-pointer"
            />
          </div>

          <div>
            <div className="flex justify-between text-sm font-medium mb-1">
              <span className="text-slate-700">가중치 w₂ (입력 x₂의 중요도)</span>
              <span className="text-rose-600 font-bold">{w2}</span>
            </div>
            <input
              type="range"
              min={-1.5}
              max={1.5}
              step={0.1}
              value={w2}
              onChange={(e) => {
                setW2(Number(e.target.value));
                onCompleteMission('pc-weights', `가중치 실험 (w1=${w1}, w2=${e.target.value}, b=${bias})`);
              }}
              className="w-full accent-rose-600 cursor-pointer"
            />
          </div>

          <div>
            <div className="flex justify-between text-sm font-medium mb-1">
              <span className="text-slate-700">편향 b (Bias - 활성화 기준 조절)</span>
              <span className="text-amber-600 font-bold">{bias}</span>
            </div>
            <input
              type="range"
              min={-1.5}
              max={1.5}
              step={0.1}
              value={bias}
              onChange={(e) => {
                setBias(Number(e.target.value));
                onCompleteMission('pc-weights', `편향 실험 (w1=${w1}, w2=${w2}, b=${e.target.value})`);
              }}
              className="w-full accent-amber-500 cursor-pointer"
            />
          </div>

          <button
            type="button"
            onClick={() => {
              onCompleteMission('pc-weights');
              applyPresetForGate(gate);
            }}
            className="w-full py-2.5 px-4 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-semibold text-sm flex items-center justify-center gap-2 transition cursor-pointer"
          >
            <Sparkles className="w-4 h-4" />
            현재 {gate} 게이트 정답 가중치 자동 설정
          </button>
        </div>
      </div>
    </div>
  );
};
