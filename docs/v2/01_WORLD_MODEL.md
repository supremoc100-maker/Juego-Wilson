# Wilson 2.0 — Modelo del Mundo

## 1. Cuatro escalas, un solo mundo

Wilson no usa cuatro juegos distintos. Usa cuatro representaciones del mismo estado.

### Escala local
Detalle de un asentamiento o lugar concreto.

Incluye:
- personas;
- hogares;
- edificios;
- calles;
- parcelas;
- campos;
- talleres;
- recursos naturales;
- unidades;
- monstruos presentes;
- tareas;
- obras.

Coordenadas locales: metros/unidades visuales relativas dentro de un asentamiento.

### Escala regional
Territorio alrededor de uno o varios asentamientos.

Incluye:
- regiones;
- caminos;
- puestos;
- granjas exteriores;
- minas;
- campamentos;
- caravanas;
- expediciones;
- patrullas;
- guaridas;
- ruinas;
- fronteras locales.

### Escala reino
Geoestrategia de una civilización.

Incluye:
- provincias;
- asentamientos;
- rutas;
- fronteras;
- ejércitos;
- rivales;
- alianzas;
- guerras;
- rebeliones;
- comercio.

### Escala mundo
Continente completo.

Incluye:
- grandes biomas;
- mares/ríos/cordilleras;
- civilizaciones conocidas;
- zonas desconocidas;
- rutas mayores;
- grandes amenazas;
- historia territorial.

## 2. Cuadrícula estratégica

Unidad base: RegionCell.

Cada celda contiene:
- world_id;
- q/r o x/y;
- biome;
- elevation;
- water;
- fertility;
- climate_zone;
- base_resources;
- current_resources;
- danger;
- owner_civilization_id;
- controller_civilization_id;
- knowledge_state;
- infrastructure_level;
- settlement_level;
- contested;
- last_observed_month.

No se representa una región como una sola textura fija: la vista local de un asentamiento dentro de esa región tiene su propio layout.

## 3. Estados territoriales

### Conocimiento
unknown
rumored
observed
explored
surveyed

### Uso
wild
exploited
connected
settled
fortified
urbanized

### Control
unclaimed
claimed
controlled
occupied
contested
vassal
annexed

Estos ejes son independientes.

Ejemplo:
- una región puede estar `surveyed + wild + controlled`;
- o `observed + settled + enemy controlled`;
- o `explored + occupied + contested`.

## 4. Expansión visible

Secuencia mínima:

explorar → confirmar ruta → establecer campamento → conectar logística → reclamar → controlar → poblar → desarrollar

Cada fase genera entidades reales:
- expedition;
- route;
- outpost;
- settlement;
- infrastructure;
- regional event.

## 5. Múltiples asentamientos

Settlement no es una sola tabla decorativa.

Cada settlement tiene:
- posición estratégica;
- layout local;
- población;
- hogares;
- edificios;
- inventarios;
- especialización;
- autoridad;
- seguridad;
- cultura local;
- instituciones;
- necesidades;
- conexión logística.

Jerarquía:
campamento → puesto → aldea → pueblo → ciudad → capital

## 6. Territorio extranjero

Otras civilizaciones usan el mismo modelo estratégico.

A distancia se simulan agregadas.
Al acercarse/contactarlas se aumenta detalle.

No se generan como texto al descubrirlas: existen desde el inicio del mundo.

## 7. Niebla e información

La interfaz solo revela lo que la civilización sabe.

Información envejece.

Ejemplo:
"Ciudad extranjera: ~450 habitantes, observado hace 14 meses."

No se muestra población exacta sin información suficiente.

## 8. Infraestructura territorial

Entidades:
- roads;
- bridges;
- ports;
- watchtowers;
- forts;
- mines;
- quarries;
- farms;
- shrines;
- waystations.

Cada una:
- posición;
- condición;
- capacidad;
- owner/controller;
- maintenance;
- destroyed state.

## 9. Historia física

El mapa debe conservar:
- caminos antiguos;
- ruinas;
- asentamientos abandonados;
- campos agotados;
- bosques talados;
- fronteras históricas;
- campos de batalla;
- fortificaciones destruidas.

La historia no es solo un registro textual.
