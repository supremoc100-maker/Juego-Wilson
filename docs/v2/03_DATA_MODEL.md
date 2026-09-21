# Wilson 2.0 — Modelo de Datos Canónico

Este documento define dominios y relaciones. La implementación SQL puede cambiar; los conceptos no.

## Core

### worlds
id
seed
name
world_month
simulation_speed
last_simulated_at
rules_json
climate_state_json

### region_cells
id
world_id
x
y
biome
elevation
water
fertility
climate_zone
danger
owner_civilization_id
controller_civilization_id
knowledge_state
land_use_state
control_state
development
last_observed_month

### spatial_entities
id
world_id
region_id
entity_type
subtype
x
y
state_json
owner_civilization_id
settlement_id
active

## Civilización

### civilizations
id
world_id
name
culture_id
language_id
government_type
capital_settlement_id
population_summary
wealth
stability
legitimacy
prestige
strategic_personality_json
status

### civilization_goals
civilization_id
goal_type
priority
target_json
status
created_month

### civilization_relations
a_id
b_id
stance
trust
tension
trade
alliance
war
tribute
intel_level

## Asentamientos

### settlements
id
civilization_id
region_id
name
tier
population
specialization
local_seed
authority_person_id
security
prosperity
status

### districts
id
settlement_id
type
polygon/layout_json
capacity
status

### plots
id
district_id
plot_type
x
y
width
height
reserved_for
occupied_entity_id

### buildings
id
settlement_id
plot_id
type
level
condition
capacity
owner_household_id
owner_civilization_id
status

### construction_projects
id
settlement_id
plot_id
type
stage
progress
required_json
delivered_json
labor_required
labor_done

## Población

### persons
id
world_id
civilization_id
settlement_id
household_id
name
sex
born_month
died_month
parents
partner_id
profession
health
needs_json
traits_json
skills_json
knowledge_json
prestige
loyalty
status

### households
id
settlement_id
name
home_building_id
members_summary
wealth
inventory_id
status

### relationships
person_a
person_b
relation_type
strength
history_json

## Trabajo

### tasks
id
world_id
settlement_id
person_id
task_type
source_entity_id
target_entity_id
project_id
cargo_json
route_id
stage
started_month
completed_month
failure_reason

## Recursos / inventarios

### resource_nodes
id
region_id
type
quality
capacity
remaining
regeneration_rate
x
y
status

### inventories
id
owner_type
owner_id
capacity
rules_json

### inventory_items
inventory_id
resource_type
quantity
quality

## Transporte

### routes
id
world_id
from_entity_id
to_entity_id
route_type
length
quality
danger
maintenance
status

### caravans
id
route_id
owner_id
cargo_json
people_json
position
status

## Economía

### markets
settlement_id
resource_type
supply
demand
reference_price

### transactions
buyer
seller
resource
quantity
price
month

### currencies
civilization_id
name
unit
stability
accepted_regions_json

### treasuries
civilization_id
balance
income_json
expenses_json

## Militar

### military_units
id
civilization_id
home_settlement_id
unit_type
member_ids/aggregate_ref
commander_id
strength
training
morale
supplies
position_region_id
status

### campaigns
id
attacker_id
defender_id
objective
target_region_id
stage
supply_state
started_month
ended_month

### battles
id
campaign_id
region_id
attacker_json
defender_json
result_json
casualties_json

### occupations
region_id
occupier_id
resistance
integration
policy

## Política

### factions
id
civilization_id
name
base_type
influence
loyalty
agenda_json

### offices
id
civilization_id
office_type
holder_person_id
authority_json

### laws
id
civilization_id
law_type
parameters_json
enacted_month
active

### dynasties
id
civilization_id
name
founder_id
prestige
claims_json

## Conocimiento/cultura

### knowledge_items
id
civilization_id
domain
level
institution_id
holders_json

### institutions
id
civilization_id
settlement_id
type
level
capacity

### cultures
id
name
values_json
customs_json
symbols_json

### religions
id
name
beliefs_json
institutions_json

### languages
id
name
parent_id
mutual_intelligibility_json

## Mundo vivo/fantasía

### wildlife_populations
region_id
species
population
migration_state

### monster_entities
id
species
region_id
lair_id
threat
health
behavior_json
status

### monster_lairs
id
region_id
species
population
threat
state

### world_sites
id
region_id
type
name
state
danger
value
knowledge_state

### artifacts
id
site_id
name
properties_json
owner_entity_id

## Clima/salud

### regional_climate
region_id
season
rainfall
temperature
hazard_state

### diseases
id
name
transmission
severity
immunity_json

### person_conditions
person_id
condition_type
severity
started_month
status

## Historia

### causal_events
id
world_id
month
event_type
actor_type
actor_id
target_type
target_id
region_id
settlement_id
cause_event_id
importance
visibility
payload_json

## Principios

1. Identidad persistente para entidades relevantes.
2. FK donde exista identidad real.
3. JSON solo para parámetros variables, no para sustituir relaciones fundamentales.
4. Ningún total global debe duplicar estado físico sin mecanismo explícito de reconciliación.
5. Snapshots son vistas derivadas; no la fuente primaria.
