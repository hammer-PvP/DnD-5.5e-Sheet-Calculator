# Character Planner D&D 5.5e FULL — beta 0.1.115 EN-US

Portable local character planner. Open `character_planner.html` in a browser.

## beta 0.1.115

- Adds top tabs: Character Planner and Spell Reference.
- Spell Reference is a quick table consult view.
- Spell Reference is populated from the centralized canonical `spells_DB.js`.
- Spells are grouped by class and spell level.
- Spell names use the same mouseover tooltip/stat block system as the planner.
- Keeps README cleanup rule: only this `README.md` remains.

## Versioning

Use numeric beta revisions: beta 0.1.115 through beta 0.1.115, then beta 0.2.000.


## beta 0.1.115
- Spell Reference class index refreshed for offline use.
- Warlock and Paladin PHB 2024 spell lists expanded across all spell levels.
- Overlapping spells can appear under every valid class while sharing one tooltip DB entry.


## beta 0.1.115 EN-US
- Consolidated `spell_db.js` and `spell_lists_2024.js` into one canonical offline file: `spells_DB.js`.
- Planner spell dropdowns and Spell Reference tab both use the same spell registry.
- Removed duplicate spell-list DB to avoid drift/bug loops.
