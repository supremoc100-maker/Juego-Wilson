# Wilson 2.0 — Invariantes de Simulación

Estas reglas son obligatorias. Si una implementación las rompe, se considera un bug estructural.

## 1. Autoridad

Backend = fuente de verdad.

Frontend = representación e intención.

## 2. Conservación de recursos

Un recurso físico solo puede:
- existir en nodo;
- estar en inventario;
- estar en tránsito;
- estar incorporado a una construcción/objeto;
- ser consumido/destruido.

No puede desaparecer ni aparecer sin evento de transferencia/producción/regeneración.

## 3. Conservación poblacional

Toda persona:
- nace;
- migra hacia dentro;
- migra hacia fuera;
- muere.

No se modifica población global por suma/resta abstracta mientras exista simulación individual.

## 4. Identidad

Personas, edificios, asentamientos, civilizaciones, ejércitos, nodos de recurso, monstruos y proyectos relevantes tienen ID persistente.

## 5. Espacio

Toda entidad física tiene ubicación coherente con su escala.

Un edificio local pertenece a:
plot → district → settlement → region.

No existe edificio sin asentamiento ni asentamiento sin región.

## 6. Urbanismo

Una construcción requiere plot válido.

No existe fallback que ignore zoning.

Si no hay suelo:
project = blocked/no_site.

## 7. Trabajo

Ninguna tarea visible se inventa en cliente.

Una animación de tala requiere Task + ResourceNode.

Una obra visible requiere ConstructionProject.

## 8. Construcción

Progreso <= fracción de materiales disponibles y <= trabajo realizado.

No puede completarse sin:
- sitio;
- materiales;
- trabajo.

## 9. Control territorial

Descubrimiento != reclamación != control != asentamiento != integración.

Cada transición tiene condición y evento.

## 10. Guerra

Declarar guerra no mueve automáticamente frontera.

Territorio cambia por:
- retirada acordada;
- ocupación;
- batalla/campaña;
- tratado;
- rebelión;
- anexión.

## 11. Conquista

Victoria militar no equivale a integración política.

Una región ocupada puede:
- resistir;
- rebelarse;
- ser liberada;
- convertirse en vasalla;
- integrarse.

## 12. Información

El jugador no recibe datos exactos que su civilización no conoce.

Todo dato exterior lleva:
- intel level;
- observed month;
- confidence.

## 13. Civilizaciones externas

Existen y evolucionan aun sin haber sido descubiertas.

No aparecen de la nada al entrar en visión.

## 14. Monstruos

Un ataque de monstruo requiere entidad/lair/población válida y trayectoria/alcance coherente.

No usar "bestia atacó" como evento sin actor físico.

## 15. Economía

Mercado/precios/moneda solo existen cuando las instituciones correspondientes emergen.

No forzar moneda desde inicio.

## 16. Tecnología

No usar árbol rígido universal.

Innovación requiere contexto.

## 17. Historia causal

Todo evento importancia >= 2 debe registrar causa o contexto causal suficiente.

Ejemplo:
battle ← campaign ← war ← border dispute.

## 18. Tiempo

Todos los sistemas usan world_month como tiempo canónico.

Speed solo cambia cuántos meses se procesan por tiempo real.

## 19. Determinismo

Mismo:
- save;
- seed;
- comandos;
- meses;

debe producir mismo resultado salvo dominios explícitamente versionados.

## 20. Concurrencia

Un world_id no procesa dos ticks simultáneos.

## 21. Catch-up

Offline catch-up ejecuta las mismas reglas que online.

No existe simulador "simplificado" que cambie resultados fundamentales.

## 22. Escala

LOD puede reducir detalle computacional, pero no contradecir estado canónico.

## 23. Nueva partida

Reset crea world nuevo limpio.

Nunca reutiliza entidades históricas de partida anterior.

## 24. Snapshot

Snapshot = vista derivada.

No se escribe lógica permanente en snapshot.

## 25. Compatibilidad

Schema y snapshot tienen versión explícita.

Migración incompatible debe fallar claramente, no asumir campos.

## 26. Definition of structural bug

Se considera estructural:
- material duplicado;
- persona duplicada;
- territorio sin causa de cambio;
- construcción en zona inválida;
- tarea sin actor;
- evento sin entidad;
- UI mostrando estado no persistido;
- civilización exterior creada al descubrirse;
- velocidad que salta sistemas;
- catch-up diferente a simulación normal.
