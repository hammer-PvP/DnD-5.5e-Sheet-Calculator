// beta 0.1.127 EN-US — canonical class/reusable feature database.
// Offline/local only.
// This DB stores non-spell mechanics that may be granted by classes, subclasses,
// invocations, maneuvers, metamagic, feats, and other game elements.
// Spells remain in spells_DB.js. Species traits remain in species_features_DB.js.

window.CLASS_FEATURES_DB = {
  "pact_weapon": {
    name: "Pact Weapon",
    category: "Warlock Feature",
    source: "PHB 2024 / Xanathar compatibility",
    mechanics: "You create or bind a weapon through a Warlock feature such as Pact of the Blade or compatible subclass features. The weapon uses the granting feature's rules for attack ability, damage, summoning, and restrictions.",
    tableUse: "Use this entry when a subclass or invocation grants the same Pact Weapon mechanic so the tooltip comes from one place."
  },
  "pact_of_the_blade": {
    name: "Pact of the Blade",
    category: "Eldritch Invocation",
    source: "PHB 2024",
    grants: ["pact_weapon"],
    mechanics: "Gain a Pact Weapon feature. This supports weapon-focused Warlock builds and can satisfy prerequisites for later blade-related invocations."
  },
  "thirsting_blade": {
    name: "Thirsting Blade",
    category: "Eldritch Invocation",
    source: "PHB 2024",
    prerequisite: "Warlock Level 5; Pact of the Blade/Pact Weapon support",
    mechanics: "You can attack more than once when using the Attack action with your Pact Weapon, according to the invocation's rules."
  },

  "careful_spell": { name: "Careful Spell", category: "Metamagic", source: "PHB 2024", mechanics: "Spend Sorcery Points to protect selected creatures from the full impact of some spells that require saving throws, according to the option's rules." },
  "distant_spell": { name: "Distant Spell", category: "Metamagic", source: "PHB 2024", mechanics: "Spend Sorcery Points to increase a spell's range, according to the option's rules." },
  "empowered_spell": { name: "Empowered Spell", category: "Metamagic", source: "PHB 2024", mechanics: "Spend Sorcery Points to reroll some damage dice for a spell, using the option's limits." },
  "extended_spell": { name: "Extended Spell", category: "Metamagic", source: "PHB 2024", mechanics: "Spend Sorcery Points to increase a spell's duration, according to the option's limits." },
  "heightened_spell": { name: "Heightened Spell", category: "Metamagic", source: "PHB 2024", mechanics: "Spend Sorcery Points to make a target more likely to fail a saving throw against a spell, according to the option's rules." },
  "quickened_spell": { name: "Quickened Spell", category: "Metamagic", source: "PHB 2024", mechanics: "Spend Sorcery Points to change a spell's casting time to a Bonus Action when the option allows it." },
  "subtle_spell": { name: "Subtle Spell", category: "Metamagic", source: "PHB 2024", mechanics: "Spend Sorcery Points to cast a spell without some or all normal components, according to the option's rules." },
  "transmuted_spell": { name: "Transmuted Spell", category: "Metamagic", source: "Tasha / PHB compatibility", mechanics: "Spend Sorcery Points to change a spell's damage type to another allowed type." },
  "twinned_spell": { name: "Twinned Spell", category: "Metamagic", source: "PHB 2024", mechanics: "Spend Sorcery Points to affect an additional valid target or otherwise duplicate the spell's effect according to the current rules text." },

  "menacing_attack": { name: "Menacing Attack", category: "Battle Master Maneuver", source: "PHB 2024", mechanics: "Spend a Superiority Die to add damage and possibly Frighten the target, according to the maneuver's saving throw rules." },
  "maneuvering_attack": { name: "Maneuvering Attack", category: "Battle Master Maneuver", source: "PHB 2024", mechanics: "Spend a Superiority Die to add damage and move an ally without provoking Opportunity Attacks from the target, according to the maneuver's limits." },
  "precision_attack": { name: "Precision Attack", category: "Battle Master Maneuver", source: "PHB 2024", mechanics: "Spend a Superiority Die to improve an attack roll." },
  "disarming_attack": { name: "Disarming Attack", category: "Battle Master Maneuver", source: "PHB 2024", mechanics: "Spend a Superiority Die to add damage and potentially force the target to drop an item." },
  "goading_attack": { name: "Goading Attack", category: "Battle Master Maneuver", source: "PHB 2024", mechanics: "Spend a Superiority Die to add damage and make the target worse at attacking creatures other than you." },
  "riposte": { name: "Riposte", category: "Battle Master Maneuver", source: "PHB 2024", mechanics: "Spend a Superiority Die to make a reaction attack after a creature misses you, according to the maneuver's trigger." },
  "trip_attack": { name: "Trip Attack", category: "Battle Master Maneuver", source: "PHB 2024", mechanics: "Spend a Superiority Die to add damage and potentially knock the target Prone." },
  "distracting_strike": { name: "Distracting Strike", category: "Battle Master Maneuver", source: "PHB 2024", mechanics: "Spend a Superiority Die to add damage and help the next attacker against the target." },
  "rally": { name: "Rally", category: "Battle Master Maneuver", source: "PHB 2024", mechanics: "Spend a Superiority Die to grant Temporary Hit Points to an ally." },
  "evasive_footwork": { name: "Evasive Footwork", category: "Battle Master Maneuver", source: "PHB 2024", mechanics: "Spend a Superiority Die to improve defense while moving, according to the maneuver's rules." }
};

window.featureKey = function featureKey(raw){
  return String(raw || '')
    .replace(/[’‘]/g, "'")
    .replace(/\s+—.*$/, '')
    .replace(/\s*\([^)]*\)\s*$/, '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');
};

window.getClassFeature = function getClassFeature(idOrName){
  const key = window.featureKey(idOrName);
  return window.CLASS_FEATURES_DB[key] || window.CLASS_FEATURES_DB[String(idOrName || '')] || null;
};

window.classFeatureTooltipHtml = function classFeatureTooltipHtml(idOrName, fallbackLabel){
  const feature = window.getClassFeature(idOrName);
  const label = fallbackLabel || String(idOrName || '');
  if (!feature) return `<strong>${label}</strong><br><em>Feature mechanics pending validation.</em>`;
  const rows = [
    ['Source', feature.source],
    ['Category', feature.category],
    ['Prerequisite', feature.prerequisite],
    ['Grants', Array.isArray(feature.grants) ? feature.grants.join(', ') : feature.grants],
    ['Mechanics', feature.mechanics],
    ['Table Use', feature.tableUse]
  ].filter(([,v]) => v);
  return `<strong>${feature.name || label}</strong>` + rows.map(([k,v]) => `<br><b>${k}:</b> ${v}`).join('');
};
