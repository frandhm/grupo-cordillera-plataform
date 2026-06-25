# Plataforma Grupo Cordillera

Plataforma de gestión de KPIs, metas y equipos de trabajo para Grupo Cordillera. Monorepo construido con **Nx** que organiza un sistema de microservicios NestJS, una API Gateway con autenticación JWT y un frontend React con visualizaciones en tiempo real.

---

## Tabla de contenidos

- [Arquitectura](#arquitectura)
- [Estructura del monorepo](#estructura-del-monorepo)
- [Stack tecnológico](#stack-tecnológico)
- [Requisitos](#requisitos)
- [Instalación](#instalación)
- [Variables de entorno](#variables-de-entorno)
- [Levantar bases de datos con Docker](#levantar-bases-de-datos-con-docker)
- [Ejecutar los servicios](#ejecutar-los-servicios)
- [Puertos y URLs](#puertos-y-urls)
- [Documentación Swagger](#documentación-swagger)
- [Autenticación y roles](#autenticación-y-roles)
- [Endpoints del API Gateway](#endpoints-del-api-gateway)
- [Dominio del negocio](#dominio-del-negocio)
- [Patrones de diseño aplicados](#patrones-de-diseño-aplicados)
- [Tests](#tests)
- [Comandos Nx útiles](#comandos-nx-útiles)

---

## Arquitectura

El sistema sigue una arquitectura de **microservicios** con un **API Gateway** como punto de entrada único (patrón BFF — Backend for Frontend).

```
┌─────────────────────────────────────────────┐
│              Frontend (React + Vite)         │
│                  :5173                       │
└────────────────────┬────────────────────────┘
                     │ proxy vía Vite
                     ▼
┌─────────────────────────────────────────────┐
│           API Gateway (NestJS)               │
│     :3000  │  JWT Auth  │  RBAC  │  Swagger  │
└──────┬──────────┬───────────────┬────────────┘
       │          │               │
       ▼          ▼               ▼
  ┌─────────┐ ┌─────────┐  ┌──────────┐
  │ ms-kpis │ │ms-metas │  │ms-equipos│
  │  :3001  │ │  :3002  │  │  :3003   │
  └────┬────┘ └────┬────┘  └────┬─────┘
       │           │            │
       ▼           ▼            ▼
  ┌─────────┐ ┌─────────┐  ┌──────────┐
  │  DB KPIs│ │DB Metas │  │DB Equipos│
  │  :5432  │ │  :5433  │  │  :5434   │
  │PostgreSQL│ │PostgreSQL│  │PostgreSQL│
  └─────────┘ └─────────┘  └──────────┘
```

---

## Estructura del monorepo

```
grupo-cordillera-plataform/
├── apps/
│   ├── api-gateway/          # Puerta de entrada, autenticación JWT y enrutamiento
│   ├── api-gateway-e2e/      # Tests E2E del gateway
│   ├── ms-kpis/              # Microservicio de indicadores de desempeño
│   ├── ms-kpis-e2e/          # Tests E2E de KPIs
│   ├── ms-metas/             # Microservicio de objetivos estratégicos
│   ├── ms-metas-e2e/         # Tests E2E de metas
│   ├── ms-equipos/           # Microservicio de equipos y estructura organizacional
│   ├── ms-equipos-e2e/       # Tests E2E de equipos
│   └── frontend/             # Dashboard React con visualizaciones
│
├── shared-interfaces/        # Interfaces TypeScript compartidas entre servicios
│
├── docker-compose.yml        # Bases de datos PostgreSQL (3 instancias)
├── nx.json                   # Configuración del workspace Nx
├── package.json
└── .env.example
```

---

## Stack tecnológico

| Capa | Tecnología |
|---|---|
| Monorepo | Nx 22.7.1 |
| Backend | NestJS 11, TypeScript 5.9 |
| ORM | TypeORM 0.3 |
| Base de datos | PostgreSQL 15 |
| Autenticación | JWT (`@nestjs/jwt`, `passport-jwt`) |
| Documentación API | Swagger (`@nestjs/swagger`) |
| Frontend | React 18, Vite 5, TypeScript |
| Visualizaciones | Recharts |
| Validación | `class-validator`, `class-transformer` |
| Testing | Jest, `@nestjs/testing` |
| Contenedores | Docker Compose |
| Linting/Formato | ESLint 9, Prettier |

---

## Requisitos

- **Node.js** >= 20
- **npm** >= 10
- **Docker** y **Docker Compose** (para las bases de datos)
- **Nx CLI** (opcional, se puede usar `npx nx`)

---

## Instalación

```bash
# Clonar el repositorio
git clone <url-del-repo>
cd grupo-cordillera-plataform

# Instalar dependencias del monorepo
npm install

# Instalar dependencias del frontend (tiene su propio package.json)
cd apps/frontend && npm install && cd ../..
```

---

## Variables de entorno

Copia el archivo de ejemplo y completa los valores:

```bash
cp .env.example .env
```

```env
# Base de datos de KPIs (puerto 5432)
DB_KPIS_HOST=localhost
DB_KPIS_PORT=5432
DB_KPIS_USER=postgres
DB_KPIS_PASSWORD=tu_password
DB_KPIS_NAME=db_kpis

# Base de datos de Metas (puerto 5433)
DB_METAS_HOST=localhost
DB_METAS_PORT=5433
DB_METAS_USER=postgres
DB_METAS_PASSWORD=tu_password
DB_METAS_NAME=db_metas

# Base de datos de Equipos (puerto 5434)
DB_EQUIPOS_HOST=localhost
DB_EQUIPOS_PORT=5434
DB_EQUIPOS_USER=postgres
DB_EQUIPOS_PASSWORD=tu_password
DB_EQUIPOS_NAME=db_equipos
```

---

## Levantar bases de datos con Docker

El proyecto usa tres instancias de PostgreSQL independientes, una por microservicio:

```bash
docker-compose up -d
```

| Contenedor | Base de datos | Puerto host |
|---|---|---|
| `cordillera-db-kpis` | db_kpis | 5432 |
| `cordillera-db-metas` | db_metas | 5433 |
| `cordillera-db-equipos` | db_equipos | 5434 |

Para detener los contenedores:

```bash
docker-compose down
```

---

## Ejecutar los servicios

Cada servicio se levanta de forma independiente. Se recomienda abrir una terminal por servicio:

```bash
# API Gateway
npx nx serve api-gateway

# Microservicio de KPIs
npx nx serve ms-kpis

# Microservicio de Metas
npx nx serve ms-metas

# Microservicio de Equipos
npx nx serve ms-equipos

# Frontend
cd apps/frontend && npm run dev
```

---

## Puertos y URLs

| Servicio | Puerto | URL base |
|---|---|---|
| API Gateway | 3000 | `http://localhost:3000/api` |
| ms-kpis | 3001 | `http://localhost:3001/api` |
| ms-metas | 3002 | `http://localhost:3002/api` |
| ms-equipos | 3003 | `http://localhost:3003/api` |
| Frontend | 5173 | `http://localhost:5173` |

---

## Documentación Swagger

Cada servicio expone su propia documentación interactiva:

| Servicio | Swagger UI |
|---|---|
| API Gateway | `http://localhost:3000/api/docs` |
| ms-kpis | `http://localhost:3001/api/docs` |
| ms-metas | `http://localhost:3002/api/docs` |
| ms-equipos | `http://localhost:3003/api/docs` |

---

## Autenticación y roles

El sistema usa **JWT Bearer Token** con tres roles de acceso. Las credenciales de demo son:

| Usuario | Contraseña | Rol | Accesos |
|---|---|---|---|
| `admin@cordillera.com` | `123456` | `jefe` | Todos los endpoints + logs + crear equipos |
| `gerente@cordillera.com` | `123456` | `gerente` | KPIs, metas, resumen, equipos (lectura) |
| `vendedor@cordillera.com` | `123456` | `vendedor` | Solo lectura de KPIs |

### Flujo de autenticación

```bash
# 1. Login
POST http://localhost:3000/api/auth/login
{
  "usuario": "admin@cordillera.com",
  "clave": "123456"
}

# Respuesta
{
  "access_token": "<jwt>",
  "mensaje": "Bienvenido, jefe del Sistema Cordillera"
}

# 2. Usar el token en peticiones protegidas
Authorization: Bearer <jwt>
```

---

## Endpoints del API Gateway

Todos los endpoints (excepto `/auth/login`) requieren el header `Authorization: Bearer <token>`.

| Método | Ruta | Roles permitidos | Descripción |
|---|---|---|---|
| `POST` | `/api/auth/login` | Público | Autenticación y obtención de JWT |
| `GET` | `/api/dashboard/kpis` | jefe, gerente, vendedor | Lista todos los KPIs |
| `POST` | `/api/dashboard/kpis` | jefe, gerente | Crear un nuevo KPI |
| `GET` | `/api/dashboard/equipos` | jefe, gerente | Lista todos los equipos |
| `POST` | `/api/dashboard/equipos` | jefe | Crear un nuevo equipo |
| `GET` | `/api/dashboard/resumen` | jefe, gerente | Resumen consolidado KPIs + Metas (BFF) |
| `GET` | `/api/dashboard/logs` | jefe | Logs de auditoría del sistema |

---

## Dominio del negocio

### KPIs (`ms-kpis`)
Indicadores de desempeño con historial de mediciones. Cada KPI registra automáticamente una medición inicial al crearse y guarda el historial cada vez que su valor se actualiza.

**Entidad KPI:** `id (uuid)`, `nombre`, `valor`, `areaId`, `descripcion`, `unidadMedicion`, `equipoId`, `responsable`, `fechaCreacion`
**Entidad Medición:** `id`, `valor`, `fecha`, relación con KPI

### Metas (`ms-metas`)
Objetivos estratégicos vinculados a un KPI. El microservicio calcula automáticamente la tasa de cumplimiento comparando las mediciones del período contra el valor objetivo. Soporta operadores de comparación (`>=`, `<=`, `=`) para contemplar distintos tipos de metas (mayor es mejor, menor es mejor, exacto).

**Entidad Meta:** `id (uuid)`, `nombre`, `areaId`, `equipoId`, `indicadorId`, `periodo`, `fechaInicio`, `fechaFin`, `valorObjetivo`, `operador`, `unidad`, `descripcionObjetivo`, `estado`, `fechaCreacion`

**Estados posibles de una meta:** `CUMPLIDA`, `EN_PROGRESO`, `EN_RIESGO`, `VENCIDA`

### Equipos (`ms-equipos`)
Estructura organizacional: equipos de trabajo agrupados por área.

**Entidad Equipo:** `id (uuid)`, `nombre`, `lider`, `areaId`, `area`, `cantidadIntegrantes`, `fechaCreacion`
**Entidad Área:** relacionada N:1 con Equipos

### Auditoría (api-gateway)
El gateway mantiene un log en memoria de las acciones relevantes del sistema: inicios de sesión exitosos y fallidos, creación de KPIs y equipos, y advertencias del sistema.

---

## Patrones de diseño aplicados

| Patrón | Dónde | Descripción |
|---|---|---|
| **Factory Method** | `ms-kpis/KpiFactory` | Encapsula la construcción de entidades KPI según su tipo |
| **Facade** | `ms-metas/KpiApiFacade` | Abstrae la comunicación HTTP con `ms-kpis` desde el servicio de metas |
| **BFF (Backend for Frontend)** | `api-gateway/obtenerResumenConsolidado` | Agrega y combina datos de `ms-kpis` y `ms-metas` en una sola respuesta optimizada para el dashboard |

---

## Tests

```bash
# Tests unitarios de todos los proyectos
npx nx run-many -t test

# Tests de un proyecto específico
npx nx test api-gateway
npx nx test ms-kpis
npx nx test ms-metas
npx nx test ms-equipos

# Tests E2E
npx nx e2e api-gateway-e2e
npx nx e2e ms-kpis-e2e
npx nx e2e ms-metas-e2e
npx nx e2e ms-equipos-e2e
```

---

## Comandos Nx útiles

```bash
# Ver el grafo de dependencias del monorepo
npx nx graph

# Build de producción de un servicio
npx nx build api-gateway

# Listar todos los targets disponibles de un proyecto
npx nx show project ms-kpis

# Correr linting en todos los proyectos
npx nx run-many -t lint

# Agregar una nueva app NestJS al monorepo
npx nx g @nx/nest:app nombre-servicio

# Agregar una nueva librería compartida
npx nx g @nx/node:lib nombre-lib
```
