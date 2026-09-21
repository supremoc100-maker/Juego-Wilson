# Wilson 2.0 — Arquitectura de Interfaz

## Principio

La UI responde siempre:
1. ¿Qué está pasando?
2. ¿Por qué?
3. ¿Necesito intervenir?

## 1. Shell permanente

### Header
- nombre civilización;
- fecha;
- velocidad;
- población;
- alimentos;
- riqueza/tesoro cuando exista;
- alertas críticas.

### Velocidad
Pausa / x1 / x3 / x8 / x20 / x60 / x100

### Navegación principal
- Mundo
- Reino
- Región
- Asentamientos
- Personas
- Economía
- Diplomacia
- Ejército
- Consejo
- Conocimiento
- Historia

Las entradas se desbloquean según existencia institucional, excepto Mundo/Región/Asentamiento/Personas/Historia.

## 2. Mapa multiescala

### Mundo
Civilizaciones conocidas, macrogeografía, grandes amenazas.

### Reino
Propios territorios, provincias, asentamientos, fronteras, ejércitos, rutas.

### Región
Rutas, POIs, explotaciones, expediciones, puestos, monstruos.

### Local
Personas, parcelas, edificios, recursos y actividades.

La transición debe preservar contexto:
seleccionar región → abrir asentamiento → volver a región seleccionada.

## 3. Sustitución del minimapa

No usar minimapa estático.

En local:
- botón/portal "Mapa estratégico";
- breadcrumb: Mundo > Reino > Región > Asentamiento;
- opcional radar local solo cuando sea útil.

## 4. Inspectores

Panel contextual único.

Tipos:
- persona;
- hogar;
- edificio;
- región;
- asentamiento;
- civilización;
- ejército;
- monstruo;
- ruta;
- proyecto.

Todos usan el patrón:
Resumen / Estado / Causas / Relaciones / Acciones permitidas / Historia

## 5. Consejo

No es lista de botones planos.

Entrada:
"Quiero expandirme hacia el norte."

Salida:
- interpretación;
- restricciones;
- plan propuesto;
- riesgos;
- recursos;
- duración aproximada de simulación;
- alternativas.

El jugador puede:
- aprobar;
- aumentar prioridad;
- cancelar;
- insistir.

## 6. Historia

Timeline filtrable:
- familia;
- asentamiento;
- región;
- reino;
- guerra;
- economía;
- monstruos.

Cada evento enlaza entidades.

## 7. Alertas

Solo alertas accionables:
- hambre;
- epidemia;
- ataque;
- rebelión;
- proyecto bloqueado;
- frontera amenazada;
- muerte del soberano;
- descubrimiento mayor.

No notificar producción rutinaria como si fuera crítica.

## 8. Visual estructural

Antes de arte final:
- calles legibles;
- distritos;
- granjas en parcelas;
- bosque/cantera separados;
- rutas territoriales;
- fronteras;
- asentamientos;
- ejércitos/expediciones;
- monstruos/POIs;
- niebla.

El mapa debe ser comprensible incluso con arte placeholder.
