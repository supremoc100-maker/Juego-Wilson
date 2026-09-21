# WILSON — Matriz Maestra de Sistemas

Esta matriz conecta el estado actual con la arquitectura final. Su función es impedir desarrollos aislados y mostrar dependencias antes de tocar Hatchable.

| Sistema | Estado actual | Estado objetivo | Dependencias principales | Bloque |
|---|---|---|---|---|
| Mundo persistente | Funcional | Continentes, clima, biomas, historia global | Core | 1 / 12 |
| Regiones | Funcional parcial | Conocimiento, control, propietario, infraestructura, disputa | Mundo | 1 |
| Vista Local | Funcional parcial | Aldea/ciudad completa e inspeccionable | Espacial | 1 |
| Vista Regional | No existe como vista completa | Fronteras, rutas, puestos, expediciones, amenazas | Regiones | 1 |
| Vista Reino | No existe | Provincias, civilizaciones, ejércitos, diplomacia | Civs + militar | 1 / 2 / 6 |
| Vista Mundo | No existe | Continente, niebla, civilizaciones conocidas, amenazas mayores | World map | 1 |
| Personas | Funcional | Vida individual, memoria, propiedad, lealtades | Población | 8 / 9 |
| Familias/hogares | Funcional básico | Herencia, propiedad, migración, prestigio familiar | Personas + vivienda | 4 / 8 |
| Demografía | Funcional y corregida | Cohortes estables, migración, efectos culturales/económicos | Salud/economía | 4 / 12 |
| Vivienda | Funcional | Mercado/propiedad/herencia/mantenimiento | Hogares + economía | 7 / 8 |
| Urbanismo | Funcional inicial | Distritos, suelo, expansión urbana, servicios | Vista local | 4 |
| Construcción | Funcional persistente | Proyectos complejos, mantenimiento, ruina | Logística | 4 / 7 |
| Tareas individuales | Funcional | Todos los sectores y tareas sociales | Personas | transversal |
| Inventarios | Madera/piedra/comida | Todos los recursos, propiedad, mercados | Economía | 7 |
| Comida | Funcional física | Estacionalidad, dieta, desperdicio, mercados | Agricultura | 7 / 12 |
| Agricultura | Funcional básica | Cultivos, rotación, clima, animales | Clima/economía | 7 / 12 |
| Recursos naturales | v36 en cierre | Nodos persistentes, regeneración, agotamiento, minerales | Regiones | 3 / 7 |
| Exploración | Funcional | Expediciones, suministros, riesgo, rumores, contacto | Regional map | 1 / 3 |
| Expansión | Funcional básica | Colonización multi-asentamiento, logística, integración | Regional + civ | 4 |
| Caminos | Visual/persistencia básica | Red logística con calidad y mantenimiento | Regional | 4 |
| Asentamientos múltiples | No existe | Aldeas/ciudades propias y extranjeras | Colonización | 4 |
| Civilizaciones externas | No existe | Simulación autónoma completa | World/Region map | 2 |
| Aldeas neutrales | No existe | Integración, comercio, absorción, conquista | Civs | 3 |
| Diplomacia | No existe | Contacto, tratados, comercio, guerra, vasallaje | Civs | 5 |
| Comercio | No existe | Mercados, caravanas, rutas, precios | Economía + civs | 7 |
| Moneda | No existe | Emergente por necesidad económica | Mercados | 7 |
| Impuestos/tesoro | No existe | Instituciones fiscales | Gobierno + moneda | 7 / 8 |
| Consejo | Funcional básico | Planificador estratégico con alternativas y costos | Todos los sistemas | 8 |
| Órdenes estratégicas | Funcional | Objetivos de reino con planes subordinados | Consejo | 8 |
| Política interna | Muy básica | Facciones, cargos, leyes, legitimidad | Personas + cultura | 8 |
| Liderazgo | Básico | Sucesión, dinastías, instituciones | Política | 8 |
| Nobleza | No existe | Emergente por propiedad, guerra y prestigio | Política | 8 |
| Rebelión/golpe | No existe | Conflicto político interno | Facciones | 8 |
| Conocimiento | No existe como sistema | Conocimiento personal/institucional persistente | Personas | 9 |
| Tecnología | No existe como sistema | Innovación emergente, no árbol rígido | Conocimiento | 9 |
| Educación | No existe | Aprendizaje, maestros, escuelas | Conocimiento | 9 |
| Cultura | No existe como sistema | Costumbres, identidad, símbolos, transmisión | Personas | 10 |
| Religión | No existe | Emergente, instituciones, tensiones | Cultura | 10 |
| Idiomas | No existe | Lengua, contacto, intérpretes, difusión | Cultura/diplomacia | 5 / 10 |
| Militar | No existe como institución | Milicia → ejército profesional | Población/economía | 6 |
| Equipamiento | No existe | Armas, armaduras, suministros | Industria | 6 / 7 |
| Campañas | No existe | Marcha, logística, objetivo y mando | Militar + regional | 6 |
| Batallas | No existe | Resolución espacial/estratégica persistente | Militar | 6 |
| Asedios | No existe | Fortificaciones, hambre, ruptura | Militar + ciudades | 6 |
| Conquista | Solo expansión propia | Ocupación, resistencia, anexión, vasallaje | Militar/diplomacia | 6 |
| Fauna | Evento mínimo | Poblaciones regionales y caza real | Ecología | 3 |
| Monstruos | No existen físicamente | Entidades, guaridas, migración, territorio de amenaza | Mundo vivo | 3 / 11 |
| Ruinas | Solo concepto | POI persistentes, descubrimiento, investigación | Exploración | 3 / 11 |
| Artefactos | No existe | Objetos únicos con historia/efectos | Ruinas/conocimiento | 11 |
| Clima | No existe | Estaciones y clima regional | Mundo | 12 |
| Desastres | No existe | Incendio, sequía, inundación, etc. | Clima | 12 |
| Salud | Básica | Enfermedad, heridas, epidemia, medicina | Personas | 12 |
| Historia | Eventos | Grafo causal y cronología navegable | Todos | 13 |
| Offline catch-up | Funcional básico | Robusto, resumido, escalable | Simulación | 14 |
| Concurrencia | Deuda técnica | Locks/idempotencia/ticks seguros | Backend | 0 / 14 |
| Escala poblacional | Individual pequeña | LOD individual/agregado | Backend | 14 |
| Rendimiento visual | Adecuado MVP | LOD, culling, batches, móvil | Frontend | 14 |
| Arte | Provisional | Dirección visual coherente final | Sistemas cerrados | 15 |
| Audio | No existe | Ambiente, alertas, música adaptativa | Pulido | 15 |
| Tutorial | No existe | Onboarding contextual | UX | 15 |

## Regla de lectura

- **Funcional** no significa terminado; significa que ya existe una base reutilizable.
- **No existe** no se implementa todavía si su bloque depende de una capa anterior.
- El siguiente salto estructural es **Bloque 1: navegación multiescala**.
- Después viene **Bloque 2: civilizaciones externas**, porque sin mapa multiescala no tendría sentido construir reinos que el jugador no puede ver ni navegar.

## Criterio de ahorro de Hatchable

Antes de cada bloque:
1. esquema completo en GitHub;
2. migraciones agrupadas;
3. simulación agrupada;
4. snapshot/API agrupado;
5. UI agrupada;
6. una única ronda de validación;
7. un despliegue principal;
8. correcciones solo si son defectos reales.

No se utilizará Hatchable para prototipar decisiones conceptuales.
