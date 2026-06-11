# Character Planner D&D 5.5e FULL — beta 0.1.127 EN-US

Portable offline Character Planner for local browser use.

## How to use

Open `character_planner.html` in a browser.

## Current DB structure

- `data_core.js` — core planner data, classes, backgrounds, species list references, basic options.
- `spells_DB.js` — canonical spell/cantrip database and class spell metadata.
- `species_features_DB.js` — canonical species mechanical feature database.
- `class_features_DB.js` — reusable non-spell feature database: invocations, metamagic, maneuvers, pact features, fighting styles, and future shared mechanics.
- `subclasses_DB.js` — unified subclass progression/feature database. Do not split subclasses across multiple DB files.
- `app.js` — planner rendering and UI logic.
- `style.css` — planner styling.
- `audit_reports/` — validation/audit reports.

## DB rules

- Spells stay only in `spells_DB.js`.
- Species traits stay only in `species_features_DB.js`.
- Class/reusable features stay in `class_features_DB.js`.
- Subclass progression stays in the unified `subclasses_DB.js`.
- Subclasses can reference spells or reusable features, but should not duplicate their full data.
