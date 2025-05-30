# 넥슨 백엔드 과제 제출

# 사용 기술
- Node.js(v.18)
- NestJS
- Docker + docker-compose
- Mongodb

# docker Compose
### docker Compose 실행
- docker-compose up --build

### mongodb
- docker exec -it mongodb mongosh

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
   - 
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
1. auth-server에서 로그인을 할 경우 쿠키에 access_token과 refresh_token을 저장합니다.<br/>
2. gateway-server에서 useGuard와 RolesGurad를 통해 auth-server에서 쿠키로 저장되어 넘어온 토큰을 검증하여 users 컬렉션에 저장된 refersh_token과 일치하는지 파악합니다.<br/>
3. 인증이 모두 통과될 경우, 모든 라우터에 대한 서비스를 role에 맞게 사용할 수 있도록 하였습니다.<br/>
4. 인증에 실패할 경우 모든 서비스를 사용할 수 없습니다.<br/>
5. 모든 라우터(login, signup 제외)는 요청을 보낼 때마다 인증 과정을 거치도록 하였습니다.<br/>
6. event-server의 경우, 조건을 통과하고 들어온 정보에 대해 권한 검증을 한 번 더 실행하여 사용자 혹은 관리자가 조건에 맞는 서비스만 이용할 수 있도록 구현하였습니다.

# API 구조 선택 이유

### @All() 데코레이터 (ex. @All('/auth/*path))
저는 gateway-server에서 모든 라우터에 대한 API 호출 방식을 @All 데코레이터를 활용하여 구현하였습니다.<br/>
이 데코레이터를 선택한 이유는, 각 서버마다 구현한 API를 gateway-server에도 똑같이 구현할 경우 효율성이 떨어진다고 생각하였습니다.<br/>
.env파일에 저장해둔 서버의 uri와 /gateway 뒤에 오는 라우터를 합쳐 실제 다른 서버에서 사용하는 API를 호출할 수 있도록 하였습니다.<br/>(ex. /gateway/event/readRewardLog)<br/>
단, login, signup, logout의 경우, 인증 과정을 거칠 필요가 없기 때문에 해당 API는 gateway-server에서도 분리하여 구현하였습니다.

# 기능을 구현하며 고민한 점

### 1. 이벤트 생성 후, 이벤트 참여를 위한 조건을 어떻게 관리하고, 저장해아 하는가
- 이벤트를 생성하고 난 뒤, 이벤트의 달성 조건과 그에 대한 사용자들의 참여 관리를 어떻게 해야 하는가에 대해 고민을 하엿습닌다.
- 이벤트를 생성하는 경우, 사용자가 이벤트를 참여했을 때, 조건에 대한 핸들러를 생성하여 관리하는 것을 생각하게 되었습니다.
- 이벤트 (출석, 친구 초대, 몬스터 퇴치) 등과 같은 정보들을 각각 핸들러로 구분하여 사용자가 참여하고자 하는 이벤트의 분류를<br/> 확인하고 그에 맞는 조건을 저장하도록 구현하였습니다.

### 2. 관리자가 보상을 지급하는 과정에서 어떤 데이터들을 어떤 순서로 저장해야 되는가
- 관리자가 사용자에게 이벤트 보상을 지급하는 과정에서 지급 상태, 지급된 아이템 로그, 지급 완료에 대한 로그 세 가지의<br/> 데이터를 컬렉션을 생성하여 저장하도록 하였습니다.
- 이러한 과정에서 저는 어떤 순서로 데이터를 저장해야 되는지 고민을 하게 되었습니다.
- 제가 구현한 순서는 지급 상태 변경 -> 아이템 로그 저장 -> 지급 완료 로그 저장 순서로 저장하였습니다.
- 보상 지급 과정에서 로그가 기록되지 않았을 경우, 앞에 저장된 데이터들을 통해 지급에 문제가 없었는지 확인할 수 있고,<br/>
사용자의 지급 상태가 변경되었더라도 아이템이 지급되지 않았으면 오류로 인한 미발급을 확인할 수 있다고 생각하여<br>
이러한 순서로 구현하게 되었습니다.

