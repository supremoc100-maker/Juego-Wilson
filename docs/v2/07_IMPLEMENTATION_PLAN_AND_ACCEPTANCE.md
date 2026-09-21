# Wilson 2.0 — Plan de Reconstrucción y Criterios de Aceptación

## Regla principal

No reconstruir feature por feature sobre v37.

Construir una base limpia por capas.

## Fase A — Foundation

Entregables:
- schema v2;
- versioning;
- world lock;
- deterministic simulation context;
- event bus;
- repository layer;
- tick runner;
- new game generator.

Aceptación:
- nueva partida;
- 1000 meses sin corrupción;
- pausa/x1/x3/x8/x20/x60/x100;
- reload exacto.

## Fase B — Mundo y mapas

Entregables:
- world generator;
- region grid;
- knowledge;
- territory;
- routes;
- settlement placement;
- local/regional/realm/world snapshots.

Aceptación:
- viajar visualmente entre cuatro escalas;
- expansión cambia mapa;
- niebla funciona;
- información envejece.

## Fase C — Vida local

Entregables:
- persons;
- households;
- resources;
- tasks;
- food;
- housing;
- construction;
- urban districts;
- demography;
- health basic.

Aceptación:
- 25 habitantes producen una historia visible;
- no movimiento aleatorio sin tarea;
- cada obra tiene lote/materiales/trabajo;
- cada recurso tiene origen.

## Fase D — Civilización completa

Entregables:
- multiple settlements;
- colonization;
- external civilizations;
- autonomous strategic AI;
- diplomacy;
- trade;
- politics;
- institutions;
- knowledge.

Aceptación:
- tres civilizaciones pueden crecer 500 meses sin jugador;
- fundan asentamientos;
- contactan;
- comercian/rivalizan;
- fronteras cambian.

## Fase E — Guerra y conquista

Entregables:
- militia/army;
- supplies;
- campaigns;
- battles;
- occupation;
- integration;
- rebellion.

Aceptación:
- guerra completa puede iniciar y terminar;
- territorio cambia de controlador;
- bajas afectan población;
- ocupación puede fracasar.

## Fase F — Mundo vivo/fantasía

Entregables:
- wildlife;
- monsters;
- lairs;
- ruins;
- artifacts;
- climate;
- disasters.

Aceptación:
- amenaza puede bloquear ruta;
- monstruo puede atacar asentamiento;
- expedición puede descubrir ruina;
- clima afecta producción.

## Fase G — Historia y UX

Entregables:
- causal history;
- return summary;
- inspectors;
- council;
- filters;
- alerts.

Aceptación:
- para todo evento importante existe respuesta a "por qué".
- el jugador puede entender el estado sin mirar base de datos.

## Fase H — Arte y optimización

Solo aquí:
- assets finales;
- animaciones;
- audio;
- particles;
- LOD visual;
- rendimiento móvil;
- polish.

## Definition of Done del demo estructural

El demo está estructuralmente completo cuando se puede ejecutar esta historia sin herramientas administrativas:

1. crear nueva partida;
2. ver 25 habitantes;
3. sobrevivir y construir;
4. explorar;
5. descubrir regiones;
6. fundar segundo asentamiento;
7. descubrir otra civilización;
8. establecer contacto;
9. comerciar o entrar en conflicto;
10. levantar fuerza militar;
11. librar campaña;
12. conquistar o perder una región;
13. encontrar una amenaza/ruina;
14. desarrollar una institución/conocimiento;
15. observar varias generaciones;
16. acelerar a x100;
17. salir y regresar;
18. ver un mundo cambiado y explicación causal.

Si uno de esos pasos depende de manipular SQL/manual admin, el demo todavía no está completo.

## Política de despliegues

Durante diseño:
- 0 despliegues Hatchable.

Durante reconstrucción:
- un despliegue por fase grande;
- hotfix solo por bug bloqueante;
- no usar producción para experimentar arquitectura.

## Legacy v37

Se conserva para:
- comparar UX;
- rescatar assets;
- rescatar lógica probada;
- verificar regresiones.

No se usa como base arquitectónica definitiva.
