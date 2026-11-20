import { AlgorithmId, AlgorithmMeta } from '../types/simulator';

export const ALGORITHMS: AlgorithmMeta[] = [
  {
    id: 'linear-regression',
    name: '선형 회귀',
    englishName: 'Linear Regression',
    category: '지도학습 · 회귀',
    color: 'blue',
    shortDesc: '연속적인 수치 데이터 사이의 관계를 가장 잘 나타내는 직선(추세선)을 찾아 미래 값을 예측합니다.',
    conceptSummary:
      '선형 회귀는 입력 변수(X)와 연속적인 출력 값(Y) 사이의 선형 관계(y = wx + b)를 학습하는 지도학습 회귀 알고리즘입니다. 실제 데이터와 직선 사이의 거리(오차) 제곱의 합인 평균제곱오차(MSE)가 최소가 되도록 기울기(w)와 절편(b)을 조정합니다.',
    realLifeExample: '하루 공부 시간(X)에 따른 시험 점수(Y) 예측, 기온(X)에 따른 아이스크림 판매량(Y) 예측',
    keyFormulaOrRule: '예측값 ŷ = w·x + b  |  손실함수 MSE = (1/n) Σ(y - ŷ)²',
    missions: [
      {
        id: 'lr-adjust',
        title: '미션 1: 기울기(w)와 절편(b) 직접 조작하기',
        description: '슬라이더를 움직여 추세선을 이동시키고 평균제곱오차(MSE)가 어떻게 변하는지 확인하세요.',
        badgeText: '파라미터 조절',
      },
      {
        id: 'lr-add-point',
        title: '미션 2: 나만의 새로운 데이터 점 추가하기',
        description: '그래프 캔버스 위를 클릭하여 새로운 학생(공부시간, 성적) 데이터를 1개 이상 추가해보세요.',
        badgeText: '데이터 입력',
      },
      {
        id: 'lr-optimal',
        title: '미션 3: 최소 오차(MSE ≤ 35) 달성 또는 최적선 학습',
        description: '직접 조절하여 MSE를 35 이하로 낮추거나, [최적 추세선 자동 학습] 버튼을 실행해 최적의 직선을 완성하세요.',
        badgeText: '모델 최적화',
      },
    ],
    quizzes: [
      {
        id: 'lr-q1',
        question: '선형 회귀(Linear Regression) 모델이 해결하기에 가장 알맞은 문제는 무엇인가요?',
        options: [
          '수신된 이메일의 스팸 여부 판별하기',
          '공부 시간으로 기말고사 점수 예측하기',
          '정답 없는 고객 데이터를 그룹으로 묶기',
          '사진 속 동물이 강아지인지 분류하기',
        ],
        correctIndex: 1,
        explanation:
          '선형 회귀는 정답이 있는 데이터를 학습하여 연속적인 숫자(점수, 가격, 기온 등)를 예측하는 지도학습 회귀 모델입니다.',
      },
      {
        id: 'lr-q2',
        question: '선형 회귀에서 실제값(y)과 예측값(ŷ)의 차이를 제곱해 평균 낸 오차 지표는 무엇인가요?',
        options: [
          '지니 불순도 (Gini Impurity)',
          '시그모이드 값 (Sigmoid Value)',
          '평균제곱오차 (MSE)',
          '유클리드 거리 (Euclidean)',
        ],
        correctIndex: 2,
        explanation:
          '평균제곱오차(MSE)는 오차(실제값 - 예측값)를 제곱해 평균을 낸 값으로, 이 값이 작을수록 직선이 데이터를 잘 설명합니다.',
      },
    ],
    reflectionPrompt:
      '직접 추세선을 맞추고 새로운 점을 찍어 본 실험 과정을 떠올리며, 아래 상황들을 중심으로 탐구 기록을 작성해보세요.',
    reflectionGuideSteps: [
      '① 기울기(w)와 절편(b)을 바꿨을 때 빨간 오차 선과 MSE 수치가 줄어들거나 커졌던 상황',
      '② 기존 점들과 멀리 떨어진 위치에 새 점(이상치)을 찍고 자동 학습을 눌렀을 때 일어난 상황',
      '③ 우리 주변에서 두 수치 사이의 관계를 직선으로 예측해볼 수 있는 상황',
    ],
    reflectionExampleHint:
      '위 안내 상황(①~③) 중 자신이 직접 실험하며 확인한 변화를 구체적인 수치나 상황과 함께 적어보세요.',
  },
  {
    id: 'logistic-regression',
    name: '로지스틱 회귀',
    englishName: 'Logistic Regression',
    category: '지도학습 · 분류',
    color: 'indigo',
    shortDesc: '데이터가 특정 범주에 속할 확률을 0과 1 사이의 S자 곡선(시그모이드 함수)으로 변환하여 분류합니다.',
    conceptSummary:
      '이름에 회귀가 들어가지만 실제로는 이진 분류(합격/불합격, 스팸/정상 등)에 사용되는 지도학습 분류 알고리즘입니다. 선형 식의 결과를 시그모이드(Sigmoid) 함수에 통과시켜 0~1(0%~100%) 사이의 확률로 바꾸고, 임계값(보통 0.5)을 기준으로 범주를 나눕니다.',
    realLifeExample: '연습 문제 풀이 시간에 따른 자격증 시험 합격(1) / 불합격(0) 확률 예측, 질병 유무 진단',
    keyFormulaOrRule: 'P(y=1) = 1 / (1 + e^-(wx + b))  |  P ≥ 임계값 이면 클래스 1(합격)',
    missions: [
      {
        id: 'log-slider',
        title: '미션 1: S자 시그모이드 곡선 형태 조절하기',
        description: '가중치(기울기 경사도 w)와 중심 위치(b) 슬라이더를 조절해 S자 곡선의 변화를 관찰하세요.',
        badgeText: '시그모이드 탐색',
      },
      {
        id: 'log-threshold',
        title: '미션 2: 분류 임계값(Threshold) 변경 실험하기',
        description: '합격/불합격 기준이 되는 임계값(기본 0.5) 슬라이더를 움직여 결정 경계가 이동하는 것을 확인하세요.',
        badgeText: '임계값 실험',
      },
      {
        id: 'log-accuracy',
        title: '미션 3: 분류 정확도 85% 이상 달성하기',
        description: '파라미터를 조절하거나 [최적 분류 모델 학습]을 눌러 데이터 분류 정확도를 85% 이상으로 만드세요.',
        badgeText: '정확도 85%+',
      },
    ],
    quizzes: [
      {
        id: 'log-q1',
        question: '로지스틱 회귀에 대한 설명으로 가장 알맞은 것은 무엇인가요?',
        options: [
          '정답 없는 데이터를 스스로 묶는 비지도학습이다.',
          '출력값을 0~1 확률로 변환해 이진 분류를 수행한다.',
          '모든 예측 결과를 직선 그래프로만 표현하는 모델이다.',
          '중심점을 반복 이동시켜 군집을 찾는 알고리즘이다.',
        ],
        correctIndex: 1,
        explanation:
          '로지스틱 회귀는 시그모이드(Sigmoid) 함수를 사용해 출력값을 0~1 사이의 확률로 변환하여 분류(Classification)를 수행합니다.',
      },
      {
        id: 'log-q2',
        question: '로지스틱 회귀에서 입력값을 0과 1 사이의 S자 곡선으로 변환해주는 함수는?',
        options: [
          '계단 활성화 함수',
          '평균 제곱 오차 함수',
          '최소 거리 계산 함수',
          '시그모이드(Sigmoid) 함수',
        ],
        correctIndex: 3,
        explanation:
          '시그모이드 함수 σ(z) = 1 / (1 + e^-z)는 입력이 작을수록 0에 가까워지고 클수록 1에 가까워지는 S자 형태의 함수입니다.',
      },
    ],
    reflectionPrompt:
      'S자 곡선과 임계값(Threshold)을 직접 조절해 본 실험을 바탕으로, 아래 상황들을 정리해보세요.',
    reflectionGuideSteps: [
      '① 임계값을 기본값(50%)보다 높게(70~80%) 또는 낮게(20~30%) 바꿨을 때 합격/불합격 판정이 달라진 상황',
      '② 경사도(w)를 크게 키웠을 때와 작게 줄였을 때 S자 곡선의 모양이 변한 상황',
      '③ 현실에서 분류 기준(임계값)을 엄격하게(높게) 잡아야 하거나 느슨하게 잡아야 하는 상황',
    ],
    reflectionExampleHint:
      '위 안내 상황(①~③)을 참고하여 내가 슬라이더를 바꿨을 때 발생한 판정 변화와 이유를 적어보세요.',
  },
  {
    id: 'knn',
    name: 'K-최근접 이웃',
    englishName: 'K-Nearest Neighbors (KNN)',
    category: '지도학습 · 분류',
    color: 'emerald',
    shortDesc: '새로운 데이터와 거리가 가장 가까운 K개의 이웃 데이터를 찾아 다수결로 범주를 분류합니다.',
    conceptSummary:
      '"유유상종" 원리를 이용한 지도학습 분류 알고리즘입니다. 새로운 데이터가 들어오면 기존 학습 데이터들과의 거리를 계산한 뒤, 가장 가까운 K개의 이웃을 찾습니다. 그 K개 이웃 중 가장 많은 비율을 차지하는 클래스(다수결)로 새로운 데이터를 분류합니다.',
    realLifeExample: '과일의 당도(X)와 크기(Y)를 기준으로 새로운 과일이 사과인지 귤인지 분류하기',
    keyFormulaOrRule: '유클리드 거리 d = √((x₁-x₂)² + (y₁-y₂)²)  |  가장 가까운 K개 이웃의 다수결 투표',
    missions: [
      {
        id: 'knn-place',
        title: '미션 1: 새로운 테스트 데이터(★) 위치 이동/찍기',
        description: '캔버스 위를 클릭하여 분류하고 싶은 새로운 과일 데이터(★)를 다양한 위치에 놓아보세요.',
        badgeText: '테스트 데이터 배치',
      },
      {
        id: 'knn-change-k',
        title: '미션 2: 이웃의 수 K값(1, 3, 5, 7) 변경 비교하기',
        description: 'K값을 서로 다른 값으로 2번 이상 변경하며 연결되는 이웃 선과 다수결 투표 결과 변화를 확인하세요.',
        badgeText: 'K값 비교 실험',
      },
      {
        id: 'knn-boundary',
        title: '미션 3: 분류 결정 경계 영역 지도 켜기 및 거리 비교',
        description: '[결정 경계 배경 보기]와 거리 측정 방식(유클리드/맨해튼)을 전환하여 영역이 어떻게 나뉘는지 확인하세요.',
        badgeText: '결정 경계 확인',
      },
    ],
    quizzes: [
      {
        id: 'knn-q1',
        question: 'KNN 이진 분류에서 K값으로 짝수보다 홀수(3, 5 등)를 주로 사용하는 이유는?',
        options: [
          '짝수보다 거리 계산 속도가 빨라지기 때문에',
          '다수결 투표에서 동점이 나오는 것을 막기 위해',
          '홀수일 때만 유클리드 거리를 쓸 수 있기 때문에',
          '전체 데이터 개수가 항상 홀수여야 하기 때문에',
        ],
        correctIndex: 1,
        explanation:
          '두 개의 범주로 분류할 때 K가 짝수이면 찬성/반대가 동수가 될 수 있으므로, 다수결 판정이 명확하도록 홀수를 주로 사용합니다.',
      },
      {
        id: 'knn-q2',
        question: 'K값을 너무 작게(예: K=1) 설정했을 때 발생할 수 있는 문제점은 무엇인가요?',
        options: [
          '주변의 이상치 하나에 흔들려 과적합되기 쉽다.',
          '모든 데이터가 항상 하나의 범주로만 묶인다.',
          '두 점 사이의 직선 거리를 계산할 수 없다.',
          '정답 레이블을 쓰지 않는 비지도학습이 된다.',
        ],
        correctIndex: 0,
        explanation:
          'K=1이면 가장 가까운 단 1개의 점만 보고 판단하므로, 잘못 섞여 들어간 이상치 점 근처에서 잘못 분류될 위험(과적합)이 큽니다.',
      },
    ],
    reflectionPrompt:
      '테스트 과일(★)의 위치와 K값을 바꾸며 실험한 내용을 아래 상황에 맞춰 기록해보세요.',
    reflectionGuideSteps: [
      '① 두 품종이 섞여 있는 경계 근처에 ★을 두고 K=1에서 K=5 또는 K=7로 바꿨을 때 분류 결과가 바뀐 상황',
      '② 결정 경계 배경을 켰을 때 K값이 커질수록 경계선 모양이 어떻게 달라졌는지 관찰한 상황',
      '③ 유클리드 거리와 맨해튼 거리를 전환했을 때 이웃 선택이나 배경 영역에 변화가 생긴 상황',
    ],
    reflectionExampleHint:
      '위 안내 상황(①~③)을 바탕으로 같은 위치의 ★이라도 K값에 따라 결과가 달라진 경험을 적어보세요.',
  },
  {
    id: 'decision-tree',
    name: '의사결정트리',
    englishName: 'Decision Tree',
    category: '지도학습 · 분류',
    color: 'amber',
    shortDesc: '스무고개처럼 데이터에 대한 질문(조건 분기)을 단계별로 적용해 데이터를 분류합니다.',
    conceptSummary:
      '데이터의 특징(속성)에 대해 "운동 시간이 5시간 이상인가?", "수면 시간이 5.3시간 이상인가?"와 같은 예/아니오(Yes/No) 질문을 나무 가지처럼 뻗어 나가며 분류하는 지도학습 알고리즘입니다. 각 단계에서 서로 다른 범주가 최대한 깨끗하게 나뉘도록(불순도 감소) 분할 기준을 정합니다.',
    realLifeExample: '체온, 기침 여부, 인후통 여부를 순서대로 질문하여 독감 여부 분류하기 / 스무고개 게임',
    keyFormulaOrRule: '조건 분기 (If X ≥ 기준값 → 왼쪽/오른쪽 자식 노드)  |  불순도(Gini)가 낮아지는 방향으로 분할',
    missions: [
      {
        id: 'dt-split',
        title: '미션 1: 루트 노드(1단계 질문) 분할 기준선 직접 조절하기',
        description: '분할 기준 축(X축/Y축)과 기준값 슬라이더를 움직여 데이터를 두 영역으로 나누어 보세요.',
        badgeText: '조건 분기 조절',
      },
      {
        id: 'dt-depth',
        title: '미션 2: 트리 깊이(Depth 1 → 2) 확장 및 자동 최적 분할 실행',
        description: '트리의 깊이를 2단계로 늘리거나 [최적 의사결정트리 자동 생성] 버튼을 눌러 세부 분할을 확인하세요.',
        badgeText: '트리 깊이 탐색',
      },
      {
        id: 'dt-test',
        title: '미션 3: 새로운 데이터를 트리에 통과시켜 예측 경로 추적하기',
        description: '캔버스에서 테스트 데이터 위치를 클릭해 루트 노드부터 리프(잎) 노드까지 따라가는 경로를 확인하세요.',
        badgeText: '예측 경로 추적',
      },
    ],
    quizzes: [
      {
        id: 'dt-q1',
        question: '의사결정트리(Decision Tree) 모델의 가장 큰 장점으로 알맞은 것은?',
        options: [
          '정답 레이블 없이도 스스로 군집을 나눈다.',
          '분류 기준이 조건문으로 보여 해석하기 쉽다.',
          '항상 원 모양의 경계선으로 데이터를 나눈다.',
          '시그모이드 확률 곡선으로 결과를 계산한다.',
        ],
        correctIndex: 1,
        explanation:
          '의사결정트리는 스무고개처럼 명확한 기준과 규칙으로 분기하므로 결과의 이유를 설명하기 쉬운 화이트박스(White-box) 모델입니다.',
      },
      {
        id: 'dt-q2',
        question: '의사결정트리에서 더 이상 나뉘지 않고 최종 분류가 결정되는 끝단 노드는?',
        options: [
          '루트 노드 (Root Node)',
          '은닉 노드 (Hidden Node)',
          '중심 노드 (Centroid Node)',
          '리프 노드 (Leaf Node)',
        ],
        correctIndex: 3,
        explanation:
          '나무의 가장 꼭대기 시작점을 루트 노드(뿌리 노드), 최종 분류 결정이 내려지는 끝부분을 리프 노드(잎 노드)라고 합니다.',
      },
    ],
    reflectionPrompt:
      '스무고개 질문 기준선과 트리 깊이를 조절해 본 실험을 바탕으로, 아래 상황들을 중심으로 적어보세요.',
    reflectionGuideSteps: [
      '① 질문 1개(Depth 1)만 사용했을 때 정확도의 한계가 나타난 상황과 그 이유',
      '② 질문 2개(Depth 2)로 늘렸을 때 그래프 영역 모양과 분류 정확도가 달라진 상황',
      '③ 내가 찍은 ★ 학생이 루트 노드에서 리프 노드까지 어떤 질문(예/아니오)을 거쳐 판정되었는지의 상황',
    ],
    reflectionExampleHint:
      '위 안내 상황(①~③)을 참고하여 Depth 1과 Depth 2의 차이 및 조건 분기 과정을 적어보세요.',
  },
  {
    id: 'kmeans',
    name: 'K-평균 군집화',
    englishName: 'K-Means Clustering',
    category: '비지도학습 · 군집화',
    color: 'purple',
    shortDesc: '정답(레이블)이 없는 데이터들을 가까운 중심점(Centroid)을 기준으로 K개의 그룹으로 묶어줍니다.',
    conceptSummary:
      '정답(레이블)이 주어지지 않은 상태에서 데이터의 비슷한 특징(거리)만을 이용해 K개의 그룹(군집)으로 묶는 대표적인 비지도학습 알고리즘입니다. ① K개의 중심점 배치 → ② 각 데이터를 가장 가까운 중심점 그룹에 배정 → ③ 각 그룹의 평균 위치로 중심점 이동 과정을 중심점이 더 이상 움직이지 않을 때까지 반복합니다.',
    realLifeExample: '시청 기록이 비슷한 사용자끼리 그룹 묶기, 체력 측정 기록이 비슷한 학생끼리 맞춤형 운동 반 편성하기',
    keyFormulaOrRule: '반복: [단계 1] 가장 가까운 중심점(μ_k)에 데이터 배정  →  [단계 2] 각 군집 데이터의 평균 좌표로 중심점 이동',
    missions: [
      {
        id: 'km-init',
        title: '미션 1: 군집 수(K) 선택 및 초기 중심점 배치하기',
        description: 'K값(2, 3, 4)을 선택하거나 [초기 중심점 새로 배치]를 눌러 군집화 준비를 시작하세요.',
        badgeText: '초기 중심점 설정',
      },
      {
        id: 'km-step',
        title: '미션 2: [데이터 배정 → 중심점 이동] 진행하여 수렴 완료하기',
        description: '[다음 단계 실행] 또는 [수렴할 때까지 자동 실행]을 눌러 중심점이 안정될 때까지 군집화를 완료하세요.',
        badgeText: '반복 수렴 완료',
      },
      {
        id: 'km-add',
        title: '미션 3: 새로운 데이터를 캔버스에 추가하고 중심점 변화 관찰하기',
        description: '캔버스를 클릭해 데이터를 추가한 뒤 중심점이 어떻게 이동하는지 확인해보세요.',
        badgeText: '데이터 추가 실험',
      },
    ],
    quizzes: [
      {
        id: 'km-q1',
        question: 'K-평균 군집화(K-Means)가 KNN·의사결정트리와 구별되는 핵심 특징은?',
        options: [
          '정답 레이블이 없는 비지도학습 알고리즘이다.',
          '연속적인 점수를 예측하는 선형 회귀 모델이다.',
          '반드시 은닉층을 포함하는 인공신경망이다.',
          '모든 데이터에 미리 정답을 입력해야 한다.',
        ],
        correctIndex: 0,
        explanation:
          'KNN과 의사결정트리는 정답 레이블이 있는 지도학습이지만, K-Means는 정답 없이 데이터 간의 거리와 유사성만으로 군집을 찾는 비지도학습입니다.',
      },
      {
        id: 'km-q2',
        question: 'K-Means에서 각 군집 데이터의 평균 위치로 이동하는 기준점의 이름은?',
        options: [
          '임계점 (Threshold)',
          '절편값 (Intercept)',
          '중심점 (Centroid)',
          '리프점 (Leaf Point)',
        ],
        correctIndex: 2,
        explanation:
          '각 군집의 중심이 되는 점을 중심점(Centroid, 센트로이드)이라고 하며, 매 단계마다 군집 내 데이터들의 평균 좌표로 이동합니다.',
      },
    ],
    reflectionPrompt:
      '70여 개의 정답 없는 데이터에서 군집화를 반복 실행한 실험을 떠올리며, 아래 상황들을 중심으로 적어보세요.',
    reflectionGuideSteps: [
      '① 처음 회색(정답 없음)이었던 70개 데이터가 단계별 실행을 거듭하며 색깔 그룹으로 나뉜 상황',
      '② 초기 중심점을 무작위로 새로 찍었을 때나 K값을 2, 3, 4로 바꿨을 때 최종 군집 모양이 달라진 상황',
      '③ 앞서 실습한 지도학습(KNN 등)과 이번 비지도학습(K-Means)의 시작 데이터 상태가 달랐던 상황',
    ],
    reflectionExampleHint:
      '위 안내 상황(①~③)을 참고하여 중심점이 이동하며 수렴한 과정과 K값 변경에 따른 차이를 적어보세요.',
  },
  {
    id: 'perceptron',
    name: '인공신경망 · 퍼셉트론',
    englishName: 'Perceptron & Neural Network',
    category: '인공신경망 · 딥러닝 기초',
    color: 'rose',
    shortDesc: '뇌의 뉴런 구조를 모방하여 입력값에 가중치를 곱하고 편향을 더한 뒤 활성화 함수로 출력을 결정합니다.',
    conceptSummary:
      '퍼셉트론(Perceptron)은 인간 뇌의 신경세포(뉴런)가 신호를 전달하는 방식을 수학적으로 모델링한 인공신경망의 가장 기본 단위입니다. 여러 입력(x₁, x₂)에 각각의 중요도인 가중치(w₁, w₂)를 곱해 모두 더하고 편향(b)을 합산한 값(z)이 기준을 넘으면 활성화 함수가 1을 출력하고, 넘지 못하면 0을 출력합니다.',
    realLifeExample: '비 올 확률(x₁)과 우산 휴대 편의성(x₂)에 나만의 중요도(가중치 w)를 곱해 우산을 챙길지(1) 말지(0) 결정하기',
    keyFormulaOrRule: '가중합 z = x₁·w₁ + x₂·w₂ + b  |  출력 y = f(z) (z ≥ 0 이면 1, 아니면 0)',
    missions: [
      {
        id: 'pc-weights',
        title: '미션 1: 입력 신호와 가중치(w₁, w₂), 편향(b) 직접 조작하기',
        description: '가중치와 편향 슬라이더를 조절하며 뉴런 내부의 가중합(z)과 최종 출력(0 또는 1)이 바뀌는 과정을 확인하세요.',
        badgeText: '뉴런 신호 실험',
      },
      {
        id: 'pc-gate',
        title: '미션 2: AND 또는 OR 논리 게이트 진리표 100% 통과시키기',
        description: '네 가지 입력 조합 (0,0), (0,1), (1,0), (1,1)에 대해 AND 또는 OR 게이트 정답과 모두 일치하도록 가중치를 맞추세요.',
        badgeText: '논리 게이트 완성',
      },
      {
        id: 'pc-xor',
        title: '미션 3: XOR 문제와 다층 퍼셉트론(은닉층) 해결 원리 확인하기',
        description: '[XOR 게이트]를 선택한 뒤 은닉층(다층 퍼셉트론)을 활성화하여 비선형 분류가 해결되는 원리를 확인하세요.',
        badgeText: '다층 신경망 이해',
      },
    ],
    quizzes: [
      {
        id: 'pc-q1',
        question: '퍼셉트론에서 각 입력 신호(x)의 중요도를 조절하기 위해 곱하는 값은?',
        options: [
          '군집 수 (K-Value)',
          '가중치 (Weight)',
          '잔차값 (Residual)',
          '리프값 (Leaf Value)',
        ],
        correctIndex: 1,
        explanation:
          '가중치(Weight, w)는 각 입력 데이터가 출력에 얼마나 큰 영향을 줄지 결정하는 중요도 파라미터입니다.',
      },
      {
        id: 'pc-q2',
        question: '단층 퍼셉트론으로 풀 수 없던 XOR 문제를 해결하기 위해 추가한 층은?',
        options: [
          '회귀층 (Regression Layer)',
          '분할층 (Split Layer)',
          '은닉층 (Hidden Layer)',
          '군집층 (Cluster Layer)',
        ],
        correctIndex: 2,
        explanation:
          '입력층과 출력층 사이에 은닉층(Hidden Layer)을 둔 다층 퍼셉트론(MLP)을 통해 비선형 문제(XOR 등)를 해결할 수 있으며, 이것이 딥러닝의 기초가 됩니다.',
      },
    ],
    reflectionPrompt:
      '가중치와 편향을 조절해 논리 게이트를 완성하고 XOR 문제를 실험한 과정을 아래 상황에 맞춰 정리해보세요.',
    reflectionGuideSteps: [
      '① AND/OR 게이트에서 가중치(w₁, w₂)와 편향(b)을 바꿀 때 2D 경계선과 진리표 판정이 바뀐 상황',
      '② XOR 게이트에서 직선 1개(단층)로는 4개 점을 나눌 수 없었던 상황과 은닉층을 켰을 때의 변화',
      '③ 일상생활의 선택(외출, 메뉴 선택 등)을 입력(x)과 중요도(가중치 w)로 결정할 수 있는 상황',
    ],
    reflectionExampleHint:
      '위 안내 상황(①~③)을 바탕으로 가중치 조절 경험과 XOR에서 은닉층이 필요한 이유를 적어보세요.',
  },
];

export const ALGORITHM_MAP: Record<AlgorithmId, AlgorithmMeta> = ALGORITHMS.reduce(
  (acc, item) => {
    acc[item.id] = item;
    return acc;
  },
  {} as Record<AlgorithmId, AlgorithmMeta>
);
