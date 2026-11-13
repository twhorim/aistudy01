# 고등학교 1학년 정보 - 기계학습 알고리즘 인터랙티브 시뮬레이터

고등학교 1학년 정보 교과(인공지능과 기계학습 단원) 수업 및 수행평가에 활용할 수 있는 **웹 기반 기계학습 시뮬레이터 & 실시간 수행 과정 관리 시스템**입니다.

---

## 1. 주요 기능

1. **6대 핵심 기계학습 알고리즘 인터랙티브 시뮬레이터**
   - **회귀 모델 (지도학습)**: **선형 회귀 (Linear Regression)** — 기울기($w$)·절편($b$) 조절, 잔차(오차) 시각화, 최소제곱법 최적 추세선 자동 학습
   - **분류 모델 (지도학습)**:
     - **로지스틱 회귀 (Logistic Regression)** — 시그모이드(Sigmoid) S자 확률 곡선, 임계값(Threshold) 조절 및 이진 분류
     - **K-최근접 이웃 (KNN)** — $K$값(1, 3, 5, 7) 변화에 따른 다수결 투표, 유클리드/맨해튼 거리, 결정 경계 히트맵
     - **의사결정트리 (Decision Tree)** — 스무고개 조건 분기 기준선 조작, 트리 깊이(Depth 1·2) 확장, 예측 경로 다이어그램
   - **비지도학습 (군집화)**: **K-평균 군집화 (K-Means)** — 정답 없는 데이터의 중심점(Centroid) 배치 및 [데이터 배정 → 중심점 이동] 단계별 수렴 시각화
   - **인공신경망**: **퍼셉트론 & 다층 퍼셉트론 (Perceptron & MLP)** — 입력·가중치·편향·활성화 함수 실험, AND/OR/NAND 진리표 완성 및 은닉층(Hidden Layer)을 통한 XOR 해결

2. **학번·이름 입력 및 3단계 수행 과정 체크**
   - **수행 과정 1 (단계별 미션 체크리스트)**: 학생이 시뮬레이터를 조작하면 미션 달성이 자동 감지되어 체크됩니다.
   - **수행 과정 2 (핵심 개념 미니 퀴즈)**: 각 알고리즘별 객관식 퀴즈 풀이 및 즉시 채점·해설 제공
   - **수행 과정 3 (서술형 탐구 소감란)**: 탐구 질문에 맞춰 실험 결과 분석과 느낀 점 작성

3. **교사용 실시간 관리자 페이지 (`교사용 관리` 버튼)**
   - 학급별/학번별 실시간 제출 현황 조회, 검색 및 정렬
   - 학생별 상세 답안 및 서술형 소감 열람 모달
   - **엑셀(CSV) 채점표 원클릭 다운로드** (한글 깨짐 방지 UTF-8 BOM 적용)
   - **구글 스프레드시트(무료 DB) 실시간 연동 지원**

---

## 2. 프로젝트 파일 다운로드 및 교사용 비밀번호 초기화/변경 방법

다른 선생님께서 이 프로젝트를 다운로드하여 사용하시거나, 설정해 둔 교사용 관리자 비밀번호를 분실하여 초기화하고 싶을 때 아래 방법을 따라 주세요.

### A. 프로젝트 파일 다운로드 방법
1. GitHub 저장소 우측 상단의 초록색 **`<> Code`** 버튼을 클릭합니다.
2. **`Download ZIP`**을 눌러 압축을 풀거나, **GitHub Desktop**에서 `File > Clone repository`로 내려받습니다.
3. 프로젝트 폴더에서 패키지를 설치하고 실행합니다:
   ```bash
   npm install
   npm run dev
   ```

### B. 브라우저에서 변경한 비밀번호를 잊어버렸을 때 (초기 비밀번호로 리셋)
교사용 관리 페이지 내부 설정에서 비밀번호를 바꿨는데 기억나지 않는 경우, 브라우저 저장소(`localStorage`)의 비밀번호 키만 지우면 코드에 설정된 기본 비밀번호로 즉시 초기화됩니다.

1. 시뮬레이터 웹페이지에서 키보드 **`F12`** (또는 마우스 우클릭 → **검사**)를 눌러 개발자 도구를 엽니다.
2. 상단 탭에서 **[Console(콘솔)]** 또는 **[Application(애플리케이션) → Local Storage]**를 선택합니다.
3. 콘솔 창에 아래 명령어를 붙여넣고 엔터를 치면 초기 비밀번호로 복구됩니다:
   ```javascript
   localStorage.removeItem('ml_sim_admin_pin_v1');
   ```

### C. 소스 코드에서 기본 비밀번호 확인 및 영구 변경하기
학교/선생님만의 고유 기본 비밀번호로 아예 코드를 바꾸어 배포하려면 아래 파일을 수정합니다.

1. 프로젝트 폴더에서 **`src/utils/storage.ts`** 파일을 메모장이나 VS Code로 엽니다.
2. `getAdminPin` 및 `setAdminPin` 함수(`101~107번째 줄` 부근)를 찾습니다:
   ```typescript
   export function getAdminPin(): string {
     return localStorage.getItem(ADMIN_PIN_KEY) || '원하는비밀번호';
   }

   export function setAdminPin(pin: string): void {
     localStorage.setItem(ADMIN_PIN_KEY, pin.trim() || '원하는비밀번호');
   }
   ```
3. 작은따옴표 안의 숫자를 원하는 비밀번호로 수정하고 저장한 뒤 GitHub에 Push하면 Vercel에 자동 반영됩니다.

---

## 3. 구글 시트(Google Sheets) + Apps Script 실시간 연동 상세 절차

학생들이 각자 다른 컴퓨터나 태블릿에서 **[수행 결과 제출하기]**를 눌렀을 때, 선생님의 구글 드라이브 시트로 실시간 수집되고 교사용 관리자 페이지에서도 한눈에 조회되게 만드는 방법입니다. **(별도 유료 DB 불필요 · 평생 무료)**

### 1단계: 새 구글 스프레드시트 만들기
1. [구글 스프레드시트(Google Sheets)](https://sheets.new)에 접속하여 빈 시트를 하나 생성합니다.
2. 시트 제목을 지정합니다 (예: `고1 정보 기계학습 수행평가 제출현황`).
   - *첫 번째 줄(열 제목)은 첫 학생이 제출할 때 스크립트가 자동으로 생성하므로 비워두셔도 됩니다.*

### 2단계: Apps Script 코드 붙여넣기
1. 구글 시트 상단 메뉴에서 **[확장 프로그램] → [Apps Script]**를 클릭합니다.
2. 코드 편집기 창이 열리면 기존에 적혀 있는 `function myFunction() { ... }` 코드를 **모두 삭제**합니다.
3. 아래 코드를 **그대로 복사하여 붙여넣고**, 상단의 **💾 저장 아이콘(`Ctrl + S`)**을 누릅니다.
   - *(시뮬레이터 웹앱의 `[교사용 관리] → [구글 시트 실시간 연동 설정]` 창에서도 동일 코드를 복사할 수 있습니다.)*

```javascript
function doPost(e) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  if (sheet.getLastRow() === 0) {
    sheet.appendRow([
      '제출일시', '학번', '이름', '학반', '미션달성률(%)', '퀴즈점수', '서술형작성수',
      '선형회귀_소감', '로지스틱_소감', 'KNN_소감', '결정트리_소감', 'K평균_소감', '퍼셉트론_소감', '전체JSON'
    ]);
  }
  var body = JSON.parse(e.postData.contents);
  var r = body.payload;
  var d = r.algorithmDetails || {};
  sheet.appendRow([
    r.submittedAt,
    r.studentId,
    r.name,
    r.schoolClass,
    r.missionProgressPercent,
    r.quizTotalScore + '/' + r.quizMaxScore,
    r.reflectionCount,
    (d['linear-regression'] && d['linear-regression'].reflection) || '',
    (d['logistic-regression'] && d['logistic-regression'].reflection) || '',
    (d['knn'] && d['knn'].reflection) || '',
    (d['decision-tree'] && d['decision-tree'].reflection) || '',
    (d['kmeans'] && d['kmeans'].reflection) || '',
    (d['perceptron'] && d['perceptron'].reflection) || '',
    JSON.stringify(r)
  ]);
  return ContentService.createTextOutput(JSON.stringify({ ok: true }))
    .setMimeType(ContentService.MimeType.JSON);
}

function doGet(e) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  var rows = sheet.getDataRange().getValues();
  var records = [];
  for (var i = 1; i < rows.length; i++) {
    var rawJson = rows[i][13];
    if (rawJson) {
      try { records.push(JSON.parse(rawJson)); } catch (err) {}
    }
  }
  return ContentService.createTextOutput(JSON.stringify({ ok: true, records: records }))
    .setMimeType(ContentService.MimeType.JSON);
}
```

### 3단계: 웹 앱(Web App)으로 배포하고 URL 발급받기
1. Apps Script 우측 상단의 **[배포] → [새 배포]**를 클릭합니다.
2. 왼쪽 톱니바퀴 아이콘(**유형 선택**)을 클릭하고 **[웹 앱]**을 선택합니다.
3. 아래 두 가지 권한 항목을 정확히 설정합니다:
   - **다음 사용자 인증 정보로 실행**: **`나 (선생님 구글 계정)`**
   - **액세스 권한이 있는 사용자**: **`모든 사용자`** *(⚠️ 반드시 '모든 사용자'로 지정해야 학생들이 별도 구글 로그인 없이 제출할 수 있습니다.)*
4. **[배포]** 버튼을 클릭합니다.
5. **[액세스 승인]** 팝업이 나타나면:
   - 선생님 구글 계정 선택 → *"Google에서 확인하지 않은 앱입니다"* 화면 좌측 하단의 **[고급(Advanced)]** 클릭 → 맨 아래 **[프로젝트(안전하지 않음)으로 이동]** 클릭 → **[허용(Allow)]** 클릭
6. 배포 완료 창에 표시되는 **`웹 앱 URL`** (`https://script.google.com/macros/s/AKfycb.../exec`)을 **[복사]**합니다.

### 4단계: 시뮬레이터 및 Vercel에 웹 앱 URL 연결하기

발급받은 웹 앱 URL을 연결하는 방법은 두 가지입니다.

- **방법 1: Vercel 환경변수 등록 (전교생 기기 자동 적용 · 권장)**
  1. [Vercel 대시보드](https://vercel.com/)에서 배포한 프로젝트로 이동합니다.
  2. 상단 **[Settings]** 탭 → 좌측 **[Environment Variables]** 메뉴를 클릭합니다.
  3. 아래 값으로 환경변수를 추가하고 **[Save]**를 누릅니다:
     - **Key**: `VITE_GOOGLE_SCRIPT_URL`
     - **Value**: 복사한 `https://script.google.com/macros/s/.../exec` URL
  4. 상단 **[Deployments]** 탭으로 이동하여 가장 최근 배포 우측의 **`⋯` 메뉴 → [Redeploy]**를 클릭하면 그 즉시 전교생 기기에서 제출 시 해당 구글 시트로 자동 저장됩니다.

- **방법 2: 교사용 관리 페이지에서 직접 등록**
  1. 시뮬레이터 우측 상단 **[교사용 관리]**에 접속합니다.
  2. **[구글 시트(무료 DB) 실시간 연동 설정]** 버튼을 클릭합니다.
  3. **Google Apps Script 웹 앱 URL** 입력란에 주소를 붙여넣고 **[설정 저장 및 동기화]**를 누릅니다.

---

## 4. GitHub 업로드 및 Vercel 배포 요약

1. **GitHub Desktop**을 사용할 경우:
   - 변경 사항에 대한 Summary(커밋 메시지) 입력 후 **[Commit to main]** 클릭 → 상단 **[Push origin]** 클릭
2. **Vercel**에서 배포할 경우:
   - [Vercel](https://vercel.com/new) 접속 → GitHub 저장소 **[Import]** → **[Deploy]** 클릭 (Vite 프레임워크로 자동 빌드 및 배포 완료)
