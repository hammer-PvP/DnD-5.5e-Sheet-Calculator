// beta 0.1.119 EN-US — canonical species mechanical feature database.
// Offline/local only. This DB powers species feature tooltips in the planner.
// It uses condensed mechanical summaries, not narrative/fantasy text.

window.SPECIES_FEATURES_DB = {
  // Shared
  "darkvision": {
    name:"Darkvision", source:"PHB 2024", type:"Senses",
    mechanics:"You have Darkvision with the range given by your species, normally 60 feet.",
    tableUse:"Use this when checking vision in dim light or darkness."
  },
  "darkvision_36": {
    name:"Darkvision", source:"PHB 2024", type:"Senses",
    mechanics:"You have Darkvision with an extended range, normally 120 feet when granted by this species entry.",
    tableUse:"Use this when checking vision in dim light or darkness."
  },

  // Aasimar
  "celestial_resistance": {
    name:"Celestial Resistance", source:"PHB 2024", species:"Aasimar", type:"Resistance",
    mechanics:"Resistance to Necrotic damage and Radiant damage.",
    tableUse:"Halve incoming Necrotic or Radiant damage after other modifiers, following resistance rules."
  },
  "healing_hands": {
    name:"Healing Hands", source:"PHB 2024", species:"Aasimar", type:"Healing",
    activation:"Magic action", uses:"Once per Long Rest",
    mechanics:"Touch a creature and roll a number of d4s equal to your Proficiency Bonus. The creature regains Hit Points equal to the total.",
    scaling:"Healing dice = Proficiency Bonus d4s."
  },
  "light_bearer": {
    name:"Light Bearer", source:"PHB 2024", species:"Aasimar", type:"Cantrip",
    mechanics:"You know the Light cantrip. Charisma is the spellcasting ability for this trait.",
    spell:"Light"
  },
  "celestial_revelation": {
    name:"Celestial Revelation", source:"PHB 2024", species:"Aasimar", type:"Transformation",
    activation:"Bonus Action", level:"Character Level 3", duration:"1 minute", uses:"Once per Long Rest",
    mechanics:"Choose a revelation option each time you transform. Once on each of your turns during the transformation, when you damage a target with an attack or spell, deal extra damage equal to your Proficiency Bonus.",
    damage:"Necrotic for Necrotic Shroud; Radiant for Heavenly Wings and Inner Radiance.",
    scaling:"Extra damage = Proficiency Bonus."
  },
  "celestial_wings": {
    name:"Heavenly Wings", source:"PHB 2024", species:"Aasimar", type:"Celestial Revelation Option",
    mechanics:"During Celestial Revelation, you gain a Fly Speed equal to your Speed."
  },
  "heavenly_wings": {
    name:"Heavenly Wings", source:"PHB 2024", species:"Aasimar", type:"Celestial Revelation Option",
    mechanics:"During Celestial Revelation, you gain a Fly Speed equal to your Speed."
  },
  "inner_radiance": {
    name:"Inner Radiance", source:"PHB 2024", species:"Aasimar", type:"Celestial Revelation Option",
    mechanics:"During Celestial Revelation, you shed Bright Light in a 10-foot radius and Dim Light for 10 more feet. At the end of each of your turns, creatures within 10 feet take Radiant damage equal to your Proficiency Bonus."
  },
  "radiant_transformation": {
    name:"Inner Radiance", source:"PHB 2024", species:"Aasimar", type:"Celestial Revelation Option",
    mechanics:"During Celestial Revelation, you shed Bright Light in a 10-foot radius and Dim Light for 10 more feet. At the end of each of your turns, creatures within 10 feet take Radiant damage equal to your Proficiency Bonus."
  },
  "necrotic_shroud": {
    name:"Necrotic Shroud", source:"PHB 2024", species:"Aasimar", type:"Celestial Revelation Option",
    mechanics:"During Celestial Revelation, nearby non-allies within 10 feet make a Charisma save or become Frightened until the end of your next turn. Your revelation extra damage is Necrotic.",
    save:"Charisma; DC = 8 + Charisma modifier + Proficiency Bonus"
  },

  // Dwarf
  "dwarven_toughness": {
    name:"Dwarven Toughness", source:"PHB 2024", species:"Dwarf", type:"Hit Points",
    mechanics:"Your Hit Point maximum increases by 1, and it increases by 1 again whenever you gain a level.",
    scaling:"Maximum HP bonus = character level."
  },
  "poison_resilience": {
    name:"Poison Resilience", source:"PHB 2024", species:"Dwarf", type:"Resistance",
    mechanics:"Resistance to Poison damage and Advantage on saving throws to avoid or end the Poisoned condition."
  },
  "stonecunning": {
    name:"Stonecunning", source:"PHB 2024", species:"Dwarf", type:"Tremorsense",
    activation:"Bonus Action", uses:"Proficiency Bonus per Long Rest",
    mechanics:"Gain Tremorsense with a 60-foot range for 10 minutes. You must be on a stone surface or touching a stone surface to use it.",
    duration:"10 minutes"
  },

  // Dragonborn
  "draconic_ancestry": {
    name:"Draconic Ancestry", source:"PHB 2024", species:"Dragonborn", type:"Choice",
    mechanics:"Choose a dragon ancestor. The choice determines Breath Weapon damage type and your Damage Resistance.",
    options:"Black/Copper: Acid; Blue/Bronze: Lightning; Brass/Gold/Red: Fire; Green: Poison; Silver/White: Cold."
  },
  "breath_weapon": {
    name:"Breath Weapon", source:"PHB 2024", species:"Dragonborn", type:"Attack Option",
    activation:"When you take the Attack action", uses:"Proficiency Bonus per Long Rest",
    mechanics:"Replace one attack with an exhalation. Creatures in the area make a Dexterity save, taking damage on a failure or half on a success.",
    damage:"1d10 at level 1; 2d10 at level 5; 3d10 at level 11; 4d10 at level 17.",
    save:"Dexterity; DC = 8 + Constitution modifier + Proficiency Bonus"
  },
  "damage_resistance": {
    name:"Damage Resistance", source:"PHB 2024", species:"Dragonborn", type:"Resistance",
    mechanics:"You have Resistance to the damage type determined by your Draconic Ancestry."
  },
  "draconic_flight": {
    name:"Draconic Flight", source:"PHB 2024", species:"Dragonborn", type:"Flight",
    activation:"Bonus Action", level:"Character Level 5", uses:"Once per Long Rest",
    mechanics:"Gain a Fly Speed equal to your Speed for 10 minutes.",
    duration:"10 minutes"
  },

  // Elf
  "elven_lineage": {
    name:"Elven Lineage", source:"PHB 2024", species:"Elf", type:"Choice",
    mechanics:"Choose Drow, High Elf, or Wood Elf. Your choice grants a cantrip at level 1 and additional prepared spells at character levels 3 and 5."
  },
  "fey_ancestry": {
    name:"Fey Ancestry", source:"PHB 2024", species:"Elf", type:"Condition Defense",
    mechanics:"Advantage on saving throws you make to avoid or end the Charmed condition."
  },
  "keen_senses": {
    name:"Keen Senses", source:"PHB 2024", species:"Elf", type:"Skill",
    mechanics:"Gain proficiency in one skill chosen from Insight, Perception, or Survival."
  },
  "trance": {
    name:"Trance", source:"PHB 2024", species:"Elf", type:"Rest",
    mechanics:"You don't need to sleep, and magic can't put you to sleep. You can finish a Long Rest in 4 hours if you spend those hours in a trance-like meditation."
  },
  "elven_lineage_spell_3": {
    name:"Elven Lineage Spell", source:"PHB 2024", species:"Elf", type:"Species Spell",
    level:"Character Level 3",
    mechanics:"Your chosen Elven Lineage grants an additional prepared spell. You can cast it once without a spell slot per Long Rest and can also cast it with spell slots."
  },
  "elven_lineage_spell_5": {
    name:"Improved Elven Lineage Spell", source:"PHB 2024", species:"Elf", type:"Species Spell",
    level:"Character Level 5",
    mechanics:"Your chosen Elven Lineage grants a higher-level prepared spell. You can cast it once without a spell slot per Long Rest and can also cast it with spell slots."
  },

  // Gnome
  "gnomish_cunning": {
    name:"Gnomish Cunning", source:"PHB 2024", species:"Gnome", type:"Saving Throws",
    mechanics:"Advantage on Intelligence, Wisdom, and Charisma saving throws."
  },
  "gnomish_lineage": {
    name:"Gnomish Lineage", source:"PHB 2024", species:"Gnome", type:"Choice",
    mechanics:"Choose Forest Gnome or Rock Gnome. Forest Gnome grants Minor Illusion and Speak with Animals. Rock Gnome grants Mending and Prestidigitation plus tinkering effects."
  },
  "forest_gnome": {
    name:"Forest Gnome", source:"PHB 2024", species:"Gnome", type:"Gnomish Lineage",
    mechanics:"You know Minor Illusion. You can also cast Speak with Animals with this trait. Intelligence, Wisdom, or Charisma is chosen as the spellcasting ability."
  },
  "rock_gnome": {
    name:"Rock Gnome", source:"PHB 2024", species:"Gnome", type:"Gnomish Lineage",
    mechanics:"You know Mending and Prestidigitation. Prestidigitation can create a Tiny clockwork device following the trait's limitations."
  },

  // Goliath
  "giant_ancestry": {
    name:"Giant Ancestry", source:"PHB 2024", species:"Goliath", type:"Choice",
    mechanics:"Choose a giant ancestry. It grants a specific level 1 benefit usable a limited number of times.",
    options:"Cloud: teleport as Bonus Action; Fire: extra Fire damage; Frost: extra Cold damage and speed reduction; Hill: knock target Prone; Stone: reduce damage; Storm: reaction Thunder damage."
  },
  "powerful_build": {
    name:"Powerful Build", source:"PHB 2024", species:"Goliath", type:"Carry/Grapple",
    mechanics:"Advantage on saving throws to end the Grappled condition. You count as one size larger when determining carrying capacity."
  },
  "large_form": {
    name:"Large Form", source:"PHB 2024", species:"Goliath", type:"Size",
    activation:"Bonus Action", level:"Character Level 5", uses:"Once per Long Rest",
    mechanics:"Become Large for 10 minutes if you have room. You have Advantage on Strength checks and your Speed increases by 10 feet.",
    duration:"10 minutes"
  },

  // Human
  "resourceful": {
    name:"Resourceful", source:"PHB 2024", species:"Human", type:"Heroic Inspiration",
    mechanics:"Gain Heroic Inspiration whenever you finish a Long Rest."
  },
  "skillful_species": {
    name:"Skillful", source:"PHB 2024", species:"Human", type:"Skill",
    mechanics:"Gain proficiency in one skill of your choice."
  },
  "versatile_origin_feat": {
    name:"Versatile", source:"PHB 2024", species:"Human", type:"Origin Feat",
    mechanics:"Gain one Origin feat of your choice."
  },

  // Orc
  "adrenaline_rush": {
    name:"Adrenaline Rush", source:"PHB 2024", species:"Orc", type:"Mobility/Temp HP",
    activation:"Bonus Action", uses:"Proficiency Bonus per Short or Long Rest",
    mechanics:"Take the Dash action as a Bonus Action and gain Temporary Hit Points equal to your Proficiency Bonus."
  },
  "relentless_endurance": {
    name:"Relentless Endurance", source:"PHB 2024", species:"Orc", type:"Survival",
    uses:"Once per Long Rest",
    mechanics:"When you are reduced to 0 Hit Points but not killed outright, drop to 1 Hit Point instead."
  },

  // Halfling
  "brave": {
    name:"Brave", source:"PHB 2024", species:"Halfling", type:"Condition Defense",
    mechanics:"Advantage on saving throws you make to avoid or end the Frightened condition."
  },
  "halfling_nimbleness": {
    name:"Halfling Nimbleness", source:"PHB 2024", species:"Halfling", type:"Movement",
    mechanics:"You can move through the space of any creature that is a size larger than you, but you can't stop in the same space."
  },
  "luck": {
    name:"Luck", source:"PHB 2024", species:"Halfling", type:"D20 Test",
    mechanics:"When you roll a 1 on the d20 of a D20 Test, you can reroll the die and must use the new roll."
  },
  "naturally_stealthy": {
    name:"Naturally Stealthy", source:"PHB 2024", species:"Halfling", type:"Hide",
    mechanics:"You can take the Hide action even when obscured only by a creature that is at least one size larger than you."
  },

  // Tiefling
  "fiendish_legacy": {
    name:"Fiendish Legacy", source:"PHB 2024", species:"Tiefling", type:"Choice",
    mechanics:"Choose Abyssal, Chthonic, or Infernal. The choice grants a damage resistance, a cantrip, and additional prepared spells at character levels 3 and 5.",
    spellAbility:"Choose Intelligence, Wisdom, or Charisma as the spellcasting ability for these spells."
  },
  "thaumaturgy": {
    name:"Otherworldly Presence", source:"PHB 2024", species:"Tiefling", type:"Cantrip",
    mechanics:"You know the Thaumaturgy cantrip. It uses the same spellcasting ability chosen for Fiendish Legacy.",
    spell:"Thaumaturgy"
  },
  "otherworldly_presence": {
    name:"Otherworldly Presence", source:"PHB 2024", species:"Tiefling", type:"Cantrip",
    mechanics:"You know the Thaumaturgy cantrip. It uses the same spellcasting ability chosen for Fiendish Legacy.",
    spell:"Thaumaturgy"
  },
  "fiendish_legacy_spell_3": {
    name:"Fiendish Legacy Spell", source:"PHB 2024", species:"Tiefling", type:"Species Spell",
    level:"Character Level 3",
    mechanics:"Your chosen Fiendish Legacy grants an additional prepared spell. You can cast it once without a spell slot per Long Rest and can also cast it with spell slots."
  },
  "fiendish_legacy_spell_5": {
    name:"Improved Fiendish Legacy Spell", source:"PHB 2024", species:"Tiefling", type:"Species Spell",
    level:"Character Level 5",
    mechanics:"Your chosen Fiendish Legacy grants a higher-level prepared spell. You can cast it once without a spell slot per Long Rest and can also cast it with spell slots."
  },
  "abyssal": {
    name:"Abyssal Legacy", source:"PHB 2024", species:"Tiefling", type:"Fiendish Legacy",
    mechanics:"Resistance to Poison damage and you know Poison Spray. Later legacy spells include Ray of Sickness and Hold Person."
  },
  "chthonic": {
    name:"Chthonic Legacy", source:"PHB 2024", species:"Tiefling", type:"Fiendish Legacy",
    mechanics:"Resistance to Necrotic damage and you know Chill Touch. Later legacy spells include False Life and Ray of Enfeeblement."
  },
  "infernal": {
    name:"Infernal Legacy", source:"PHB 2024", species:"Tiefling", type:"Fiendish Legacy",
    mechanics:"Resistance to Fire damage and you know Fire Bolt. Later legacy spells include Hellish Rebuke and Darkness."
  }
};

window.speciesFeatureKey = function speciesFeatureKey(raw){
  return String(raw || '')
    .replace(/[’‘]/g,"'")
    .replace(/\s*\([^)]*\)\s*$/,'')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g,'_')
    .replace(/^_+|_+$/g,'');
};

window.getSpeciesFeature = function getSpeciesFeature(idOrName){
  const key = window.speciesFeatureKey(idOrName);
  return window.SPECIES_FEATURES_DB[key] || window.SPECIES_FEATURES_DB[String(idOrName || '')] || null;
};

window.speciesFeatureTooltipHtml = function speciesFeatureTooltipHtml(idOrName, fallbackLabel){
  const feature = window.getSpeciesFeature(idOrName);
  const label = fallbackLabel || String(idOrName || '');
  if (!feature) return `<strong>${label}</strong><br><em>Species feature details pending validation.</em>`;
  const rows = [
    ['Source', feature.source],
    ['Species', feature.species],
    ['Type', feature.type],
    ['Level', feature.level],
    ['Activation', feature.activation],
    ['Uses', feature.uses],
    ['Duration', feature.duration],
    ['Range', feature.range],
    ['Save', feature.save],
    ['Damage', feature.damage],
    ['Scaling', feature.scaling],
    ['Spellcasting Ability', feature.spellAbility],
    ['Options', feature.options],
    ['Mechanics', feature.mechanics],
    ['Table Use', feature.tableUse]
  ].filter(([,v]) => v);
  return `<strong>${feature.name || label}</strong>` + rows.map(([k,v]) => `<br><b>${k}:</b> ${v}`).join('');
};
