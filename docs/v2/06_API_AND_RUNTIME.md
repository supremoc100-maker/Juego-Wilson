# Wilson 2.0 — Runtime y Contratos API

## 1. Separación de responsabilidades

### Simulation Core
Sin DOM, Phaser ni UI.

### Persistence
Repositorios/queries.

### Domain Services
PopulationService
EconomyService
SettlementService
ExplorationService
CivilizationService
DiplomacyService
MilitaryService
PoliticsService
KnowledgeService
EcologyService
HealthService
HistoryService

### API
Thin controllers.

### Client
Renderiza snapshots y envía intenciones.

## 2. Ticks

### Local tick
Necesidades, tareas, producción, transporte, salud.

### Settlement tick
Inventarios, mercados, construcción, urbanismo.

### Regional tick
Rutas, expediciones, fauna, monstruos, clima, control.

### Strategic tick
Civilizaciones, diplomacia, guerra, política, tecnología.

Frecuencias internas pueden diferir, pero todo deriva del mismo world_month.

## 3. Velocidad

simulation_speed persistente:
0,1,3,8,20,60,100

Motor convierte tiempo real en meses simulados.

Reglas:
- nunca descartar fracción de tiempo;
- catch-up idempotente;
- máximo de trabajo por transacción;
- continuar en lotes si backlog;
- evitar doble tick concurrente.

## 4. Lock de mundo

world_runtime_lock:
- world_id;
- lock_owner;
- acquired_at;
- expires_at;
- last_completed_month.

Cada avance adquiere lock transaccional.

## 5. API v2

GET /api/v2/bootstrap
Devuelve shell + mundo + permisos + versiones.

GET /api/v2/local?settlement_id=
Snapshot local.

GET /api/v2/region?region_id=
Snapshot regional.

GET /api/v2/realm
Snapshot del reino del jugador.

GET /api/v2/world
Snapshot de conocimiento global.

GET /api/v2/entity/:type/:id
Inspector contextual.

POST /api/v2/orders
Crea/cambia objetivo estratégico.

POST /api/v2/diplomacy
Acción diplomática.

POST /api/v2/military
Objetivo militar.

POST /api/v2/decisions/:id
Resolver decisión.

POST /api/v2/speed
Cambiar velocidad.

POST /api/v2/new-game
Nueva partida.

GET /api/v2/history
Eventos causales filtrados.

## 6. Snapshots

No enviar todas las personas al mapa mundial.

Local:
- detailed people;
- buildings;
- tasks;
- local resources.

Region:
- settlements;
- routes;
- expeditions;
- sites;
- armies;
- threats.

Realm:
- provinces;
- settlements summaries;
- diplomacy;
- military;
- economy summaries.

World:
- only known macro entities.

## 7. Versionado

simulation_schema_version
client_snapshot_version
save_version

El cliente puede detectar incompatibilidad.

## 8. Recuperación

Cada gran proceso usa:
- deterministic seed;
- transaction;
- idempotency key;
- event log.

Si falla un tick:
- no debe dejar materiales descontados sin tarea;
- no debe duplicar nacimiento;
- no debe duplicar conquista.

## 9. Pruebas mínimas

- 1000 meses simulados sin excepción;
- reset completo;
- speed switch;
- concurrent advance;
- offline catch-up;
- civilization expansion;
- war;
- famine;
- colony;
- monster attack;
- population growth/collapse;
- save/reload consistency.
