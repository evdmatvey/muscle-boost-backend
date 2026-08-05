# Changelog

All notable changes to this project are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2026-08-05

First MVP release for the client: workout planning, training diary, analytics, plus staging/production deploy and basic observability.

### Added

- **user-profiles** - `GET` / `PATCH /api/v1/user-profiles/me`
- **exercises** — catalog listing with filters and pagination, custom exercise create, system exercise seed
- **workout-plans** — plan CRUD with nested exercises and sets; server-computed `workoutType`
- **workout-sessions** - training diary: create from plan or ad-hoc, start/complete/cancel, nested exercises and set logs
- **analytics** - read-only summary, exercise progress, and muscle-group volume (`WEEK` … `YEAR`)
- **health** - `GET /api/health/live`, `GET /api/health/ready`
- Docker staging/production stack (`Dockerfile`, `docker-compose.yml`) with one-shot migrations
- GitHub Actions CD via GHCR (staging on `main`, production on GitHub Release `v*`)
- Structured Pino logging and unified exception filters
- Prometheus metrics at `GET /metrics` (process defaults + HTTP request metrics)
- Local observability stack: Grafana, Prometheus, Loki, Promtail (`docker-compose.observability.yml`)

### Fixed

- Parse mobile device name from client User-Agent
- Return `401` with `INVALID_ACCESS_TOKEN` for expired/invalid access JWT
- Staging deploy `git fetch` when checking out the release ref
- Record HTTP metrics in middleware; harden Grafana dashboards

## [0.1.0] - 2025

### Added

- User registration and JWT authentication (access + refresh)
- Session management (list, revoke one, revoke all)
- Refresh token rotation with grace window

[1.0.0]: https://github.com/evdmatvey/muscle-boost-backend/compare/v0.1.0...v1.0.0
[0.1.0]: https://github.com/evdmatvey/muscle-boost-backend/releases/tag/v0.1.0
