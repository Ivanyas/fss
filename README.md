# File Storage Service (FSS)

Веб-приложение для загрузки, хранения и скачивания файлов.

## Технологии

- Backend: Java 17, Spring Boot 3
- Frontend: React + Vite
- БД: PostgreSQL
- Docker, Docker Compose

## Запуск

```bash
docker-compose up --build
```

После запуска:
- Frontend: http://localhost:3001
- Backend API: http://localhost:8080

## API

| Метод | URL | Описание |
|-------|-----|----------|
| GET | /api/files | Получить список файлов |
| POST | /api/files/upload | Загрузить файлы |
| GET | /api/files/download/{id} | Скачать файл |
| DELETE | /api/files | Удалить файлы |
