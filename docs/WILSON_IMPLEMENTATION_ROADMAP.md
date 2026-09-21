# WILSON — Roadmap de Implementación por Bloques

## Regla operativa

No volver a hacer una cadena de microdespliegues para funciones sueltas.

Cada bloque se diseña primero en GitHub y se despliega a Hatchable cuando:
- esquema de datos está definido;
- lógica principal está definida;
- snapshot/API está definido;
- UI/vista está definida;
- migración desde estado actual está prevista;
- criterios de prueba están escritos.

---

## Bloque 0 — Base existente y estabilización

Ya existe:
- mundo persistente;
- población individual;
- hogares;
- edificios;
- construcción;
- tareas/logística;
- inventarios;
- comida física;
- recursos finitos;
- regiones;
- exploración;
- expansión;
- PWA;
- historial;
- órdenes múltiples;
- nueva partida;
- urbanismo inicial.

Antes de ampliar:
- consolidar concurrencia;
- reconciliar scheduler/catch-up;
- terminar resource_nodes v36;
- eliminar estado visual ficticio restante.

---

## Bloque 1 — Navegación multiescala del mundo

Objetivo: dejar de estar atrapado en el “pedacito de mapa”.

Entregables:
- Vista Local;
- Vista Regional;
- Vista Reino;
- Vista Mundo;
- zoom/navegación entre ellas;
- niebla de guerra;
- niveles de conocimiento;
- regiones seleccionables;
- asentamientos seleccionables;
- fronteras y rutas visibles;
- historial territorial.

Éste es el siguiente bloque prioritario.

---

## Bloque 2 — Civilizaciones externas

Entregables:
- tabla civilizations;
- identidad/cultura inicial;
- capital;
- población;
- territorios;
- asentamientos;
- expansión autónoma;
- economía simplificada;
- objetivos estratégicos;
- relaciones;
- snapshot mundo.

Primera partida debe contener otras civilizaciones desde el inicio, aunque sean desconocidas.

El jugador solo las ve cuando información suficiente llega a su civilización.

---

## Bloque 3 — Mundo vivo fuera del jugador

Entregables:
- fauna regional;
- migraciones;
- aldeas neutrales;
- comerciantes;
- bandidos;
- ruinas;
- amenazas;
- monstruos/guaridas;
- evolución offline independiente.

---

## Bloque 4 — Expansión avanzada y colonización

Entregables:
- múltiples asentamientos propios;
- fundación;
- migración de hogares;
- rutas;
- abastecimiento;
- gobernadores/líderes locales;
- especialización regional;
- provincias;
- integración cultural.

---

## Bloque 5 — Diplomacia

Entregables:
- primer contacto;
- idiomas/intérpretes simplificados;
- relaciones;
- emisarios;
- tratados;
- comercio;
- alianza;
- rivalidad;
- guerra;
- paz;
- vasallaje.

---

## Bloque 6 — Militar y conquista

Entregables:
- milicia;
- ejército;
- equipo;
- suministros;
- campaña;
- marcha visible;
- batalla;
- asedio;
- ocupación;
- resistencia;
- anexión;
- rebelión;
- fronteras dinámicas.

Conquista debe verse en mapa regional/reino.

---

## Bloque 7 — Economía completa

Entregables:
- propiedad;
- excedentes;
- mercados;
- precios;
- trueque;
- moneda emergente;
- salarios;
- comercio interno;
- caravanas;
- comercio extranjero;
- tesoro;
- impuestos.

---

## Bloque 8 — Política e instituciones

Entregables:
- facciones;
- consejo avanzado;
- cargos;
- leyes;
- legitimidad;
- sucesión;
- nobleza;
- dinastías;
- rebelión;
- golpe;
- autonomía regional.

---

## Bloque 9 — Conocimiento y tecnología

Entregables:
- conocimiento por persona/institución;
- aprendizaje;
- transmisión;
- especialistas;
- innovaciones;
- pérdida de conocimiento;
- educación;
- instituciones;
- desarrollo no lineal.

---

## Bloque 10 — Cultura y religión

Entregables:
- costumbres;
- identidad;
- símbolos;
- fiestas;
- religión;
- templos;
- tensiones;
- sincretismo;
- legado histórico.

---

## Bloque 11 — Monstruos y fantasía avanzada

Entregables:
- monstruos físicos;
- guaridas;
- territorio de amenaza;
- migración;
- ataques;
- caza;
- grandes criaturas;
- ruinas;
- artefactos;
- recursos excepcionales.

---

## Bloque 12 — Clima, salud y desastres

Entregables:
- estaciones;
- clima;
- enfermedad;
- epidemias;
- heridas;
- incendios;
- inundaciones;
- sequías;
- recuperación;
- medicina.

---

## Bloque 13 — Historia y explicabilidad

Entregables:
- causal graph;
- genealogías;
- cronología;
- historia de regiones;
- historia de edificios;
- historia de guerras;
- historia diplomática;
- “¿por qué pasó esto?”;
- resumen al regresar.

---

## Bloque 14 — Escala y optimización

Entregables:
- simulación individual/local;
- simulación agregada distante;
- LOD poblacional;
- LOD visual;
- batching;
- concurrencia;
- scheduler robusto;
- snapshots eficientes;
- carga móvil.

---

## Bloque 15 — Pulido

Solo después de que el esqueleto completo exista:
- arte definitivo;
- animaciones;
- audio;
- partículas;
- UX;
- balance;
- tutorial;
- accesibilidad;
- rendimiento final.

---

## Orden inmediato de trabajo

1. Terminar v36/resource_nodes sin nuevos sistemas laterales.
2. Construir Bloque 1 completo: navegación multiescala.
3. Construir Bloque 2: civilizaciones persistentes.
4. Construir Bloque 3: mundo vivo externo.
5. Bloque 4 + 5 + 6: colonización, diplomacia y conquista.
6. Luego economía/política/conocimiento/cultura/fantasía.
7. Optimizar y pulir al final.

La prioridad ya no será “mejorar la aldea”, sino **hacer que exista el juego completo de Wilson**.
