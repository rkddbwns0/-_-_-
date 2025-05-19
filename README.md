# 넥슨 백엔드 과제 제출

1. docker Compose 실행
    docker-compose up --build

# 서버 구조
1. gateway-server
- 모든 요청을 받아 라우터 수행

구현 내용
- jwt토큰 인증 및 role 검증 수행
- POST, GET, UPDATE, DELETE와 같은 method를 처리하기 위해 @ALL 데코레이션을 활용.

2. auth-server
- 로그인 및 역할 검증
- 

   
