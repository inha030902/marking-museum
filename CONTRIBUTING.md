# 협업 규칙 (젝커톤용)

1. `develop`에서 작업 브랜치를 만든다: `git switch develop && git pull && git switch -c feat/작업이름`
2. 작업 후 push: `git push -u origin feat/작업이름`
3. GitHub에서 **develop 대상으로 PR**을 올린다 (기본 대상이 develop).
4. 최종 배포 전에 `develop → main` PR을 올려 병합하고, main에서 배포한다.

- PR은 작게, 자주. 같은 파일을 여러 명이 동시에 크게 고치지 않기.
- 로컬 실행: `npm install` → `npm run dev` (로컬에서는 DB 대신 브라우저 저장소 사용)
- 비밀값(.env, API 키)은 절대 커밋하지 않기.
