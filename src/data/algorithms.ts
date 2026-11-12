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
        title: '미션 3: 최소 오차(MSE ≤ 35) 달성 또는 경사하강법 최적선 찾기',
        description: '직접 조절하여 MSE를 35 이하로 낮추거나, [최적 추세선 자동 학습] 버튼을 실행해 최적의 직선을 완성하세요.',
        badgeText: '모델 최적화',
      },
    ],
    quizzes: [
      {
        id: 'lr-q1',
        question: '선형 회귀(Linear Regression) 모델이 해결하기에 가장 알맞은 문제는 무엇인가요?',
        options: [
          '이메일이 스팸인지 아닌지 둘 중 하나로 구분하기',
          '공부 시간과 출석률을 바탕으로 기말고사 예상 점수(수치) 예측하기',
          '정답 레이블이 없는 고객 데이터를 비슷한 취향끼리 묶기',
          '고양이와 강아지 사진을 분류하기',
        ],
        correctIndex: 1,
        explanation:
          '선형 회귀는 정답이 있는 데이터를 학습하여 연속적인 숫자(점수, 가격, 기온 등)를 예측하는 지도학습 회귀 모델입니다.',
      },
      {
        id: 'lr-q2',
        question: '선형 회귀에서 실제 데이터 값(y)과 직선의 예측값(ŷ) 사이의 차이를 제곱하여 평균 낸 값을 무엇이라고 하나요?',
        options: [
          '평균제곱오차 (MSE: Mean Squared Error)',
          '시그모이드 함수 (Sigmoid Function)',
          '정보 이득 (Information Gain)',
          '유클리드 거리 (Euclidean Distance)',
        ],
        correctIndex: 0,
        explanation:
          '평균제곱오차(MSE)는 오차(실제값 - 예측값)를 제곱해 평균을 낸 값으로, 이 값이 작을수록 직선이 데이터를 잘 설명합니다.',
      },
    ],
    reflectionPrompt:
      '기울기(w)와 절편(b)을 바꿀 때 오차(MSE)가 어떻게 변했나요? 만약 기존 경향에서 크게 벗어난 이상치(특이한 점) 데이터를 찍으면 추세선이 어떻게 변하는지 실험 결과를 적어보세요.',
    reflectionExampleHint:
      '예: 기울기와 절편을 데이터 중심에 맞출수록 오차 막대(잔차)가 줄어들며 MSE가 작아졌다. 멀리 떨어진 이상치 점을 찍었더니 추세선이 그 점 쪽으로 끌려가서 전체 오차가 커졌다.',
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
        question: '로지스틱 회귀에 대한 설명으로 옳은 것은 무엇인가요?',
        options: [
          '정답이 없는 데이터를 다루는 비지도학습 알고리즘이다.',
          '출력값을 0과 1 사이의 확률로 변환하여 이진 분류 문제를 해결한다.',
          '예측 결과가 항상 직선으로만 나타나며 확률을 구할 수 없다.',
          '군집의 중심점을 반복해서 이동시키는 알고리즘이다.',
        ],
        correctIndex: 1,
        explanation:
          '로지스틱 회귀는 시그모이드(Sigmoid) 함수를 사용해 출력값을 0~1 사이의 확률로 변환하여 분류(Classification)를 수행합니다.',
      },
      {
        id: 'log-q2',
        question: '로지스틱 회귀에서 모든 실수 입력을 0과 1 사이의 S자 모양 곡선으로 변환해주는 함수의 이름은?',
        options: ['계단 함수', '시그모이드(Sigmoid) 함수', '평균 함수', '최소제곱 함수'],
        correctIndex: 1,
        explanation:
          '시그모이드 함수 σ(z) = 1 / (1 + e^-z)는 입력이 작을수록 0에 가까워지고 클수록 1에 가까워지는 S자 형태의 함수입니다.',
      },
    ],
    reflectionPrompt:
      '선형 회귀(직선)와 달리 로지스틱 회귀(S자 곡선)가 합격/불합격 같은 분류 문제에 더 적합한 이유는 무엇인지, 임계값(Threshold)을 높거나 낮게 바꿨을 때 어떤 변화가 있었는지 적어보세요.',
    reflectionExampleHint:
      '예: 합격/불합격은 0 또는 1의 범주인데 시그모이드 곡선은 결과를 0%~100% 확률로 나타내 주어 편리하다. 임계값을 0.8로 높였더니 합격 판정이 까다로워져서 합격 예측 인원이 줄어들었다.',
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
        title: '미션 3: 분류 결정 경계(Decision Boundary) 영역 지도 켜기',
        description: '[결정 경계 배경 보기]와 거리 측정 방식(유클리드/맨해튼)을 전환하여 영역이 어떻게 나뉘는지 확인하세요.',
        badgeText: '결정 경계 확인',
      },
    ],
    quizzes: [
      {
        id: 'knn-q1',
        question: 'KNN 알고리즘에서 새로운 데이터를 분류할 때 일반적으로짝수(2, 4 등)보다 홀수(3, 5 등)를 K값으로 선호하는 이유는?',
        options: [
          '계산 속도가 2배 빨라지기 때문에',
          '이진 분류에서 다수결 투표 시 동점(Tie)이 나오는 상황을 방지하기 위해',
          '홀수일 때만 유클리드 거리를 계산할 수 있기 때문에',
          '데이터의 개수가 항상 홀수이기 때문에',
        ],
        correctIndex: 1,
        explanation:
          '두 개의 범주로 분류할 때 K가 짝수이면 찬성/반대가 동수가 될 수 있으므로, 다수결 판정이 명확하도록 홀수를 주로 사용합니다.',
      },
      {
        id: 'knn-q2',
        question: 'K값을 너무 작게(예: K=1) 설정했을 때 발생할 수 있는 문제점으로 가장 적절한 것은?',
        options: [
          '주변의 이상치(노이즈) 데이터 하나에 민감하게 반응하여 과적합(Overfitting)될 수 있다.',
          '모든 데이터가 무조건 한 가지 클래스로만 분류된다.',
          '거리를 전혀 계산하지 못한다.',
          '비지도학습으로 알고리즘이 바뀐다.',
        ],
        correctIndex: 0,
        explanation:
          'K=1이면 가장 가까운 단 1개의 점만 보고 판단하므로, 잘못 섞여 들어간 이상치 점 근처에서 잘못 분류될 위험(과적합)이 큽니다.',
      },
    ],
    reflectionPrompt:
      '두 범주가 섞여 있는 경계선 근처에 테스트 데이터(★)를 놓았을 때, K=1일 때와 K=5 또는 K=7일 때 분류 결과와 결정 경계가 어떻게 달라졌는지 적어보세요.',
    reflectionExampleHint:
      '예: 경계선 근처에 별을 찍었을 때 K=1에서는 바로 옆의 파란 점 하나 때문에 파란색으로 분류되었지만, K=5로 늘리자 주변에 빨간 점이 3개로 더 많아 빨간색으로 분류 결과가 바뀌었다.',
  },
  {
    id: 'decision-tree',
    name: '의사결정트리',
    englishName: 'Decision Tree',
    category: '지도학습 · 분류',
    color: 'amber',
    shortDesc: '스무고개처럼 데이터에 대한 스무고개 질문(조건 분기)을 단계별로 적용해 데이터를 분류합니다.',
    conceptSummary:
      '데이터의 특징(속성)에 대해 "당도가 6 이상인가?", "크기가 5 이상인가?"와 같은 예/아니오(Yes/No) 질문을 나무 가지처럼 뻗어 나가며 분류하는 지도학습 알고리즘입니다. 각 단계에서 서로 다른 범주가 최대한 깨끗하게 나뉘도록(불순도 감소) 분할 기준을 정합니다.',
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
        question: '의사결정트리(Decision Tree) 알고리즘의 가장 큰 장점으로 알맞은 것은?',
        options: [
          '분류 과정이 조건문(질문) 형태로 시각화되어 사람이 왜 그런 예측을 했는지 이해(해석)하기 쉽다.',
          '정답 레이블이 전혀 없어도 스스로 군집을 만든다.',
          '항상 원 모양의 경계선으로만 데이터를 나눈다.',
          '가중치와 시그모이드 함수만 사용한다.',
        ],
        correctIndex: 0,
        explanation:
          '의사결정트리는 스무고개처럼 명확한 기준과 규칙으로 분기하므로 결과의 이유를 설명하기 쉬운 화이트박스(White-box) 모델입니다.',
      },
      {
        id: 'dt-q2',
        question: '의사결정트리에서 더 이상 질문으로 나뉘지 않고 최종 분류 결과가 결정되는 가장 끝단의 노드를 무엇이라 부르나요?',
        options: ['루트 노드 (Root Node)', '리프 노드 (Leaf Node, 잎 노드)', '은닉 노드 (Hidden Node)', '중심점 (Centroid)'],
        correctIndex: 1,
        explanation:
          '나무의 가장 꼭대기 시작점을 루트 노드(뿌리 노드), 최종 분류 결정이 내려지는 끝부분을 리프 노드(잎 노드)라고 합니다.',
      },
    ],
    reflectionPrompt:
      '의사결정트리에서 질문을 1번만 했을 때(깊이 1)와 질문을 2번 연속 했을 때(깊이 2) 분류 정확도와 화면의 분할 영역 모양이 어떻게 달라졌는지 적어보세요.',
    reflectionExampleHint:
      '예: 깊이 1일 때는 직선 하나로만 화면을 나누어 섞여 있는 데이터를 다 구분하지 못했는데, 깊이 2로 늘려 두 번째 질문을 추가하니 사각형 구역으로 세밀하게 나뉘어 정확도가 높아졌다.',
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
        title: '미션 2: [데이터 배정 → 중심점 이동] 단계별 진행하여 수렴 완료하기',
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
        question: 'K-평균 군집화(K-Means)가 KNN, 의사결정트리와 구별되는 가장 큰 특징은 무엇인가요?',
        options: [
          '정답(레이블)이 없는 데이터를 스스로 비슷한 그룹으로 묶는 비지도학습(Unsupervised Learning)이다.',
          '오직 직선 추세선만 그릴 수 있다.',
          '학습 데이터가 전혀 필요하지 않다.',
          '인공신경망의 은닉층을 10개 이상 사용한다.',
        ],
        correctIndex: 0,
        explanation:
          'KNN과 의사결정트리는 정답 레이블이 있는 지도학습이지만, K-Means는 정답 없이 데이터 간의 거리와 유사성만으로 군집을 찾는 비지도학습입니다.',
      },
      {
        id: 'km-q2',
        question: 'K-Means 알고리즘에서 각 군집에 속한 데이터들의 평균 위치로 이동하는 기준점을 무엇이라고 하나요?',
        options: ['중심점 (Centroid)', '절편 (Intercept)', '임계값 (Threshold)', '결정 나무 (Tree)'],
        correctIndex: 0,
        explanation:
          '각 군집의 중심이 되는 점을 중심점(Centroid, 센트로이드)이라고 하며, 매 단계마다 군집 내 데이터들의 평균 좌표로 이동합니다.',
      },
    ],
    reflectionPrompt:
      '지도학습 분류(KNN 등)와 비지도학습 군집화(K-Means)의 차이점은 무엇인가요? 또한 처음 중심점(Centroid)이 어디에 찍히느냐에 따라 군집화 과정이 어떻게 진행되었는지 적어보세요.',
    reflectionExampleHint:
      '예: KNN은 처음부터 데이터의 정답 색깔이 정해져 있었지만, K-Means는 처음에 모든 데이터가 회색(정답 없음)이었다가 가까운 중심점을 찾아가며 스스로 그룹이 만들어졌다.',
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
        title: '미션 3: 단층 퍼셉트론의 한계(XOR 문제)와 다층 퍼셉트론(은닉층) 확인하기',
        description: '[XOR 게이트 (다층 퍼셉트론)] 모드를 선택하여 직선 하나로 나눌 수 없는 문제를 은닉층으로 해결하는 원리를 확인하세요.',
        badgeText: '다층 신경망 이해',
      },
    ],
    quizzes: [
      {
        id: 'pc-q1',
        question: '퍼셉트론에서 각 입력 신호(x)가 결과에 미치는 중요도를 조절하는 값을 무엇이라고 하나요?',
        options: ['가중치 (Weight)', '군집 수 (K)', '잔차 (Residual)', '리프 노드 (Leaf Node)'],
        correctIndex: 0,
        explanation:
          '가중치(Weight, w)는 각 입력 데이터가 출력에 얼마나 큰 영향을 줄지 결정하는 중요도 파라미터입니다.',
      },
      {
        id: 'pc-q2',
        question: '단층 퍼셉트론(직선 1개)으로는 풀 수 없었던 XOR 문제를 해결하기 위해 입력층과 출력층 사이에 추가한 층을 무엇이라고 하나요?',
        options: ['은닉층 (Hidden Layer)', '표면층 (Surface Layer)', '거부층 (Reject Layer)', '회귀층 (Regression Layer)'],
        correctIndex: 0,
        explanation:
          '입력층과 출력층 사이에 은닉층(Hidden Layer)을 둔 다층 퍼셉트론(MLP)을 통해 비선형 문제(XOR 등)를 해결할 수 있으며, 이것이 딥러닝의 기초가 됩니다.',
      },
    ],
    reflectionPrompt:
      '내가 의사결정을 내릴 때(예: 주말에 외출할지 말지 결정) 퍼셉트론처럼 입력 요인(날씨, 숙제량 등)과 가중치(중요도)를 어떻게 적용할 수 있을지 비유하여 적어보고, XOR 문제에서 은닉층이 왜 필요한지 정리해보세요.',
    reflectionExampleHint:
      '예: 주말 외출 결정에서 날씨가 좋음(x₁)에는 큰 양수 가중치를, 시험이 가까움(x₂)에는 음수 가중치를 두어 합산 점수로 결정할 수 있다. XOR은 대각선으로 데이터가 엇갈려 있어 직선 1개로는 나눌 수 없으므로 은닉층이 꼭 필요하다.',
  },
];

export const ALGORITHM_MAP: Record<AlgorithmId, AlgorithmMeta> = ALGORITHMS.reduce(
  (acc, item) => {
    acc[item.id] = item;
    return acc;
  },
  {} as Record<AlgorithmId, AlgorithmMeta>
);
