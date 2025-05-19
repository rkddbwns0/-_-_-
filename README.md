# 넥슨 백엔드 과제 제출

# 사용 기술
- Node.js(v.18)
- NestJS
- Docker + docker-compose
- Mongodb

# docker Compose
docker Compose 실행
- docker-compose up --build

# 서버 구조

### 1. gateway-server
- 모든 요청을 받아 라우터 수행
- jwt토큰 인증 및 role 검증 수행
- POST, GET, UPDATE, DELETE와 같은 method를 처리하기 위해 @ALL 데코레이션을 활용.

### 2. auth-server
- 로그인 및 역할 검증
- 본인 확인

### 3. event-server
- 모든 이벤트 관련 요청 처리

# 이벤트 설계

### 1. (POST) /event/createEvent
   - 이벤트 설계 라우터입니다.
   - 이벤트 명, 상세 설명, 조건 등과 리워드를 입력하면 해당 데이터를 mongodb에 저장하도록 구현하였습니다.
   - 이벤트와 리워드의 경우 contersdb를 따로 구성하여 event_no, reward_no를 저장하여 쉽게 이벤트와 리워드를 찾을 수 있도록 구현하였습니다.
   - 이벤트를 호출할 경우 reward에 대한 데이터 또한 함께 호출되도록 구현하였습니다.

### 2. (GET) /event/eventList/:classification
   - 분류 별 이벤트 리스트 호출 라우터입니다.
   - '출석', '초대', '일일', '반복' 등 분류를 하여 종류를 입력하면 그에 대한 이벤트 리스트를 호출하도록 구현하였습니다.

### 3. (POST) /event/participationEvent
   - 이벤트 참여 라우터입니다.
   - 사용자가 특정 event_no에 요청을 보내면 이벤트의 진행 유무, 참여 유무에 따라 결과를 처리하도록 구현하였습니다.

### 4. (POST) /event/eventReward
   - 사용자가 이벤트 보상을 요청하는 라우터입니다.
   - 요청을 보낼 시 event_no에 대하여 보상 지급 조건을 충족하였는지 판단합니다.
   - 이미 보상을 받은 상태일 경우 중복 보상을 받을 수 없도록 하였고, 해당 요청에 대한 로그를 db에 저장하도록 구현하였습니다.

### 5. (POST) /event/rewardPayment
    - 보상지급 라우터입니다.
    - admin 역할의 관리자는 사용자의 보상 요청에 대하여 보상을 지급할 수 있습니다.
    - 보상을 지급할 경우 해당 기록은 db에 저장됩니다.

### 6. (GET) /event/reqRewardLog/:user_id
   - 사용자가 리워드 요청 내역을 확인하는 라우터입니다.
   - query 문자로 event_no와 함께 요청을 할 경우 특정 이벤트에 대한 내역만 확인이 가능하도록 구현하였습니다.

### 7. (GET) /event/readRewardLog
    - 모든 관리자가 사용할 수 있는 라우터로, 사용자에게 보상을 지급, 보상 요청 등에 대한 모든 로그를 확인할 수 있는 라우터입니다.
  
# 조건 검증 방식
auth-server에서 로그인을 할 경우 쿠키에 access_token과 refresh_token을 저장합니다.<br/>
gateway-server에서 useGuard와 RolesGurad를 통해 auth-server에서 쿠키로 저장되어 넘어온 토큰을 검증하여 users 컬렉션에 저장된 refersh_token과 일치하는지 파악합니다.<br/>
인증이 모두 통과될 경우, 모든 라우터에 대한 서비스를 role에 맞게 사용할 수 있도록 하였습니다.<br/>
인증에 실패할 경우 모든 서비스를 사용할 수 없습니다.<br/>
모든 라우터(login, signup 제외)는 요청을 보낼 때마다 인증 과정을 거치도록 하였습니다.<br/>
event-server의 경우, 조건을 통과하고 들어온 정보에 대해 권한 검증을 한 번 더 실행하여 사용자 혹은 관리자가 조건에 맞는 서비스만 이용할 수 있도록 구현하였습니다.

# API 구조 선택 이유

### @All() 데코레이터a
저는 gateway-server에서 모든 라우터에 대한 API 호출 방식을 @All 데코레이터를 활용하여 구현하였습니다.<br/>
이 데코레이터를 선택한 이유는, 각 서버마다 구현한 API를 gateway-server에도 똑같이 구현할 경우 효율성이 떨어진다고 생각하였습니다.<br/>
.env파일에 저장해둔 서버의 uri와 /gateway 뒤에 오는 라우터를 합쳐 실제 다른 서버에서 사용하는 API를 호출할 수 있도록 하였습니다.<br/>(ex. /gateway/event/readRewardLog)<br/>
단, login, signup, logout의 경우, 인증 과정을 거칠 필요가 없기 때문에 해당 API는 gateway-server에서도 분리하여 구현하였습니다.
