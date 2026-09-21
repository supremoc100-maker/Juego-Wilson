# Wilson 2.0 — Dominios de Simulación

## 1. Core

### WorldClock
Autoridad temporal.

Velocidades:
0, 1, 3, 8, 20, 60, 100.

### Scheduler
Ejecuta:
- ticks locales;
- ticks regionales;
- ticks estratégicos;
- mantenimiento;
- catch-up.

### EventBus
Todo cambio importante genera eventos causales.

## 2. Población

### Person
Identidad, genética/tendencias, familia, habilidades, salud, necesidades, memoria, lealtad, profesión, tareas, residencia.

### Household
Unidad económica/social.

### Life cycle
nacimiento → infancia → aprendizaje → adultez → pareja → descendencia → vejez → muerte

### Escala
Detalle completo para población relevante/local.
Agregación para masas distantes, con capacidad de materializar individuos importantes.

## 3. Necesidades

Persona:
- food;
- water;
- rest;
- health;
- safety;
- belonging;
- status.

Hogar:
- food reserve;
- housing;
- income/resources;
- safety;
- succession.

Settlement:
- food;
- storage;
- housing;
- labor;
- defense;
- sanitation;
- legitimacy.

Civilization:
- territory;
- wealth;
- security;
- cohesion;
- knowledge;
- prestige.

## 4. Trabajo y tareas

Todas las acciones significativas son WorkOrder/Task.

Tipos:
- gather;
- harvest;
- hunt;
- farm;
- transport;
- construct;
- repair;
- patrol;
- explore;
- trade;
- learn;
- teach;
- craft;
- mine;
- administer;
- recruit;
- train;
- campaign.

Estados:
planned → assigned → traveling → working → transporting → completed/cancelled/failed

## 5. Recursos

ResourceNode:
- type;
- position;
- capacity;
- remaining;
- regeneration;
- quality;
- accessibility;
- owner/control.

Cadena:
node → extraction → cargo → storage → transformation → consumption/use

Nada importante se crea directamente por profesión sin origen físico.

## 6. Economía

Fases emergentes:
communal → barter → market → commodity money → currency → wages → treasury/taxes → credit

Sistemas:
- inventories;
- ownership;
- production;
- demand;
- prices;
- trade routes;
- caravans;
- market access;
- taxation;
- treasury.

## 7. Construcción

Project:
proposal → approved → site reserved → materials → labor → completion → maintenance → decay

Construcción requiere:
- lote;
- materiales;
- transporte;
- trabajadores;
- tiempo.

## 8. Urbanismo

District:
- residential;
- agricultural;
- production;
- storage;
- civic;
- military;
- sacred;
- market.

Zonas naturales protegidas/operativas:
- gathering;
- forest;
- quarry;
- mine;
- water;
- pasture.

El planificador nunca invade zonas prohibidas por fallback.

## 9. Exploración

Expedition:
- members;
- supplies;
- route;
- objective;
- risk;
- knowledge;
- return state.

Resultados:
- new region knowledge;
- resource discovery;
- ruin;
- monster;
- contact;
- casualties;
- disappearance.

## 10. Civilizaciones

Civilization:
- culture;
- language;
- government;
- population;
- settlements;
- territory;
- economy;
- institutions;
- technology;
- religion;
- factions;
- diplomacy;
- military;
- goals.

Todas avanzan offline.

## 11. Diplomacia

Relation:
unknown/contact/neutral/cordial/trade/alliance/rival/hostile/war/vassal

Actions:
- emissary;
- trade proposal;
- treaty;
- alliance;
- demand;
- tribute;
- ultimatum;
- peace;
- vassalization.

## 12. Militar

Population-based military.

Unit:
- members;
- commander;
- equipment;
- morale;
- training;
- supplies;
- position.

Campaign:
mobilize → supply → march → encounter → battle/siege → occupation/retreat

Conquest:
victory != integration.

occupation → resistance → administration → assimilation/autonomy/annexation

## 13. Política

Entities:
- office;
- faction;
- law;
- claim;
- dynasty;
- council.

Dynamics:
- legitimacy;
- influence;
- succession;
- corruption;
- rebellion;
- coup;
- regional autonomy.

## 14. Conocimiento y tecnología

KnowledgeItem:
- domain;
- level;
- holders;
- institution;
- prerequisites;
- diffusion;
- decay.

Innovación emerge por:
need + practice + specialist + resources + contact

## 15. Cultura/religión

CultureState:
- language;
- customs;
- values;
- symbols;
- festivals;
- identity.

ReligionState:
- beliefs;
- clergy;
- sacred sites;
- rituals;
- tolerance.

## 16. Ecología, fauna y monstruos

WildlifePopulation:
- species;
- region;
- size;
- migration;
- hunted pressure.

MonsterEntity/Lair:
- species;
- threat;
- territory;
- behavior;
- hunger;
- movement;
- attacks;
- loot/artifacts.

## 17. Clima y salud

Climate:
- season;
- rain;
- temperature;
- extremes.

Health:
- nutrition;
- disease;
- wounds;
- sanitation;
- medicine;
- epidemics.

## 18. Historia

CausalEvent:
- actor;
- action;
- target;
- cause_event_id;
- consequence_event_ids;
- region;
- settlement;
- importance;
- visibility.

Debe responder:
"¿Por qué ocurrió esto?"
