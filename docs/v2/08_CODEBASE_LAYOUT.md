# Wilson 2.0 — Estructura del Código

## Objetivo

Que ningún archivo vuelva a convertirse en un monolito como `sim.js`.

## Backend

```
server/
  core/
    clock.js
    simulation-context.js
    world-lock.js
    rng.js
    event-bus.js
    versioning.js

  persistence/
    repositories/
      world-repository.js
      person-repository.js
      settlement-repository.js
      region-repository.js
      civilization-repository.js
      economy-repository.js
      military-repository.js
      history-repository.js

  domains/
    population/
      person-service.js
      household-service.js
      demography-service.js
      health-service.js

    settlements/
      settlement-service.js
      urban-planner.js
      building-service.js
      construction-service.js

    resources/
      resource-service.js
      inventory-service.js
      logistics-service.js

    economy/
      production-service.js
      market-service.js
      trade-service.js
      currency-service.js
      treasury-service.js

    exploration/
      expedition-service.js
      knowledge-map-service.js
      colonization-service.js

    civilizations/
      civilization-service.js
      strategic-ai.js
      diplomacy-service.js

    military/
      recruitment-service.js
      army-service.js
      campaign-service.js
      battle-service.js
      occupation-service.js

    politics/
      council-service.js
      faction-service.js
      law-service.js
      succession-service.js

    knowledge/
      knowledge-service.js
      technology-service.js
      education-service.js

    culture/
      culture-service.js
      religion-service.js
      language-service.js

    ecology/
      wildlife-service.js
      monster-service.js
      site-service.js

    climate/
      climate-service.js
      disaster-service.js

    history/
      causal-history-service.js
      return-summary-service.js

  simulation/
    local-tick.js
    settlement-tick.js
    regional-tick.js
    strategic-tick.js
    catch-up-runner.js

api/v2/
  bootstrap.js
  local.js
  region.js
  realm.js
  world.js
  entity.js
  orders.js
  diplomacy.js
  military.js
  decisions.js
  speed.js
  new-game.js
  history.js
```

## Frontend

```
client/
  app/
    state-store.js
    api-client.js
    router.js

  views/
    local/
      local-scene.js
      people-layer.js
      building-layer.js
      resource-layer.js
      task-layer.js

    region/
      region-map.js
      routes-layer.js
      expedition-layer.js
      threat-layer.js

    realm/
      realm-map.js
      territory-layer.js
      army-layer.js
      settlement-layer.js

    world/
      world-map.js
      civilization-layer.js
      fog-layer.js
      macro-threat-layer.js

  panels/
    entity-inspector.js
    council-panel.js
    diplomacy-panel.js
    military-panel.js
    economy-panel.js
    knowledge-panel.js
    history-panel.js

  ui/
    header.js
    speed-controls.js
    breadcrumbs.js
    alerts.js
```

## Regla de dependencias

Core no conoce UI.

Domains pueden depender de core y persistence abstractions.

Simulation orquesta domains.

API llama simulation/domain services.

Frontend solo consume API/snapshots y envía intenciones.

No existe importación desde frontend hacia backend.

## Regla de módulo

Un dominio no modifica directamente tablas de otro dominio.

Ejemplo:
- MilitaryService no descuenta comida manualmente.
- Solicita suministros a Logistics/Economy.
- Economy registra la transferencia.
- Military recibe el resultado.

## Estado visual

El cliente puede interpolar:
- posición;
- animación;
- partículas;
- transición.

El cliente no puede decidir:
- nacimiento;
- muerte;
- recurso consumido;
- conquista;
- relación diplomática;
- construcción completada.

## Legacy adapter

Durante migración se permite:
```
adapters/
  legacy-v37/
```

Su función:
- leer saves antiguos;
- convertir datos;
- importar assets;
- nunca introducir reglas nuevas.
