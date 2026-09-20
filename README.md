# Juego Wilson — Demo Phaser

Prototipo visual del simulador de civilización autónoma Wilson.

## Objetivo de esta demo

Validar que una aldea inicial de 25 habitantes **se sienta como un juego** antes de conectar toda la simulación persistente de Hatchable.

Incluye:
- aldea 2D cenital;
- 25 habitantes autónomos;
- tareas visibles (agricultura, madera, construcción, caza, exploración y recolección);
- movimiento continuo entre casa y lugar de trabajo;
- selección de habitantes;
- cámara con arrastre y zoom;
- pausa y velocidades x1, x3 y x8;
- ciclo día/noche visual;
- eventos de actividad;
- órdenes estratégicas de prueba.

La primera versión usa Phaser 3.90 por estabilidad de API. La simulación de esta demo es local; el siguiente paso será conectar sus entidades y acciones con el backend existente de Hatchable.
