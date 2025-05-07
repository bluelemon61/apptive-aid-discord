# APPTIVE X AID 공동 Discord Bot 
**공동의 소통채널에 대하여**
- APPTIVE, AID 동아리에 공동 채널을 만들고, 디코 봇이 메시지를 릴레이 한다.
    - 공동 공지 채널
    - 공동 스터디 모집 채널
    - 공동 프로젝트 모집 채널

## 배포

### 1. 프로젝트 구조 생성 및 레포지터리 복제

```shell
mkdir apptive-aid-discord && cd apptive-aid-discord
git clone https://github.com/bluelemon61/apptive-aid-discord.git app
mkdir data
```

### 2. Docker Compose 파일 생성

생성한 apptive-aid-discord 폴더 아래에 `compose.yml` 파일을 생성한 후 아래 내용을 붙여넣고, 각 환경에 맞게 설정해 줍니다.

```shell
vim compose.yml
```

```yaml
services:
  app:
    container_name: apptive-aid-discord-app
    restart: unless-stopped
    network_mode: host # 중요: discord bot을 docker로 구동 시 이 옵션이 있어야 지연 시간을 감소시킬 수 있음!
    build: app
    depends_on:
      - db
    environment:
      DISCORD_TOKEN: # 발급받은 Discord Bot Token을 채워넣습니다.
      DATABASE_URL: mysql://mysql:mysql@db:3306/aidapptive

  db:
    container_name: apptive-aid-discord-db
    restart: unless-stopped
    image: mysql:5.7
    environment:
      MYSQL_ROOT_PASSWORD: mysql
      MYSQL_DATABASE: aidapptive
      MYSQL_USER: mysql
      MYSQL_PASSWORD: mysql
    volumes:
      - ./data:/var/lib/mysql
```

### 3. 실행

```shell
docker compose up -d
```