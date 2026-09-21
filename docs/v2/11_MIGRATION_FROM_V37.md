# Wilson 2.0 — Estrategia de Migración desde v37

## Principio

v37 no se "arregla" hasta convertirse en v2.

v2 se reconstruye con arquitectura nueva y usa v37 solo como fuente de componentes comprobados.

## Qué se conserva

### Conceptos
- principio de soberano estratégico;
- personas individuales;
- hogares;
- construcción con materiales;
- inventarios físicos;
- resource nodes;
- exploración;
- expansión;
- órdenes múltiples;
- nueva partida;
- PWA.

### Datos/algoritmos potencialmente reutilizables
- generación de nombres;
- atributos de personas;
- parte de demografía;
- algunas fórmulas de producción;
- sprites/assets;
- layouts visuales como referencia;
- lógica de eventos;
- serialización básica.

## Qué no se hereda como arquitectura

- sim.js monolítico;
- snapshot único gigantesco;
- coordenadas hardcoded como planificación urbana;
- lógica visual usada para simular estado;
- funciones con responsabilidades múltiples;
- migraciones acumulativas como diseño definitivo;
- tablas duplicando totales sin reconciliación explícita;
- navegación basada en un solo mapa local.

## Migración de saves

No es prioridad del primer demo v2.

Orden:
1. terminar v2;
2. crear LegacyImporter;
3. mapear world/persons/households/buildings/resources/history;
4. convertir región local a región v2;
5. generar datos v2 que no existían;
6. validar invariantes.

## Entorno

### legacy
v37 live, solo referencia.

### v2-dev
rama y backend de desarrollo limpio.

### v2-demo
primer entorno desplegado cuando Foundation+B+C estén integrados.

No desplegar cambios estructurales v2 sobre la base legacy antes de tener schema v2 estable.

## Primera migración v2

Idealmente una migración base consolidada:
0001_v2_schema.sql

No 20+ migraciones históricas para crear una nueva partida.

Migraciones posteriores representan cambios reales del schema v2.

## Criterio de corte

Se deja de depender de v37 cuando v2 puede:
- crear partida;
- simular 1000 meses;
- navegar escalas;
- mantener población;
- construir;
- explorar;
- crear segundo asentamiento.

A partir de ese punto v37 queda solo archivada.
