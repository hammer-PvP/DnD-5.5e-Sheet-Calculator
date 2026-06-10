// Character Planner D&D 5.5e — portable local base
// Base focused on the 2024 Player’s Handbook. Long rules text is not copied here:
// the planner stores names, choices, and short reminders for book consultation.

const COMMON = {
  skills: ['Acrobatics','Animal Handling','Arcana','Athletics','Deception','Stealth','History','Intimidation','Insight','Investigation','Medicine','Nature','Perception','Persuasion','Sleight of Hand','Religion','Survival','Performance'],
  fightingStyles: ['Archery','Great Weapon Fighting','Two-Weapon Fighting','Defense','Dueling','Interception','Blind Fighting','Protection','Superior Technique','Blessed Warrior','Druidic Warrior'],
  asi: ['+2 to one ability','+1 to two abilities','General Feat','Fighting Style Feat','Epic Boon Feat (level 19)'],
  abilities: ['Strength','Dexterity','Constitution','Intelligence','Wisdom','Charisma'],
  cantripsArcane: ['Friends','True Strike','Acid Splash','Shocking Grasp','Mending','Mind Sliver','Minor Illusion','Light','Mage Hand','Message','Sleight of Hand','Fire Bolt','Eldritch Blast','Chill Touch'],
  cantripsDivine: ['Sacred Flame','Spare the Dying','Light','Guidance','Resistance','Thaumaturgy'],
  cantripsPrimal: ['Shillelagh','Thorn Whip','Mending','Produce Flame','Druidcraft','Guidance','Poison Spray','Resistance'],
  firstSpells: ['Cure Wounds','Healing Word','Detect Magic','Shield','Magic Missile','Sleep','Thunderwave','Bless','Command','Hunter’s Mark','Divine Smite','Armor of Agathys','Charm Person','Disguise Self'],
  maneuvers: ['Menacing Attack','Maneuvering Attack','Precision Attack','Disarming Attack','Goading Attack','Riposte','Trip Attack','Distracting Strike','Rally','Evasive Footwork'],
  metamagic: ['Quickened Spell','Careful Spell','Distant Spell','Twinned Spell','Heightened Spell','Extended Spell','Subtle Spell','Transmuted Spell'],
  invocations: ['Agonizing Blast','Armor of Shadows','Devil’s Sight','Eldritch Mind','Eldritch Spear','Fiendish Vigor','Lessons of the First Ones','Mask of Many Faces','Misty Visions','Pact of the Blade','Pact of the Chain','Pact of the Tome','Repelling Blast','Thirsting Blade'],
};

function F(id, name, type='feature', extra={}) { return Object.assign({id, name, type}, extra); }
function choice(id, name, count, options) { return F(id, name, 'choice', {count, options}); }
function spellChoice(id, name, count, options) { return F(id, name, 'spellChoice', {count, options}); }
function asi(level) { return choice('asi_'+level, 'Ability Score Improvement / Feat', 1, COMMON.asi); }
function subclass(id, label, options) { return choice(id, label, 1, options); }


const SPELLS = {
  bard_cantrips: ['Friends','True Strike','Mending','Minor Illusion','Light','Mage Hand','Message','Sleight of Hand','Vicious Mockery'],
  bard_1: ['Command','Comprehend Languages','Cure Wounds','Detect Magic','Disguise Self','Dissonant Whispers','Speak with Animals','Faerie Fire','Heroism','Identify','Silent Image','Thunderwave','Healing Word','Feather Fall','Tasha’s Hideous Laughter','Sleep'],
  warlock_cantrips: ['Friends','True Strike','Minor Illusion','Mage Hand','Sleight of Hand','Eldritch Blast','Chill Touch'],
  warlock_1: ['Armor of Agathys','Arms of Hadar','Comprehend Languages','Charm Person','Illusory Script','Protection from Evil and Good','Witch Bolt','Hellish Rebuke','Unseen Servant','Hex'],
  cleric_cantrips: ['Sacred Flame','Spare the Dying','Light','Guidance','Resistance','Thaumaturgy'],
  cleric_1: ['Bless','Command','Create or Destroy Water','Cure Wounds','Detect Magic','Detect Evil and Good','Detect Poison and Disease','Shield of Faith','Guidance','Inflict Wounds','Healing Word','Protection from Evil and Good','Purify Food and Drink','Sanctuary'],
  druid_cantrips: ['Shillelagh','Thorn Whip','Mending','Produce Flame','Druidcraft','Guidance','Poison Spray','Resistance'],
  druid_1: ['Animal Friendship','Goodberry','Create or Destroy Water','Cure Wounds','Detect Magic','Entangle','Speak with Animals','Faerie Fire','Fog Cloud','Thunderwave','Healing Word','Longstrider','Purify Food and Drink'],
  sorcerer_cantrips: ['Friends','True Strike','Acid Splash','Shocking Grasp','Mending','Minor Illusion','Light','Mage Hand','Message','Sleight of Hand','Fire Bolt','Chill Touch'],
  sorcerer_1: ['Mage Armor','Comprehend Languages','Detect Magic','Disguise Self','Charm Person','Shield','Magic Missile','Fog Cloud','Thunderwave','Feather Fall','Witch Bolt','Sleep'],
  ranger_1: ['Animal Friendship','Goodberry','Cure Wounds','Detect Magic','Entangle','Speak with Animals','Hunter’s Mark','Fog Cloud','Longstrider','Jump'],
  wizard_cantrips: ['Friends','True Strike','Acid Splash','Shocking Grasp','Mending','Minor Illusion','Light','Mage Hand','Message','Sleight of Hand','Fire Bolt','Chill Touch'],
  wizard_1: ['Alarm','Mage Armor','Comprehend Languages','Detect Magic','Disguise Self','Charm Person','Shield','Illusory Script','Identify','Silent Image','Magic Missile','Fog Cloud','Thunderwave','Feather Fall','Witch Bolt','Tasha’s Hideous Laughter','Unseen Servant','Sleep'],
  paladin_1: ['Bless','Command','Cure Wounds','Detect Magic','Detect Evil and Good','Divine Smite','Shield of Faith','Heroism','Protection from Evil and Good','Purify Food and Drink'],
};

const WARLOCK_INVOCATIONS = [
  'Agonizing Blast — improves Eldritch Blast',
  'Armor of Shadows — Mage Armor at will',
  'Devil’s Sight — see in magical darkness',
  'Eldritch Mind — advantage to maintain concentration',
  'Eldritch Spear — increases Eldritch Blast range',
  'Fiendish Vigor — False Life at will',
  'Lessons of the First Ones — additional Origin feat',
  'Mask of Many Faces — Disguise Self at will',
  'Misty Visions — Silent Image at will',
  'Pact of the Blade — pact weapon',
  'Pact of the Chain — special familiar',
  'Pact of the Tome — Book of Shadows and extra cantrips',
  'Repelling Blast — pushes with Eldritch Blast',
  'Thirsting Blade — extra attack with pact weapon'
];

const PLANNER_DATA = {
  version: 'beta-0.1.103-en-us',
  note: 'v0.5: spell lists separated by class; Warlock Pact Magic and Eldritch Invocations revised.',
  classes: [
    { id:'barbarian', name:'Barbarian', source:'Player’s Handbook 2024', pageRef:'p. 51', levels:{
      1:[F('rage','Rage'), F('unarmored_defense','Unarmored Defense'), choice('skill_prof','Class Skills',2,['Animal Handling','Athletics','Intimidation','Nature','Perception','Survival'])],
      2:[F('danger_sense','Danger Sense'), F('reckless_attack','Reckless Attack')],
      3:[subclass('subclass','Subclass / Primal Path',['Path of the World Tree (PHB 2024)','Path of the Berserker (PHB 2024)','Path of the Wild Heart (PHB 2024)','Path of the Zealot (PHB 2024)','Path of the Beast (Tasha)','Path of Wild Magic (Tasha)','Path of the Ancestral Guardian (Xanathar)','Path of the Storm Herald (Xanathar)']), F('primal_knowledge','Primal Knowledge')],
      4:[asi(4)], 5:[F('extra_attack','Extra Attack'), F('fast_movement','Fast Movement')], 6:[F('subclass_6','Subclass Feature')],
      7:[F('feral_instinct','Feral Instinct'), F('instinctive_pounce','Instinctive Pounce')], 8:[asi(8)], 9:[F('brutal_strike','Brutal Strike')], 10:[F('subclass_10','Subclass Feature')],
      11:[F('relentless_rage','Relentless Rage')], 12:[asi(12)], 13:[F('improved_brutal_strike','Improved Brutal Strike')], 14:[F('subclass_14','Subclass Feature')],
      15:[F('persistent_rage','Persistent Rage')], 16:[asi(16)], 17:[F('improved_brutal_strike_2','Improved Brutal Strike')], 18:[F('indomitable_might','Indomitable Might')],
      19:[asi(19)], 20:[F('primal_champion','Primal Champion')]
    }},

    { id:'bard', name:'Bard', source:'Player’s Handbook 2024', pageRef:'p. 59', levels:{
      1:[F('bardic_inspiration','Bardic Inspiration'), F('spellcasting','Spellcasting'), spellChoice('cantrips','Cantrips Known',2,SPELLS.bard_cantrips), spellChoice('spells_1','Initial Known/Prepared Spells',4,SPELLS.bard_1), choice('skill_prof','Class Skills',3,COMMON.skills)],
      2:[F('expertise','Expertise'), choice('expertise_choice','Expertise Choices',2,COMMON.skills), F('jack_of_all_trades','Jack of All Trades')],
      3:[subclass('subclass','Subclass / Bard College',['College of Valor (PHB 2024)','College of Dance (PHB 2024)','College of Lore (PHB 2024)','College of Glamour (PHB 2024)','College of Creation (Tasha)','College of Eloquence (Tasha)','College of Swords (Xanathar)','College of Whispers (Xanathar)'])],
      4:[asi(4)], 5:[F('font_of_inspiration','Font of Inspiration')], 6:[F('countercharm','Countercharm'), F('subclass_6','Subclass Feature')],
      7:[F('magical_secrets','Magical Secrets')], 8:[asi(8)], 9:[F('expertise_2','Additional Expertise'), choice('expertise_choice_2','Expertise Choices',2,COMMON.skills)],
      10:[F('magical_secrets_2','Additional Magical Secrets')], 11:[F('spellcasting_update_11','Spellcasting Progression')], 12:[asi(12)],
      13:[F('magical_secrets_3','Additional Magical Secrets')], 14:[F('subclass_14','Subclass Feature')], 15:[F('superior_inspiration','Superior Inspiration')],
      16:[asi(16)], 17:[F('magical_secrets_4','Additional Magical Secrets')], 18:[F('epic_boon_ready','Epic Boon Preparation')], 19:[asi(19)], 20:[F('words_of_creation','Words of Creation')]
    }},

    { id:'warlock', name:'Warlock', source:'Player’s Handbook 2024', pageRef:'p. 69', levels:{
      1:[F('pact_magic','Pact Magic'), F('invocations','Eldritch Invocations'), choice('invocation_choices_1','Initial Invocation Choice',1,WARLOCK_INVOCATIONS), spellChoice('cantrips','Cantrips Known',2,SPELLS.warlock_cantrips), spellChoice('spells_1','Initial Pact Spells Known',2,SPELLS.warlock_1), choice('skill_prof','Class Skills',2,['Arcana','Deception','History','Intimidation','Investigation','Nature','Religion'])],
      2:[F('magical_cunning','Magical Cunning'), choice('invocation_choices_2','Additional Invocation Choices',2,WARLOCK_INVOCATIONS)],
      3:[subclass('subclass','Subclass / Otherworldly Patron',['Archfey Patron (PHB 2024)','Celestial Patron (PHB 2024)','Great Old One Patron (PHB 2024)','Fiend Patron (PHB 2024)','The Fathomless Patron (Tasha)','The Genie Patron (Tasha)','The Hexblade Patron (Xanathar)'])],
      4:[asi(4)], 5:[choice('invocation_choices_5','New Eldritch Invocation',1,WARLOCK_INVOCATIONS)], 6:[F('subclass_6','Subclass Feature')],
      7:[choice('invocation_choices_7','New Eldritch Invocation',1,WARLOCK_INVOCATIONS)], 8:[asi(8)], 9:[F('contact_patron','Contact Patron')], 10:[F('subclass_10','Subclass Feature')],
      11:[F('mystic_arcanum_6','Mystic Arcanum — 6th level')], 12:[asi(12), choice('invocation_choices_12','New Eldritch Invocation',1,WARLOCK_INVOCATIONS)],
      13:[F('mystic_arcanum_7','Mystic Arcanum — 7th level')], 14:[F('subclass_14','Subclass Feature')], 15:[F('mystic_arcanum_8','Mystic Arcanum — 8th level')],
      16:[asi(16)], 17:[F('mystic_arcanum_9','Mystic Arcanum — 9th level')], 18:[choice('invocation_choices_18','New Eldritch Invocation',1,WARLOCK_INVOCATIONS)], 19:[asi(19)], 20:[F('eldritch_master','Eldritch Master')]
    }},

    { id:'cleric', name:'Cleric', source:'Player’s Handbook 2024', pageRef:'p. 81', levels:{
      1:[F('spellcasting','Spellcasting'), choice('divine_order','Divine Order',1,['Protector','Thaumaturge']), spellChoice('cantrips','Cleric Cantrips',3,SPELLS.cleric_cantrips), spellChoice('spells_1','Prepared Cleric Spells — 1st level',2,SPELLS.cleric_1), choice('skill_prof','Class Skills',2,['History','Insight','Medicine','Persuasion','Religion'])],
      2:[F('channel_divinity','Channel Divinity')],
      3:[subclass('subclass','Subclass / Divine Domain',['War Domain (PHB 2024)','Light Domain (PHB 2024)','Trickery Domain (PHB 2024)','Life Domain (PHB 2024)','Order Domain (Tasha)','Peace Domain (Tasha)','Twilight Domain (Tasha)','Forge Domain (Xanathar)','Grave Domain (Xanathar)'])],
      4:[asi(4)], 5:[F('smiting_undead','Smiting Undead')], 6:[F('subclass_6','Subclass Feature')], 7:[F('blessed_strikes','Blessed Strikes')], 8:[asi(8)],
      9:[F('divine_intervention','Divine Intervention')], 10:[F('subclass_10','Subclass Feature')], 11:[F('smiting_undead_improved','Improved Smiting Undead')], 12:[asi(12)],
      13:[F('divine_intervention_improved','Improved Divine Intervention')], 14:[F('subclass_14','Subclass Feature')], 15:[F('greater_blessed_strikes','Greater Blessed Strikes')],
      16:[asi(16)], 17:[F('supreme_healing_or_domain','Elevated Domain Power')], 18:[F('greater_divine_intervention','Greater Divine Intervention')], 19:[asi(19)], 20:[F('greater_divine_intervention_capstone','Supreme Divine Intervention')]
    }},

    { id:'druid', name:'Druid', source:'Player’s Handbook 2024', pageRef:'p. 91', levels:{
      1:[F('spellcasting','Spellcasting'), F('druidic','Druidic'), spellChoice('cantrips','Druid Cantrips',2,SPELLS.druid_cantrips), spellChoice('spells_1','Prepared Druid Spells — 1st level',2,SPELLS.druid_1), choice('skill_prof','Class Skills',2,['Animal Handling','Arcana','Insight','Medicine','Nature','Perception','Religion','Survival'])],
      2:[F('wild_shape','Wild Shape'), choice('primal_order','Primal Order',1,['Ranger','Wizard'])],
      3:[subclass('subclass','Subclass / Druid Circle',['Circle of the Moon (PHB 2024)','Circle of the Land (PHB 2024)','Circle of Stars (PHB 2024)','Circle of the Sea (PHB 2024)','Circle of Spores (Tasha)','Circle of Wildfire (Tasha)','Circle of Dreams (Xanathar)','Circle of the Shepherd (Xanathar)'])],
      4:[asi(4)], 5:[F('wild_resurgence','Wild Resurgence')], 6:[F('subclass_6','Subclass Feature')], 7:[F('elemental_fury','Elemental Fury')], 8:[asi(8)],
      9:[F('improved_wild_shape','Improved Wild Shape')], 10:[F('subclass_10','Subclass Feature')], 11:[F('greater_elemental_fury','Greater Elemental Fury')], 12:[asi(12)],
      13:[F('commune_with_nature','Commune with Nature')], 14:[F('subclass_14','Subclass Feature')], 15:[F('improved_elemental_fury','Improved Elemental Fury')],
      16:[asi(16)], 17:[F('beast_spells','Wild Shape Spells')], 18:[F('archdruid','Archdruid')], 19:[asi(19)], 20:[F('epic_boon_druid','Epic Boon / Supreme Archdruid')]
    }},

    { id:'sorcerer', name:'Sorcerer', source:'Player’s Handbook 2024', pageRef:'p. 103', levels:{
      1:[F('spellcasting','Spellcasting'), F('innate_sorcery','Innate Sorcery'), spellChoice('cantrips','Sorcerer Cantrips',4,SPELLS.sorcerer_cantrips), spellChoice('spells_1','Initial Known Spells',2,SPELLS.sorcerer_1), choice('skill_prof','Class Skills',2,['Arcana','Deception','Insight','Intimidation','Persuasion','Religion'])],
      2:[F('font_of_magic','Font of Magic'), F('metamagic','Metamagic'), choice('metamagic_choices','Metamagic Choices',2,COMMON.metamagic)],
      3:[subclass('subclass','Subclass / Sorcerous Origin',['Aberrant Sorcery (PHB 2024)','Draconic Sorcery (PHB 2024)','Clockwork Sorcery (PHB 2024)','Wild Magic Sorcery (PHB 2024)','Divine Soul (Xanathar)','Shadow Magic (Xanathar)','Storm Sorcery (Xanathar)'])],
      4:[asi(4)], 5:[F('sorcerous_restoration','Sorcerous Restoration')], 6:[F('subclass_6','Subclass Feature')], 7:[choice('metamagic_choices_7','New Metamagic',1,COMMON.metamagic)],
      8:[asi(8)], 9:[F('sorcery_incarnate','Sorcery Incarnate')], 10:[F('subclass_10','Subclass Feature')], 11:[choice('metamagic_choices_11','New Metamagic',1,COMMON.metamagic)],
      12:[asi(12)], 13:[F('arcane_apotheosis','Arcane Apotheosis')], 14:[F('subclass_14','Subclass Feature')], 15:[F('sorcerous_restoration_improved','Improved Sorcerous Restoration')],
      16:[asi(16)], 17:[choice('metamagic_choices_17','New Metamagic',1,COMMON.metamagic)], 18:[F('arcane_apotheosis_improved','Improved Arcane Apotheosis')], 19:[asi(19)], 20:[F('epic_boon_sorcerer','Epic Boon / Supreme Sorcery')]
    }},

    { id:'ranger', name:'Ranger', source:'Player’s Handbook 2024', pageRef:'p. 117', levels:{
      1:[F('spellcasting','Spellcasting'), F('favored_enemy','Favored Enemy'), F('weapon_mastery','Weapon Mastery'), spellChoice('spells_1','Prepared Ranger Spells — 1st level',2,SPELLS.ranger_1), choice('skill_prof','Class Skills',3,['Animal Handling','Athletics','Stealth','Insight','Investigation','Nature','Perception','Survival'])],
      2:[choice('fighting_style','Fighting Style',1,COMMON.fightingStyles), F('deft_explorer','Deft Explorer')],
      3:[subclass('subclass','Subclass / Ranger Archetype',['Fey Wanderer (PHB 2024)','Hunter (PHB 2024)','Beast Master (PHB 2024)','Gloom Stalker (PHB 2024)','Swarmkeeper (Tasha)','Horizon Walker (Xanathar)','Monster Slayer (Xanathar)'])],
      4:[asi(4)], 5:[F('extra_attack','Extra Attack')], 6:[F('roving','Roving')], 7:[F('subclass_7','Subclass Feature')], 8:[asi(8)],
      9:[F('expertise','Expertise'), choice('expertise_choice','Expertise Choices',2,COMMON.skills)], 10:[F('tireless','Tireless')], 11:[F('subclass_11','Subclass Feature')],
      12:[asi(12)], 13:[F('relentless_hunter','Relentless Hunter')], 14:[F('nature_veil','Nature’s Veil')], 15:[F('subclass_15','Subclass Feature')],
      16:[asi(16)], 17:[F('precise_hunter','Precise Hunter')], 18:[F('feral_senses','Feral Senses')], 19:[asi(19)], 20:[F('foe_slayer','Foe Slayer')]
    }},

    { id:'fighter', name:'Fighter', source:'Player’s Handbook 2024', pageRef:'p. 127', levels:{
      1:[choice('fighting_style','Fighting Style',1,COMMON.fightingStyles), F('second_wind','Second Wind'), F('weapon_mastery','Weapon Mastery'), choice('skill_prof','Class Skills',2,['Acrobatics','Animal Handling','Athletics','History','Intimidation','Insight','Perception','Survival'])],
      2:[F('action_surge','Action Surge'), F('tactical_mind','Tactical Mind')],
      3:[subclass('subclass','Subclass / Martial Archetype',['Champion (PHB 2024)','Eldritch Knight (PHB 2024)','Psi Warrior (PHB 2024)','Battle Master (PHB 2024)','Rune Knight (Tasha)','Arcane Archer (Xanathar)','Cavalier (Xanathar)','Samurai (Xanathar)'])],
      4:[asi(4)], 5:[F('extra_attack','Extra Attack'), F('tactical_shift','Tactical Shift')], 6:[asi(6)], 7:[F('subclass_7','Subclass Feature')], 8:[asi(8)],
      9:[F('indomitable','Indomitable'), F('tactical_master','Tactical Master')], 10:[F('subclass_10','Subclass Feature')], 11:[F('two_extra_attacks','Two Extra Attacks')], 12:[asi(12)],
      13:[F('studied_attacks','Studied Attacks')], 14:[asi(14)], 15:[F('subclass_15','Subclass Feature')], 16:[asi(16)],
      17:[F('action_surge_2','Improved Action Surge'), F('indomitable_2','Improved Indomitable')], 18:[F('subclass_18','Subclass Feature')], 19:[asi(19)], 20:[F('three_extra_attacks','Three Extra Attacks')]
    }},

    { id:'rogue', name:'Rogue', source:'Player’s Handbook 2024', pageRef:'p. 137', levels:{
      1:[F('sneak_attack','Sneak Attack'), F('expertise','Expertise'), choice('expertise_choice','Expertise Choices',2,COMMON.skills), F('thieves_cant','Thieves’ Cant'), F('weapon_mastery','Weapon Mastery'), choice('skill_prof','Class Skills',4,['Acrobatics','Athletics','Deception','Stealth','Intimidation','Insight','Investigation','Perception','Persuasion','Sleight of Hand'])],
      2:[F('cunning_action','Cunning Action')],
      3:[subclass('subclass','Subclass / Rogue Archetype',['Soulknife (PHB 2024)','Assassin (PHB 2024)','Thief (PHB 2024)','Arcane Trickster (PHB 2024)','Phantom (Tasha)','Soulknife (Tasha)','Inquisitive (Xanathar)','Mastermind (Xanathar)','Scout (Xanathar)','Swashbuckler (Xanathar)']), F('steady_aim','Steady Aim')],
      4:[asi(4)], 5:[F('cunning_strike','Cunning Strike'), F('uncanny_dodge','Uncanny Dodge')], 6:[F('expertise_2','Additional Expertise'), choice('expertise_choice_2','Expertise Choices',2,COMMON.skills)],
      7:[F('evasion','Evasion'), F('reliable_talent','Reliable Talent')], 8:[asi(8)], 9:[F('subclass_9','Subclass Feature')], 10:[asi(10)],
      11:[F('improved_cunning_strike','Improved Cunning Strike')], 12:[asi(12)], 13:[F('subclass_13','Subclass Feature')], 14:[F('devious_strikes','Devious Strikes')],
      15:[F('slippery_mind','Slippery Mind')], 16:[asi(16)], 17:[F('subclass_17','Subclass Feature')], 18:[F('elusive','Elusive')], 19:[asi(19)], 20:[F('stroke_of_luck','Stroke of Luck')]
    }},

    { id:'wizard', name:'Wizard', source:'Player’s Handbook 2024', pageRef:'p. 147', levels:{
      1:[F('spellcasting','Spellcasting'), F('arcane_recovery','Arcane Recovery'), spellChoice('cantrips','Wizard Cantrips',3,SPELLS.wizard_cantrips), spellChoice('spells_1','Initial Spellbook Spells',6,SPELLS.wizard_1), choice('skill_prof','Class Skills',2,['Arcana','History','Investigation','Medicine','Nature','Religion'])],
      2:[F('scholar','Scholar')],
      3:[subclass('subclass','Subclass / Arcane Tradition',['Abjurer (PHB 2024)','Diviner (PHB 2024)','Evoker (PHB 2024)','Illusionist (PHB 2024)','Bladesinger (Tasha)','Order of Scribes (Tasha)','War Magic (Xanathar)'])],
      4:[asi(4)], 5:[F('memorize_spell','Memorize Spell')], 6:[F('subclass_6','Subclass Feature')], 7:[F('modify_spell','Modify Spell')], 8:[asi(8)],
      9:[F('create_spell','Create Spell')], 10:[F('subclass_10','Subclass Feature')], 11:[F('spell_mastery_ready','Higher-Level Spell Progression')], 12:[asi(12)],
      13:[F('spell_mastery_ready_2','Higher-Level Spell Progression')], 14:[F('subclass_14','Subclass Feature')], 15:[F('spell_mastery','Spell Mastery')],
      16:[asi(16)], 17:[F('signature_spells_ready','Higher-Level Spell Progression')], 18:[F('signature_spells','Signature Spells')], 19:[asi(19)], 20:[F('epic_boon_wizard','Epic Boon / Archmage')]
    }},

    { id:'monk', name:'Monk', source:'Player’s Handbook 2024', pageRef:'p. 159', levels:{
      1:[F('martial_arts','Martial Arts'), F('unarmored_defense','Unarmored Defense'), choice('skill_prof','Class Skills',2,['Acrobatics','Athletics','Stealth','History','Insight','Religion'])],
      2:[F('monks_focus','Monk’s Focus'), F('unarmored_movement','Unarmored Movement'), F('uncanny_metabolism','Uncanny Metabolism')],
      3:[subclass('subclass','Subclass / Monastic Tradition',['Warrior of the Open Hand (PHB 2024)','Warrior of Mercy (PHB 2024)','Warrior of Shadow (PHB 2024)','Warrior of the Elements (PHB 2024)','Way of the Astral Self (Tasha)','Way of the Drunken Master (Xanathar)','Way of the Kensei (Xanathar)','Way of the Sun Soul (Xanathar)']), F('deflect_attacks','Deflect Attacks')],
      4:[asi(4), F('slow_fall','Slow Fall')], 5:[F('extra_attack','Extra Attack'), F('stunning_strike','Stunning Strike')], 6:[F('empowered_strikes','Empowered Strikes'), F('subclass_6','Subclass Feature')],
      7:[F('evasion','Evasion'), F('stillness_of_mind','Stillness of Mind')], 8:[asi(8)], 9:[F('acrobatic_movement','Acrobatic Movement')], 10:[F('heightened_focus','Heightened Focus'), F('self_restoration','Self-Restoration')],
      11:[F('subclass_11','Subclass Feature')], 12:[asi(12)], 13:[F('deflect_energy','Deflect Energy')], 14:[F('disciplined_survivor','Disciplined Survivor')],
      15:[F('perfect_focus','Perfect Focus')], 16:[asi(16)], 17:[F('subclass_17','Subclass Feature')], 18:[F('superior_defense','Superior Defense')], 19:[asi(19)], 20:[F('body_and_mind','Body and Mind')]
    }},

    { id:'paladin', name:'Paladin', source:'Player’s Handbook 2024', pageRef:'p. 167', levels:{
      1:[F('spellcasting','Spellcasting'), F('weapon_mastery','Weapon Mastery'), F('lay_on_hands','Lay on Hands'), spellChoice('spells_1','Initial Prepared Spells',2,SPELLS.paladin_1), choice('skill_prof','Class Skills',2,['Athletics','Insight','Intimidation','Medicine','Persuasion','Religion'])],
      2:[F('paladins_smite','Paladin’s Smite'), choice('fighting_style','Fighting Style',1,COMMON.fightingStyles)],
      3:[F('channel_divinity','Channel Divinity'), subclass('subclass','Subclass / Sacred Oath',['Oath of Devotion (PHB 2024)','Oath of Glory (PHB 2024)','Oath of Vengeance (PHB 2024)','Oath of the Ancients (PHB 2024)','Oath of the Watchers (Tasha)','Oath of Conquest (Xanathar)','Oath of Redemption (Xanathar)'])],
      4:[asi(4)], 5:[F('extra_attack','Extra Attack'), F('faithful_steed','Faithful Steed')], 6:[F('aura_of_protection','Aura of Protection')], 7:[F('subclass_7','Subclass Feature')], 8:[asi(8)],
      9:[F('abjure_foes','Abjure Foes')], 10:[F('aura_of_courage','Aura of Courage')], 11:[F('radiant_strikes','Radiant Strikes')], 12:[asi(12)],
      13:[F('restoring_touch','Restoring Touch')], 14:[F('subclass_14','Subclass Feature')], 15:[F('improved_channel_divinity','Improved Channel Divinity')],
      16:[asi(16)], 17:[F('aura_expansion','Aura Expansion')], 18:[F('subclass_18','Subclass Feature')], 19:[asi(19)], 20:[F('epic_boon_paladin','Epic Boon / Holy Champion')]
    }}
  ]
};

// Player’s Handbook 2024 backgrounds — apply ability bonuses at level 1.
PLANNER_DATA.backgrounds = [
  {id:'acolyte',name:'Acolyte',attrs:['Intelligence','Wisdom','Charisma'],feat:'Magic Initiate (Cleric)',skills:['Insight','Religion'],tool:'Calligrapher’s Supplies'},
  {id:'wayfarer',name:'Wayfarer',attrs:['Dexterity','Wisdom','Charisma'],feat:'Lucky',skills:['Stealth','Insight'],tool:'Thieves’ Tools'},
  {id:'crafter_bg',name:'Crafter',attrs:['Strength','Dexterity','Intelligence'],feat:'Crafter',skills:['Investigation','Persuasion'],tool:'Artisan’s Tools'},
  {id:'entertainer',name:'Entertainer',attrs:['Strength','Dexterity','Charisma'],feat:'Musician',skills:['Acrobatics','Performance'],tool:'Musical Instrument'},
  {id:'charlatan',name:'Charlatan',attrs:['Dexterity','Constitution','Charisma'],feat:'Skilled',skills:['Deception','Sleight of Hand'],tool:'Disguise Kit'},
  {id:'criminal',name:'Criminal',attrs:['Dexterity','Constitution','Intelligence'],feat:'Alert',skills:['Stealth','Sleight of Hand'],tool:'Thieves’ Tools'},
  {id:'hermit',name:'Hermit',attrs:['Constitution','Wisdom','Charisma'],feat:'Healer',skills:['Medicine','Religion'],tool:'Herbalism Kit'},
  {id:'scribe',name:'Scribe',attrs:['Dexterity','Intelligence','Wisdom'],feat:'Skilled',skills:['Investigation','Perception'],tool:'Calligrapher’s Supplies'},
  {id:'farmer',name:'Farmer',attrs:['Strength','Constitution','Wisdom'],feat:'Tough',skills:['Animal Handling','Nature'],tool:'Carpenter’s Tools'},
  {id:'guard',name:'Guard',attrs:['Strength','Intelligence','Wisdom'],feat:'Alert',skills:['Athletics','Perception'],tool:'Gaming Set'},
  {id:'guide',name:'Guidance',attrs:['Dexterity','Constitution','Wisdom'],feat:'Magic Initiate (Druid)',skills:['Stealth','Survival'],tool:'Cartographer’s Tools'},
  {id:'sailor',name:'Sailor',attrs:['Strength','Dexterity','Wisdom'],feat:'Tavern Brawler',skills:['Acrobatics','Perception'],tool:'Navigator’s Tools'},
  {id:'merchant',name:'Merchant',attrs:['Constitution','Intelligence','Charisma'],feat:'Lucky',skills:['Animal Handling','Persuasion'],tool:'Navigator’s Tools'},
  {id:'noble',name:'Noble',attrs:['Strength','Intelligence','Charisma'],feat:'Skilled',skills:['History','Persuasion'],tool:'Gaming Set'},
  {id:'sage',name:'Sage',attrs:['Constitution','Intelligence','Wisdom'],feat:'Magic Initiate (Wizard)',skills:['Arcana','History'],tool:'Calligrapher’s Supplies'},
  {id:'soldier',name:'Soldier',attrs:['Strength','Dexterity','Constitution'],feat:'Savage Attacker',skills:['Athletics','Intimidation'],tool:'Gaming Set'}
];

// Organized feat table by minimum level. Feats with bonus:1 display an ability menu and add it automatically to the header.
PLANNER_DATA.feats = [
  {id:'alert',name:'Alert',level:1},{id:'crafter',name:'Crafter',level:1},{id:'savage_attacker',name:'Savage Attacker',level:1},{id:'healer',name:'Healer',level:1},{id:'skilled',name:'Skilled',level:1},{id:'magic_initiate_cleric',name:'Magic Initiate (Cleric)',level:1},{id:'magic_initiate_druid',name:'Magic Initiate (Druid)',level:1},{id:'magic_initiate_wizard',name:'Magic Initiate (Wizard)',level:1},{id:'musician',name:'Musician',level:1},{id:'lucky',name:'Lucky',level:1},{id:'tavern_brawler',name:'Tavern Brawler',level:1},{id:'tough',name:'Tough',level:1},
  {id:'actor',name:'Actor',level:4,bonus:1,abilities:['Charisma']},{id:'athlete',name:'Athlete',level:4,bonus:1,abilities:['Strength','Dexterity']},{id:'charger',name:'Charger',level:4,bonus:1,abilities:['Strength','Dexterity']},{id:'chef',name:'Chef',level:4,bonus:1,abilities:['Constitution','Wisdom']},{id:'crossbow_expert',name:'Crossbow Expert',level:4,bonus:1,abilities:['Dexterity']},{id:'defensive_duelist',name:'Defensive Duelist',level:4,bonus:1,abilities:['Dexterity']},{id:'dual_wielder',name:'Dual Wielder',level:4,bonus:1,abilities:['Strength','Dexterity']},{id:'durable',name:'Durable',level:4,bonus:1,abilities:['Constitution']},{id:'elemental_adept',name:'Elemental Adept',level:4,bonus:1,abilities:['Intelligence','Wisdom','Charisma']},{id:'fey_touched',name:'Fey-Touched',level:4,bonus:1,abilities:['Intelligence','Wisdom','Charisma']},{id:'grappler',name:'Grappler',level:4,bonus:1,abilities:['Strength','Dexterity']},{id:'great_weapon_master',name:'Great Weapon Master',level:4,bonus:1,abilities:['Strength']},{id:'heavily_armored',name:'Heavily Armored',level:4,bonus:1,abilities:['Strength','Constitution']},{id:'heavy_armor_master',name:'Heavy Armor Master',level:4,bonus:1,abilities:['Strength','Constitution']},{id:'inspiring_leader',name:'Inspiring Leader',level:4,bonus:1,abilities:['Wisdom','Charisma']},{id:'keen_mind',name:'Keen Mind',level:4,bonus:1,abilities:['Intelligence']},{id:'lightly_armored',name:'Lightly Armored',level:4,bonus:1,abilities:['Strength','Dexterity']},{id:'mage_slayer',name:'Mage Slayer',level:4,bonus:1,abilities:['Strength','Dexterity']},{id:'martial_weapon_training',name:'Martial Weapon Training',level:4,bonus:1,abilities:['Strength','Dexterity']},{id:'medium_armor_master',name:'Medium Armor Master',level:4,bonus:1,abilities:['Strength','Dexterity']},{id:'mounted_combatant',name:'Mounted Combatant',level:4,bonus:1,abilities:['Strength','Dexterity','Wisdom']},{id:'observant',name:'Observant',level:4,bonus:1,abilities:['Intelligence','Wisdom']},{id:'piercer',name:'Piercer',level:4,bonus:1,abilities:['Strength','Dexterity']},{id:'poisoner',name:'Poisoner',level:4,bonus:1,abilities:['Dexterity','Intelligence']},{id:'polearm_master',name:'Polearm Master',level:4,bonus:1,abilities:['Strength','Dexterity']},{id:'resilient',name:'Resilient',level:4,bonus:1,abilities:['Strength','Dexterity','Constitution','Intelligence','Wisdom','Charisma']},{id:'ritual_caster',name:'Ritual Caster',level:4,bonus:1,abilities:['Intelligence','Wisdom','Charisma']},{id:'sentinel',name:'Sentinel',level:4,bonus:1,abilities:['Strength','Dexterity']},{id:'shadow_touched',name:'Shadow-Touched',level:4,bonus:1,abilities:['Intelligence','Wisdom','Charisma']},{id:'sharpshooter',name:'Sharpshooter',level:4,bonus:1,abilities:['Dexterity']},{id:'shield_master',name:'Shield Master',level:4,bonus:1,abilities:['Strength']},{id:'skill_expert',name:'Skill Expert',level:4,bonus:1,abilities:['Strength','Dexterity','Constitution','Intelligence','Wisdom','Charisma']},{id:'skulker',name:'Skulker',level:4,bonus:1,abilities:['Dexterity']},{id:'slasher',name:'Slasher',level:4,bonus:1,abilities:['Strength','Dexterity']},{id:'speedy',name:'Speedy',level:4,bonus:1,abilities:['Dexterity','Constitution']},{id:'spell_sniper',name:'Spell Sniper',level:4,bonus:1,abilities:['Intelligence','Wisdom','Charisma']},{id:'telekinetic',name:'Telekinetic',level:4,bonus:1,abilities:['Intelligence','Wisdom','Charisma']},{id:'telepathic',name:'Telepathic',level:4,bonus:1,abilities:['Intelligence','Wisdom','Charisma']},{id:'war_caster',name:'War Caster',level:4,bonus:1,abilities:['Intelligence','Wisdom','Charisma']},{id:'weapon_master',name:'Weapon Master',level:4,bonus:1,abilities:['Strength','Dexterity']},
  {id:'crusher_tasha',name:'Crusher (Tasha)',level:4,bonus:1,abilities:['Strength','Constitution'],source:'Tasha'},
  {id:'artificer_initiate_tasha',name:'Artificer Initiate (Tasha)',level:4,bonus:1,abilities:['Intelligence'],source:'Tasha',note:'*Homebrew: This Tasha feat does not originally grant an Ability Score Increase. The planner adds +1 Intelligence by Artificer/magical crafting context.'},
  {id:'eldritch_adept_tasha',name:'Eldritch Adept (Tasha)',level:4,bonus:1,abilities:['Charisma'],source:'Tasha',note:'*Homebrew: This Tasha feat does not originally grant an Ability Score Increase. The planner adds +1 Charisma by Warlock/Eldritch Invocation context.'},
  {id:'fighting_initiate_tasha',name:'Fighting Initiate (Tasha)',level:4,bonus:1,abilities:['Strength','Dexterity','Constitution'],source:'Tasha',note:'*Homebrew: This Tasha feat does not originally grant an Ability Score Increase. The planner adds +1 Strength, Dexterity, or Constitution by martial context.'},
  {id:'gunner_tasha',name:'Gunner (Tasha)',level:4,bonus:1,abilities:['Dexterity'],source:'Tasha'},
  {id:'metamagic_adept_tasha',name:'Metamagic Adept (Tasha)',level:4,bonus:1,abilities:['Charisma'],source:'Tasha',note:'*Homebrew: This Tasha feat does not originally grant an Ability Score Increase. The planner adds +1 Charisma by Sorcerer/Metamagic context.'},
  {id:'bountiful_luck_xanathar',name:'Bountiful Luck (Xanathar)',level:4,bonus:1,abilities:['Charisma'],source:'Xanathar',note:'*Homebrew: This Xanathar feat does not originally grant an Ability Score Increase. The planner adds +1 Charisma by luck/supportive presence context.'},
  {id:'dragon_fear_xanathar',name:'Dragon Fear (Xanathar)',level:4,bonus:1,abilities:['Strength','Constitution','Charisma'],source:'Xanathar'},
  {id:'dragon_hide_xanathar',name:'Dragon Hide (Xanathar)',level:4,bonus:1,abilities:['Strength','Constitution','Charisma'],source:'Xanathar'},
  {id:'drow_high_magic_xanathar',name:'Drow High Magic (Xanathar)',level:4,bonus:1,abilities:['Charisma'],source:'Xanathar',note:'*Homebrew: This Xanathar feat does not originally grant an Ability Score Increase. The planner adds +1 Charisma by Drow innate magic context.'},
  {id:'dwarven_fortitude_xanathar',name:'Dwarven Fortitude (Xanathar)',level:4,bonus:1,abilities:['Constitution'],source:'Xanathar'},
  {id:'elven_accuracy_xanathar',name:'Elven Accuracy (Xanathar)',level:4,bonus:1,abilities:['Dexterity','Intelligence','Wisdom','Charisma'],source:'Xanathar'},
  {id:'fade_away_xanathar',name:'Fade Away (Xanathar)',level:4,bonus:1,abilities:['Dexterity','Intelligence'],source:'Xanathar'},
  {id:'fey_teleportation_xanathar',name:'Fey Teleportation (Xanathar)',level:4,bonus:1,abilities:['Intelligence','Charisma'],source:'Xanathar'},
  {id:'flames_of_phlegethos_xanathar',name:'Flames of Phlegethos (Xanathar)',level:4,bonus:1,abilities:['Intelligence','Charisma'],source:'Xanathar'},
  {id:'infernal_constitution_xanathar',name:'Infernal Constitution (Xanathar)',level:4,bonus:1,abilities:['Constitution'],source:'Xanathar'},
  {id:'orcish_fury_xanathar',name:'Orcish Fury (Xanathar)',level:4,bonus:1,abilities:['Strength','Constitution'],source:'Xanathar'},
  {id:'prodigy_xanathar',name:'Prodigy (Xanathar)',level:4,bonus:1,abilities:['Strength','Dexterity','Constitution','Intelligence','Wisdom','Charisma'],source:'Xanathar',note:'*Homebrew: This Xanathar feat does not originally grant an Ability Score Increase. The planner adds +1 to any ability by broad skill/prodigy context.'},
  {id:'second_chance_xanathar',name:'Second Chance (Xanathar)',level:4,bonus:1,abilities:['Dexterity','Constitution','Charisma'],source:'Xanathar'},
  {id:'squat_nimbleness_xanathar',name:'Squat Nimbleness (Xanathar)',level:4,bonus:1,abilities:['Strength','Dexterity'],source:'Xanathar'},
  {id:'svirfneblin_magic_xanathar',name:'Svirfneblin Magic (Xanathar)',level:4,bonus:1,abilities:['Intelligence'],source:'Xanathar',note:'*Homebrew: This Xanathar feat does not originally grant an Ability Score Increase. The planner adds +1 Intelligence by deep gnome illusion/abjuration magic context.'},
  {id:'wood_elf_magic_xanathar',name:'Wood Elf Magic (Xanathar)',level:4,bonus:1,abilities:['Wisdom'],source:'Xanathar',note:'*Homebrew: This Xanathar feat does not originally grant an Ability Score Increase. The planner adds +1 Wisdom by Druid/nature magic context.'},
  {id:'epic_boon_combat_prowess',name:'Epic Boon of Combat Prowess',level:19,bonus:1,abilities:['Strength','Dexterity']},{id:'epic_boon_high_magic',name:'Epic Boon of High Magic',level:19,bonus:1,abilities:['Intelligence','Wisdom','Charisma']},{id:'epic_boon_recovery',name:'Epic Boon of Recovery',level:19,bonus:1,abilities:['Constitution']},{id:'epic_boon_speed',name:'Epic Boon of Speed',level:19,bonus:1,abilities:['Dexterity']},{id:'epic_boon_fate',name:'Epic Boon of Fate',level:19,bonus:1,abilities:['Strength','Dexterity','Constitution','Intelligence','Wisdom','Charisma']}
];


// v0.6 — PHB 2024/5.5e species and short feature descriptions.
PLANNER_DATA.version = 'beta-0.1.103-en-us';
PLANNER_DATA.note = 'beta 0.1.103 EN-US: broader spell hover coverage across class spell lists, cantrip progression dice, spell stat-block framework, Thirsting Blade level gate, and Battle Master maneuver selectors.';
PLANNER_DATA.species = [
  {id:'aasimar', name:'Aasimar', size:'Small or Medium', speed:'30 ft.', summary:'Celestial resistances, healing, and a level 3 transformation.', levels:{
    1:[F('celestial_resistance','Celestial Resistance','species',{desc:'Resistance to Necrotic and Radiant damage.'}),F('darkvision','Darkvision','species',{desc:'You can see in darkness within the range specified by your species.'}),F('healing_hands','Healing Hands','species',{desc:'Heals a creature you touch; uses return on a Long Rest.'}),F('light_bearer','Light Bearer','species',{desc:'You know the Light cantrip.'})],
    3:[choice('celestial_revelation','Celestial Revelation',1,['Celestial Wings','Necrotic Shroud','Radiant Transformation'])]
  }},
  {id:'dwarf', name:'Dwarf', size:'Medium', speed:'30 ft.', summary:'Tough, poison resistant, and tied to stone.', levels:{
    1:[F('darkvision_36','Superior Darkvision','species',{desc:'Extended-range Darkvision.'}),F('dwarven_toughness','Dwarven Toughness','species',{desc:'Increases maximum Hit Points as you gain levels.'}),F('poison_resilience','Poison Resilience','species',{desc:'Resistance to Poison damage and advantage against the Poisoned condition.'}),F('stonecunning','Stonecunning','species',{desc:'Allows you to perceive vibrations through stone for a limited time.'})]
  }},
  {id:'dragonborn', name:'Dragonborn', size:'Medium', speed:'30 ft.', summary:'Draconic ancestry, breath weapon, elemental resistance, and flight at level 5.', levels:{
    1:[choice('draconic_ancestry','Draconic Ancestry',1,['Blue — Lightning','Black — Acid','White — Cold','Gold — Fire','Bronze — Lightning','Silver — Cold','Copper — Acid','Green — Poison','Brass — Fire','Red — Fire']),F('breath_weapon','Breath Weapon','species',{desc:'Replace one attack with a cone or line of damage from the chosen ancestry.'}),F('damage_resistance','Damage Resistance','species',{desc:'Resistance to the damage type of your Draconic Ancestry.'}),F('darkvision','Darkvision','species',{desc:'You can see in darkness within the range specified by your species.'})],
    5:[F('draconic_flight','Draconic Flight','species',{desc:'Gain temporary flight as a Bonus Action once per Long Rest.'})]
  }},
  {id:'elf', name:'Elf', size:'Medium', speed:'30 ft.', summary:'Fey Ancestry, Trance, and magical lineage.', levels:{
    1:[F('darkvision','Darkvision','species',{desc:'You can see in darkness within the range specified by your species.'}),choice('elven_lineage','Elven Lineage',1,['High Elf','Drow','Wood Elf']),F('fey_ancestry','Fey Ancestry','species',{desc:'Advantage against the Charmed condition.'}),choice('keen_senses','Keen Senses',1,['Insight','Perception','Survival']),F('trance','Trance','species',{desc:'Long Rest in 4 hours of meditation; magic can’t put you to sleep.'})],
    3:[F('elven_lineage_spell_3','Elven Lineage Spell','species',{desc:'The chosen lineage grants an additional spell.'})],
    5:[F('elven_lineage_spell_5','Improved Elven Lineage Spell','species',{desc:'The chosen lineage grants an additional higher-level spell.'})]
  }},
  {id:'gnome', name:'Gnome', size:'Small', speed:'30 ft.', summary:'magical cunning and gnomish lineage.', levels:{
    1:[F('darkvision','Darkvision','species',{desc:'You can see in darkness within the range specified by your species.'}),F('gnomish_cunning','Gnomish Cunning','species',{desc:'Vantagem em salvaguardas de Intelligence, Wisdom e Charisma.'}),choice('gnomish_lineage','Gnomish Lineage',1,['Rock Gnome','Forest Gnome'])]
  }},
  {id:'goliath', name:'Goliath', size:'Medium', speed:'35 ft.', summary:'Giant ancestry, powerful build, and Large Form at level 5.', levels:{
    1:[choice('giant_ancestry','Giant Ancestry',1,['Frost Giant','Fire Giant','Stone Giant','Cloud Giant','Hill Giant','Storm Giant']),F('powerful_build','Powerful Build','species',{desc:'Counts as larger for carrying capacity and has advantage against Grappled.'})],
    5:[F('large_form','Large Form','species',{desc:'Aumenta temporariamente para Grande, com vantagem em Strength e deslocamento maior.'})]
  }},
  {id:'human', name:'Human', size:'Small or Medium', speed:'30 ft.', summary:'Versatile, skillful, and gains Heroic Inspiration after a Long Rest.', levels:{
    1:[F('resourceful','Resourceful','species',{desc:'Gain Heroic Inspiration when you finish a Long Rest.'}),choice('skillful_species','Skillful',1,COMMON.skills),choice('versatile_origin_feat','Versatile — Origin Feat',1,['Skilled','Lucky','Musician','Alert','Healer','Tough','Crafter','Tavern Brawler'])]
  }},
  {id:'orc', name:'Orc', size:'Medium', speed:'30 ft.', summary:'Resilient, fast in combat, and hard to bring down.', levels:{
    1:[F('adrenaline_rush','Adrenaline Rush','species',{desc:'Dash as a Bonus Action and gain temporary Hit Points.'}),F('darkvision_36','Superior Darkvision','species',{desc:'Extended-range Darkvision.'}),F('relentless_endurance','Relentless Endurance','species',{desc:'When reduced to 0 HP, you can drop to 1 HP instead once per Long Rest.'})]
  }},
  {id:'halfling', name:'Halfling', size:'Small', speed:'30 ft.', summary:'Lucky, brave, and nimble among larger creatures.', levels:{
    1:[F('brave','Brave','species',{desc:'Advantage against the Frightened condition.'}),F('halfling_nimbleness','Halfling Nimbleness','species',{desc:'Move through the space of creatures larger than you.'}),F('luck','Luck','species',{desc:'You can reroll a 1 on the d20 for a D20 Test.'}),F('naturally_stealthy','Naturally Stealthy','species',{desc:'You can hide behind a creature larger than you.'})]
  }},
  {id:'tiefling', name:'Tiefling', size:'Small or Medium', speed:'30 ft.', summary:'Fiendish legacy, legacy resistance/spells, and Thaumaturgy.', levels:{
    1:[F('darkvision','Darkvision','species',{desc:'You can see in darkness within the range specified by your species.'}),choice('fiendish_legacy','Fiendish Legacy',1,['Abyssal','Chthonic','Infernal']),F('thaumaturgy','Otherworldly Presence','species',{desc:'You know the Thaumaturgy cantrip.'})],
    3:[F('fiendish_legacy_spell_3','Fiendish Legacy Spell','species',{desc:'The chosen legacy grants an additional spell.'})],
    5:[F('fiendish_legacy_spell_5','Improved Fiendish Legacy Spell','species',{desc:'The chosen legacy grants an additional higher-level spell.'})]
  }}
];

PLANNER_DATA.featureDescriptions = Object.assign({}, PLANNER_DATA.featureDescriptions || {}, {
  rage:'Enter a rage to improve combat power and resilience as described by the class.',
  unarmored_defense:'Calcula defesa sem armadura usando atributos da classe.',
  spellcasting:'Unlocks spellcasting and class spell choices.',
  pact_magic:'Warlock-specific magic system with Pact Magic spell slots.',
  invocations:'Special Warlock choices that grant powers, spells, or pact features.',
  eldritch_master:'Recurso final do Warlock para recuperar poder de pacto.',
  bardic_inspiration:'An inspiration die used to help allies.',
  expertise:'Choose skills to double your Proficiency Bonus.',
  jack_of_all_trades:'Improves checks in which you lack proficiency.',
  fighting_style:'Choice um estilo de combate da classe.',
  second_wind:'Limited Hit Point recovery.',
  action_surge:'Allows a burst of additional action in combat.',
  extra_attack:'Allows more than one attack when you take the Attack action.',
  sneak_attack:'Extra Rogue damage when the conditions are met.',
  cunning_action:'Uses quick mobility and stealth actions.',
  lay_on_hands:'Reserva de cura do Paladin.',
  divine_smite:'Canaliza poder divino em ataques.',
  wild_shape:'Assume forms or channel Wild Shape uses.',
  martial_arts:'Base unarmed combat system of the Monk.',
  metamagic:'Modifies spells with Sorcerer options.',
  arcane_recovery:'Recovers some of the Wizard’s spell slots.',
  subclass:'Subclass choice. In this planner, all subclasses are placed at level 3 for PHB 2024 compatibility.',
  asi_4:'Choose an Ability Score Improvement or a feat according to level rules.',
  asi_8:'Choose an Ability Score Improvement or a feat according to level rules.',
  asi_12:'Choose an Ability Score Improvement or a feat according to level rules.',
  asi_16:'Choose an Ability Score Improvement or a feat according to level rules.',
  asi_19:'Choose an Epic Boon or another permitted high-level option.'
});

// v0.9 — Incremental update: spells and cantrips from supplements.
// Preserves all previous features and only expands the existing lists.
(function(){
  function addUnique(arr, items){
    if (!arr) return;
    items.forEach(x => { if (x && !arr.includes(x)) arr.push(x); });
    arr.sort((a,b)=>a.localeCompare(b,'en-US'));
  }
  function spellList(id, name, options){ return F(id, name, 'spellList', {options}); }
  function cls(id){ return PLANNER_DATA.classes.find(c => c.id === id); }
  function addLevelFeature(classId, level, feat){
    const c = cls(classId); if(!c) return;
    if(!c.levels[level]) c.levels[level] = [];
    if(!c.levels[level].some(f => f.id === feat.id)) c.levels[level].push(feat);
  }
  const XGE = 'Xanathar';
  const TCE = 'Tasha';
  const src = (name, source) => `${name} (${source})`;

  const SUPP = {
    bard_cantrips: [src('Thunderclap',XGE), src('Booming Blade',TCE), src('Green-Flame Blade',TCE), src('Mind Sliver',TCE)],
    bard_1: [src('Earth Tremor',XGE), src('Skywrite',XGE), src('Silvery Barbs',TCE)],
    bard_2: [src('Pyrotechnics',XGE), src('Warding Wind',XGE), src('Tasha’s Mind Whip',TCE)],
    bard_3: [src('Catnap',XGE), src('Enemies Abound',XGE), src('Intellect Fortress',TCE)],
    bard_4: [src('Charm Monster',XGE)],
    bard_5: [src('Synaptic Static',XGE)],
    bard_8: [src('Power Word Pain',XGE)],
    bard_9: [src('Psychic Scream',XGE)],

    warlock_cantrips: [src('Create Bonfire',XGE), src('Frostbite',XGE), src('Infestation',XGE), src('Magic Stone',XGE), src('Toll the Dead',XGE), src('Thunderclap',XGE), src('Booming Blade',TCE), src('Green-Flame Blade',TCE), src('Lightning Lure',TCE), src('Mind Sliver',TCE)],
    warlock_1: [src('Cause Fear',XGE), src('Silvery Barbs',TCE)],
    warlock_2: [src('Earthbind',XGE), src('Mind Spike',XGE), src('Shadow Blade',XGE), src('Tasha’s Mind Whip',TCE)],
    warlock_3: [src('Enemies Abound',XGE), src('Summon Lesser Demons',XGE), src('Thunder Step',XGE), src('Intellect Fortress',TCE), src('Spirit Shroud',TCE), src('Summon Fey',TCE), src('Summon Shadowspawn',TCE), src('Summon Undead',TCE)],
    warlock_4: [src('Charm Monster',XGE), src('Shadow of Moil',XGE), src('Sickening Radiance',XGE), src('Summon Greater Demon',XGE), src('Summon Aberration',TCE)],
    warlock_5: [src('Infernal Calling',XGE), src('Danse Macabre',XGE), src('Enervation',XGE), src('Synaptic Static',XGE), src('Negative Energy Flood',XGE), src('Far Step',XGE)],
    warlock_6: [src('Soul Cage',XGE), src('Summon Fiend',TCE), src('Tasha’s Otherworldly Guise',TCE)],
    warlock_7: [src('Crown of Stars',XGE), src('Power Word Pain',XGE)],
    warlock_8: [src('Maddening Darkness',XGE)],
    warlock_9: [src('Psychic Scream',XGE), src('Blade of Disaster',TCE)],

    cleric_cantrips: [src('Word of Radiance',XGE), src('Toll the Dead',XGE)],
    cleric_1: [src('Ceremony',XGE)],
    cleric_3: [src('Life Transference',XGE), src('Spirit Shroud',TCE)],
    cleric_5: [src('Holy Weapon',XGE), src('Aurora',XGE), src('Summon Celestial',TCE)],
    cleric_7: [src('Templo dos Deuses',XGE)],
    cleric_9: [src('Toll the Dead',TCE)],

    druid_cantrips: [src('Control Flames',XGE), src('Create Bonfire',XGE), src('Thunderclap',XGE), src('Infestation',XGE), src('Gust',XGE), src('Shape Water',XGE), src('Mold Earth',XGE), src('Magic Stone',XGE), src('Frostbite',XGE), src('Primal Savagery',XGE)],
    druid_1: [src('Absorb Elements',XGE), src('Ice Knife',XGE), src('Snare',XGE), src('Earth Tremor',XGE), src('Beast Bond',XGE)],
    druid_2: [src('Earthbind',XGE), src('Dust Devil',XGE), src('Skywrite',XGE), src('Healing Spirit',XGE), src('Warding Wind',XGE), src('Summon Beast',TCE)],
    druid_3: [src('Erupting Earth',XGE), src('Flame Arrows',XGE), src('Tidal Wave',XGE), src('Wall of Water',XGE), src('Summon Fey',TCE)],
    druid_4: [src('Elemental Bane',XGE), src('Charm Monster',XGE), src('Guardian of Nature',XGE), src('Summon Elemental',TCE)],
    druid_5: [src('Control Winds',XGE), src('Maelstrom',XGE), src('Transmute Rock',XGE), src('Wrath of Nature',XGE)],
    druid_6: [src('Druid Grove',XGE), src('Investiture of Flame',XGE), src('Investiture of Ice',XGE), src('Investiture of Stone',XGE), src('Investiture of Wind',XGE)],
    druid_7: [src('Whirlwind',XGE)],
    druid_8: [src('Tsunami',XGE)],

    sorcerer_cantrips: [src('Control Flames',XGE), src('Create Bonfire',XGE), src('Frostbite',XGE), src('Gust',XGE), src('Infestation',XGE), src('Shape Water',XGE), src('Mold Earth',XGE), src('Thunderclap',XGE), src('Booming Blade',TCE), src('Green-Flame Blade',TCE), src('Lightning Lure',TCE), src('Mind Sliver',TCE), src('Sword Burst',TCE)],
    sorcerer_1: [src('Catapult',XGE), src('Chaos Bolt',XGE), src('Earth Tremor',XGE), src('Ice Knife',XGE), src('Tasha’s Caustic Brew',TCE), src('Silvery Barbs',TCE)],
    sorcerer_2: [src('Aganazzar’s Scorcher',XGE), src('Dragon’s Breath',XGE), src('Dust Devil',XGE), src('Earthbind',XGE), src('Earthbind',XGE), src('Mind Spike',XGE), src('Pyrotechnics',XGE), src('Shadow Blade',XGE), src('Snilloc’s Snowball Swarm',XGE), src('Warding Wind',XGE), src('Tasha’s Mind Whip',TCE)],
    sorcerer_3: [src('Catnap',XGE), src('Erupting Earth',XGE), src('Enemies Abound',XGE), src('Flame Arrows',XGE), src('Tidal Wave',XGE), src('Thunder Step',XGE), src('Wall of Water',XGE), src('Intellect Fortress',TCE), src('Spirit Shroud',TCE)],
    sorcerer_4: [src('Elemental Bane',XGE), src('Charm Monster',XGE), src('Sickening Radiance',XGE), src('Summon Aberration',TCE), src('Summon Construct',TCE), src('Summon Elemental',TCE)],
    sorcerer_5: [src('Control Winds',XGE), src('Enervation',XGE), src('Far Step',XGE), src('Synaptic Static',XGE)],
    sorcerer_6: [src('Scatter',XGE), src('Investiture of Flame',XGE), src('Investiture of Ice',XGE), src('Investiture of Stone',XGE), src('Investiture of Wind',XGE), src('Tasha’s Otherworldly Guise',TCE)],
    sorcerer_7: [src('Crown of Stars',XGE), src('Power Word Pain',XGE), src('Dream of the Blue Veil',TCE)],
    sorcerer_8: [src('Maddening Darkness',XGE)],
    sorcerer_9: [src('Psychic Scream',XGE), src('Blade of Disaster',TCE)],

    ranger_1: [src('Absorb Elements',XGE), src('Beast Bond',XGE), src('Snare',XGE), src('Zephyr Strike',XGE)],
    ranger_2: [src('Healing Spirit',XGE), src('Summon Beast',TCE)],
    ranger_3: [src('Flame Arrows',XGE), src('Summon Fey',TCE)],
    ranger_4: [src('Guardian of Nature',XGE), src('Summon Elemental',TCE)],
    ranger_5: [src('Steel Wind Strike',XGE), src('Wrath of Nature',XGE)],

    wizard_cantrips: [src('Control Flames',XGE), src('Create Bonfire',XGE), src('Frostbite',XGE), src('Gust',XGE), src('Infestation',XGE), src('Shape Water',XGE), src('Mold Earth',XGE), src('Thunderclap',XGE), src('Booming Blade',TCE), src('Green-Flame Blade',TCE), src('Lightning Lure',TCE), src('Mind Sliver',TCE), src('Sword Burst',TCE)],
    wizard_1: [src('Absorb Elements',XGE), src('Catapult',XGE), src('Cause Fear',XGE), src('Earth Tremor',XGE), src('Ice Knife',XGE), src('Snare',XGE), src('Tasha’s Caustic Brew',TCE), src('Silvery Barbs',TCE)],
    wizard_2: [src('Aganazzar’s Scorcher',XGE), src('Dragon’s Breath',XGE), src('Dust Devil',XGE), src('Earthbind',XGE), src('Earthbind',XGE), src('Mind Spike',XGE), src('Pyrotechnics',XGE), src('Skywrite',XGE), src('Shadow Blade',XGE), src('Snilloc’s Snowball Swarm',XGE), src('Warding Wind',XGE), src('Tasha’s Mind Whip',TCE)],
    wizard_3: [src('Catnap',XGE), src('Enemies Abound',XGE), src('Erupting Earth',XGE), src('Tidal Wave',XGE), src('Thunder Step',XGE), src('Wall of Water',XGE), src('Intellect Fortress',TCE), src('Spirit Shroud',TCE), src('Summon Fey',TCE), src('Summon Shadowspawn',TCE), src('Summon Undead',TCE)],
    wizard_4: [src('Elemental Bane',XGE), src('Charm Monster',XGE), src('Summon Greater Demon',XGE), src('Sickening Radiance',XGE), src('Summon Aberration',TCE), src('Summon Construct',TCE), src('Summon Elemental',TCE)],
    wizard_5: [src('Danse Macabre',XGE), src('Enervation',XGE), src('Synaptic Static',XGE), src('Far Step',XGE), src('Wall of Light',XGE), src('Transmute Rock',XGE)],
    wizard_6: [src('Scatter',XGE), src('Soul Cage',XGE), src('Investiture of Flame',XGE), src('Investiture of Ice',XGE), src('Investiture of Stone',XGE), src('Investiture of Wind',XGE), src('Mental Prison',XGE), src('Tasha’s Otherworldly Guise',TCE), src('Summon Fiend',TCE)],
    wizard_7: [src('Crown of Stars',XGE), src('Power Word Pain',XGE), src('Dream of the Blue Veil',TCE)],
    wizard_8: [src('Maddening Darkness',XGE)],
    wizard_9: [src('Psychic Scream',XGE), src('Blade of Disaster',TCE)],

    paladin_1: [src('Ceremony',XGE)],
    paladin_2: [src('Find Greater Steed',XGE)],
    paladin_3: [src('Spirit Shroud',TCE)],
    paladin_5: [src('Holy Weapon',XGE)],
  };

  addUnique(SPELLS.bard_cantrips, SUPP.bard_cantrips); addUnique(SPELLS.bard_1, SUPP.bard_1);
  addUnique(SPELLS.warlock_cantrips, SUPP.warlock_cantrips); addUnique(SPELLS.warlock_1, SUPP.warlock_1);
  addUnique(SPELLS.cleric_cantrips, SUPP.cleric_cantrips); addUnique(SPELLS.cleric_1, SUPP.cleric_1);
  addUnique(SPELLS.druid_cantrips, SUPP.druid_cantrips); addUnique(SPELLS.druid_1, SUPP.druid_1);
  addUnique(SPELLS.sorcerer_cantrips, SUPP.sorcerer_cantrips); addUnique(SPELLS.sorcerer_1, SUPP.sorcerer_1);
  addUnique(SPELLS.ranger_1, SUPP.ranger_1);
  addUnique(SPELLS.wizard_cantrips, SUPP.wizard_cantrips); addUnique(SPELLS.wizard_1, SUPP.wizard_1);
  addUnique(SPELLS.paladin_1, SUPP.paladin_1);

  Object.assign(SPELLS, {
    bard_2: SUPP.bard_2, bard_3: SUPP.bard_3, bard_4: SUPP.bard_4, bard_5: SUPP.bard_5, bard_8: SUPP.bard_8, bard_9: SUPP.bard_9,
    warlock_2: SUPP.warlock_2, warlock_3: SUPP.warlock_3, warlock_4: SUPP.warlock_4, warlock_5: SUPP.warlock_5, warlock_6: SUPP.warlock_6, warlock_7: SUPP.warlock_7, warlock_8: SUPP.warlock_8, warlock_9: SUPP.warlock_9,
    cleric_3: SUPP.cleric_3, cleric_5: SUPP.cleric_5, cleric_7: SUPP.cleric_7, cleric_9: SUPP.cleric_9,
    druid_2: SUPP.druid_2, druid_3: SUPP.druid_3, druid_4: SUPP.druid_4, druid_5: SUPP.druid_5, druid_6: SUPP.druid_6, druid_7: SUPP.druid_7, druid_8: SUPP.druid_8,
    sorcerer_2: SUPP.sorcerer_2, sorcerer_3: SUPP.sorcerer_3, sorcerer_4: SUPP.sorcerer_4, sorcerer_5: SUPP.sorcerer_5, sorcerer_6: SUPP.sorcerer_6, sorcerer_7: SUPP.sorcerer_7, sorcerer_8: SUPP.sorcerer_8, sorcerer_9: SUPP.sorcerer_9,
    ranger_2: SUPP.ranger_2, ranger_3: SUPP.ranger_3, ranger_4: SUPP.ranger_4, ranger_5: SUPP.ranger_5,
    wizard_2: SUPP.wizard_2, wizard_3: SUPP.wizard_3, wizard_4: SUPP.wizard_4, wizard_5: SUPP.wizard_5, wizard_6: SUPP.wizard_6, wizard_7: SUPP.wizard_7, wizard_8: SUPP.wizard_8, wizard_9: SUPP.wizard_9,
    paladin_2: SUPP.paladin_2, paladin_3: SUPP.paladin_3, paladin_5: SUPP.paladin_5,
  });

  // Validation lists by unlocked spell level — they do not remove or alter existing choices.
  [['bard',3,'bard_2'],['bard',5,'bard_3'],['bard',7,'bard_4'],['bard',9,'bard_5'],['bard',15,'bard_8'],['bard',17,'bard_9'],
   ['warlock',3,'warlock_2'],['warlock',5,'warlock_3'],['warlock',7,'warlock_4'],['warlock',9,'warlock_5'],['warlock',11,'warlock_6'],['warlock',13,'warlock_7'],['warlock',15,'warlock_8'],['warlock',17,'warlock_9'],
   ['cleric',5,'cleric_3'],['cleric',9,'cleric_5'],['cleric',13,'cleric_7'],['cleric',17,'cleric_9'],
   ['druid',3,'druid_2'],['druid',5,'druid_3'],['druid',7,'druid_4'],['druid',9,'druid_5'],['druid',11,'druid_6'],['druid',13,'druid_7'],['druid',15,'druid_8'],
   ['sorcerer',3,'sorcerer_2'],['sorcerer',5,'sorcerer_3'],['sorcerer',7,'sorcerer_4'],['sorcerer',9,'sorcerer_5'],['sorcerer',11,'sorcerer_6'],['sorcerer',13,'sorcerer_7'],['sorcerer',15,'sorcerer_8'],['sorcerer',17,'sorcerer_9'],
   ['ranger',5,'ranger_2'],['ranger',9,'ranger_3'],['ranger',13,'ranger_4'],['ranger',17,'ranger_5'],
   ['wizard',3,'wizard_2'],['wizard',5,'wizard_3'],['wizard',7,'wizard_4'],['wizard',9,'wizard_5'],['wizard',11,'wizard_6'],['wizard',13,'wizard_7'],['wizard',15,'wizard_8'],['wizard',17,'wizard_9'],
   ['paladin',5,'paladin_2'],['paladin',9,'paladin_3'],['paladin',17,'paladin_5']
  ].forEach(([classId, lvl, key]) => addLevelFeature(classId, lvl, spellList(`supp_${key}`, `Supplement spells — ${key.split('_').pop()}º level`, SPELLS[key] || [])));

  PLANNER_DATA.version = 'beta-0.1.103-en-us';
  PLANNER_DATA.note = 'beta 0.1.103 EN-US: broader spell hover coverage across class spell lists, cantrip progression dice, spell stat-block framework, Thirsting Blade level gate, and Battle Master maneuver selectors.';
})();
