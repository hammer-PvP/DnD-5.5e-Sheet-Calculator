// beta 0.1.109 EN-US — canonical consolidated spell database.
// This single file contains spell stat blocks, class/subclass tags, and spell registry helpers.
// Do not create a second spell list DB; planner dropdowns and Spell Reference both read from this file.

// beta 0.1.105 EN-US — separated spell database.
// Condensed mechanical spell stat blocks for planner tooltips.
// Class spell lists should reference spell names/IDs; this DB is the single tooltip source.
window.SPELLS_DB = {
  "Acid Splash": {level:"Cantrip", school:"Evocation", casting:"Action", range:"60 ft.", components:"V, S", duration:"Instantaneous", save:"Dexterity", damage:"Acid", cantripProgression:["Level 1: 1d6","Level 5: 2d6","Level 11: 3d6","Level 17: 4d6"], text:"One or two nearby targets make a Dexterity save or take Acid damage.", source:"PHB 2024"},
  "Alarm": {level:"1st", school:"Abjuration", casting:"1 minute or Ritual", range:"30 ft.", components:"V, S, M", duration:"8 hours", text:"Ward an area; you are alerted when a creature enters it.", source:"PHB 2024"},
  "Animal Friendship": {level:"1st", school:"Enchantment", casting:"Action", range:"30 ft.", components:"V, S, M", duration:"24 hours", save:"Wisdom", text:"A Beast becomes charmed by you on a failed save, within spell limits.", source:"PHB 2024"},
  "Armor of Agathys": {level:"1st", school:"Abjuration", casting:"Action", range:"Self", components:"V, S, M", duration:"1 hour", damage:"5 Cold", scaling:"+5 temporary HP and +5 Cold damage per slot level above 1st.", text:"Gain temporary HP. A creature that hits you with a melee attack while those HP remain takes Cold damage.", source:"PHB 2024"},
  "Arms of Hadar": {level:"1st", school:"Conjuration", casting:"Action", range:"Self (10-ft. radius)", components:"V, S", duration:"Instantaneous", save:"Strength", damage:"2d6 Necrotic", scaling:"+1d6 per slot level above 1st.", text:"Creatures near you take Necrotic damage on a failed save and can’t take Reactions until their next turn.", source:"PHB 2024"},
  "Bless": {level:"1st", school:"Enchantment", casting:"Action", range:"30 ft.", components:"V, S, M", duration:"Concentration, up to 1 minute", scaling:"Affects one additional target per slot level above 1st.", text:"Targets add 1d4 to attack rolls and saving throws.", source:"PHB 2024"},
  "Charm Person": {level:"1st", school:"Enchantment", casting:"Action", range:"30 ft.", components:"V, S", duration:"1 hour", save:"Wisdom", scaling:"Targets one additional creature per slot level above 1st.", text:"A Humanoid is charmed by you on a failed save, with Advantage on the save if you or allies are fighting it.", source:"PHB 2024"},
  "Chill Touch": {level:"Cantrip", school:"Necromancy", casting:"Action", range:"Touch", components:"V, S", duration:"Instantaneous", attack:"Melee spell attack", damage:"Necrotic", cantripProgression:["Level 1: 1d10","Level 5: 2d10","Level 11: 3d10","Level 17: 4d10"], text:"On hit, target takes Necrotic damage and can have healing interference as defined by the spell.", source:"PHB 2024"},
  "Command": {level:"1st", school:"Enchantment", casting:"Action", range:"60 ft.", components:"V", duration:"1 round", save:"Wisdom", scaling:"Targets one additional creature per slot level above 1st.", text:"Target follows a one-word command on a failed save.", source:"PHB 2024"},
  "Comprehend Languages": {level:"1st", school:"Divination", casting:"Action or Ritual", range:"Self", components:"V, S, M", duration:"1 hour", text:"Understand literal meaning of spoken or written languages within spell limits.", source:"PHB 2024"},
  "Create or Destroy Water": {level:"1st", school:"Transmutation", casting:"Action", range:"30 ft.", components:"V, S, M", duration:"Instantaneous", scaling:"Water volume increases by slot level.", text:"Create or destroy water in an open container or area within spell limits.", source:"PHB 2024"},
  "Cure Wounds": {level:"1st", school:"Abjuration", casting:"Action", range:"Touch", components:"V, S", duration:"Instantaneous", healing:"2d8 + spellcasting ability modifier", scaling:"+2d8 healing per slot level above 1st.", text:"A creature you touch regains Hit Points.", source:"PHB 2024"},
  "Detect Evil and Good": {level:"1st", school:"Divination", casting:"Action", range:"Self", components:"V, S", duration:"Concentration, up to 10 minutes", text:"Sense certain creature types, consecrated/desecrated places, and similar presences within spell limits.", source:"PHB 2024"},
  "Detect Magic": {level:"1st", school:"Divination", casting:"Action or Ritual", range:"Self", components:"V, S", duration:"Concentration, up to 10 minutes", text:"Sense nearby magic and identify schools of magic within spell limits.", source:"PHB 2024"},
  "Detect Poison and Disease": {level:"1st", school:"Divination", casting:"Action or Ritual", range:"Self", components:"V, S, M", duration:"Concentration, up to 10 minutes", text:"Sense poison, poisonous creatures, and disease within range and identify them within spell limits.", source:"PHB 2024"},
  "Disguise Self": {level:"1st", school:"Illusion", casting:"Action", range:"Self", components:"V, S", duration:"1 hour", text:"Change your appearance illusionarily within spell limits.", source:"PHB 2024"},
  "Dissonant Whispers": {level:"1st", school:"Enchantment", casting:"Action", range:"60 ft.", components:"V", duration:"Instantaneous", save:"Wisdom", damage:"3d6 Psychic", scaling:"+1d6 per slot level above 1st.", text:"Target takes Psychic damage on a failed save and must use its Reaction to move away if able; half damage on success.", source:"PHB 2024"},
  "Divine Smite": {level:"1st", school:"Evocation", casting:"Bonus Action", range:"Self", components:"V", duration:"Instantaneous", damage:"2d8 Radiant", scaling:"+1d8 per slot level above 1st.", text:"After hitting with a melee weapon or Unarmed Strike, deal extra Radiant damage to the target.", source:"PHB 2024"},
  "Druidcraft": {level:"Cantrip", school:"Transmutation", casting:"Action", range:"30 ft.", components:"V, S", duration:"Instantaneous", text:"Create minor primal effects such as sensory effects, weather signs, or small natural changes.", source:"PHB 2024"},
  "Eldritch Blast": {level:"Cantrip", school:"Evocation", casting:"Action", range:"120 ft.", components:"V, S", duration:"Instantaneous", attack:"Ranged spell attack", damage:"Force", cantripProgression:["Level 1: 1 beam, 1d10","Level 5: 2 beams, 1d10 each","Level 11: 3 beams, 1d10 each","Level 17: 4 beams, 1d10 each"], text:"Make one or more ranged spell attacks; each hit deals Force damage.", source:"PHB 2024"},
  "Entangle": {level:"1st", school:"Conjuration", casting:"Action", range:"90 ft.", components:"V, S", duration:"Concentration, up to 1 minute", save:"Strength", text:"Plants create difficult terrain and can Restrain creatures on failed saves.", source:"PHB 2024"},
  "Faerie Fire": {level:"1st", school:"Evocation", casting:"Action", range:"60 ft.", components:"V", duration:"Concentration, up to 1 minute", save:"Dexterity", text:"Objects and creatures in area shed light; attacks against affected creatures gain Advantage if the attacker can see them.", source:"PHB 2024"},
  "Feather Fall": {level:"1st", school:"Transmutation", casting:"Reaction", range:"60 ft.", components:"V, M", duration:"1 minute", text:"Up to five falling creatures descend slowly and avoid falling damage while the spell lasts.", source:"PHB 2024"},
  "Fire Bolt": {level:"Cantrip", school:"Evocation", casting:"Action", range:"120 ft.", components:"V, S", duration:"Instantaneous", attack:"Ranged spell attack", damage:"Fire", cantripProgression:["Level 1: 1d10","Level 5: 2d10","Level 11: 3d10","Level 17: 4d10"], text:"On hit, target takes Fire damage. Can ignite unattended flammable objects.", source:"PHB 2024"},
  "Fog Cloud": {level:"1st", school:"Conjuration", casting:"Action", range:"120 ft.", components:"V, S", duration:"Concentration, up to 1 hour", scaling:"Fog radius increases by 20 ft. per slot level above 1st.", text:"Create a heavily obscured sphere of fog.", source:"PHB 2024"},
  "Friends": {level:"Cantrip", school:"Enchantment", casting:"Action", range:"10 ft.", components:"S, M", duration:"Concentration, up to 1 minute", save:"Wisdom", text:"Influence a creature socially within spell limits; hostile reaction risks apply as defined.", source:"PHB 2024"},
  "Goodberry": {level:"1st", school:"Conjuration", casting:"Action", range:"Self", components:"V, S, M", duration:"24 hours", healing:"1 HP per berry", text:"Create berries that provide nourishment and restore Hit Points when eaten.", source:"PHB 2024"},
  "Guidance": {level:"Cantrip", school:"Divination", casting:"Reaction", range:"10 ft.", components:"V, S", duration:"Instantaneous", text:"When a creature fails an ability check, it can add 1d4 to the roll, potentially turning failure into success.", source:"PHB 2024"},
  "Healing Word": {level:"1st", school:"Abjuration", casting:"Bonus Action", range:"60 ft.", components:"V", duration:"Instantaneous", healing:"2d4 + spellcasting ability modifier", scaling:"+2d4 healing per slot level above 1st.", text:"A creature you can see regains Hit Points.", source:"PHB 2024"},
  "Hellish Rebuke": {level:"1st", school:"Evocation", casting:"Reaction", range:"60 ft.", components:"V, S", duration:"Instantaneous", save:"Dexterity", damage:"2d10 Fire", scaling:"+1d10 per slot level above 1st.", text:"Trigger: a creature damages you. The target takes Fire damage, half on successful save.", source:"PHB 2024"},
  "Heroism": {level:"1st", school:"Enchantment", casting:"Action", range:"Touch", components:"V, S", duration:"Concentration, up to 1 minute", scaling:"Targets one additional creature per slot level above 1st.", text:"Target is immune to Frightened and gains temporary HP at the start of each of its turns.", source:"PHB 2024"},
  "Hex": {level:"1st", school:"Enchantment", casting:"Bonus Action", range:"90 ft.", components:"V, S, M", duration:"Concentration, up to 1 hour", damage:"+1d6 Necrotic on each hit you make against the target", scaling:"Duration increases with higher slot levels.", text:"Mark a creature. Your attacks deal extra Necrotic damage to it; choose one ability, and the target has Disadvantage on ability checks using that ability.", source:"PHB 2024"},
  "Hunter’s Mark": {level:"1st", school:"Divination", casting:"Bonus Action", range:"90 ft.", components:"V", duration:"Concentration, up to 1 hour", damage:"+1d6 Force or weapon rider, as current rules define", scaling:"Duration increases with higher slots.", text:"Mark a creature; your attacks deal extra damage to it and tracking improves.", source:"PHB 2024"},
  "Identify": {level:"1st", school:"Divination", casting:"1 minute or Ritual", range:"Touch", components:"V, S, M", duration:"Instantaneous", text:"Learn properties of a magic item or spell affecting a creature/object.", source:"PHB 2024"},
  "Illusory Script": {level:"1st", school:"Illusion", casting:"1 minute or Ritual", range:"Touch", components:"S, M", duration:"10 days", text:"Write a hidden message that appears differently to other readers within spell limits.", source:"PHB 2024"},
  "Inflict Wounds": {level:"1st", school:"Necromancy", casting:"Action", range:"Touch", components:"V, S", duration:"Instantaneous", attack:"Melee spell attack", damage:"3d10 Necrotic", scaling:"+1d10 per slot level above 1st.", text:"On hit, target takes Necrotic damage.", source:"PHB 2024"},
  "Jump": {level:"1st", school:"Transmutation", casting:"Bonus Action", range:"Touch", components:"V, S, M", duration:"1 minute", text:"Increase a creature’s jump movement within spell limits.", source:"PHB 2024"},
  "Light": {level:"Cantrip", school:"Evocation", casting:"Action", range:"Touch", components:"V, M", duration:"1 hour", text:"One object sheds bright and dim light. Hostile carried object can allow a Dexterity save.", source:"PHB 2024"},
  "Longstrider": {level:"1st", school:"Transmutation", casting:"Action", range:"Touch", components:"V, S, M", duration:"1 hour", scaling:"Targets one additional creature per slot level above 1st.", text:"Increase target’s Speed by 10 ft.", source:"PHB 2024"},
  "Mage Armor": {level:"1st", school:"Abjuration", casting:"Action", range:"Touch", components:"V, S, M", duration:"8 hours", text:"Target not wearing armor has base AC 13 + Dexterity modifier.", source:"PHB 2024"},
  "Mage Hand": {level:"Cantrip", school:"Conjuration", casting:"Action", range:"30 ft.", components:"V, S", duration:"1 minute", text:"Create a spectral hand that can manipulate objects within spell limits.", source:"PHB 2024"},
  "Magic Missile": {level:"1st", school:"Evocation", casting:"Action", range:"120 ft.", components:"V, S", duration:"Instantaneous", damage:"3 darts, each 1d4+1 Force", scaling:"One additional dart per slot level above 1st.", text:"Darts automatically hit targets you can see within range.", source:"PHB 2024"},
  "Mending": {level:"Cantrip", school:"Transmutation", casting:"1 minute", range:"Touch", components:"V, S, M", duration:"Instantaneous", text:"Repair a break or tear in an object within spell limits.", source:"PHB 2024"},
  "Message": {level:"Cantrip", school:"Transmutation", casting:"Action", range:"120 ft.", components:"S, M", duration:"1 round", text:"Send a whispered message to a target, who can whisper a reply.", source:"PHB 2024"},
  "Minor Illusion": {level:"Cantrip", school:"Illusion", casting:"Action", range:"30 ft.", components:"S, M", duration:"1 minute", text:"Create a sound or image illusion within spell limits.", source:"PHB 2024"},
  "Poison Spray": {level:"Cantrip", school:"Necromancy", casting:"Action", range:"30 ft.", components:"V, S", duration:"Instantaneous", save:"Constitution", damage:"Poison", cantripProgression:["Level 1: 1d12","Level 5: 2d12","Level 11: 3d12","Level 17: 4d12"], text:"Target takes Poison damage on a failed save.", source:"PHB 2024"},
  "Produce Flame": {level:"Cantrip", school:"Conjuration", casting:"Bonus Action", range:"Self / 60 ft. attack", components:"V, S", duration:"10 minutes", attack:"Ranged spell attack", damage:"Fire", cantripProgression:["Level 1: 1d8","Level 5: 2d8","Level 11: 3d8","Level 17: 4d8"], text:"Create flame for light; you can hurl it to deal Fire damage.", source:"PHB 2024"},
  "Protection from Evil and Good": {level:"1st", school:"Abjuration", casting:"Action", range:"Touch", components:"V, S, M", duration:"Concentration, up to 10 minutes", text:"Protect a target against specified creature types; attacks against it can have Disadvantage and it resists certain control effects.", source:"PHB 2024"},
  "Purify Food and Drink": {level:"1st", school:"Transmutation", casting:"Action or Ritual", range:"10 ft.", components:"V, S", duration:"Instantaneous", text:"Purify nonmagical food and drink in a small area.", source:"PHB 2024"},
  "Resistance": {level:"Cantrip", school:"Abjuration", casting:"Reaction", range:"10 ft.", components:"V, S", duration:"Instantaneous", text:"When a creature fails a saving throw, it can add 1d4 to the roll, potentially turning failure into success.", source:"PHB 2024"},
  "Sacred Flame": {level:"Cantrip", school:"Evocation", casting:"Action", range:"60 ft.", components:"V, S", duration:"Instantaneous", save:"Dexterity", damage:"Radiant", cantripProgression:["Level 1: 1d8","Level 5: 2d8","Level 11: 3d8","Level 17: 4d8"], text:"Target takes Radiant damage on a failed save; cover does not help as defined by the spell.", source:"PHB 2024"},
  "Sanctuary": {level:"1st", school:"Abjuration", casting:"Bonus Action", range:"30 ft.", components:"V, S, M", duration:"1 minute", save:"Wisdom", text:"Attackers must save or choose another target; spell ends if warded creature attacks, casts harmful spell, or deals damage as defined.", source:"PHB 2024"},
  "Shield": {level:"1st", school:"Abjuration", casting:"Reaction", range:"Self", components:"V, S", duration:"1 round", text:"Trigger: hit by an attack or targeted by Magic Missile. Gain +5 AC until start of your next turn and negate Magic Missile.", source:"PHB 2024"},
  "Shield of Faith": {level:"1st", school:"Abjuration", casting:"Bonus Action", range:"60 ft.", components:"V, S, M", duration:"Concentration, up to 10 minutes", text:"Target gains +2 AC while the spell lasts.", source:"PHB 2024"},
  "Shillelagh": {level:"Cantrip", school:"Transmutation", casting:"Bonus Action", range:"Self", components:"V, S, M", duration:"1 minute", damage:"Weapon die changes/scales", cantripProgression:["Level 1: d8","Level 5: d10","Level 11: d12","Level 17: 2d6"], text:"A club or quarterstaff uses your spellcasting ability for attacks and damage and its damage die improves.", source:"PHB 2024"},
  "Shocking Grasp": {level:"Cantrip", school:"Evocation", casting:"Action", range:"Touch", components:"V, S", duration:"Instantaneous", attack:"Melee spell attack", damage:"Lightning", cantripProgression:["Level 1: 1d8","Level 5: 2d8","Level 11: 3d8","Level 17: 4d8"], text:"On hit, target takes Lightning damage and can’t take Opportunity Attacks until the start of its next turn.", source:"PHB 2024"},
  "Silent Image": {level:"1st", school:"Illusion", casting:"Action", range:"60 ft.", components:"V, S, M", duration:"Concentration, up to 10 minutes", text:"Create a visual illusion within spell limits.", source:"PHB 2024"},
  "Sleep": {level:"1st", school:"Enchantment", casting:"Action", range:"60 ft.", components:"V, S, M", duration:"Concentration, up to 1 minute", save:"Wisdom", text:"Creatures in area can become Incapacitated and fall asleep after failed saves as defined by the spell.", source:"PHB 2024"},
  "Sleight of Hand": {level:"Cantrip", school:"Transmutation", casting:"Action", range:"Self", components:"S", duration:"Instantaneous", text:"This imported entry appears to be a nonstandard spell label in the project data; verify if it should be replaced by another cantrip.", source:"Project DB"},
  "Spare the Dying": {level:"Cantrip", school:"Necromancy", casting:"Action", range:"15 ft.", components:"V, S", duration:"Instantaneous", text:"A living creature with 0 HP becomes stable.", source:"PHB 2024"},
  "Speak with Animals": {level:"1st", school:"Divination", casting:"Action or Ritual", range:"Self", components:"V, S", duration:"10 minutes", text:"Communicate with Beasts within spell limits.", source:"PHB 2024"},
  "Tasha’s Hideous Laughter": {level:"1st", school:"Enchantment", casting:"Action", range:"30 ft.", components:"V, S, M", duration:"Concentration, up to 1 minute", save:"Wisdom", text:"Target can fall Prone and become Incapacitated on a failed save, with repeat saves as defined.", source:"PHB 2024"},
  "Thaumaturgy": {level:"Cantrip", school:"Transmutation", casting:"Action", range:"30 ft.", components:"V", duration:"Up to 1 minute", text:"Create minor supernatural effects within spell limits.", source:"PHB 2024"},
  "Thorn Whip": {level:"Cantrip", school:"Transmutation", casting:"Action", range:"30 ft.", components:"V, S, M", duration:"Instantaneous", attack:"Melee spell attack", damage:"Piercing", cantripProgression:["Level 1: 1d6","Level 5: 2d6","Level 11: 3d6","Level 17: 4d6"], text:"On hit, target takes Piercing damage and can be pulled closer if Large or smaller.", source:"PHB 2024"},
  "Thunderwave": {level:"1st", school:"Evocation", casting:"Action", range:"Self (15-ft. cube)", components:"V, S", duration:"Instantaneous", save:"Constitution", damage:"2d8 Thunder", scaling:"+1d8 per slot level above 1st.", text:"Creatures in area take Thunder damage and can be pushed away; half damage on successful save.", source:"PHB 2024"},
  "True Strike": {level:"Cantrip", school:"Divination", casting:"Action", range:"Self", components:"S, M", duration:"Instantaneous", attack:"Weapon attack using spellcasting ability", damage:"Weapon damage; later Radiant bonus", cantripProgression:["Level 1: weapon damage","Level 5: +1d6 Radiant","Level 11: +2d6 Radiant","Level 17: +3d6 Radiant"], text:"Make one weapon attack using your spellcasting ability; damage type can become Radiant and scales at higher levels.", source:"PHB 2024"},
  "Unseen Servant": {level:"1st", school:"Conjuration", casting:"Action or Ritual", range:"60 ft.", components:"V, S, M", duration:"1 hour", text:"Create an invisible servant that performs simple tasks within spell limits.", source:"PHB 2024"},
  "Vicious Mockery": {level:"Cantrip", school:"Enchantment", casting:"Action", range:"60 ft.", components:"V", duration:"Instantaneous", save:"Wisdom", damage:"Psychic", cantripProgression:["Level 1: 1d6","Level 5: 2d6","Level 11: 3d6","Level 17: 4d6"], text:"Target takes Psychic damage on a failed save and has Disadvantage on its next attack roll before the end of its next turn.", source:"PHB 2024"},
  "Witch Bolt": {level:"1st", school:"Evocation", casting:"Action", range:"30 ft.", components:"V, S, M", duration:"Concentration, up to 1 minute", attack:"Ranged spell attack", damage:"1d12 Lightning", scaling:"Initial damage increases by slot level.", text:"On hit, deal Lightning damage and can continue dealing damage with actions while maintained.", source:"PHB 2024"}
};


// ---- Consolidated class/subclass spell list metadata and registry helpers ----
// beta 0.1.107 EN-US — offline spell reference class index refresh.
// Purpose: keep the portable planner fully offline while making the Spell Reference tab
// class-based. The same spell ID/name may appear under multiple classes; all entries
// point to the centralized SPELLS_DB tooltip/stat-block data.
(function(){
  if (typeof SPELLS !== 'object') return;
  const clean = s => String(s||'').replace(/\s*\((PHB 2024|Tasha|Xanathar|TCE|XGE)\)\s*$/i,'').trim();
  const add = (key, arr) => {
    if (!SPELLS[key]) SPELLS[key] = [];
    const seen = new Set(SPELLS[key].map(x => clean(x).toLowerCase()));
    (arr||[]).forEach(name => {
      const n = clean(name);
      if (!n) return;
      if (!seen.has(n.toLowerCase())) { SPELLS[key].push(n); seen.add(n.toLowerCase()); }
    });
    SPELLS[key].sort((a,b)=>clean(a).localeCompare(clean(b),'en-US'));
  };

  // Full PHB 2024 Warlock list captured into the offline class index.
  add('warlock_cantrips', ['Blade Ward','Chill Touch','Eldritch Blast','Friends','Mage Hand','Mind Sliver','Minor Illusion','Poison Spray','Prestidigitation','Thunderclap','Toll the Dead','True Strike']);
  add('warlock_1', ['Armor of Agathys','Arms of Hadar','Bane','Charm Person','Comprehend Languages','Detect Magic','Expeditious Retreat','Hellish Rebuke','Hex','Illusory Script','Protection from Evil and Good','Speak with Animals','Tasha\'s Hideous Laughter','Unseen Servant','Witch Bolt']);
  add('warlock_2', ['Cloud of Daggers','Crown of Madness','Darkness','Enthrall','Hold Person','Invisibility','Mind Spike','Mirror Image','Misty Step','Ray of Enfeeblement','Spider Climb','Suggestion']);
  add('warlock_3', ['Counterspell','Dispel Magic','Fear','Fly','Gaseous Form','Hunger of Hadar','Hypnotic Pattern','Magic Circle','Major Image','Remove Curse','Summon Fey','Summon Undead','Tongues','Vampiric Touch']);
  add('warlock_4', ['Banishment','Blight','Charm Monster','Dimension Door','Hallucinatory Terrain','Summon Aberration']);
  add('warlock_5', ['Contact Other Plane','Dream','Hold Monster','Jallarzi\'s Storm of Radiance','Mislead','Planar Binding','Scrying','Synaptic Static','Teleportation Circle']);
  add('warlock_6', ['Arcane Gate','Circle of Death','Create Undead','Eyebite','Summon Fiend','Tasha\'s Bubbling Cauldron','True Seeing']);
  add('warlock_7', ['Etherealness','Finger of Death','Forcecage','Plane Shift']);
  add('warlock_8', ['Befuddlement','Demiplane','Dominate Monster','Glibness','Power Word Stun']);
  add('warlock_9', ['Astral Projection','Foresight','Gate','Imprisonment','Power Word Kill','True Polymorph','Weird']);

  // Full PHB 2024 Paladin list captured into the offline class index.
  add('paladin_1', ['Bless','Command','Compelled Duel','Cure Wounds','Detect Evil and Good','Detect Magic','Detect Poison and Disease','Divine Favor','Divine Smite','Heroism','Protection from Evil and Good','Purify Food and Drink','Searing Smite','Shield of Faith','Thunderous Smite','Wrathful Smite']);
  add('paladin_2', ['Aid','Find Steed','Gentle Repose','Lesser Restoration','Locate Object','Magic Weapon','Prayer of Healing','Protection from Poison','Shining Smite','Warding Bond','Zone of Truth']);
  add('paladin_3', ['Aura of Vitality','Blinding Smite','Create Food and Water','Crusader\'s Mantle','Daylight','Dispel Magic','Elemental Weapon','Magic Circle','Remove Curse','Revivify']);
  add('paladin_4', ['Aura of Life','Aura of Purity','Banishment','Death Ward','Locate Creature','Staggering Smite']);
  add('paladin_5', ['Banishing Smite','Circle of Power','Destructive Wave','Dispel Evil and Good','Geas','Greater Restoration','Raise Dead','Summon Celestial']);

  // Correct common overlap gaps in the existing class arrays so repeated spells appear under every valid class.
  add('bard_2', ['Aid','Animal Messenger','Blindness/Deafness','Calm Emotions','Cloud of Daggers','Crown of Madness','Detect Thoughts','Enhance Ability','Enlarge/Reduce','Enthrall','Heat Metal','Hold Person','Invisibility','Knock','Lesser Restoration','Locate Animals or Plants','Locate Object','Magic Mouth','Mirror Image','Phantasmal Force','See Invisibility','Shatter','Silence','Suggestion','Zone of Truth']);
  add('cleric_2', ['Aid','Augury','Calm Emotions','Continual Flame','Enhance Ability','Find Traps','Gentle Repose','Hold Person','Lesser Restoration','Locate Object','Prayer of Healing','Protection from Poison','Silence','Spiritual Weapon','Warding Bond','Zone of Truth']);
  add('druid_2', ['Aid','Animal Messenger','Augury','Barkskin','Beast Sense','Continual Flame','Enhance Ability','Enlarge/Reduce','Find Traps','Flame Blade','Flaming Sphere','Gust of Wind','Heat Metal','Hold Person','Lesser Restoration','Locate Animals or Plants','Locate Object','Moonbeam','Pass without Trace','Protection from Poison','Spike Growth','Summon Beast']);
  add('ranger_2', ['Aid','Animal Messenger','Barkskin','Beast Sense','Cordon of Arrows','Darkvision','Enhance Ability','Find Traps','Gust of Wind','Lesser Restoration','Locate Animals or Plants','Locate Object','Magic Weapon','Pass without Trace','Protection from Poison','Silence','Spike Growth','Summon Beast']);

  // Lightweight DB backfill for newly indexed spells that previously had no stat block.
  // This avoids empty tooltips in the Spell Reference tab. Detailed text can be expanded during validation.
  window.SPELLS_DB = window.SPELLS_DB || {};
  const levelLabel = n => n === 0 ? 'Cantrip' : (n===1?'1st':n===2?'2nd':n===3?'3rd':`${n}th`);
  const backfill = (name, level, school, extra={}) => {
    if (!window.SPELLS_DB[name]) window.SPELLS_DB[name] = {level:levelLabel(level), school, source:'PHB 2024', text:'Offline spell reference entry. Detailed mechanical text pending table validation.'};
    else Object.assign(window.SPELLS_DB[name], {source: window.SPELLS_DB[name].source || 'PHB 2024'}, extra);
    Object.assign(window.SPELLS_DB[name], extra);
  };
  [
    ['Compelled Duel',1,'Enchantment',{casting:'Bonus Action',range:'30 ft.',duration:'Concentration, up to 1 minute',save:'Wisdom'}],
    ['Divine Favor',1,'Transmutation',{casting:'Bonus Action',range:'Self',duration:'1 minute',damage:'+1d4 Radiant on weapon hits'}],
    ['Searing Smite',1,'Evocation',{casting:'Bonus Action',range:'Self',duration:'1 minute',damage:'Fire'}],
    ['Thunderous Smite',1,'Evocation',{casting:'Bonus Action',range:'Self',duration:'Instantaneous',damage:'Thunder'}],
    ['Wrathful Smite',1,'Necromancy',{casting:'Bonus Action',range:'Self',duration:'1 minute'}],
    ['Find Steed',2,'Conjuration',{casting:'Action',range:'30 ft.',duration:'Instantaneous'}],
    ['Shining Smite',2,'Transmutation',{casting:'Bonus Action',range:'Self',duration:'Concentration, up to 1 minute',damage:'Radiant'}],
    ['Aura of Vitality',3,'Abjuration',{casting:'Action',range:'Self',duration:'Concentration, up to 1 minute'}],
    ['Blinding Smite',3,'Evocation',{casting:'Bonus Action',range:'Self',duration:'1 minute',damage:'Radiant'}],
    ['Crusader\'s Mantle',3,'Transmutation',{casting:'Action',range:'Self',duration:'Concentration, up to 1 minute'}],
    ['Aura of Life',4,'Abjuration',{casting:'Action',range:'Self',duration:'Concentration, up to 10 minutes'}],
    ['Aura of Purity',4,'Abjuration',{casting:'Action',range:'Self',duration:'Concentration, up to 10 minutes'}],
    ['Staggering Smite',4,'Enchantment',{casting:'Bonus Action',range:'Self',duration:'Instantaneous'}],
    ['Banishing Smite',5,'Conjuration',{casting:'Bonus Action',range:'Self',duration:'Concentration, up to 1 minute'}],
    ['Circle of Power',5,'Abjuration',{casting:'Action',range:'Self',duration:'Concentration, up to 10 minutes'}],
    ['Destructive Wave',5,'Evocation',{casting:'Action',range:'Self',duration:'Instantaneous',damage:'Thunder + Radiant or Necrotic'}],
    ['Summon Celestial',5,'Conjuration',{casting:'Action',range:'90 ft.',duration:'Concentration, up to 1 hour'}],
    ['Bane',1,'Enchantment',{casting:'Action',range:'30 ft.',duration:'Concentration, up to 1 minute'}],
    ['Expeditious Retreat',1,'Transmutation',{casting:'Bonus Action',range:'Self',duration:'Concentration, up to 10 minutes'}],
    ['Mind Spike',2,'Divination',{casting:'Action',range:'120 ft.',duration:'Concentration, up to 1 hour',damage:'Psychic'}],
    ['Misty Step',2,'Conjuration',{casting:'Bonus Action',range:'Self',duration:'Instantaneous'}],
    ['Ray of Enfeeblement',2,'Necromancy',{casting:'Action',range:'60 ft.',duration:'Concentration, up to 1 minute'}],
    ['Hunger of Hadar',3,'Conjuration',{casting:'Action',range:'150 ft.',duration:'Concentration, up to 1 minute',damage:'Cold/Acid'}],
    ['Summon Fey',3,'Conjuration',{casting:'Action',range:'90 ft.',duration:'Concentration, up to 1 hour'}],
    ['Summon Undead',3,'Necromancy',{casting:'Action',range:'90 ft.',duration:'Concentration, up to 1 hour'}],
    ['Summon Aberration',4,'Conjuration',{casting:'Action',range:'90 ft.',duration:'Concentration, up to 1 hour'}],
    ['Jallarzi\'s Storm of Radiance',5,'Evocation',{casting:'Action',range:'120 ft.',duration:'Concentration, up to 1 minute',damage:'Radiant/Thunder'}],
    ['Summon Fiend',6,'Conjuration',{casting:'Action',range:'90 ft.',duration:'Concentration, up to 1 hour'}],
    ['Tasha\'s Bubbling Cauldron',6,'Conjuration',{casting:'Action',range:'5 ft.',duration:'10 minutes'}],
    ['Befuddlement',8,'Enchantment',{casting:'Action',range:'150 ft.',duration:'Instantaneous'}]
  ].forEach(x => backfill(x[0],x[1],x[2],x[3]));

  // If a spell was just added to a class list but has no DB entry, create a minimal local entry.
  Object.entries(SPELLS).forEach(([key,list])=>{
    const m = key.match(/_(cantrips|\d)$/); if(!m || !Array.isArray(list)) return;
    const lvl = m[1] === 'cantrips' ? 0 : Number(m[1]);
    list.forEach(raw => {
      const name = clean(raw);
      if (!window.SPELLS_DB[name]) window.SPELLS_DB[name] = {level:levelLabel(lvl), school:'Pending validation', source:'PHB 2024 / Supplements', text:'Offline spell reference entry. Detailed mechanical text pending table validation.'};
    });
  });
})();

// beta 0.1.108 EN-US — consolidated offline spell registry.
// This turns SPELLS_DB into the single spell lookup source for both the planner dropdowns
// and the Spell Reference tab. Class lists are stored as metadata on each spell entry.
(function consolidateSpellDatabase_0_1_108(){
  if (typeof SPELLS !== 'object') return;
  window.SPELLS_DB = window.SPELLS_DB || {};

  const CLASS_LABELS = {
    bard:'Bard', cleric:'Cleric', druid:'Druid', paladin:'Paladin', ranger:'Ranger',
    sorcerer:'Sorcerer', warlock:'Warlock', wizard:'Wizard', artificer:'Artificer'
  };

  function normalizeName(raw){
    return String(raw||'')
      .replace(/[’‘]/g,"'")
      .replace(/\s*\((PHB 2024|Tasha|TCE|Xanathar|XGE)\)\s*$/i,'')
      .replace(/\s+/g,' ')
      .trim();
  }

  function displayName(name){
    // Prefer the already existing database spelling when possible.
    const n = normalizeName(name);
    const existing = Object.keys(window.SPELLS_DB).find(k => normalizeName(k).toLowerCase() === n.toLowerCase());
    return existing || n;
  }

  function sourceFromRaw(raw){
    const s=String(raw||'');
    const m=s.match(/\((PHB 2024|Tasha|TCE|Xanathar|XGE)\)\s*$/i);
    if (!m) return 'PHB 2024';
    const v=m[1].toUpperCase();
    if (v === 'TCE') return 'Tasha';
    if (v === 'XGE') return 'Xanathar';
    return m[1];
  }

  function levelFromKey(kind){
    if (kind === 'cantrips') return 0;
    const n=Number(kind);
    return Number.isFinite(n) ? n : null;
  }

  function levelLabel(n){
    if (n === 0) return 'Cantrip';
    if (n === 1) return '1st';
    if (n === 2) return '2nd';
    if (n === 3) return '3rd';
    return `${n}th`;
  }

  function dbLevelNum(entry){
    const v=entry?.level;
    if (typeof v === 'number') return v;
    const s=String(v||'').toLowerCase();
    if (s.includes('cantrip')) return 0;
    const m=s.match(/\d+/);
    return m ? Number(m[0]) : 99;
  }

  function ensureSpell(raw, levelNum, source){
    const name=displayName(raw);
    if (!name) return null;
    if (!window.SPELLS_DB[name]) {
      window.SPELLS_DB[name] = {
        level: levelLabel(levelNum),
        school: 'Pending validation',
        source: source || 'PHB 2024 / Supplements',
        text: 'Offline spell reference entry. Detailed mechanical text pending table validation.'
      };
    } else if (!window.SPELLS_DB[name].level || String(window.SPELLS_DB[name].level).includes('Pending')) {
      window.SPELLS_DB[name].level = levelLabel(levelNum);
    }
    const entry=window.SPELLS_DB[name];
    entry.id = entry.id || name.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
    entry.sources = Array.isArray(entry.sources) ? entry.sources : [];
    const src = source || sourceFromRaw(raw);
    if (src && !entry.sources.includes(src)) entry.sources.push(src);
    if (!entry.source) entry.source = entry.sources[0] || src || 'PHB 2024 / Supplements';
    entry.classes = entry.classes || {};
    entry.subclasses = entry.subclasses || {};
    entry.validationTags = entry.validationTags || [];
    return entry;
  }

  Object.entries(SPELLS).forEach(([key, list]) => {
    const m=String(key).match(/^(.+?)_(cantrips|\d)$/);
    if (!m || !Array.isArray(list)) return;
    const classId=m[1];
    const spellLevel=levelFromKey(m[2]);
    if (spellLevel === null) return;
    list.forEach(raw => {
      const entry=ensureSpell(raw, spellLevel, sourceFromRaw(raw));
      if (!entry) return;
      const cls=CLASS_LABELS[classId] || classId.replace(/\b\w/g, ch=>ch.toUpperCase());
      entry.classes[cls] = Array.isArray(entry.classes[cls]) ? entry.classes[cls] : [];
      if (!entry.classes[cls].includes(spellLevel)) entry.classes[cls].push(spellLevel);
      entry.validationTags.push(`${cls}:${spellLevel===0?'cantrip':spellLevel}`);
    });
  });

  Object.values(window.SPELLS_DB).forEach(entry => {
    if (entry.classes) Object.keys(entry.classes).forEach(cls => entry.classes[cls].sort((a,b)=>a-b));
    if (entry.validationTags) entry.validationTags = Array.from(new Set(entry.validationTags)).sort();
  });

  function classMaxSpellLevel(classId, characterLevel){
    const lvl=Math.max(1, Number(characterLevel||1));
    if (classId === 'warlock') {
      if (lvl >= 17) return 9; // Mystic Arcanum reference, shown in Spell Reference and validation menus.
      if (lvl >= 15) return 8;
      if (lvl >= 13) return 7;
      if (lvl >= 11) return 6;
      if (lvl >= 9) return 5;
      if (lvl >= 7) return 4;
      if (lvl >= 5) return 3;
      if (lvl >= 3) return 2;
      return 1;
    }
    if (classId === 'paladin' || classId === 'ranger') {
      if (lvl >= 17) return 5;
      if (lvl >= 13) return 4;
      if (lvl >= 9) return 3;
      if (lvl >= 5) return 2;
      return 1;
    }
    if (['bard','cleric','druid','sorcerer','wizard','artificer'].includes(classId)) {
      if (lvl >= 17) return 9;
      if (lvl >= 15) return 8;
      if (lvl >= 13) return 7;
      if (lvl >= 11) return 6;
      if (lvl >= 9) return 5;
      if (lvl >= 7) return 4;
      if (lvl >= 5) return 3;
      if (lvl >= 3) return 2;
      return 1;
    }
    return 0;
  }

  window.SPELL_REGISTRY = {
    classLabels: CLASS_LABELS,
    normalizeName,
    levelNum: dbLevelNum,
    classMaxSpellLevel,
    getSpell(name){
      const n=displayName(name);
      return window.SPELLS_DB[n] || null;
    },
    getClassSpells(classId, characterLevel=20, includeCantrips=true){
      const cls=CLASS_LABELS[classId] || classId.replace(/\b\w/g, ch=>ch.toUpperCase());
      const max=classMaxSpellLevel(classId, characterLevel);
      const out=[];
      const seen=new Set();
      Object.entries(window.SPELLS_DB).forEach(([name, entry]) => {
        const levels=(entry.classes && entry.classes[cls]) || [];
        if (!levels.length) return;
        const lvl=dbLevelNum(entry);
        if (lvl === 0 && !includeCantrips) return;
        if (lvl > 0 && lvl > max) return;
        if (!seen.has(name.toLowerCase())) { out.push(name); seen.add(name.toLowerCase()); }
      });
      return out.sort((a,b)=>{
        const la=dbLevelNum(window.SPELLS_DB[a]);
        const lb=dbLevelNum(window.SPELLS_DB[b]);
        return la-lb || a.localeCompare(b,'en-US');
      });
    }
  };
})();
