# WILSON — Arquitectura Maestra del Juego

## 1. Visión

Wilson es un simulador persistente de civilización autónoma.

**Principio central:** el jugador dice qué quiere; la civilización decide cómo conseguirlo.

El jugador actúa como soberano/autoridad estratégica, no como trabajador individual. Emite prioridades, políticas, objetivos, permisos y decisiones excepcionales. La sociedad interpreta esas órdenes según recursos, conocimiento, instituciones, intereses y circunstancias.

El mundo continúa mientras el jugador está ausente.

Wilson no debe sentirse como una aldea estática. Debe permitir observar cómo una comunidad pequeña se convierte en una civilización, ocupa territorio, funda asentamientos, encuentra otras sociedades, crea instituciones, libra guerras, comercia, enfrenta monstruos y deja una historia física visible.

---

## 2. Experiencia objetivo

Wilson debe producir simultáneamente:

1. **Vida:** personas, hogares y profesiones parecen pertenecer al mundo.
2. **Historia:** el estado actual tiene causas identificables.
3. **Transformación:** el mapa cambia físicamente con el tiempo.
4. **Escala:** se puede pasar de una persona a un continente sin cambiar de juego.
5. **Agencia estratégica:** el jugador decide dirección; la civilización decide ejecución.
6. **Descubrimiento:** gran parte del mundo no se conoce al inicio.
7. **Consecuencias:** expansión, guerra, hambre, prosperidad y política dejan marcas persistentes.

Regla:
> Todo elemento importante visible debe corresponder a un estado real de simulación.

No se mostrará una tala sin árbol real, una obra ficticia, una conquista sin cambio territorial ni un reino que no exista en backend.

---

## 3. Escalas conectadas

### A. Vista Local — Aldea / Ciudad
Máximo detalle.

Muestra:
- habitantes individuales;
- hogares;
- edificios;
- calles;
- campos;
- talleres;
- mercados;
- almacenes;
- recursos naturales;
- obras;
- tareas;
- animales;
- monstruos presentes;
- patrullas;
- unidades militares;
- incendios, enfermedad, daños, reconstrucción.

Se puede seleccionar persona, hogar, edificio, recurso, obra, animal, monstruo o unidad.

### B. Vista Regional — Territorio
Escala de expansión y logística.

Muestra:
- regiones conocidas;
- caminos entre asentamientos;
- puestos;
- aldeas secundarias;
- explotaciones;
- campamentos;
- rutas comerciales;
- expediciones;
- caravanas;
- patrullas;
- guaridas;
- ruinas;
- pasos montañosos;
- ríos;
- fronteras locales;
- zonas disputadas.

Estados de conocimiento/control:
unknown → rumored → observed → explored → exploited → connected → controlled → settled

Descubrir no significa controlar. Controlar no significa poblar.

### C. Vista Reino — Geoestrategia
Muestra:
- todos los asentamientos propios;
- provincias;
- fronteras;
- civilizaciones extranjeras;
- ciudades extranjeras conocidas;
- relaciones diplomáticas;
- rutas comerciales;
- ejércitos;
- guerras;
- alianzas;
- vasallos;
- territorios disputados;
- grandes monstruos/amenazas;
- migraciones;
- rebeliones.

### D. Vista Mundo / Continente
Muestra:
- continentes/islas;
- mares;
- grandes biomas;
- grandes cordilleras/ríos;
- civilizaciones conocidas;
- zonas desconocidas;
- grandes rutas;
- grandes amenazas;
- expansión histórica.

La información distante puede ser imperfecta y envejecer.

---

## 4. Cámara y navegación

La transición de escala debe ser fluida:

persona → casa → barrio → asentamiento → región → reino → continente

El mapa local no debe intentar representar todo el continente a la vez.

La interfaz principal tendrá navegación conceptual:
- Mundo
- Reino
- Asentamiento
- Personas
- Economía
- Territorio
- Diplomacia
- Ejército
- Consejo
- Conocimiento
- Historia

Las secciones aparecen solo cuando la institución correspondiente existe.

---

## 5. Mundo y territorio

### World
Entidad raíz:
- seed;
- calendario;
- clima;
- continentes;
- océanos;
- biomas;
- parámetros naturales;
- reglas de partida.

### Region
Unidad estratégica:
- coordenadas;
- biome;
- elevación;
- agua;
- fertilidad;
- clima;
- recursos;
- peligros;
- owner_civilization_id;
- controller_civilization_id;
- knowledge_state;
- last_observed_month;
- infrastructure_level;
- settlement_level;
- contested;
- discovered;
- controlled;
- settled.

### Transformación territorial visible
Una región puede cambiar físicamente:
- sendero;
- camino;
- camino principal;
- puesto;
- aldea;
- ciudad;
- fortificación;
- frontera;
- campos;
- minería;
- deforestación;
- abandono;
- ruinas.

---

## 6. Civilizaciones externas

Las otras civilizaciones son entidades persistentes independientes.

### Civilization
Campos:
- identidad;
- nombre;
- cultura;
- idioma;
- población;
- capital;
- territorios;
- tecnología;
- riqueza;
- gobierno;
- religión;
- personalidad estratégica;
- relaciones;
- memoria histórica;
- recursos;
- ejército;
- objetivos.

Cada civilización evoluciona sin esperar al jugador.

Puede:
- explorar;
- expandirse;
- fundar asentamientos;
- comerciar;
- colonizar;
- combatir;
- aliarse;
- fragmentarse;
- rebelarse;
- desaparecer;
- absorber otras sociedades.

El jugador puede observar físicamente su avance cuando tiene información suficiente.

---

## 7. Asentamientos

Tipos emergentes:
campamento → aldea → pueblo → ciudad → metrópolis/capital

Cada asentamiento posee:
- población;
- hogares;
- edificios;
- inventarios;
- producción;
- especialización;
- defensa;
- autoridad;
- cultura;
- instituciones;
- posición física;
- conexiones;
- necesidades;
- historia.

La civilización puede fundar nuevos asentamientos autónomamente cuando logística, población y estrategia lo justifican.

---

## 8. Población

Cada persona importante tiene:
- identidad;
- edad;
- sexo;
- padres;
- pareja;
- hijos;
- hogar;
- residencia;
- profesión;
- tareas;
- habilidades;
- salud;
- hambre;
- energía;
- personalidad;
- prestigio;
- memoria;
- lealtades;
- experiencia;
- propiedad;
- conocimientos.

Escala:
- población pequeña: simulación individual completa;
- población grande: detalle individual para personas relevantes + simulación agregada de población rutinaria, conservando registros esenciales.

---

## 9. Hogares y familias

Hogar != edificio.

Un hogar puede:
- compartir vivienda;
- mudarse;
- dividirse;
- heredar propiedad;
- adquirir prestigio;
- caer en pobreza;
- migrar;
- desaparecer.

Las viviendas tienen ocupación real.

Demografía depende de:
- salud;
- alimento;
- vivienda;
- edad;
- pareja;
- cultura;
- seguridad;
- economía.

---

## 10. Recursos y ecología

Cadena física:
nodo natural → trabajador → carga → almacén/taller → consumo/producción

Tipos:
- alimentos;
- madera;
- piedra;
- minerales;
- metales;
- fibras;
- arcilla;
- sal;
- agua;
- animales;
- recursos excepcionales.

Los nodos pueden ser:
- finitos;
- regenerativos;
- estacionales.

La explotación transforma el paisaje.

---

## 11. Economía

Evolución emergente:

comunal → trueque → mercados → unidad de referencia → moneda → salarios → tesoro → impuestos → crédito

Sistemas:
- inventarios físicos;
- producción;
- consumo;
- propiedad;
- comercio;
- precios;
- rutas;
- caravanas;
- escasez;
- especialización;
- clases;
- riqueza;
- impuestos;
- tesoro;
- crisis.

No se introduce moneda en Año 0 si no existe necesidad social.

---

## 12. Construcción y urbanismo

Construcción:
planificada → parcela reservada → materiales → obra → terminada → mantenimiento → deterioro/ruina

Urbanismo:
- distritos;
- calles;
- parcelas;
- zonas productivas;
- suelo reservado;
- expansión planificada/autónoma;
- caminos externos.

La ciudad debe crecer de forma legible y orgánica, no como puntos aleatorios.

---

## 13. Exploración

Una expedición usa personas, comida, equipo y tiempo reales.

Puede:
- regresar;
- descubrir regiones;
- encontrar recursos;
- hallar ruinas;
- sufrir bajas;
- encontrar monstruos;
- contactar otra sociedad;
- desaparecer.

La información puede ser incompleta o quedar obsoleta.

---

## 14. Expansión y conquista

Expansión pacífica:
reconocimiento → ruta → puesto → control → asentamiento

Conquista:
objetivo → inteligencia → movilización → marcha → batalla/asedio → ocupación → resistencia → integración

Territorio conquistado no se vuelve estable automáticamente.

Puede existir:
- ocupación militar;
- resistencia;
- rebelión;
- asimilación;
- autonomía;
- vasallaje.

La frontera debe cambiar visualmente.

---

## 15. Militar

Evolución:
cazadores/milicia → guardia → guerreros → ejército profesional

Sistemas:
- reclutamiento;
- entrenamiento;
- equipo;
- suministros;
- moral;
- mando;
- formación;
- patrulla;
- batalla;
- asedio;
- heridas;
- bajas;
- prisioneros;
- veteranos.

Los soldados salen de la población real.

---

## 16. Diplomacia

Relaciones:
- desconocido;
- contacto;
- neutral;
- amistad;
- comercio;
- alianza;
- rivalidad;
- hostilidad;
- guerra;
- vasallaje.

Acciones:
- emisarios;
- tratados;
- comercio;
- fronteras;
- tributo;
- matrimonio político;
- amenazas;
- espionaje;
- guerra/paz.

Información diplomática puede ser imperfecta.

---

## 17. Política interna

Niveles:
familia → profesión → comunidad → facción → consejo → soberano → reino

Sistemas:
- líder;
- consejo;
- cargos;
- prestigio;
- facciones;
- leyes;
- intereses;
- sucesión;
- nobleza;
- rebelión;
- golpe;
- legitimidad.

El consejo traduce órdenes estratégicas en planes ejecutables.

---

## 18. Cultura, religión e identidad

Emergen con el tiempo:
- costumbres;
- nombres;
- símbolos;
- fiestas;
- tabúes;
- religión;
- arte;
- tradiciones;
- monumentos;
- identidad regional.

Pueden propagarse, mezclarse o dividir sociedades.

---

## 19. Conocimiento, educación y tecnología

Tecnología no es un árbol rígido.

Requiere:
- necesidad;
- recursos;
- especialistas;
- experiencia;
- conocimiento previo;
- contacto.

Conocimiento puede:
- residir en personas;
- transmitirse;
- perderse;
- importarse;
- institucionalizarse.

Sistemas futuros:
- aprendizaje;
- maestros;
- escuelas;
- bibliotecas;
- investigación;
- regresión tecnológica.

---

## 20. Monstruos y fantasía

El mundo comienza casi histórico.

La fantasía aparece progresivamente.

Entidades:
- fauna peligrosa;
- criaturas;
- monstruos únicos;
- guaridas;
- territorios infestados;
- ruinas;
- artefactos;
- recursos extraordinarios.

Los monstruos son actores físicos:
- ocupan territorio;
- cazan;
- migran;
- atacan;
- pueden bloquear rutas;
- pueden ser exterminados, evitados o aprovechados.

Un gran monstruo puede alterar expansión, comercio o política regional.

---

## 21. Clima, estaciones y desastres

Sistemas:
- estaciones;
- sequía;
- inundación;
- tormenta;
- incendio;
- frío;
- cosecha;
- epidemia;
- desastre regional.

Afectan producción, logística, salud, migración y guerra.

---

## 22. Salud

- edad;
- enfermedad;
- heridas;
- nutrición;
- epidemias;
- maternidad;
- discapacidad;
- recuperación;
- muerte.

Más adelante:
- curanderos;
- medicina;
- hospitales;
- saneamiento.

---

## 23. Historia causal

Cada cambio importante debe guardar causa.

Ejemplos:
- esta casa existe porque aumentó el hacinamiento;
- esta carretera existe por una expedición de expansión;
- esta guerra empezó por una disputa territorial;
- esta familia emigró por hambre;
- este pueblo fue abandonado por monstruos.

La interfaz Historia debe permitir seguir:
evento → causa → actores → consecuencias

---

## 24. Tiempo y persistencia

Velocidades conceptuales:
pause / 1x / 5x / 20x / 100x

Offline catch-up:
- mundo continúa;
- eventos importantes se preservan;
- procesos prolongados avanzan;
- al volver se muestra resumen causal.

Todas las acciones críticas deben ser idempotentes/concurrency-safe.

---

## 25. GenAI

IA generativa solo para:
- crónicas;
- diálogo;
- biografías;
- descripciones;
- rumores;
- textos culturales.

Nunca como fuente de verdad de la simulación.

Core:
determinista + reglas + probabilidades + estado persistente.

---

## 26. Arquitectura técnica objetivo

GitHub:
- código fuente;
- documentación;
- assets;
- versiones.

Hatchable:
- Postgres;
- simulación autoritativa;
- APIs;
- scheduler;
- persistencia.

Frontend:
- representación visual;
- cámara;
- interacción;
- animación;
- vistas multiescala.

Separación:
simulation state ≠ visual state

El visual lee la simulación; no inventa cambios permanentes.

---

## 27. Modelo de datos final por dominios

### Core
worlds
regions
spatial_entities
events
orders
decisions

### Población
persons
households
relationships
memories
skills
person_tasks

### Asentamientos
settlements
buildings
construction_projects
roads
districts
inventories

### Recursos
resource_nodes
resource_deposits
wildlife_populations

### Civilizaciones
civilizations
civilization_regions
foreign_settlements
relations
treaties

### Militar
military_units
armies
campaigns
battles
fortifications

### Economía
markets
trades
caravans
currencies
treasuries
taxes

### Política
factions
offices
laws
dynasties
claims

### Conocimiento
knowledge_items
institutions
discoveries
languages

### Fantasía
monster_entities
monster_lairs
artifacts
ruins

---

## 28. Regla para avanzar el desarrollo

No implementar funciones aisladas sin saber a qué dominio final pertenecen.

Orden:
1. definir dominio;
2. definir estado persistente;
3. definir simulación;
4. definir API/snapshot;
5. definir representación visual;
6. validar coherencia;
7. desplegar como bloque.

Hatchable se usa por paquetes funcionales, no para microajustes continuos.

---

## 29. Definición de Wilson completo

Wilson está estructuralmente completo cuando el jugador puede:

- iniciar una civilización pequeña;
- observar personas reales;
- verla crecer durante generaciones;
- ampliar una aldea a múltiples asentamientos;
- navegar local/regional/reino/mundo;
- explorar territorio desconocido;
- descubrir otras civilizaciones;
- observar cómo ellas también evolucionan;
- comerciar o entrar en conflicto;
- conquistar/perder territorio;
- enfrentar monstruos y amenazas;
- crear instituciones;
- ver economía, política y cultura emerger;
- ausentarse y regresar a un mundo cambiado;
- explicar por qué el mundo llegó a su estado actual.

El acabado gráfico y balance pueden seguir evolucionando después. La arquitectura no debe requerir reconstrucción fundamental.
