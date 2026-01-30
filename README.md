# ThreeForge Survivor

ThreeForge 프레임워크를 사용한 뱀파이어 서바이버 스타일 게임

## 설치 및 실행

```bash
# 클론 (submodule 포함)
git clone --recursive https://github.com/painh/threeforge-survivor.git
cd threeforge-survivor

# 이미 클론한 경우 submodule 초기화
git submodule update --init

# 의존성 설치 및 실행
npm install
npm run dev
```

브라우저에서 http://localhost:3000 접속

## 조작법

- **WASD / 방향키**: 이동
- **Space**: 공격

## 주요 기능

- 플레이어 이동 및 카메라 추적
- 적 스폰 시스템 (ObjectPool 사용)
- 충돌 감지
- GameLoop (Fixed timestep + Variable update)

## 프로젝트 구조

```
src/
├── main.ts              # 엔트리 포인트
├── Game.ts              # 게임 메인 클래스
├── core/
│   ├── GameLoop.ts      # 게임 루프
│   ├── InputManager.ts  # 입력 관리
│   └── ObjectPool.ts    # 오브젝트 풀
├── rendering/
│   ├── Camera2D.ts      # 탑다운 카메라
│   └── SpriteRenderer.ts
├── scenes/
│   ├── BaseScene.ts
│   ├── SceneManager.ts
│   └── GameScene.ts
├── entities/
│   ├── Player.ts
│   └── Enemy.ts
└── systems/
    ├── SpawnSystem.ts
    └── CollisionSystem.ts
```

## Tech Stack

- ThreeForge (게임 프레임워크)
- TypeScript
- Three.js
- Vite

## Credits

- 아이콘: [credit.txt](./credit.txt) 참조

## License

MIT
