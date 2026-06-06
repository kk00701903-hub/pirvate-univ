# 대학 레벨업 만족도 기록

매일 하루 만족도를 기록하며 **고려대**까지 레벨업하는 수험생 동기부여 PWA 앱입니다.

![대학 레벨업](https://img.shields.io/badge/목표-고려대학교-004b8d?style=for-the-badge)
![React](https://img.shields.io/badge/React-19-61dafb?style=for-the-badge&logo=react)
![Vite](https://img.shields.io/badge/Vite-5-646cff?style=for-the-badge&logo=vite)
![Tailwind](https://img.shields.io/badge/Tailwind-4-06b6d4?style=for-the-badge&logo=tailwindcss)

## 기능

- 📅 **매일 만족도 기록** — 1~10점 슬라이더로 오늘 하루를 평가
- 🏆 **레벨 시스템** — 누적 점수에 따라 6단계 대학 레벨 표시
- 💾 **로컬 저장** — 데이터는 기기(localStorage)에만 저장, 외부 전송 없음
- 📱 **PWA 지원** — 홈 화면에 추가하면 앱처럼 사용 가능
- 📝 **히스토리** — 과거 기록을 날짜별로 확인

## 레벨 체계

| 레벨 | 누적 점수 |
|------|---------|
| 🌱 지방 전문대 | 0 ~ 19점 |
| 🌿 지방 4년제 | 20 ~ 39점 |
| 🌳 인서울 하위 | 40 ~ 59점 |
| ⭐ 인서울 중위 | 60 ~ 79점 |
| 🔥 인서울 상위 | 80 ~ 94점 |
| 🏆 고려대학교 | 95 ~ 100점 |

## 로컬 개발

```bash
npm install
npm run dev
```

## 빌드

```bash
npm run build
```

## 배포

이 저장소는 GitHub Actions를 통해 **GitHub Pages**에 자동 배포됩니다.  
`main` 브랜치에 push하면 자동으로 빌드 및 배포됩니다.

## 기술 스택

- [React 19](https://react.dev/)
- [Vite 5](https://vitejs.dev/)
- [Tailwind CSS v4](https://tailwindcss.com/)
- [TypeScript](https://www.typescriptlang.org/)
