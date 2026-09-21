# Wilson 2.0 — Architecture Freeze

Esta carpeta es la fuente de verdad para la reconstrucción estructural de Wilson.

## Decisión

- `main` / v37 queda como prototipo legado y referencia funcional.
- No se añadirán sistemas estructurales nuevos directamente sobre v37.
- Wilson 2.0 se diseña por completo antes de reconstruir backend/frontend.
- La implementación visual final se afina después de que el demo estructural completo funcione.

## Objetivo de Wilson 2.0

Construir un simulador persistente de civilización autónoma donde:

> El jugador indica qué quiere conseguir; la civilización decide cómo hacerlo y el mundo muestra físicamente las consecuencias.

El jugador debe poder observar el arco completo:

25 habitantes → aldea → territorio → múltiples asentamientos → reino → contacto exterior → comercio/diplomacia → guerra/conquista → instituciones → cultura/tecnología → mundo histórico persistente.

## Regla de completitud del demo

Antes de pulir arte, todos estos dominios deben existir de extremo a extremo:

1. mundo multiescala;
2. población/familias;
3. recursos/economía;
4. construcción/urbanismo;
5. exploración/colonización;
6. civilizaciones externas;
7. diplomacia;
8. militar/conquista;
9. política/instituciones;
10. conocimiento/tecnología;
11. cultura/religión;
12. fauna/monstruos/ruinas;
13. clima/salud/desastres;
14. historia causal;
15. tiempo/offline/velocidades;
16. UI navegable para todos los anteriores.

Cada dominio necesita:
- estado persistente;
- reglas de simulación;
- API/snapshot;
- representación mínima;
- prueba de aceptación.

## Velocidades

Pausa, x1, x3, x8, x20, x60, x100.

Todas deben utilizar la misma simulación autoritativa. Ninguna velocidad puede saltarse procesos causales.

## Documentos

- 01_WORLD_MODEL.md
- 02_SIMULATION_DOMAINS.md
- 03_DATA_MODEL.md
- 04_GAMEPLAY_AND_PROGRESSION.md
- 05_UI_NAVIGATION.md
- 06_API_AND_RUNTIME.md
- 07_IMPLEMENTATION_PLAN_AND_ACCEPTANCE.md

No se inicia reconstrucción hasta cerrar estos contratos.
