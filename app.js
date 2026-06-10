const $ = (id) => document.getElementById(id);
let state = JSON.parse(localStorage.getItem('dndPlannerState') || '{}');
if (!state.choices) state.choices = {};
if (!state.attributes) state.attributes = { str:8, dex:8, con:8, int:8, wis:8, cha:8 };
if (!state.origin) state.origin = { mode:'+2/+1', plus2:'', plus1:'', plus1a:'', plus1b:'', plus1c:'' };
if (!state.feats) state.feats = {};
if (!state.speciesChoices) state.speciesChoices = {};
if (!state.speciesId) state.speciesId = ''; 

const ATTRS = [
  { id:'str', label:'Strength' }, { id:'dex', label:'Dexterity' }, { id:'con', label:'Constitution' },
  { id:'int', label:'Intelligence' }, { id:'wis', label:'Wisdom' }, { id:'cha', label:'Charisma' }
];
const ATTR_BY_LABEL = Object.fromEntries(ATTRS.map(a => [a.label, a.id]));
const POINT_BUY_COST = { 8:0, 9:1, 10:2, 11:3, 12:4, 13:5, 14:7, 15:9 };

function migrateLegacyIds(){
  const classMap = {barbaro:'barbarian', bardo:'bard', bruxo:'warlock', clerigo:'cleric', druida:'druid', feiticeiro:'sorcerer', guardiao:'ranger', guerreiro:'fighter', ladino:'rogue', mago:'wizard', monge:'monk', paladino:'paladin'};
  const backgroundMap = {acolito:'acolyte', andarilho:'wayfarer', artesao:'crafter_bg', artista:'entertainer', charlatao:'charlatan', criminoso:'criminal', eremita:'hermit', escriba:'scribe', fazendeiro:'farmer', guarda:'guard', guia:'guide', marinheiro:'sailor', mercador:'merchant', nobre:'noble', sabio:'sage', soldado:'soldier'};
  const speciesMap = {anao:'dwarf', draconato:'dragonborn', elfo:'elf', gnomo:'gnome', golias:'goliath', humano:'human', pequenino:'halfling', tiferino:'tiefling'};
  if (classMap[state.classId]) state.classId = classMap[state.classId];
  if (backgroundMap[state.backgroundId]) state.backgroundId = backgroundMap[state.backgroundId];
  if (speciesMap[state.speciesId]) state.speciesId = speciesMap[state.speciesId];
}
migrateLegacyIds();
function modifier(score){ return Math.floor((Number(score) - 10) / 2); }
function modText(n){ return n >= 0 ? `+${n}` : `${n}`; }
function pointBuyUsed(){ return ATTRS.reduce((sum,a) => sum + (POINT_BUY_COST[state.attributes[a.id]] ?? 0), 0); }
function clampLevel(v){ return Math.max(1, Math.min(20, parseInt(v || 1))); }
function currentClass(){ return PLANNER_DATA.classes.find(c => c.id === $('classSelect').value); }
function currentBackground(){ return (PLANNER_DATA.backgrounds||[]).find(b => b.id === $('backgroundSelect')?.value); }
function currentSpecies(){ return (PLANNER_DATA.species||[]).find(sp => sp.id === $('speciesSelect')?.value); }
function key(level, featId, suffix=''){ return `${currentClass().id}|${level}|${featId}|${suffix}`; }
function featKey(level, featId){ return key(level, featId, 'featPick'); }

function bonusMap(){
  const b = { str:0,dex:0,con:0,int:0,wis:0,cha:0 };
  const bg = currentBackground();
  if (bg) {
    if (state.origin.mode === '+1/+1/+1') {
      ['plus1a','plus1b','plus1c'].forEach(k => { if (state.origin[k]) b[state.origin[k]] += 1; });
    } else {
      if (state.origin.plus2) b[state.origin.plus2] += 2;
      if (state.origin.plus1) b[state.origin.plus1] += 1;
    }
  }
  Object.values(state.feats||{}).forEach(fs => {
    if (!fs || !fs.featId) return;
    if (fs.featId === 'asi') {
      if (fs.asiMode === '+2') { if (fs.asiA) b[fs.asiA] += 2; }
      else { if (fs.asiA) b[fs.asiA] += 1; if (fs.asiB) b[fs.asiB] += 1; }
      return;
    }
    const ft = (PLANNER_DATA.feats||[]).find(f => f.id === fs.featId);
    if (ft?.bonus === 1 && fs.ability) b[fs.ability] += 1;
  });
  return b;
}
function totalAttr(attr){ return Number(state.attributes[attr]||8) + bonusMap()[attr]; }

function renderAttributes(){
  const grid = $('attributesGrid'); if (!grid) return;
  const bonuses = bonusMap();
  grid.innerHTML = '';
  ATTRS.forEach(a => {
    const base = Number(state.attributes[a.id] ?? 8);
    const total = base + bonuses[a.id];
    const card = document.createElement('div'); card.className = 'attrCard';
    card.innerHTML = `<label><span class="attrName">${a.label}</span><input id="attr-${a.id}" type="number" min="8" max="15" value="${base}"></label><span class="attrBonus">Bonus ${bonuses[a.id] >= 0 ? '+'+bonuses[a.id] : bonuses[a.id]}</span><span class="attrTotal">Total ${total} (${modText(modifier(total))})</span><span class="attrCost">Cost ${POINT_BUY_COST[base] ?? 0}</span>`;
    const input = card.querySelector('input');
    input.addEventListener('input', () => {
      let v = Math.max(8, Math.min(15, parseInt(input.value || 8))); input.value = v;
      state.attributes[a.id] = v; render();
    });
    grid.appendChild(card);
  });
  const used = pointBuyUsed(); $('pointsUsed').textContent = used; $('pointsLeft').textContent = 27 - used;
  document.querySelector('.pointsStatus').classList.toggle('over', used > 27);
}

function fillAttrSelect(sel, allowedLabels, value, includeBlank=false){
  sel.innerHTML = '';
  if (includeBlank) { const o=document.createElement('option'); o.value=''; o.textContent='-- choose --'; sel.appendChild(o); }
  const list = allowedLabels ? allowedLabels.map(x => ({id:ATTR_BY_LABEL[x], label:x})) : ATTRS;
  list.forEach(a => { const o=document.createElement('option'); o.value=a.id; o.textContent=a.label; sel.appendChild(o); });
  sel.value = value || sel.options[0]?.value || '';
}

function fillFreeAttrSelect(sel, value, blockedIds=new Set()){
  sel.innerHTML = '';
  ATTRS.forEach(a => {
    const o=document.createElement('option');
    o.value=a.id;
    o.textContent=a.label;
    if (blockedIds.has(a.id) && a.id !== value) {
      o.disabled = true;
      o.textContent += ' — already chosen';
    }
    sel.appendChild(o);
  });
  sel.value = value || sel.options[0]?.value || '';
}

function normalizeOriginChoices(){
  if (!state.origin) state.origin = { mode:'+2/+1', plus2:'', plus1:'', plus1a:'', plus1b:'', plus1c:'' };
  const valid = new Set(ATTRS.map(a => a.id));
  const firstFree = (used) => ATTRS.find(a => !used.has(a.id))?.id || ATTRS[0].id;
  if (state.origin.mode === '+1/+1/+1') {
    const used = new Set();
    ['plus1a','plus1b','plus1c'].forEach(k => {
      if (!valid.has(state.origin[k]) || used.has(state.origin[k])) state.origin[k] = firstFree(used);
      used.add(state.origin[k]);
    });
  } else {
    state.origin.mode = '+2/+1';
    if (!valid.has(state.origin.plus2)) state.origin.plus2 = ATTRS[0].id;
    if (!valid.has(state.origin.plus1) || state.origin.plus1 === state.origin.plus2) {
      state.origin.plus1 = firstFree(new Set([state.origin.plus2]));
    }
  }
}

function renderOrigin(){
  const bg = currentBackground(); const box = $('originDetails'); if (!box || !bg) return;
  normalizeOriginChoices();
  box.innerHTML = '';
  const originInfo = document.createElement('div');
  originInfo.className = 'originInfo';
  const originFeat = featByDisplayName(bg.feat);
  originInfo.innerHTML = `<b>${bg.name}</b> — Origin Feat: `;
  originInfo.appendChild(originFeat ? featLinkNode(originFeat, {}) : document.createTextNode(bg.feat));
  originInfo.appendChild(document.createElement('br'));
  originInfo.append('Skills: ');
  (bg.skills || []).forEach((sk, idx) => {
    if (idx) originInfo.append(', ');
    originInfo.appendChild(makeTooltipLink(sk, skillTooltipHtml(sk)));
  });
  originInfo.append(` | Tool: ${bg.tool}`);
  originInfo.appendChild(document.createElement('br'));
  const hb = document.createElement('small');
  hb.textContent = 'Homebrew: origin ability scores are free. Choose +2/+1 or +1/+1/+1 without repeating an ability.';
  originInfo.appendChild(hb);
  box.appendChild(originInfo);
  const row = document.createElement('div'); row.className='originControls';
  const mode = document.createElement('select'); ['+2/+1','+1/+1/+1'].forEach(m=>{const o=document.createElement('option');o.value=m;o.textContent=m;mode.appendChild(o);}); mode.value=state.origin.mode;
  mode.addEventListener('change', e=>{ state.origin.mode=e.target.value; normalizeOriginChoices(); render(); });
  row.append('Ability Score Bonus: ', mode);
  if (state.origin.mode === '+1/+1/+1') {
    const keys = ['plus1a','plus1b','plus1c'];
    keys.forEach((k,i)=>{
      const selectedByOthers = new Set(keys.filter(x => x !== k).map(x => state.origin[x]).filter(Boolean));
      const s=document.createElement('select');
      fillFreeAttrSelect(s,state.origin[k],selectedByOthers);
      s.addEventListener('change',e=>{state.origin[k]=e.target.value; normalizeOriginChoices(); render();});
      row.append(` +1 #${i+1}: `,s);
    });
  } else {
    const s2=document.createElement('select');
    fillFreeAttrSelect(s2,state.origin.plus2,new Set([state.origin.plus1]));
    s2.addEventListener('change',e=>{state.origin.plus2=e.target.value; normalizeOriginChoices(); render();});
    const s1=document.createElement('select');
    fillFreeAttrSelect(s1,state.origin.plus1,new Set([state.origin.plus2]));
    s1.addEventListener('change',e=>{state.origin.plus1=e.target.value; normalizeOriginChoices(); render();});
    row.append(' +2: ', s2, ' +1: ', s1);
  }
  box.appendChild(row);
}


function renderSpeciesDetails(){
  const sp = currentSpecies(); const box = $('speciesDetails'); if (!box || !sp) return;
  box.innerHTML = '';
  const wrap = document.createElement('div');
  wrap.className = 'originInfo speciesInfo';
  const top = document.createElement('div');
  top.innerHTML = `<b>${sp.name}</b> — ${sp.size || 'Variable size'} | Speed: ${sp.speed || '30 ft.'}<br>${sp.summary || ''}`;
  wrap.appendChild(top);

  const featureLinks = [];
  if (sp.levels) {
    Object.keys(sp.levels).sort((a,b)=>Number(a)-Number(b)).forEach(lvl => {
      (sp.levels[lvl] || []).forEach(f => {
        featureLinks.push({lvl, id:f.id, name:f.name, type:f.type});
      });
    });
  }
  if (featureLinks.length) {
    const line = document.createElement('div');
    line.className = 'speciesFeatureQuickLinks';
    line.appendChild(document.createTextNode('Species Features: '));
    featureLinks.forEach((f, idx) => {
      if (idx) line.appendChild(document.createTextNode(', '));
      line.appendChild(speciesFeatureLink(f.id, `${f.name} (Lv. ${f.lvl})`));
    });
    wrap.appendChild(line);
  }
  box.appendChild(wrap);
}

function allFeaturesForLevel(c, lvl){
  const out = [];
  const sp = currentSpecies();
  if (sp && sp.levels && sp.levels[lvl]) sp.levels[lvl].forEach(f => out.push(Object.assign({scope:'species'}, f)));
  (c.levels[lvl] || []).forEach(f => out.push(Object.assign({scope:'class'}, f)));
  if (typeof selectedSubclassFeaturesForLevel === 'function') {
    selectedSubclassFeaturesForLevel(c, lvl).forEach(f => out.push(f));
  }
  return out;
}

function featureDesc(feat){
  return feat.desc || (PLANNER_DATA.featureDescriptions && PLANNER_DATA.featureDescriptions[feat.id]) || '';
}

function priorSelections(featId, currentLevel, currentIndex){
  const values = new Set();
  Object.entries(state.choices || {}).forEach(([k,v]) => {
    const parts = k.split('|');
    const lvl = Number(parts[1]);
    const id = parts[2];
    const idx = Number(parts[3]);
    if (id === featId && v && (lvl < currentLevel || (lvl === currentLevel && idx !== currentIndex))) values.add(v);
  });
  return values;
}
function globallyChosenOptions(currentLevel, currentFeatId, currentIndex){
  const values = new Set();
  Object.entries(state.choices || {}).forEach(([k,v]) => {
    const parts = k.split('|');
    const lvl = Number(parts[1]);
    const id = parts[2];
    const idx = Number(parts[3]);
    if (!v) return;
    if (lvl < currentLevel || (lvl === currentLevel && (id !== currentFeatId || idx !== currentIndex))) values.add(v);
  });
  return values;
}
function isRepeatSensitive(feat){
  const name = (feat.name || '').toLowerCase();
  return feat.type === 'spellChoice' || name.includes('cantrip') || name.includes('spell') || name.includes('invocation') || name.includes('maneuver') || name.includes('metamagic') || name.includes('skill') || name.includes('style');
}
function displayName(raw){
  return String(raw || '').replace(/\s+—.*$/, '').trim();
}
function canonicalName(raw){
  return displayName(raw).replace(/\s*\((PHB 2024|Tasha|Xanathar|XGE|TCE)\)\s*$/i,'').trim();
}
function skillMeta(name){
  const map = {
    'Acrobatics':{
      ability:'Dexterity',
      uses:'Balance, tumbling, staying on your feet, escaping restraints, and performing agile movement.',
      mechanical:'Used when the outcome of agile physical movement is uncertain. Add Dexterity modifier and Proficiency Bonus if proficient.'
    },
    'Animal Handling':{
      ability:'Wisdom',
      uses:'Calm, control, train, or read the behavior of beasts and mounts.',
      mechanical:'Used to influence or understand animals. Add Wisdom modifier and Proficiency Bonus if proficient.'
    },
    'Arcana':{
      ability:'Intelligence',
      uses:'Recall lore about spells, magic items, magical traditions, planes, and arcane symbols.',
      mechanical:'Used for magical knowledge checks. Add Intelligence modifier and Proficiency Bonus if proficient.'
    },
    'Athletics':{
      ability:'Strength',
      uses:'Climbing, jumping, swimming, grappling, shoving, and forceful physical movement.',
      mechanical:'Used for Strength-based physical challenges. Add Strength modifier and Proficiency Bonus if proficient.'
    },
    'Deception':{
      ability:'Charisma',
      uses:'Lying, disguises, misdirection, forged impressions, and concealing the truth.',
      mechanical:'Used to mislead others. Add Charisma modifier and Proficiency Bonus if proficient.'
    },
    'Stealth':{
      ability:'Dexterity',
      uses:'Hiding, moving silently, avoiding notice, and staying unseen or unheard.',
      mechanical:'Used to avoid detection. Add Dexterity modifier and Proficiency Bonus if proficient.'
    },
    'History':{
      ability:'Intelligence',
      uses:'Recall lore about history, cultures, wars, kingdoms, and important people or places.',
      mechanical:'Used for historical knowledge checks. Add Intelligence modifier and Proficiency Bonus if proficient.'
    },
    'Intimidation':{
      ability:'Charisma',
      uses:'Threats, coercion, pressure, displays of force, and fear-based influence.',
      mechanical:'Used to influence through fear or pressure. Add Charisma modifier and Proficiency Bonus if proficient.'
    },
    'Insight':{
      ability:'Wisdom',
      uses:'Read motives, emotions, lies, intent, and social cues.',
      mechanical:'Used to evaluate creatures and situations socially. Add Wisdom modifier and Proficiency Bonus if proficient.'
    },
    'Investigation':{
      ability:'Intelligence',
      uses:'Search for clues, analyze details, deduce causes, and solve problems through reasoning.',
      mechanical:'Used for deliberate examination and deduction. Add Intelligence modifier and Proficiency Bonus if proficient.'
    },
    'Medicine':{
      ability:'Wisdom',
      uses:'Stabilize creatures, diagnose illness, identify wounds, and understand anatomy or treatment.',
      mechanical:'Used for medical knowledge and treatment. Add Wisdom modifier and Proficiency Bonus if proficient.'
    },
    'Nature':{
      ability:'Intelligence',
      uses:'Recall lore about plants, animals, terrain, weather, natural hazards, and ecosystems.',
      mechanical:'Used for natural-world knowledge. Add Intelligence modifier and Proficiency Bonus if proficient.'
    },
    'Perception':{
      ability:'Wisdom',
      uses:'Spot, hear, smell, or otherwise notice creatures, objects, traps, and danger.',
      mechanical:'Used for awareness. Add Wisdom modifier and Proficiency Bonus if proficient; often compared against Stealth.'
    },
    'Persuasion':{
      ability:'Charisma',
      uses:'Honest influence, negotiation, diplomacy, requests, bargaining, and social agreement.',
      mechanical:'Used to influence through sincerity or reason. Add Charisma modifier and Proficiency Bonus if proficient.'
    },
    'Sleight of Hand':{
      ability:'Dexterity',
      uses:'Pickpocketing, palming objects, concealing items, and fine manual trickery.',
      mechanical:'Used for quick or subtle hand movements. Add Dexterity modifier and Proficiency Bonus if proficient.'
    },
    'Religion':{
      ability:'Intelligence',
      uses:'Recall lore about deities, rites, prayers, holy symbols, undead, and religious orders.',
      mechanical:'Used for religious knowledge checks. Add Intelligence modifier and Proficiency Bonus if proficient.'
    },
    'Survival':{
      ability:'Wisdom',
      uses:'Track creatures, forage, navigate wilderness, predict weather, and avoid natural hazards.',
      mechanical:'Used for wilderness survival and tracking. Add Wisdom modifier and Proficiency Bonus if proficient.'
    },
    'Performance':{
      ability:'Charisma',
      uses:'Acting, music, dance, oratory, stage presence, and entertaining an audience.',
      mechanical:'Used when performance quality matters. Add Charisma modifier and Proficiency Bonus if proficient.'
    }
  };
  return map[name] ? Object.assign({name}, map[name]) : null;
}

const SPELL_META = {
  'Eldritch Blast':{level:'Cantrip',school:'Evocation',casting:'Action',range:'120 ft.',components:'V, S',duration:'Instantaneous',attack:'Ranged spell attack',damage:'1d10 Force',scaling:'Level 5: 2 beams; Level 11: 3 beams; Level 17: 4 beams.',text:'On hit, a beam deals Force damage. You can direct beams at the same or different targets.'},
  'Fire Bolt':{level:'Cantrip',school:'Evocation',casting:'Action',range:'120 ft.',components:'V, S',duration:'Instantaneous',attack:'Ranged spell attack',damage:'1d10 Fire',scaling:'Level 1: 1d10; Level 5: 2d10; Level 11: 3d10; Level 17: 4d10.',text:'On hit, the target takes Fire damage.'},
  'Chill Touch':{level:'Cantrip',school:'Necromancy',casting:'Action',range:'Touch/Range per source',components:'V, S',duration:'1 round',attack:'Spell attack or save per source',damage:'Necrotic',scaling:'Cantrip damage scales by character level.',text:'Deals Necrotic damage and interferes with healing/undead interaction as defined by source.'},
  'Mind Sliver':{level:'Cantrip',school:'Enchantment',casting:'Action',range:'60 ft.',components:'V',duration:'1 round',save:'Intelligence',damage:'Psychic',scaling:'Cantrip damage scales by character level.',text:'Target takes Psychic damage and subtracts 1d4 from its next saving throw before the end of your next turn.'},
  'Booming Blade':{level:'Cantrip',school:'Evocation',casting:'Action',range:'Self (weapon attack)',components:'S, M',duration:'1 round',attack:'Melee weapon attack',damage:'Thunder',scaling:'Damage scales by character level.',text:'Make a melee attack; the target can take Thunder damage if it willingly moves before your next turn.'},
  'Green-Flame Blade':{level:'Cantrip',school:'Evocation',casting:'Action',range:'Self (weapon attack)',components:'S, M',duration:'Instantaneous',attack:'Melee weapon attack',damage:'Fire',scaling:'Damage scales by character level.',text:'Make a melee attack; fire can leap to a second creature within range defined by the spell.'},
  'Lightning Lure':{level:'Cantrip',school:'Evocation',casting:'Action',range:'Self/15 ft. pull',components:'V',duration:'Instantaneous',save:'Strength',damage:'Lightning',scaling:'Cantrip damage scales by character level.',text:'Pull a creature toward you; if it ends close enough, it takes Lightning damage.'},
  'Thunderclap':{level:'Cantrip',school:'Evocation',casting:'Action',range:'Self (5 ft.)',components:'S',duration:'Instantaneous',save:'Constitution',damage:'Thunder',scaling:'Cantrip damage scales by character level.',text:'Creatures within range must save or take Thunder damage.'},
  'Vicious Mockery':{level:'Cantrip',school:'Enchantment',casting:'Action',range:'60 ft.',components:'V',duration:'Instantaneous',save:'Wisdom',damage:'Psychic',scaling:'Cantrip damage scales by character level.',text:'Target takes Psychic damage and has Disadvantage on its next attack roll before the end of its next turn.'},
  'Mage Hand':{level:'Cantrip',school:'Conjuration',casting:'Action',range:'30 ft.',components:'V, S',duration:'1 minute',text:'Creates a spectral hand that manipulates objects within spell limits.'},
  'Minor Illusion':{level:'Cantrip',school:'Illusion',casting:'Action',range:'30 ft.',components:'S, M',duration:'1 minute',text:'Create a sound or image within spell limits.'},
  'Light':{level:'Cantrip',school:'Evocation',casting:'Action',range:'Touch',components:'V, M',duration:'1 hour',text:'Object sheds bright and dim light within spell limits.'},
  'Guidance':{level:'Cantrip',school:'Divination',casting:'Reaction',range:'Touch/close per source',components:'V, S',duration:'Concentration, up to 1 minute',text:'Add 1d4 to an ability check within spell limits.'},
  'Resistance':{level:'Cantrip',school:'Abjuration',casting:'Reaction',range:'Touch/close per source',components:'V, S',duration:'Concentration, up to 1 minute',text:'Add 1d4 to a saving throw within spell limits.'},
  'Sacred Flame':{level:'Cantrip',school:'Evocation',casting:'Action',range:'60 ft.',components:'V, S',duration:'Instantaneous',save:'Dexterity',damage:'Radiant',scaling:'Cantrip damage scales by character level.',text:'Target takes Radiant damage on a failed save.'},
  'Shocking Grasp':{level:'Cantrip',school:'Evocation',casting:'Action',range:'Touch',components:'V, S',duration:'Instantaneous',attack:'Melee spell attack',damage:'Lightning',scaling:'Cantrip damage scales by character level.',text:'On hit, target takes Lightning damage and cannot take Reactions until the start of its next turn.'},
  'Shield':{level:'1st',school:'Abjuration',casting:'Reaction',range:'Self',components:'V, S',duration:'1 round',text:'Trigger: you are hit by an attack or targeted by Magic Missile. Gain +5 AC until the start of your next turn and negate Magic Missile.'},
  'Magic Missile':{level:'1st',school:'Evocation',casting:'Action',range:'120 ft.',components:'V, S',duration:'Instantaneous',damage:'Force',scaling:'+1 dart per slot level above 1st.',text:'Creates darts that automatically hit and deal Force damage.'},
  'Armor of Agathys':{level:'1st',school:'Abjuration',casting:'Action',range:'Self',components:'V, S, M',duration:'1 hour',damage:'Cold',scaling:'Temporary HP and retaliatory Cold damage increase with slot level.',text:'Gain temporary Hit Points; melee attackers take Cold damage while the temporary HP remain.'},
  'Hex':{level:'1st',school:'Enchantment',casting:'Bonus Action',range:'90 ft.',components:'V, S, M',duration:'Concentration, up to 1 hour',damage:'Necrotic',scaling:'Duration increases with higher slots.',text:'Mark a creature. Your attacks deal extra Necrotic damage, and the target has disadvantage on one chosen ability checks.'},
  'Hellish Rebuke':{level:'1st',school:'Evocation',casting:'Reaction',range:'60 ft.',components:'V, S',duration:'Instantaneous',save:'Dexterity',damage:'Fire',scaling:'+1d10 per slot level above 1st.',text:'Trigger: creature damages you. Target takes Fire damage, half on successful save.'},
  'Charm Person':{level:'1st',school:'Enchantment',casting:'Action',range:'30 ft.',components:'V, S',duration:'1 hour',save:'Wisdom',text:'Humanoid target is charmed on a failed save, with advantage if you or allies are fighting it.'},
  'Cure Wounds':{level:'1st',school:'Abjuration',casting:'Action',range:'Touch',components:'V, S',duration:'Instantaneous',healing:'Healing spell',scaling:'Healing increases by slot level.',text:'A creature you touch regains Hit Points.'},
  'Healing Word':{level:'1st',school:'Abjuration',casting:'Bonus Action',range:'60 ft.',components:'V',duration:'Instantaneous',healing:'Healing spell',scaling:'Healing increases by slot level.',text:'A creature you can see regains Hit Points.'},
  'Bless':{level:'1st',school:'Enchantment',casting:'Action',range:'30 ft.',components:'V, S, M',duration:'Concentration, up to 1 minute',scaling:'Affects one additional target per slot level above 1st.',text:'Targets add 1d4 to attack rolls and saving throws.'},
  'Command':{level:'1st',school:'Enchantment',casting:'Action',range:'60 ft.',components:'V',duration:'1 round',save:'Wisdom',scaling:'Targets one additional creature per slot level above 1st.',text:'Target follows a one-word command on a failed save.'},
  'Hunter’s Mark':{level:'1st',school:'Divination',casting:'Bonus Action',range:'90 ft.',components:'V',duration:'Concentration, up to 1 hour',damage:'Weapon damage rider',scaling:'Duration increases with higher slots.',text:'Mark a creature; your weapon attacks deal extra damage to it and tracking improves.'},
  'Misty Step':{level:'2nd',school:'Conjuration',casting:'Bonus Action',range:'Self',components:'V',duration:'Instantaneous',text:'Teleport up to 30 feet to an unoccupied space you can see.'},
  'Tasha’s Mind Whip':{level:'2nd',school:'Enchantment',casting:'Action',range:'90 ft.',components:'V',duration:'1 round',save:'Intelligence',damage:'Psychic',scaling:'Targets one additional creature per slot level above 2nd.',text:'On failed save, target takes Psychic damage and has limited actions until the end of its next turn.'},
  'Fireball':{level:'3rd',school:'Evocation',casting:'Action',range:'150 ft.',components:'V, S, M',duration:'Instantaneous',save:'Dexterity',damage:'8d6 Fire',scaling:'+1d6 per slot level above 3rd.',text:'Creatures in a 20-foot-radius sphere take Fire damage, half on successful save.'},
  'Spirit Shroud':{level:'3rd',school:'Necromancy',casting:'Bonus Action',range:'Self',components:'V, S',duration:'Concentration, up to 1 minute',damage:'Radiant, Necrotic, or Cold',scaling:'Damage increases with higher slot levels.',text:'Your attacks deal extra damage, reduce enemy healing, and slow nearby enemies.'},
  'Summon Fey':{level:'3rd',school:'Conjuration',casting:'Action',range:'90 ft.',components:'V, S, M',duration:'Concentration, up to 1 hour',text:'Summons a Fey spirit stat block. Its stats scale with the slot level and your spell attack modifier.'},
  'Summon Beast':{level:'2nd',school:'Conjuration',casting:'Action',range:'90 ft.',components:'V, S, M',duration:'Concentration, up to 1 hour',text:'Summons a Beast spirit stat block. Its stats scale with the slot level and your spell attack modifier.'},
  'Summon Aberration':{level:'4th',school:'Conjuration',casting:'Action',range:'90 ft.',components:'V, S, M',duration:'Concentration, up to 1 hour',text:'Summons an Aberrant spirit stat block. Its stats scale with the slot level and your spell attack modifier.'},
  'Summon Fiend':{level:'6th',school:'Conjuration',casting:'Action',range:'90 ft.',components:'V, S, M',duration:'Concentration, up to 1 hour',text:'Summons a Fiendish spirit stat block. Its stats scale with the slot level and your spell attack modifier.'}
};

// beta 0.1.103 — broader spell tooltip coverage.
// These entries are intentionally compact mechanical stat blocks for planner use.
Object.assign(SPELL_META, {
  'Acid Splash':{level:'Cantrip',school:'Evocation',casting:'Action',range:'60 ft.',components:'V, S',duration:'Instantaneous',save:'Dexterity',damage:'Acid',scaling:'Level 1: 1d6; Level 5: 2d6; Level 11: 3d6; Level 17: 4d6.',text:'Target creature(s) in range take Acid damage on a failed save.'},
  'Booming Blade':{level:'Cantrip',school:'Evocation',casting:'Action',range:'Self (5-ft. radius)',components:'S, M',duration:'1 round',attack:'Melee weapon attack',damage:'Thunder',scaling:'Level 1: weapon damage; Level 5: +1d8 hit / 2d8 move; Level 11: +2d8 hit / 3d8 move; Level 17: +3d8 hit / 4d8 move.',text:'Make a melee attack; target takes Thunder damage if it moves before your next turn.'},
  'Create Bonfire':{level:'Cantrip',school:'Conjuration',casting:'Action',range:'60 ft.',components:'V, S',duration:'Concentration, up to 1 minute',save:'Dexterity',damage:'Fire',scaling:'Level 1: 1d8; Level 5: 2d8; Level 11: 3d8; Level 17: 4d8.',text:'Create a bonfire in a space. Creatures entering or ending turn there save or take Fire damage.'},
  'Control Flames':{level:'Cantrip',school:'Transmutation',casting:'Action',range:'60 ft.',components:'S',duration:'Instantaneous or 1 hour',text:'Manipulate nonmagical flame within the spell limits.'},
  'Druidcraft':{level:'Cantrip',school:'Transmutation',casting:'Action',range:'30 ft.',components:'V, S',duration:'Instantaneous',text:'Create minor primal effects such as weather signs, sensory effects, or small natural changes.'},
  'Frostbite':{level:'Cantrip',school:'Evocation',casting:'Action',range:'60 ft.',components:'V, S',duration:'Instantaneous',save:'Constitution',damage:'Cold',scaling:'Level 1: 1d6; Level 5: 2d6; Level 11: 3d6; Level 17: 4d6.',text:'Target takes Cold damage on a failed save and has Disadvantage on its next weapon attack roll.'},
  'Gust':{level:'Cantrip',school:'Transmutation',casting:'Action',range:'30 ft.',components:'V, S',duration:'Instantaneous',save:'Strength',text:'Push a creature or object, or create a small harmless air effect within spell limits.'},
  'Infestation':{level:'Cantrip',school:'Conjuration',casting:'Action',range:'30 ft.',components:'V, S, M',duration:'Instantaneous',save:'Constitution',damage:'Poison',scaling:'Level 1: 1d6; Level 5: 2d6; Level 11: 3d6; Level 17: 4d6.',text:'Target takes Poison damage on a failed save and moves randomly if it can move.'},
  'Lightning Lure':{level:'Cantrip',school:'Evocation',casting:'Action',range:'Self (15-ft. radius)',components:'V',duration:'Instantaneous',save:'Strength',damage:'Lightning',scaling:'Level 1: 1d8; Level 5: 2d8; Level 11: 3d8; Level 17: 4d8.',text:'Pull a creature toward you; if it ends close enough, it takes Lightning damage.'},
  'Magic Stone':{level:'Cantrip',school:'Transmutation',casting:'Bonus Action',range:'Touch',components:'V, S',duration:'1 minute',attack:'Ranged spell attack using thrown/sling stone',damage:'Bludgeoning',text:'Imbue pebbles so they can be used for ranged spell attacks.'},
  'Mold Earth':{level:'Cantrip',school:'Transmutation',casting:'Action',range:'30 ft.',components:'S',duration:'Instantaneous or 1 hour',text:'Manipulate loose earth or stone within the spell limits.'},
  'Poison Spray':{level:'Cantrip',school:'Necromancy',casting:'Action',range:'30 ft.',components:'V, S',duration:'Instantaneous',save:'Constitution',damage:'Poison',scaling:'Level 1: 1d12; Level 5: 2d12; Level 11: 3d12; Level 17: 4d12.',text:'Target takes Poison damage on a failed save.'},
  'Produce Flame':{level:'Cantrip',school:'Conjuration',casting:'Bonus Action',range:'Self / 60 ft. attack',components:'V, S',duration:'10 minutes',attack:'Ranged spell attack',damage:'Fire',scaling:'Level 1: 1d8; Level 5: 2d8; Level 11: 3d8; Level 17: 4d8.',text:'Create flame for light; you can hurl it to deal Fire damage.'},
  'Sacred Flame':{level:'Cantrip',school:'Evocation',casting:'Action',range:'60 ft.',components:'V, S',duration:'Instantaneous',save:'Dexterity',damage:'Radiant',scaling:'Level 1: 1d8; Level 5: 2d8; Level 11: 3d8; Level 17: 4d8.',text:'Target takes Radiant damage on a failed save; cover does not help as defined by the spell.'},
  'Shape Water':{level:'Cantrip',school:'Transmutation',casting:'Action',range:'30 ft.',components:'S',duration:'Instantaneous or 1 hour',text:'Manipulate water within the spell limits.'},
  'Shillelagh':{level:'Cantrip',school:'Transmutation',casting:'Bonus Action',range:'Touch',components:'V, S, M',duration:'1 minute',attack:'Melee weapon attack using spellcasting ability',damage:'Bludgeoning',scaling:'Damage die improves by source/character level where applicable.',text:'Imbue a club or quarterstaff; use spellcasting ability for attack and damage.'},
  'Spare the Dying':{level:'Cantrip',school:'Necromancy',casting:'Action',range:'15 ft.',components:'V, S',duration:'Instantaneous',text:'Stabilize a creature with 0 Hit Points.'},
  'Sword Burst':{level:'Cantrip',school:'Conjuration',casting:'Action',range:'Self (5-ft. radius)',components:'V',duration:'Instantaneous',save:'Dexterity',damage:'Force',scaling:'Level 1: 1d6; Level 5: 2d6; Level 11: 3d6; Level 17: 4d6.',text:'Creatures around you take Force damage on a failed save.'},
  'Thaumaturgy':{level:'Cantrip',school:'Transmutation',casting:'Action',range:'30 ft.',components:'V',duration:'Up to 1 minute',text:'Create minor divine signs or sensory effects within spell limits.'},
  'Thorn Whip':{level:'Cantrip',school:'Transmutation',casting:'Action',range:'30 ft.',components:'V, S, M',duration:'Instantaneous',attack:'Melee spell attack',damage:'Piercing',scaling:'Level 1: 1d6; Level 5: 2d6; Level 11: 3d6; Level 17: 4d6.',text:'On hit, target takes Piercing damage and can be pulled closer.'},
  'Thunderclap':{level:'Cantrip',school:'Evocation',casting:'Action',range:'Self (5-ft. radius)',components:'S',duration:'Instantaneous',save:'Constitution',damage:'Thunder',scaling:'Level 1: 1d6; Level 5: 2d6; Level 11: 3d6; Level 17: 4d6.',text:'Creatures around you take Thunder damage on a failed save.'},
  'Toll the Dead':{level:'Cantrip',school:'Necromancy',casting:'Action',range:'60 ft.',components:'V, S',duration:'Instantaneous',save:'Wisdom',damage:'Necrotic',scaling:'Level 1: 1d8/1d12; Level 5: 2d8/2d12; Level 11: 3d8/3d12; Level 17: 4d8/4d12.',text:'Target takes Necrotic damage on a failed save; die increases if target is missing Hit Points.'},
  'True Strike':{level:'Cantrip',school:'Divination',casting:'Action',range:'Self',components:'S, M',duration:'Instantaneous',attack:'Weapon attack using spellcasting ability',damage:'Weapon damage type or Radiant by source',scaling:'Level 5: +1d6; Level 11: +2d6; Level 17: +3d6.',text:'Make one weapon attack with magical guidance; damage scales with character level.'},
  'Vicious Mockery':{level:'Cantrip',school:'Enchantment',casting:'Action',range:'60 ft.',components:'V',duration:'Instantaneous',save:'Wisdom',damage:'Psychic',scaling:'Level 1: 1d6; Level 5: 2d6; Level 11: 3d6; Level 17: 4d6.',text:'Target takes Psychic damage on a failed save and has Disadvantage on its next attack roll.'},
  'Word of Radiance':{level:'Cantrip',school:'Evocation',casting:'Action',range:'Self (5-ft. radius)',components:'V, M',duration:'Instantaneous',save:'Constitution',damage:'Radiant',scaling:'Level 1: 1d6; Level 5: 2d6; Level 11: 3d6; Level 17: 4d6.',text:'Chosen creatures around you take Radiant damage on a failed save.'},

  'Absorb Elements':{level:'1st',school:'Abjuration',casting:'Reaction',range:'Self',components:'S',duration:'1 round',damage:'Acid, Cold, Fire, Lightning, or Thunder',scaling:'+1d6 damage per slot level above 1st.',text:'Gain resistance to triggering elemental damage; next melee attack deals extra damage.'},
  'Alarm':{level:'1st',school:'Abjuration',casting:'1 minute or Ritual',range:'30 ft.',components:'V, S, M',duration:'8 hours',text:'Set a magical alarm around an area.'},
  'Animal Friendship':{level:'1st',school:'Enchantment',casting:'Action',range:'30 ft.',components:'V, S, M',duration:'24 hours',save:'Wisdom',text:'Charm a Beast within the spell limits.'},
  'Arms of Hadar':{level:'1st',school:'Conjuration',casting:'Action',range:'Self (10-ft. radius)',components:'V, S',duration:'Instantaneous',save:'Strength',damage:'Necrotic',scaling:'+1d6 per slot level above 1st.',text:'Creatures around you take Necrotic damage and cannot take Reactions on failed save.'},
  'Beast Bond':{level:'1st',school:'Divination',casting:'Action',range:'Touch',components:'V, S, M',duration:'Concentration, up to 10 minutes',text:'Create a telepathic bond with a Beast and support its attacks within spell limits.'},
  'Cause Fear':{level:'1st',school:'Necromancy',casting:'Action',range:'60 ft.',components:'V',duration:'Concentration, up to 1 minute',save:'Wisdom',scaling:'Targets one additional creature per slot level above 1st.',text:'Target becomes Frightened on a failed save.'},
  'Catapult':{level:'1st',school:'Transmutation',casting:'Action',range:'60 ft.',components:'S',duration:'Instantaneous',save:'Dexterity',damage:'Bludgeoning',scaling:'+1d8 per slot level above 1st.',text:'Hurl an object in a line; target takes Bludgeoning damage on failed save.'},
  'Ceremony':{level:'1st',school:'Abjuration',casting:'1 hour or Ritual',range:'Touch',components:'V, S, M',duration:'Instantaneous',text:'Perform one of several religious rites with mechanical effects defined by the spell.'},
  'Chaos Bolt':{level:'1st',school:'Evocation',casting:'Action',range:'120 ft.',components:'V, S',duration:'Instantaneous',attack:'Ranged spell attack',damage:'Variable',scaling:'+1d6 per slot level above 1st.',text:'On hit, deal chaotic damage and may leap to another target.'},
  'Comprehend Languages':{level:'1st',school:'Divination',casting:'Action or Ritual',range:'Self',components:'V, S, M',duration:'1 hour',text:'Understand literal meaning of spoken and written languages.'},
  'Create or Destroy Water':{level:'1st',school:'Transmutation',casting:'Action',range:'30 ft.',components:'V, S, M',duration:'Instantaneous',scaling:'Water volume increases by slot level.',text:'Create or destroy water within spell limits.'},
  'Detect Evil and Good':{level:'1st',school:'Divination',casting:'Action',range:'Self',components:'V, S',duration:'Concentration, up to 10 minutes',text:'Sense certain creature types and consecrated/desecrated places nearby.'},
  'Detect Magic':{level:'1st',school:'Divination',casting:'Action or Ritual',range:'Self',components:'V, S',duration:'Concentration, up to 10 minutes',text:'Sense magic nearby and identify school auras within spell limits.'},
  'Detect Poison and Disease':{level:'1st',school:'Divination',casting:'Action or Ritual',range:'Self',components:'V, S, M',duration:'Concentration, up to 10 minutes',text:'Sense poisons, poisonous creatures, and diseases nearby.'},
  'Disguise Self':{level:'1st',school:'Illusion',casting:'Action',range:'Self',components:'V, S',duration:'1 hour',text:'Change your appearance with an illusion.'},
  'Dissonant Whispers':{level:'1st',school:'Enchantment',casting:'Action',range:'60 ft.',components:'V',duration:'Instantaneous',save:'Wisdom',damage:'Psychic',scaling:'+1d6 per slot level above 1st.',text:'Target takes Psychic damage and uses its Reaction to move away on failed save.'},
  'Earth Tremor':{level:'1st',school:'Evocation',casting:'Action',range:'Self (10-ft. radius)',components:'V, S',duration:'Instantaneous',save:'Dexterity',damage:'Bludgeoning',scaling:'+1d6 per slot level above 1st.',text:'Creatures around you take damage and may fall Prone; ground can become difficult terrain.'},
  'Entangle':{level:'1st',school:'Conjuration',casting:'Action',range:'90 ft.',components:'V, S',duration:'Concentration, up to 1 minute',save:'Strength',text:'Area becomes difficult terrain and can Restrict creatures on failed saves.'},
  'Faerie Fire':{level:'1st',school:'Evocation',casting:'Action',range:'60 ft.',components:'V',duration:'Concentration, up to 1 minute',save:'Dexterity',text:'Outline targets; attacks against affected targets have Advantage and invisibility is negated.'},
  'Feather Fall':{level:'1st',school:'Transmutation',casting:'Reaction',range:'60 ft.',components:'V, M',duration:'1 minute',text:'Reduce falling speed for up to five falling creatures.'},
  'Fog Cloud':{level:'1st',school:'Conjuration',casting:'Action',range:'120 ft.',components:'V, S',duration:'Concentration, up to 1 hour',scaling:'Fog radius increases by slot level.',text:'Create a heavily obscured fog sphere.'},
  'Goodberry':{level:'1st',school:'Conjuration',casting:'Action',range:'Self',components:'V, S, M',duration:'Instantaneous',healing:'1 HP per berry',text:'Create berries that restore Hit Points and provide nourishment.'},
  'Heroism':{level:'1st',school:'Enchantment',casting:'Action',range:'Touch',components:'V, S',duration:'Concentration, up to 1 minute',scaling:'Targets one additional creature per slot level above 1st.',text:'Target is immune to Frightened and gains temporary Hit Points each turn.'},
  'Ice Knife':{level:'1st',school:'Conjuration',casting:'Action',range:'60 ft.',components:'S, M',duration:'Instantaneous',attack:'Ranged spell attack',save:'Dexterity',damage:'Piercing + Cold',scaling:'+1d6 Cold per slot level above 1st.',text:'On hit, target takes Piercing damage; hit or miss, shard explodes for Cold damage.'},
  'Identify':{level:'1st',school:'Divination',casting:'1 minute or Ritual',range:'Touch',components:'V, S, M',duration:'Instantaneous',text:'Learn properties of a magic item or spell affecting a creature/object.'},
  'Illusory Script':{level:'1st',school:'Illusion',casting:'1 minute or Ritual',range:'Touch',components:'S, M',duration:'10 days',text:'Write a hidden magical message.'},
  'Inflict Wounds':{level:'1st',school:'Necromancy',casting:'Action',range:'Touch',components:'V, S',duration:'Instantaneous',attack:'Melee spell attack',damage:'Necrotic',scaling:'+1d10 per slot level above 1st.',text:'On hit, target takes Necrotic damage.'},
  'Jump':{level:'1st',school:'Transmutation',casting:'Bonus Action',range:'Touch',components:'V, S, M',duration:'1 minute',text:'Increase a creature’s jump movement within spell limits.'},
  'Longstrider':{level:'1st',school:'Transmutation',casting:'Action',range:'Touch',components:'V, S, M',duration:'1 hour',scaling:'Targets one additional creature per slot level above 1st.',text:'Increase target speed.'},
  'Mage Armor':{level:'1st',school:'Abjuration',casting:'Action',range:'Touch',components:'V, S, M',duration:'8 hours',text:'Target not wearing armor gains base AC 13 + Dexterity modifier.'},
  'Magic Missile':{level:'1st',school:'Evocation',casting:'Action',range:'120 ft.',components:'V, S',duration:'Instantaneous',damage:'Force',scaling:'+1 dart per slot level above 1st.',text:'Create darts that automatically hit and deal Force damage.'},
  'Protection from Evil and Good':{level:'1st',school:'Abjuration',casting:'Action',range:'Touch',components:'V, S, M',duration:'Concentration, up to 10 minutes',text:'Protect a creature from specified creature types: attack Disadvantage and charm/frighten/possession protections.'},
  'Purify Food and Drink':{level:'1st',school:'Transmutation',casting:'Action or Ritual',range:'10 ft.',components:'V, S',duration:'Instantaneous',text:'Purify nonmagical food and drink in range.'},
  'Sanctuary':{level:'1st',school:'Abjuration',casting:'Bonus Action',range:'30 ft.',components:'V, S, M',duration:'1 minute',save:'Wisdom',text:'Attackers must save or choose another target; ends if warded creature attacks/casts harmful spell as defined.'},
  'Shield':{level:'1st',school:'Abjuration',casting:'Reaction',range:'Self',components:'V, S',duration:'1 round',text:'Trigger: hit by attack or targeted by Magic Missile. Gain +5 AC until start of your next turn and negate Magic Missile.'},
  'Shield of Faith':{level:'1st',school:'Abjuration',casting:'Bonus Action',range:'60 ft.',components:'V, S, M',duration:'Concentration, up to 10 minutes',text:'Target gains +2 AC.'},
  'Silent Image':{level:'1st',school:'Illusion',casting:'Action',range:'60 ft.',components:'V, S, M',duration:'Concentration, up to 10 minutes',text:'Create a visual illusion within the spell limits.'},
  'Silvery Barbs':{level:'1st',school:'Enchantment',casting:'Reaction',range:'60 ft.',components:'V',duration:'Instantaneous',text:'Force a reroll of a successful d20 Test and grant Advantage to another creature.'},
  'Snare':{level:'1st',school:'Abjuration',casting:'1 minute',range:'Touch',components:'S, M',duration:'8 hours',save:'Dexterity',text:'Create a magical trap that restrains and lifts a creature on a failed save.'},
  'Speak with Animals':{level:'1st',school:'Divination',casting:'Action or Ritual',range:'Self',components:'V, S',duration:'10 minutes',text:'Understand and verbally communicate with Beasts.'},
  'Tasha’s Caustic Brew':{level:'1st',school:'Evocation',casting:'Action',range:'Self (30-ft. line)',components:'V, S, M',duration:'Concentration, up to 1 minute',save:'Dexterity',damage:'Acid',scaling:'+2d4 per slot level above 1st.',text:'Line of acid coats creatures on failed save; they take Acid damage until they use an action to scrape it off.'},
  'Tasha’s Hideous Laughter':{level:'1st',school:'Enchantment',casting:'Action',range:'30 ft.',components:'V, S, M',duration:'Concentration, up to 1 minute',save:'Wisdom',text:'Target falls Prone and is Incapacitated on a failed save, with repeat saves as defined.'},
  'Thunderwave':{level:'1st',school:'Evocation',casting:'Action',range:'Self (15-ft. cube)',components:'V, S',duration:'Instantaneous',save:'Constitution',damage:'Thunder',scaling:'+1d8 per slot level above 1st.',text:'Creatures in area take Thunder damage and are pushed on failed save; objects may be pushed.'},
  'Unseen Servant':{level:'1st',school:'Conjuration',casting:'Action or Ritual',range:'60 ft.',components:'V, S, M',duration:'1 hour',text:'Create an invisible servant that performs simple tasks.'},
  'Witch Bolt':{level:'1st',school:'Evocation',casting:'Action',range:'30 ft.',components:'V, S, M',duration:'Concentration, up to 1 minute',attack:'Ranged spell attack',damage:'Lightning',scaling:'Initial damage increases by slot level.',text:'On hit, deal Lightning damage and can continue dealing damage with actions while maintained.'},

  'Aganazzar’s Scorcher':{level:'2nd',school:'Evocation',casting:'Action',range:'30-ft. line',components:'V, S, M',duration:'Instantaneous',save:'Dexterity',damage:'Fire',scaling:'+1d8 per slot level above 2nd.',text:'Creatures in line take Fire damage, half on successful save.'},
  'Dragon’s Breath':{level:'2nd',school:'Transmutation',casting:'Bonus Action',range:'Touch',components:'V, S, M',duration:'Concentration, up to 1 minute',save:'Dexterity',damage:'Acid, Cold, Fire, Lightning, or Poison',scaling:'+1d6 per slot level above 2nd.',text:'Target can use an action to exhale damaging energy in a cone.'},
  'Dust Devil':{level:'2nd',school:'Conjuration',casting:'Action',range:'60 ft.',components:'V, S, M',duration:'Concentration, up to 1 minute',save:'Strength',damage:'Bludgeoning',scaling:'+1d8 per slot level above 2nd.',text:'Create a moving dust devil that damages and pushes creatures.'},
  'Earthbind':{level:'2nd',school:'Transmutation',casting:'Action',range:'300 ft.',components:'V',duration:'Concentration, up to 1 minute',save:'Strength',text:'Force a flying creature downward and reduce its flying speed.'},
  'Healing Spirit':{level:'2nd',school:'Conjuration',casting:'Bonus Action',range:'60 ft.',components:'V, S',duration:'Concentration, up to 1 minute',healing:'Healing spirit',text:'Conjure a spirit that heals creatures that enter or start in its space within use limits.'},
  'Mind Spike':{level:'2nd',school:'Divination',casting:'Action',range:'60 ft.',components:'S',duration:'Concentration, up to 1 hour',save:'Wisdom',damage:'Psychic',scaling:'+1d8 per slot level above 2nd.',text:'Target takes Psychic damage and you know its location while concentration lasts.'},
  'Pyrotechnics':{level:'2nd',school:'Transmutation',casting:'Action',range:'60 ft.',components:'V, S',duration:'Instantaneous',save:'Constitution',text:'Extinguish flame to create fireworks or smoke with mechanical effects.'},
  'Shadow Blade':{level:'2nd',school:'Illusion',casting:'Bonus Action',range:'Self',components:'V, S',duration:'Concentration, up to 1 minute',attack:'Melee weapon attack',damage:'Psychic',scaling:'Damage die increases with higher slot levels.',text:'Create a throwable finesse/light weapon of shadow that deals Psychic damage.'},
  'Skywrite':{level:'2nd',school:'Transmutation',casting:'Action or Ritual',range:'Sight',components:'V, S',duration:'Concentration, up to 1 hour',text:'Shape cloud words visible at long distance.'},
  'Snilloc’s Snowball Swarm':{level:'2nd',school:'Evocation',casting:'Action',range:'90 ft.',components:'V, S, M',duration:'Instantaneous',save:'Dexterity',damage:'Cold',scaling:'+1d6 per slot level above 2nd.',text:'Area burst deals Cold damage, half on successful save.'},
  'Warding Wind':{level:'2nd',school:'Evocation',casting:'Action',range:'Self',components:'V',duration:'Concentration, up to 10 minutes',text:'Strong wind around you imposes ranged attack and movement/sensory effects.'},

  'Catnap':{level:'3rd',school:'Enchantment',casting:'Action',range:'30 ft.',components:'S, M',duration:'10 minutes',text:'Targets fall unconscious and gain a Short Rest if uninterrupted.'},
  'Enemies Abound':{level:'3rd',school:'Enchantment',casting:'Action',range:'120 ft.',components:'V, S',duration:'Concentration, up to 1 minute',save:'Intelligence',text:'Target regards all creatures as enemies on failed save.'},
  'Erupting Earth':{level:'3rd',school:'Transmutation',casting:'Action',range:'120 ft.',components:'V, S, M',duration:'Instantaneous',save:'Dexterity',damage:'Bludgeoning',scaling:'+1d12 per slot level above 3rd.',text:'Area erupts; creatures take Bludgeoning damage and area becomes difficult terrain.'},
  'Flame Arrows':{level:'3rd',school:'Transmutation',casting:'Action',range:'Touch',components:'V, S',duration:'Concentration, up to 1 hour',damage:'Fire',scaling:'Affects additional ammunition with higher slots.',text:'Ammunition gains extra Fire damage.'},
  'Intellect Fortress':{level:'3rd',school:'Abjuration',casting:'Action',range:'30 ft.',components:'V',duration:'Concentration, up to 1 hour',scaling:'Targets one additional creature per slot level above 3rd.',text:'Grant resistance to Psychic damage and advantage on mental saving throws.'},
  'Summon Shadowspawn':{level:'3rd',school:'Conjuration',casting:'Action',range:'90 ft.',components:'V, S, M',duration:'Concentration, up to 1 hour',text:'Summon a Shadow Spirit stat block that scales with slot level and your spell attack modifier.'},
  'Summon Undead':{level:'3rd',school:'Necromancy',casting:'Action',range:'90 ft.',components:'V, S, M',duration:'Concentration, up to 1 hour',text:'Summon an Undead Spirit stat block that scales with slot level and your spell attack modifier.'},
  'Thunder Step':{level:'3rd',school:'Conjuration',casting:'Action',range:'90 ft.',components:'V',duration:'Instantaneous',save:'Constitution',damage:'Thunder',scaling:'+1d10 per slot level above 3rd.',text:'Teleport and create a thunder burst at the origin point.'},
  'Tidal Wave':{level:'3rd',school:'Conjuration',casting:'Action',range:'120 ft.',components:'V, S, M',duration:'Instantaneous',save:'Dexterity',damage:'Bludgeoning',text:'Wave damages and knocks Prone on failed save, and extinguishes exposed flames.'},
  'Wall of Water':{level:'3rd',school:'Evocation',casting:'Action',range:'60 ft.',components:'V, S, M',duration:'Concentration, up to 10 minutes',text:'Create wall of water with ranged/fire/cold interaction effects.'},

  'Charm Monster':{level:'4th',school:'Enchantment',casting:'Action',range:'30 ft.',components:'V, S',duration:'1 hour',save:'Wisdom',scaling:'Targets one additional creature per slot level above 4th.',text:'Charm a creature on a failed save; advantage if fighting it.'},
  'Elemental Bane':{level:'4th',school:'Transmutation',casting:'Action',range:'90 ft.',components:'V, S',duration:'Concentration, up to 1 minute',save:'Constitution',damage:'Acid, Cold, Fire, Lightning, or Thunder',scaling:'Targets one additional creature per slot level above 4th.',text:'Target loses resistance to chosen damage type and takes extra damage once per turn.'},
  'Guardian of Nature':{level:'4th',school:'Transmutation',casting:'Bonus Action',range:'Self',components:'V',duration:'Concentration, up to 1 minute',text:'Transform into one of two combat forms granting attack, mobility, or defensive benefits.'},
  'Shadow of Moil':{level:'4th',school:'Necromancy',casting:'Action',range:'Self',components:'V, S, M',duration:'Concentration, up to 1 minute',damage:'Necrotic',text:'Flame-like shadows obscure you, grant resistance, and damage attackers.'},
  'Sickening Radiance':{level:'4th',school:'Evocation',casting:'Action',range:'120 ft.',components:'V, S',duration:'Concentration, up to 10 minutes',save:'Constitution',damage:'Radiant',text:'Area deals Radiant damage, inflicts Exhaustion on failed saves, and reveals invisible creatures.'},
  'Summon Aberration':{level:'4th',school:'Conjuration',casting:'Action',range:'90 ft.',components:'V, S, M',duration:'Concentration, up to 1 hour',text:'Summon an Aberrant Spirit stat block that scales with slot level and your spell attack modifier.'},
  'Summon Construct':{level:'4th',school:'Conjuration',casting:'Action',range:'90 ft.',components:'V, S, M',duration:'Concentration, up to 1 hour',text:'Summon a Construct Spirit stat block that scales with slot level and your spell attack modifier.'},
  'Summon Elemental':{level:'4th',school:'Conjuration',casting:'Action',range:'90 ft.',components:'V, S, M',duration:'Concentration, up to 1 hour',text:'Summon an Elemental Spirit stat block that scales with slot level and your spell attack modifier.'},
  'Summon Greater Demon':{level:'4th',school:'Conjuration',casting:'Action',range:'60 ft.',components:'V, S, M',duration:'Concentration, up to 1 hour',save:'Charisma',text:'Summon a demon with control checks and risk defined by the spell.'},

  'Control Winds':{level:'5th',school:'Transmutation',casting:'Action',range:'300 ft.',components:'V, S',duration:'Concentration, up to 1 hour',text:'Control wind in a large area with gusts, downdraft, or updraft effects.'},
  'Danse Macabre':{level:'5th',school:'Necromancy',casting:'Action',range:'60 ft.',components:'V, S',duration:'Concentration, up to 1 hour',scaling:'Animate two additional corpses per slot above 5th.',text:'Animate up to five Small/Medium corpses as undead allies.'},
  'Enervation':{level:'5th',school:'Necromancy',casting:'Action',range:'60 ft.',components:'V, S',duration:'Concentration, up to 1 minute',save:'Dexterity',damage:'Necrotic',scaling:'+1d8 per slot level above 5th.',text:'Necrotic energy damages a target and can heal you while maintained.'},
  'Far Step':{level:'5th',school:'Conjuration',casting:'Bonus Action',range:'Self',components:'V',duration:'Concentration, up to 1 minute',text:'Teleport up to 60 feet as part of casting and on later Bonus Actions while maintained.'},
  'Holy Weapon':{level:'5th',school:'Evocation',casting:'Bonus Action',range:'Touch',components:'V, S',duration:'Concentration, up to 1 hour',damage:'Radiant',text:'Weapon deals extra Radiant damage and can discharge a blinding burst.'},
  'Maelstrom':{level:'5th',school:'Evocation',casting:'Action',range:'120 ft.',components:'V, S, M',duration:'Concentration, up to 1 minute',save:'Strength',damage:'Bludgeoning',text:'Create a difficult terrain vortex that pulls and damages creatures.'},
  'Negative Energy Flood':{level:'5th',school:'Necromancy',casting:'Action',range:'60 ft.',components:'V, M',duration:'Instantaneous',save:'Constitution',damage:'Necrotic',text:'Living target takes Necrotic damage; if killed, may rise as undead. Undead target gains temporary HP.'},
  'Synaptic Static':{level:'5th',school:'Enchantment',casting:'Action',range:'120 ft.',components:'V, S',duration:'Instantaneous',save:'Intelligence',damage:'Psychic',text:'Area Psychic damage and debuff to attacks/checks/concentration on failed save.'},
  'Transmute Rock':{level:'5th',school:'Transmutation',casting:'Action',range:'120 ft.',components:'V, S, M',duration:'Until dispelled',text:'Transform rock and mud areas, creating restraint or difficult terrain effects.'},
  'Wall of Light':{level:'5th',school:'Evocation',casting:'Action',range:'120 ft.',components:'V, S, M',duration:'Concentration, up to 10 minutes',save:'Constitution',damage:'Radiant',text:'Create wall that damages/blinds creatures and can fire radiant beams.'},
  'Wrath of Nature':{level:'5th',school:'Evocation',casting:'Action',range:'120 ft.',components:'V, S',duration:'Concentration, up to 1 minute',save:'Varies',text:'Animate natural terrain in an area to create multiple control/damage effects.'},

  'Blade of Disaster':{level:'9th',school:'Conjuration',casting:'Bonus Action',range:'60 ft.',components:'V, S',duration:'Concentration, up to 1 minute',attack:'Melee spell attack',damage:'Force',text:'Create a planar blade that attacks as a Bonus Action and crits more often.'},
  'Crown of Stars':{level:'7th',school:'Evocation',casting:'Action',range:'Self',components:'V, S',duration:'1 hour',attack:'Ranged spell attack',damage:'Radiant',text:'Create motes that you can fire as Bonus Actions for Radiant damage.'},
  'Dream of the Blue Veil':{level:'7th',school:'Conjuration',casting:'10 minutes',range:'20 ft.',components:'V, S, M',duration:'6 hours',text:'Transport willing creatures to another world as defined by the spell.'},
  'Druid Grove':{level:'6th',school:'Abjuration',casting:'10 minutes',range:'Touch',components:'V, S, M',duration:'24 hours',text:'Ward an outdoor area with multiple defensive and control effects.'},
  'Find Greater Steed':{level:'4th',school:'Conjuration',casting:'10 minutes',range:'30 ft.',components:'V, S',duration:'Instantaneous',text:'Summon a loyal magical mount with stronger options than Find Steed.'},
  'Infernal Calling':{level:'5th',school:'Conjuration',casting:'1 minute',range:'90 ft.',components:'V, S, M',duration:'Concentration, up to 1 hour',text:'Summon a devil with control and negotiation mechanics defined by the spell.'},
  'Investiture of Flame':{level:'6th',school:'Transmutation',casting:'Action',range:'Self',components:'V, S',duration:'Concentration, up to 10 minutes',damage:'Fire',text:'Gain fire immunity/resistance interaction, damage aura, and a line fire attack.'},
  'Investiture of Ice':{level:'6th',school:'Transmutation',casting:'Action',range:'Self',components:'V, S',duration:'Concentration, up to 10 minutes',damage:'Cold',text:'Gain cold immunity/resistance interaction, terrain control, and a cone cold attack.'},
  'Investiture of Stone':{level:'6th',school:'Transmutation',casting:'Action',range:'Self',components:'V, S',duration:'Concentration, up to 10 minutes',text:'Gain resistance to physical damage and earth movement/control effects.'},
  'Investiture of Wind':{level:'6th',school:'Transmutation',casting:'Action',range:'Self',components:'V, S',duration:'Concentration, up to 10 minutes',damage:'Bludgeoning',text:'Gain flight/ranged defense and a wind blast attack.'},
  'Maddening Darkness':{level:'8th',school:'Evocation',casting:'Action',range:'150 ft.',components:'V, M',duration:'Concentration, up to 10 minutes',save:'Wisdom',damage:'Psychic',text:'Create magical darkness that deals Psychic damage in a large area.'},
  'Mental Prison':{level:'6th',school:'Illusion',casting:'Action',range:'60 ft.',components:'S',duration:'Concentration, up to 1 minute',save:'Intelligence',damage:'Psychic',text:'Restrain target in an illusion and punish movement/forced movement.'},
  'Power Word Pain':{level:'7th',school:'Enchantment',casting:'Action',range:'60 ft.',components:'V',duration:'Instantaneous',save:'Constitution',text:'Target with low enough HP suffers severe penalties until it saves.'},
  'Psychic Scream':{level:'9th',school:'Enchantment',casting:'Action',range:'90 ft.',components:'S',duration:'Instantaneous',save:'Intelligence',damage:'Psychic',text:'Multiple targets take Psychic damage and may be Stunned.'},
  'Scatter':{level:'6th',school:'Conjuration',casting:'Action',range:'30 ft.',components:'V',duration:'Instantaneous',save:'Wisdom for unwilling targets',text:'Teleport up to five creatures to spaces you can see.'},
  'Soul Cage':{level:'6th',school:'Necromancy',casting:'Reaction',range:'60 ft.',components:'V, S, M',duration:'8 hours',text:'Trap a dying humanoid soul and spend it for several mechanical benefits.'},
  'Summon Celestial':{level:'5th',school:'Conjuration',casting:'Action',range:'90 ft.',components:'V, S, M',duration:'Concentration, up to 1 hour',text:'Summon a Celestial Spirit stat block that scales with slot level and your spell attack modifier.'},
  'Summon Fiend':{level:'6th',school:'Conjuration',casting:'Action',range:'90 ft.',components:'V, S, M',duration:'Concentration, up to 1 hour',text:'Summon a Fiendish Spirit stat block that scales with slot level and your spell attack modifier.'},
  'Tasha’s Otherworldly Guise':{level:'6th',school:'Transmutation',casting:'Bonus Action',range:'Self',components:'V, S, M',duration:'Concentration, up to 1 minute',text:'Gain flight, AC/weapon attack improvements, extra attack, and condition/damage immunities based on chosen form.'},
  'Templo dos Deuses':{level:'7th',school:'Conjuration',casting:'1 hour',range:'120 ft.',components:'V, S, M',duration:'24 hours',text:'Creates a magical temple. Name kept as imported; EN-US label should be Temple of the Gods in a future data cleanup.'},
  'Tsunami':{level:'8th',school:'Conjuration',casting:'1 minute',range:'Sight',components:'V, S',duration:'Concentration, up to 6 rounds',save:'Strength',damage:'Bludgeoning',text:'Create a huge wave that damages and carries creatures.'},
  'Whirlwind':{level:'7th',school:'Evocation',casting:'Action',range:'300 ft.',components:'V, M',duration:'Concentration, up to 1 minute',save:'Dexterity/Strength',damage:'Bludgeoning',text:'Create a moving whirlwind that damages, restrains, and lifts creatures.'}
});

function spellSource(raw){
  const m = String(raw||'').match(/\((PHB 2024|Tasha|Xanathar|XGE|TCE)\)\s*$/i);
  if (!m) return '';
  const v=m[1].toUpperCase();
  if (v === 'TCE') return 'Tasha';
  if (v === 'XGE') return 'Xanathar';
  return m[1];
}
function ordinalLevelFromKey(key){
  const m=String(key||'').match(/_(cantrips|\d+)$/);
  if (!m) return '';
  if (m[1] === 'cantrips') return 'Cantrip';
  const n=Number(m[1]);
  return n===1?'1st':n===2?'2nd':n===3?'3rd':`${n}th`;
}
function spellIndex(){
  if (window.__spellIndex) return window.__spellIndex;
  const idx={};
  if (typeof SPELLS === 'object') {
    Object.entries(SPELLS).forEach(([k,list])=>{
      if (!Array.isArray(list)) return;
      const lvl=ordinalLevelFromKey(k);
      list.forEach(raw=>{
        const name=canonicalName(raw);
        if (!idx[name]) idx[name]={};
        if (lvl && !idx[name].level) idx[name].level=lvl;
        const src=spellSource(raw);
        if (src && !idx[name].source) idx[name].source=src;
      });
    });
  }
  window.__spellIndex=idx;
  return idx;
}
function spellMeta(raw){
  const name = canonicalName(raw);
  const indexed = spellIndex()[name] || {};
  const meta = SPELL_META[name] || {};
  if (!SPELL_META[name] && !indexed.level) return null;
  return Object.assign({
    level: indexed.level || 'Spell level pending',
    school: 'Pending validation',
    casting: 'Pending validation',
    range: 'Pending validation',
    components: 'Pending validation',
    duration: 'Pending validation',
    text: 'Mechanical stat block pending detailed validation from the source book.'
  }, indexed, meta);
}
function makeTooltipLink(label, tipHtml, className='rulesLink'){
  const span=document.createElement('span');
  span.className=className;
  span.tabIndex=0;
  span.textContent=label;
  const tip=document.createElement('span');
  tip.className='rulesTooltip';
  tip.innerHTML=tipHtml;
  span.appendChild(tip);
  span.addEventListener('mousemove', (e)=>positionTooltip(tip,e));
  span.addEventListener('mouseenter', (e)=>positionTooltip(tip,e));
  span.addEventListener('focus', ()=>{ tip.style.position='fixed'; tip.style.left='24px'; tip.style.top='80px'; });
  return span;
}
function positionTooltip(tip, e){
  const margin = 14;
  const width = Math.min(380, window.innerWidth - 40);
  tip.style.width = width + 'px';
  tip.style.position = 'fixed';
  let left = e.clientX + margin;
  let top = e.clientY + margin;
  if (left + width > window.innerWidth - 12) left = Math.max(12, e.clientX - width - margin);
  const estHeight = Math.min(360, tip.scrollHeight || 180);
  if (top + estHeight > window.innerHeight - 12) top = Math.max(12, window.innerHeight - estHeight - 12);
  tip.style.left = left + 'px';
  tip.style.top = top + 'px';
}
function spellTooltipHtml(raw){
  const name=canonicalName(raw); const meta=spellMeta(raw);
  if (!meta) return `<strong>${name}</strong><br><em>Spell stat block pending validation.</em>`;
  const rows=[['Source',meta.source],['Level',meta.level],['School',meta.school],['Casting Time',meta.casting],['Range',meta.range],['Components',meta.components],['Duration',meta.duration],['Save',meta.save],['Attack',meta.attack],['Damage / Type',meta.damage],['Healing',meta.healing],['Scaling',meta.scaling],['Effect',meta.text]].filter(([,v])=>v);
  return `<strong>${name}</strong>` + rows.map(([k,v])=>`<br><b>${k}:</b> ${v}`).join('');
}
function skillTooltipHtml(raw){
  const name=canonicalName(raw); const meta=skillMeta(name);
  if (!meta) return `<strong>${name}</strong><br><em>Skill details pending validation.</em>`;
  return `<strong>${name}</strong><br><b>Ability:</b> ${meta.ability}<br><b>Common Uses:</b> ${meta.uses}<br><b>Check:</b> ${meta.mechanical}`;
}


function speciesFeatureTooltip(idOrName, label){
  if (typeof window.speciesFeatureTooltipHtml === 'function') return window.speciesFeatureTooltipHtml(idOrName, label);
  return `<strong>${label || idOrName}</strong><br><em>Species feature details pending validation.</em>`;
}
function speciesFeatureLink(idOrName, label){
  return makeTooltipLink(label || displayName(idOrName), speciesFeatureTooltip(idOrName, label), 'rulesLink speciesFeatureLink');
}
function speciesFeatureLinkForFeature(feat){
  return speciesFeatureLink(feat.id || feat.name, feat.name || feat.id);
}

function featByDisplayName(name){
  const clean = canonicalName(name).toLowerCase().replace(/[-’']/g,'').replace(/\s+/g,' ').trim();
  return (PLANNER_DATA.feats||[]).find(f => {
    const n = canonicalName(f.name).toLowerCase().replace(/[-’']/g,'').replace(/\s+/g,' ').trim();
    return n === clean || clean.includes(n) || n.includes(clean);
  });
}
function featTooltipHtmlFromFeat(ft, fs={}){
  if (!ft) return '';
  const lines = featMechanicsLines(ft, fs);
  if (!lines.length) return `<strong>${ft.name}</strong><br><em>Feat details pending validation.</em>`;
  return `<strong>${ft.name}</strong>` + lines.map(line => `<br>• ${line}`).join('');
}
function featLinkNode(ft, fs={}){
  const html = featTooltipHtmlFromFeat(ft, fs);
  return html ? makeTooltipLink(ft.name, html, 'rulesLink featRulesLink') : document.createTextNode(ft?.name || 'Feat');
}
function optionTooltipHtml(feat, opt){
  const fname=(feat.name||'').toLowerCase();
  if (feat.scope === 'species' || (feat.id||'').includes('lineage') || (feat.id||'').includes('ancestry') || (feat.id||'').includes('legacy') || (feat.id||'').includes('revelation')) return speciesFeatureTooltip(opt, displayName(opt));
  if (feat.type === 'spellChoice' || fname.includes('spell') || fname.includes('cantrip')) return spellTooltipHtml(opt);
  if (fname.includes('skill') || fname.includes('expertise')) return skillTooltipHtml(opt);
  return '';
}
function optionLabelNode(feat, opt){
  const html = optionTooltipHtml(feat, opt);
  return html ? makeTooltipLink(displayName(opt), html) : document.createTextNode(opt);
}
function allowedOptionsForFeature(feat, lvl){
  let opts = feat.options || [];
  if (currentClass()?.id === 'warlock' && (feat.name||'').toLowerCase().includes('invocation')) {
    opts = opts.filter(opt => !(String(opt).startsWith('Thirsting Blade') && lvl < 5));
  }
  return opts;
}
function renderSpellList(feat){
  const box = document.createElement('div'); box.className='spellListBox';
  const list = feat.options || [];
  box.innerHTML = `<b>Available list for validation:</b> <span class="muted">${list.length} options</span>`;
  const details=document.createElement('details');
  const summary=document.createElement('summary'); summary.textContent='Show list'; details.appendChild(summary);
  const ul=document.createElement('ul'); ul.className='spellList';
  list.forEach(item=>{const li=document.createElement('li'); li.appendChild(optionLabelNode(feat, item)); ul.appendChild(li);});
  details.appendChild(ul); box.appendChild(details); return box;
}

function init() {
  const select = $('classSelect');
  PLANNER_DATA.classes.forEach(c => { const o = document.createElement('option'); o.value = c.id; o.textContent = c.name; select.appendChild(o); });
  const bgSel = $('backgroundSelect');
  (PLANNER_DATA.backgrounds||[]).forEach(b => { const o = document.createElement('option'); o.value=b.id; o.textContent=b.name; bgSel.appendChild(o); });
  const spSel = $('speciesSelect');
  (PLANNER_DATA.species||[]).forEach(sp => { const o = document.createElement('option'); o.value=sp.id; o.textContent=sp.name; spSel.appendChild(o); });
  $('charName').value = state.charName || '';
  select.value = state.classId || PLANNER_DATA.classes[0].id;
  bgSel.value = state.backgroundId || (PLANNER_DATA.backgrounds?.[0]?.id || '');
  spSel.value = state.speciesId || (PLANNER_DATA.species?.[0]?.id || '');
  $('levelInput').value = state.level || 1;
  select.addEventListener('change', () => { state.classId = select.value; state.level = 1; $('levelInput').value = 1; render(); });
  bgSel.addEventListener('change', () => { state.backgroundId = bgSel.value; state.origin = { mode:'+2/+1', plus2:'', plus1:'', plus1a:'', plus1b:'', plus1c:'' }; render(); });
  spSel.addEventListener('change', () => { state.speciesId = spSel.value; state.speciesChoices = {}; render(); });
  $('levelInput').addEventListener('input', () => { state.level = clampLevel($('levelInput').value); render(); });
  $('charName').addEventListener('input', () => { state.charName = $('charName').value; renderSummary(); });
  $('saveBtn').addEventListener('click', save);
  $('exportBtn').addEventListener('click', exportJSON);
  $('importInput').addEventListener('change', importJSON);
  render();
}

function render(){
  state.classId = $('classSelect').value; state.backgroundId = $('backgroundSelect').value; state.speciesId = $('speciesSelect')?.value || state.speciesId; state.level = clampLevel($('levelInput').value);
  renderOrigin(); renderSpeciesDetails(); renderAttributes();
  const c = currentClass(); const box = $('features'); box.innerHTML = '';
  for (let lvl=1; lvl<=state.level; lvl++) {
    const feats = allFeaturesForLevel(c, lvl); if (!feats.length) continue;
    const block = document.createElement('details');
    block.className = 'levelBlock levelDropdown';
    block.open = lvl === state.level;

    const summary = document.createElement('summary');
    summary.className = 'levelSummary';
    const unlockNames = feats.map(f => f.name).join(' • ');
    summary.innerHTML = `<span class="levelTitle">Level ${lvl}</span><span class="levelUnlocks">${unlockNames}</span>`;
    block.appendChild(summary);

    const content = document.createElement('div');
    content.className = 'levelContent';
    feats.forEach(feat => content.appendChild(renderFeature(lvl, feat)));
    block.appendChild(content);
    box.appendChild(block);
  }
  renderSummary();
}

// beta 0.1.1k — Subclass mechanics/progression panels.
// This data is intentionally mechanical only: no roleplay themes or character fantasy.
const SUBCLASS_MECHANICS = {
  'Path of the World Tree (PHB 2024)': { levels:{3:[['Vitality of the Tree','Rage grants temporary Hit Points and improves your durability/resource support.']],6:[['Branches of the Tree','Use your subclass feature to reposition creatures in combat.']],10:[['Battering Roots','Improve reach/control while raging.']],14:[['Travel Along the Tree','Teleportation-style movement and positioning support.']] } },
  'Path of the Berserker (PHB 2024)': { levels:{3:[['Frenzy','Rage improves weapon damage output.']],6:[['Mindless Rage','Defensive protection against charm/frighten-style control while raging.']],10:[['Retaliation','Reaction-based damage when you are attacked.']],14:[['Intimidating Presence','Action-based control option against enemies.']] } },
  'Path of the Wild Heart (PHB 2024)': { levels:{3:[['Animal Speaker','Utility spell access.'],['Rage of the Wilds','Choose a combat adaptation while raging.']],6:[['Aspect of the Wilds','Choose an exploration/combat support adaptation.']],10:[['Nature Speaker','Additional utility spell access.']],14:[['Power of the Wilds','Additional combat adaptation while raging.']] } },
  'Path of the Zealot (PHB 2024)': { levels:{3:[['Divine Fury','First weapon hit on your turn deals extra damage while raging.']],6:[['Fanatical Focus','Reroll a failed saving throw while raging.']],10:[['Zealous Presence','Bonus Action team buff to attacks and saving throws.']],14:[['Rage beyond Death','Rage helps you continue fighting at 0 Hit Points.']] } },
  'Path of the Beast (Tasha)': { levels:{3:[['Form of the Beast','When you rage, choose a natural weapon option.']],6:[['Bestial Soul','Natural weapons become magical and gain movement/adaptation options.']],10:[['Infectious Fury','Force additional damage or reaction attacks through your natural weapons.']],14:[['Call the Hunt','Rage grants a team damage/survivability benefit.']] } },
  'Path of Wild Magic (Tasha)': { levels:{3:[['Magic Awareness','Detect nearby spells/magic effects.'],['Wild Surge','When you rage, roll for a magical combat effect.']],6:[['Bolstering Magic','Support attack rolls or restore spell slots.']],10:[['Unstable Backlash','Change wild surge effect when damaged or after a save trigger.']],14:[['Controlled Surge','Roll twice for Wild Surge and choose one result.']] } },
  'Path of the Ancestral Guardian (Xanathar)': { levels:{3:[['Ancestral Protectors','First target you hit while raging is hindered against your allies.']],6:[['Spirit Shield','Reaction reduces damage to an ally. Scaling: 2d6 at 6, 3d6 at 10, 4d6 at 14.']],10:[['Consult the Spirits','Utility divination features. Spirit Shield improves to 3d6.']],14:[['Vengeful Ancestors','Spirit Shield also returns force damage to the attacker. Spirit Shield improves to 4d6.']] } },
  'Path of the Storm Herald (Xanathar)': { levels:{3:[['Storm Aura','While raging, activate an aura effect as a Bonus Action. Damage/support scales by Barbarian level.']],6:[['Storm Soul','Gain resistance and environment benefits based on chosen storm.']],10:[['Shielding Storm','Extend your Storm Soul resistance to chosen creatures in your aura.']],14:[['Raging Storm','Your aura gains a reaction/control rider based on chosen storm.']] } },

  'College of Valor (PHB 2024)': { levels:{3:[['Combat Inspiration','Bardic Inspiration can improve ally damage or defense.'],['Martial Training','Improves armor/weapon combat options.']],6:[['Extra Attack','Attack twice when taking the Attack action.']],14:[['Battle Magic','Combine spellcasting with weapon attacks.']] } },
  'College of Dance (PHB 2024)': { levels:{3:[['Dazzling Footwork','Unarmed/mobility-based combat benefits.'],['Inspiring Movement','Bardic Inspiration can move allies without provoking.']],6:[['Tandem Footwork','Improve party Initiative.']],14:[['Leading Evasion','Evasion-style defense for you and nearby allies.']] } },
  'College of Lore (PHB 2024)': { levels:{3:[['Bonus Proficiencies','Gain additional skill proficiencies.'],['Cutting Words','Use Bardic Inspiration to reduce enemy rolls.']],6:[['Magical Discoveries','Add extra spells from any spell list.']],14:[['Peerless Skill','Use Bardic Inspiration on your own ability checks.']] } },
  'College of Glamour (PHB 2024)': { levels:{3:[['Mantle of Inspiration','Spend Bardic Inspiration to grant temporary Hit Points and movement.'],['Beguiling Magic','Gain charm/control spell support.']],6:[['Mantle of Majesty','Command-style Bonus Action control.']],14:[['Unbreakable Majesty','Defensive charm/control aura that punishes attackers.']] } },
  'College of Creation (Tasha)': { levels:{3:[['Mote of Potential','Bardic Inspiration gains additional effects.'],['Performance of Creation','Create a nonmagical object.']],6:[['Animating Performance','Animate an item as a combat companion.']],14:[['Creative Crescendo','Create more/larger objects with fewer limits.']] } },
  'College of Eloquence (Tasha)': { levels:{3:[['Silver Tongue','Reliable Persuasion/Deception checks.'],['Unsettling Words','Spend Bardic Inspiration to reduce a target saving throw.']],6:[['Unfailing Inspiration','Bardic Inspiration is not expended when it fails.'],['Universal Speech','Communicate across languages.']],14:[['Infectious Inspiration','After a Bardic Inspiration succeeds, grant another inspiration as a Reaction.']] } },
  'College of Swords (Xanathar)': { levels:{3:[['Bonus Proficiencies','Gain armor/weapon proficiency support.'],['Fighting Style','Choose Dueling or Two-Weapon Fighting.'],['Blade Flourish','Spend Bardic Inspiration for damage plus movement/defensive/control flourish.']],6:[['Extra Attack','Attack twice when taking the Attack action.']],14:[['Master’s Flourish','Use a d6 flourish without spending Bardic Inspiration.']] } },
  'College of Whispers (Xanathar)': { levels:{3:[['Psychic Blades','Spend Bardic Inspiration to add psychic damage on weapon hit.'],['Words of Terror','Out-of-combat fear setup.']],6:[['Mantle of Whispers','Steal a humanoid shadow to disguise and gain information.']],14:[['Shadow Lore','Magical secret that can charm/control a target.']] } },

  'Archfey Patron (PHB 2024)': { levels:{3:[['Expanded Spells','Add patron spells to your Warlock options.'],['Steps of the Fey','Teleportation-based defensive/mobility feature.']],6:[['Misty Escape','Reaction teleport/defense after taking damage.']],10:[['Beguiling Defenses','Defensive benefit against charm/control and reflected control.']],14:[['Bewitching Magic','Improve action economy after casting Enchantment/Illusion spells.']] } },
  'Celestial Patron (PHB 2024)': { levels:{3:[['Expanded Spells','Add patron spells to your Warlock options.'],['Healing Light','Gain a pool of d6s to heal as a Bonus Action. Pool scales with Warlock level.']],6:[['Radiant Soul','Improve radiant/fire damage and gain resistance support.']],10:[['Celestial Resilience','Grant temporary Hit Points after rests.']],14:[['Searing Vengeance','When near death, recover and damage/blind nearby enemies.']] } },
  'Great Old One Patron (PHB 2024)': { levels:{3:[['Expanded Spells','Add patron spells to your Warlock options.'],['Awakened Mind','Telepathic communication feature.'],['Psychic Spells','Psychic/mental spellcasting improvements.']],6:[['Clairvoyant Combatant','Mark a target for combat advantage and defensive benefits.']],10:[['Thought Shield','Psychic resistance and mental defense.']],14:[['Create Thrall','Long-term influence/control feature.']] } },
  'Fiend Patron (PHB 2024)': { levels:{3:[['Expanded Spells','Add patron spells to your Warlock options.'],['Dark One’s Blessing','Gain temporary Hit Points when you reduce a hostile creature to 0 HP.']],6:[['Dark One’s Own Luck','Add a d10 to an ability check or saving throw.']],10:[['Fiendish Resilience','Choose a damage resistance after a rest.']],14:[['Hurl Through Hell','Once per turn/rest cycle, banish and deal high psychic damage after a hit.']] } },
  'The Fathomless Patron (Tasha)': { levels:{3:[['Expanded Spells','Add patron spells to your Warlock options.'],['Tentacle of the Deeps','Bonus Action summon/attack tentacle; cold damage and speed reduction.'],['Gift of the Sea','Gain swim speed and underwater breathing.']],6:[['Oceanic Soul','Gain cold resistance and underwater communication.'],['Guardian Coil','Tentacle can reduce damage to you or an ally.']],10:[['Grasping Tentacles','Gain/empower control spell effect and temporary Hit Points.']],14:[['Fathomless Plunge','Teleport self and allies through water.']] } },
  'The Genie Patron (Tasha)': { levels:{3:[['Expanded Spells','Add patron spells based on genie kind.'],['Genie’s Vessel','Gain a vessel and add genie-type damage once per turn.']],6:[['Elemental Gift','Gain resistance and limited flight.']],10:[['Sanctuary Vessel','Allies can rest inside the vessel and gain healing benefits.']],14:[['Limited Wish','Replicate a lower-level spell effect without material components.']] } },
  'The Hexblade Patron (Xanathar)': { levels:{3:[['Expanded Spells','Add patron spells to your Warlock options.'],['Hexblade’s Curse','Curse a target for bonus damage, improved crit range, and healing on its death.'],['Hex Warrior','Use Charisma for one chosen weapon and gain armor/shield proficiency.']],6:[['Accursed Specter','Raise a slain humanoid as a specter ally.']],10:[['Armor of Hexes','Cursed target has a chance to miss you.']],14:[['Master of Hexes','Move Hexblade’s Curse to a new target after the cursed target dies.']] } },

  'War Domain (PHB 2024)': { levels:{3:[['Domain Spells','Always have domain spells prepared.'],['War Priest','Bonus Action weapon attacks with limited uses.'],['Channel Divinity: Guided Strike','Add a large bonus to an attack roll.']],6:[['War God’s Blessing','Use Channel Divinity to improve ally attack roll.']],17:[['Avatar of Battle','Resistance to Bludgeoning, Piercing, and Slashing damage.']] } },
  'Light Domain (PHB 2024)': { levels:{3:[['Domain Spells','Always have domain spells prepared.'],['Warding Flare','Reaction imposes Disadvantage on an attack.'],['Channel Divinity: Radiance of the Dawn','Area radiant damage and dispel darkness.']],6:[['Improved Warding Flare','Protect allies with Warding Flare.']],17:[['Corona of Light','Aura improves radiant/fire damage and harms enemies.']] } },
  'Trickery Domain (PHB 2024)': { levels:{3:[['Domain Spells','Always have domain spells prepared.'],['Blessing of the Trickster','Grant stealth support.'],['Channel Divinity: Invoke Duplicity','Create a duplicate for positioning/spell delivery support.']],6:[['Trickster’s Transposition','Teleport/swap using your duplicate.']],17:[['Improved Duplicity','Duplicate feature improves with more options.']] } },
  'Life Domain (PHB 2024)': { levels:{3:[['Domain Spells','Always have domain spells prepared.'],['Disciple of Life','Healing spells restore extra Hit Points.'],['Channel Divinity: Preserve Life','Restore a pool of Hit Points to creatures.']],6:[['Blessed Healer','Healing others also heals you.']],17:[['Supreme Healing','Maximize healing dice.']] } },
  'Order Domain (Tasha)': { levels:{3:[['Domain Spells','Always have domain spells prepared.'],['Bonus Proficiencies','Gain armor/skill support.'],['Voice of Authority','When you target an ally with a spell, that ally can make a Reaction attack.']],6:[['Channel Divinity: Order’s Demand','Charm/control nearby creatures and force item drops.'],['Embodiment of the Law','Cast some enchantment spells as a Bonus Action.']],17:[['Order’s Wrath','Ally attacks against your marked target deal extra psychic damage.']] } },
  'Peace Domain (Tasha)': { levels:{3:[['Domain Spells','Always have domain spells prepared.'],['Emboldening Bond','Bond allies to add a d4 to attacks, saves, or checks.']],6:[['Channel Divinity: Balm of Peace','Move without provoking and heal creatures you pass.'],['Protective Bond','Bonded creatures can teleport and take damage for each other.']],17:[['Expansive Bond','Bond range and damage protection improve.']] } },
  'Twilight Domain (Tasha)': { levels:{3:[['Domain Spells','Always have domain spells prepared.'],['Eyes of Night','Long-range Darkvision sharing.'],['Vigilant Blessing','Grant Initiative advantage.']],6:[['Channel Divinity: Twilight Sanctuary','Aura grants temporary Hit Points or ends charm/frighten.'],['Steps of Night','Limited flight in dim light/darkness.']],17:[['Twilight Shroud','Twilight Sanctuary grants cover.']] } },
  'Forge Domain (Xanathar)': { levels:{3:[['Domain Spells','Always have domain spells prepared.'],['Bonus Proficiencies','Gain heavy armor and smith’s tools.'],['Blessing of the Forge','Improve one weapon or armor after a Long Rest.']],6:[['Soul of the Forge','Gain fire resistance and armor-based AC bonus.']],17:[['Saint of Forge and Fire','Fire immunity and resistance to nonmagical weapon damage while armored.']] } },
  'Grave Domain (Xanathar)': { levels:{3:[['Domain Spells','Always have domain spells prepared.'],['Circle of Mortality','Healing at 0 HP is maximized.'],['Eyes of the Grave','Detect undead.']],6:[['Channel Divinity: Path to the Grave','Mark a target to become vulnerable to next hit.'],['Sentinel at Death’s Door','Reaction can cancel a critical hit.']],17:[['Keeper of Souls','When enemies die nearby, heal an ally.']] } },

  'Circle of the Moon (PHB 2024)': { levels:{3:[['Circle Forms','Wild Shape supports stronger combat forms.'],['Circle Spells','Always prepared circle spells.']],6:[['Improved Circle Forms','Wild Shape combat scaling improves.']],10:[['Moonlight Step','Teleportation/mobility feature tied to Wild Shape/magic.']],14:[['Lunar Form','Wild Shape or circle form reaches final combat scaling.']] } },
  'Circle of the Land (PHB 2024)': { levels:{3:[['Circle Spells','Choose land type for always prepared spells.'],['Land’s Aid','Spend Wild Shape to heal allies and damage enemies.']],6:[['Natural Recovery','Recover spell slots with nature-linked rest feature.']],10:[['Nature’s Ward','Defensive resistance/immunity support.']],14:[['Nature’s Sanctuary','Defensive protection from beasts/plants and similar creatures.']] } },
  'Circle of Stars (PHB 2024)': { levels:{3:[['Star Map','Spellcasting focus and guiding spell support.'],['Starry Form','Spend Wild Shape for Archer, Chalice, or Dragon form benefits.']],6:[['Cosmic Omen','Roll omen after rest to help or hinder d20 rolls.']],10:[['Twinkling Constellations','Starry Form improvements.']],14:[['Full of Stars','Gain resistance while Starry Form is active.']] } },
  'Circle of the Sea (PHB 2024)': { levels:{3:[['Circle Spells','Always prepared sea-themed spells.'],['Wrath of the Sea','Spend Wild Shape to create an aura that damages/pushes enemies.']],6:[['Aquatic Affinity','Movement and environment support.']],10:[['Stormborn','Flight/resistance style improvement while Wrath is active.']],14:[['Oceanic Gift','Share Wrath of the Sea benefits with allies.']] } },
  'Circle of Spores (Tasha)': { levels:{3:[['Circle Spells','Always prepared circle spells.'],['Halo of Spores','Reaction necrotic damage.'],['Symbiotic Entity','Spend Wild Shape to gain temporary HP and improve spore/melee damage.']],6:[['Fungal Infestation','Animate a nearby corpse as a temporary creature.']],10:[['Spreading Spores','Create an area spore damage zone.']],14:[['Fungal Body','Gain immunities and critical hit protection.']] } },
  'Circle of Wildfire (Tasha)': { levels:{3:[['Circle Spells','Always prepared circle spells.'],['Summon Wildfire Spirit','Spend Wild Shape to summon a wildfire spirit for damage/teleport support.']],6:[['Enhanced Bond','Improve fire/healing spells while spirit is active.']],10:[['Cauterizing Flames','Create healing/damage flames when creatures die.']],14:[['Blazing Revival','Use your wildfire spirit to avoid dropping to 0 HP.']] } },
  'Circle of Dreams (Xanathar)': { levels:{3:[['Balm of the Summer Court','Pool of d6s heals and grants temporary HP. Pool scales with Druid level.']],6:[['Hearth of Moonlight and Shadow','Short-rest protection and stealth support.']],10:[['Hidden Paths','Bonus Action teleport self or ally.']],14:[['Walker in Dreams','Free limited teleportation/divination spell effects after rest.']] } },
  'Circle of the Shepherd (Xanathar)': { levels:{3:[['Speech of the Woods','Communication utility.'],['Spirit Totem','Summon spirit aura for healing, attack support, or temporary HP.']],6:[['Mighty Summoner','Summoned beasts/fey are tougher and count as magical.']],10:[['Guardian Spirit','Spirit Totem heals summoned creatures.']],14:[['Faithful Summons','When incapacitated/at 0 HP, summon beasts automatically.']] } },

  'Aberrant Sorcery (PHB 2024)': { levels:{3:[['Psionic Spells','Gain extra spells and replace them within rules.'],['Telepathic Speech','Telepathic communication feature.']],6:[['Psionic Sorcery','Cast psionic spells with Sorcery Points and no components.'],['Psychic Defenses','Gain psychic resistance and advantage vs charm/frighten.']],14:[['Revelation in Flesh','Spend Sorcery Points for mobility/senses/defense mutations.']],18:[['Warping Implosion','Teleport and pull creatures into an area burst.']] } },
  'Draconic Sorcery (PHB 2024)': { levels:{3:[['Draconic Resilience','Increase durability and natural armor style defense.'],['Draconic Spells','Gain subclass spell support.']],6:[['Elemental Affinity','Improve damage and resistance tied to chosen dragon type.']],14:[['Dragon Wings','Gain flight.']],18:[['Dragon Companion/Presence','High-level draconic combat feature.']] } },
  'Clockwork Sorcery (PHB 2024)': { levels:{3:[['Clockwork Spells','Gain extra spells and replace them within rules.'],['Restore Balance','Cancel Advantage/Disadvantage on a d20 roll.']],6:[['Bastion of Law','Spend Sorcery Points to create damage-reducing d8s.']],14:[['Trance of Order','Reliable rolls and enemy attack suppression.']],18:[['Clockwork Cavalcade','Restore creatures/repair/remove spell effects in an area.']] } },
  'Wild Magic Sorcery (PHB 2024)': { levels:{3:[['Wild Magic Surge','Chance to trigger magical surge after spellcasting.'],['Tides of Chaos','Gain Advantage and refresh through surges.']],6:[['Bend Luck','Spend Sorcery Points to modify another creature’s roll by 1d4.']],14:[['Controlled Chaos','Roll twice on Wild Magic Surge and choose.']],18:[['Spell Bombardment','Improve spell damage dice under specific roll conditions.']] } },
  'Divine Soul (Xanathar)': { levels:{3:[['Divine Magic','Access Cleric spell list for Sorcerer spell choices.'],['Favored by the Gods','Add 2d4 to a failed save or missed attack.']],6:[['Empowered Healing','Spend Sorcery Points to reroll healing dice.']],14:[['Otherworldly Wings','Gain flight.']],18:[['Unearthly Recovery','Bonus Action self-heal when below half HP.']] } },
  'Shadow Magic (Xanathar)': { levels:{3:[['Eyes of the Dark','Darkvision and Darkness spell support.'],['Strength of the Grave','Attempt to avoid dropping to 0 HP.']],6:[['Hound of Ill Omen','Spend Sorcery Points to summon a hound that hinders target saves.']],14:[['Shadow Walk','Teleport between dim/dark areas.']],18:[['Umbral Form','Spend Sorcery Points for resistance/incorporeal movement.']] } },
  'Storm Sorcery (Xanathar)': { levels:{3:[['Wind Speaker','Language/utility feature.'],['Tempestuous Magic','After casting a leveled spell, fly 10 feet without provoking.']],6:[['Heart of the Storm','Resistance and area damage after lightning/thunder spell.'],['Storm Guide','Weather utility.']],14:[['Storm’s Fury','Reaction damage and push when hit.']],18:[['Wind Soul','Lightning/thunder immunity and flight.']] } },

  'Fey Wanderer (PHB 2024)': { levels:{3:[['Dreadful Strikes','Weapon hits deal extra psychic damage.'],['Fey Wanderer Magic','Gain subclass spells.'],['Otherworldly Glamour','Wisdom improves Charisma checks and gain skill.']],7:[['Beguiling Twist','Reaction redirects charm/frighten failures.']],11:[['Fey Reinforcements','Summon Fey support.']],15:[['Misty Wanderer','Teleport uses and ally teleport support.']] } },
  'Hunter (PHB 2024)': { levels:{3:[['Hunter’s Prey','Choose damage/control benefit against targets.'],['Hunter’s Lore','Identify target weaknesses/resistances.']],7:[['Defensive Tactics','Choose a defensive combat option.']],11:[['Superior Hunter’s Prey','Improve offensive multi-target feature.']],15:[['Superior Hunter’s Defense','Improve defensive option.']] } },
  'Beast Master (PHB 2024)': { levels:{3:[['Primal Companion','Gain beast companion. Companion attacks/use scale with Proficiency Bonus and Ranger level.']],7:[['Exceptional Training','Companion actions and damage improve.']],11:[['Bestial Fury','Companion attacks more effectively.']],15:[['Share Spells','Spells you cast on yourself can also affect companion.']] } },
  'Gloom Stalker (PHB 2024)': { levels:{3:[['Dread Ambusher','Initiative and first-round attack/damage benefit.'],['Gloom Stalker Magic','Gain subclass spells.'],['Umbral Sight','Darkvision and darkness-based combat stealth.']],7:[['Iron Mind','Gain saving throw proficiency or improve mental defense.']],11:[['Stalker’s Flurry','Improve missed attacks.']],15:[['Shadowy Dodge','Reaction imposes Disadvantage on attacks against you.']] } },
  'Swarmkeeper (Tasha)': { levels:{3:[['Gathered Swarm','Once per turn, swarm adds damage, movement, or forced movement.'],['Swarmkeeper Magic','Gain subclass spells.']],7:[['Writhing Tide','Gain temporary flight/hover movement.']],11:[['Mighty Swarm','Gathered Swarm damage/control improves.']],15:[['Swarming Dispersal','Reaction resistance and teleport when taking damage.']] } },
  'Horizon Walker (Xanathar)': { levels:{3:[['Horizon Walker Magic','Gain subclass spells.'],['Detect Portal','Detect nearby planar portal.'],['Planar Warrior','Bonus Action converts next hit to force damage and adds damage.']],7:[['Ethereal Step','Cast Etherealness briefly as Bonus Action.']],11:[['Distant Strike','Teleport between attacks and make extra attack against different target.']],15:[['Spectral Defense','Reaction resistance to damage from one attack.']] } },
  'Monster Slayer (Xanathar)': { levels:{3:[['Monster Slayer Magic','Gain subclass spells.'],['Hunter’s Sense','Learn target immunities/resistances/vulnerabilities.'],['Slayer’s Prey','Bonus Action mark target for extra damage once per turn.']],7:[['Supernatural Defense','Add 1d6 to saves/checks against Slayer’s Prey.']],11:[['Magic-User’s Nemesis','Reaction interrupts spell/teleport.']],15:[['Slayer’s Counter','Reaction attack against Slayer’s Prey when it forces a save.']] } },

  'Champion (PHB 2024)': { levels:{3:[['Improved Critical','Weapon attacks score critical hits more often.'],['Remarkable Athlete','Improve physical checks and movement.']],7:[['Additional Fighting Style','Gain another Fighting Style.']],10:[['Heroic Warrior','Gain Heroic Inspiration in combat.']],15:[['Superior Critical','Critical range improves again.']],18:[['Survivor','Regain Hit Points at start of turn when below half.']] } },
  'Eldritch Knight (PHB 2024)': { levels:{3:[['Spellcasting','Gain Wizard spellcasting progression for the subclass.'],['Weapon Bond','Bond weapons and summon them.']],7:[['War Magic','Blend cantrips and weapon attacks.']],10:[['Eldritch Strike','Weapon hits impose Disadvantage on saves against your spells.']],15:[['Arcane Charge','Teleport when using Action Surge.']],18:[['Improved War Magic','Blend leveled spells and weapon attacks.']] } },
  'Psi Warrior (PHB 2024)': { levels:{3:[['Psionic Power','Gain Psionic Energy Dice. Dice size scales: d6 at 3, d8 at 5, d10 at 11, d12 at 17. Uses scale with proficiency/level rules.'],['Protective Field','Reaction reduces damage using Psionic Energy Die.'],['Psionic Strike','Add force damage after a weapon hit using Psionic Energy Die.'],['Telekinetic Movement','Move objects/creatures with psionic power.']],7:[['Psi-Powered Leap','Gain flying movement briefly.'],['Telekinetic Thrust','Psionic Strike can push or knock Prone.']],10:[['Guarded Mind','Resistance to psychic damage and end Charmed/Frightened.']],15:[['Bulwark of Force','Grant half cover to yourself/allies.']],18:[['Telekinetic Master','High-level telekinetic spell/effect access.']] } },
  'Battle Master (PHB 2024)': { levels:{3:[['Combat Superiority','Gain 4 Superiority Dice (d8) and learn 3 Maneuvers. Save DC uses Strength or Dexterity.'],['Maneuvers','Choose 3 Maneuvers now.'],['Student of War','Gain proficiency with one Artisan’s Tool.']],7:[['Know Your Enemy','Assess combat capabilities of a creature.'],['Combat Superiority Scaling','Superiority Dice: 5d8. Maneuvers Known: 5.']],10:[['Improved Combat Superiority','Superiority Dice become d10. Maneuvers Known: 7.']],15:[['Relentless','Regain one Superiority Die when rolling Initiative if you have none. Superiority Dice: 6d10. Maneuvers Known: 9.']],18:[['Improved Combat Superiority','Superiority Dice become d12. Superiority Dice: 6d12.']] } },
  'Rune Knight (Tasha)': { levels:{3:[['Bonus Proficiencies','Gain smith’s tools and Giant language.'],['Rune Carver','Learn 2 runes. Known runes scale: 2 at 3, 3 at 7, 4 at 10, 5 at 15.'],['Giant’s Might','Bonus Action grow, gain Advantage on Strength checks/saves, and add extra damage once per turn.']],7:[['Runic Shield','Reaction force attack reroll.'],['Rune Carver Scaling','Known Runes: 3.']],10:[['Great Stature','Extra Giant’s Might damage improves.'],['Rune Carver Scaling','Known Runes: 4.']],15:[['Master of Runes','Use each rune twice per rest. Known Runes: 5.']],18:[['Runic Juggernaut','Giant’s Might size/damage/reach improves.']] } },
  'Arcane Archer (Xanathar)': { levels:{3:[['Arcane Archer Lore','Gain skill/cantrip support.'],['Arcane Shot','Learn 2 Arcane Shot options. Uses: 2 per Short/Long Rest.']],7:[['Curving Shot','Bonus Action redirect missed magic arrow.'],['Magic Arrow','Arrows count as magical.']],10:[['Arcane Shot Improvement','Learn another Arcane Shot option.']],15:[['Ever-Ready Shot','Regain one Arcane Shot use when rolling Initiative if you have none.']],18:[['Arcane Shot Improvement','Arcane Shot damage improves.']] } },
  'Cavalier (Xanathar)': { levels:{3:[['Bonus Proficiency','Gain one skill or language.'],['Born to the Saddle','Mounted combat improvements.'],['Unwavering Mark','Mark enemies you hit; punish them if they attack others.']],7:[['Warding Maneuver','Reaction add d8 to AC and reduce damage.']],10:[['Hold the Line','Opportunity attacks stop movement.']],15:[['Ferocious Charger','Charge can knock target Prone.']],18:[['Vigilant Defender','Special reaction on every creature’s turn for opportunity attacks.']] } },
  'Samurai (Xanathar)': { levels:{3:[['Bonus Proficiency','Gain skill/language support.'],['Fighting Spirit','Bonus Action gain Advantage on weapon attacks and temporary HP. Uses per Long Rest.']],7:[['Elegant Courtier','Add Wisdom to Persuasion and gain saving throw proficiency.']],10:[['Tireless Spirit','Regain Fighting Spirit use when rolling Initiative if none.']],15:[['Rapid Strike','Trade Advantage on one attack for an additional attack.']],18:[['Strength before Death','Take an extra turn when reduced to 0 HP before falling unconscious.']] } },

  'Soulknife (PHB 2024)': { levels:{3:[['Psionic Power','Gain Psionic Energy Dice. Dice size scales with Rogue level.'],['Psychic Blades','Manifest psychic blades for attacks.']],9:[['Soul Blades','Improve Psychic Blades with accuracy/teleport options.']],13:[['Psychic Veil','Turn Invisible for a duration.']],17:[['Rend Mind','Stun/control a target damaged by Psychic Blades.']] } },
  'Assassin (PHB 2024)': { levels:{3:[['Assassinate','Improve Initiative and early-round damage.'],['Assassin’s Tools','Gain poison/disguise tool support.']],9:[['Infiltration Expertise','Create false identities.']],13:[['Envenom Weapons','Improve poison use/damage.']],17:[['Death Strike','High-damage opening strike against surprised/marked targets.']] } },
  'Thief (PHB 2024)': { levels:{3:[['Fast Hands','Use Cunning Strike/object options more efficiently.'],['Second-Story Work','Improve climbing and jumping.']],9:[['Supreme Sneak','Improve stealth while moving slowly.']],13:[['Use Magic Device','Use more magic items and attunement flexibility.']],17:[['Thief’s Reflexes','Gain an extra turn in the first round of combat.']] } },
  'Arcane Trickster (PHB 2024)': { levels:{3:[['Spellcasting','Gain Wizard spellcasting progression for the subclass.'],['Mage Hand Legerdemain','Mage Hand gains stealthy rogue utility.']],9:[['Magical Ambush','Hidden spellcasting imposes Disadvantage on saves.']],13:[['Versatile Trickster','Mage Hand helps grant Advantage.']],17:[['Spell Thief','Steal/disable a spell from another caster.']] } },
  'Phantom (Tasha)': { levels:{3:[['Whispers of the Dead','Gain floating skill/tool proficiency.'],['Wails from the Grave','After Sneak Attack, damage a second creature. Uses scale with Proficiency Bonus.']],9:[['Tokens of the Departed','Create soul trinkets to fuel features and gain defenses.']],13:[['Ghost Walk','Bonus Action spectral form with flight/defensive movement.']],17:[['Death’s Friend','Wails from the Grave improves and soul trinket generation improves.']] } },
  'Soulknife (Tasha)': { levels:{3:[['Psionic Power','Gain Psionic Energy Dice.'],['Psychic Blades','Manifest psychic blades for attacks.']],9:[['Soul Blades','Improve Psychic Blades with accuracy/teleport options.']],13:[['Psychic Veil','Turn Invisible for a duration.']],17:[['Rend Mind','Stun/control a target damaged by Psychic Blades.']] } },
  'Inquisitive (Xanathar)': { levels:{3:[['Ear for Deceit','Reliable Insight against lies.'],['Eye for Detail','Bonus Action Perception/Investigation.'],['Insightful Fighting','Bonus Action Insight check enables Sneak Attack without Advantage.']],9:[['Steady Eye','Advantage on Perception/Investigation if moving slowly.']],13:[['Unerring Eye','Detect illusions/shapechangers/deception.']],17:[['Eye for Weakness','Insightful Fighting adds extra Sneak Attack damage.']] } },
  'Mastermind (Xanathar)': { levels:{3:[['Master of Intrigue','Tool/language/disguise/mimicry support.'],['Master of Tactics','Help as Bonus Action at range.']],9:[['Insightful Manipulator','Learn comparative target capabilities.']],13:[['Misdirection','Redirect attacks to a creature providing cover.']],17:[['Soul of Deceit','Mental defense and truth magic resistance.']] } },
  'Scout (Xanathar)': { levels:{3:[['Skirmisher','Reaction move when enemy ends turn near you.'],['Survivalist','Gain Nature/Survival proficiency and Expertise.']],9:[['Superior Mobility','Increase Speed.']],13:[['Ambush Master','Initiative advantage and first-hit team attack support.']],17:[['Sudden Strike','Bonus Action extra attack and potential second Sneak Attack.']] } },
  'Swashbuckler (Xanathar)': { levels:{3:[['Fancy Footwork','Targets you attack cannot Opportunity Attack you that turn.'],['Rakish Audacity','Add Charisma to Initiative and enable one-on-one Sneak Attack.']],9:[['Panache','Social/combat taunt/charm feature.']],13:[['Elegant Maneuver','Bonus Action Advantage on Acrobatics/Athletics.']],17:[['Master Duelist','Reroll a missed attack with Advantage once per rest.']] } },

  'Abjurer (PHB 2024)': { levels:{3:[['Arcane Ward','Create a damage-absorbing ward when casting abjuration.'],['Abjuration Savant','Improve access/copying/preparation of abjuration spells.']],6:[['Projected Ward','Use ward to protect allies.']],10:[['Improved Abjuration','Improve abjuration spell checks.']],14:[['Spell Resistance','Advantage on spell saves and resistance to spell damage.']] } },
  'Diviner (PHB 2024)': { levels:{3:[['Portent','Roll d20s after Long Rest and replace later rolls.'],['Divination Savant','Improve access/copying/preparation of divination spells.']],6:[['Expert Divination','Recover lower-level spell slots after divination spells.']],10:[['The Third Eye','Gain special sight options.']],14:[['Greater Portent','Roll three Portent dice.']] } },
  'Evoker (PHB 2024)': { levels:{3:[['Sculpt Spells','Protect allies from your evocation spell areas.'],['Evocation Savant','Improve access/copying/preparation of evocation spells.']],6:[['Potent Cantrip','Damaging cantrips remain effective on successful saves.']],10:[['Empowered Evocation','Add Intelligence modifier to one damage roll of Wizard evocation spells.']],14:[['Overchannel','Maximize damage of lower-level Wizard spells with escalating cost.']] } },
  'Illusionist (PHB 2024)': { levels:{3:[['Improved Illusions','Improve Minor Illusion and illusion spell use.'],['Illusion Savant','Improve access/copying/preparation of illusion spells.']],6:[['Malleable Illusions','Change an active illusion.']],10:[['Illusory Self','Reaction causes an attack to miss.']],14:[['Illusory Reality','Make part of an illusion temporarily real.']] } },
  'Bladesinger (Tasha)': { levels:{3:[['Training in War and Song','Gain armor/weapon/performance support.'],['Bladesong','Bonus Action defensive/mobility/concentration boost. Uses scale with Proficiency Bonus.']],6:[['Extra Attack','Attack twice; one attack can be replaced with a cantrip.']],10:[['Song of Defense','Spend spell slot to reduce damage.']],14:[['Song of Victory','Add Intelligence modifier to melee weapon damage during Bladesong.']] } },
  'Order of Scribes (Tasha)': { levels:{3:[['Wizardly Quill','Magical quill improves spellbook work.'],['Awakened Spellbook','Spellbook becomes a magical focus and changes spell damage type.']],6:[['Manifest Mind','Create a spectral mind for sensing and spellcasting position.']],10:[['Master Scrivener','Create enhanced scrolls and reduce scroll cost.']],14:[['One with the Word','Use spellbook to avoid damage and lose spells temporarily.']] } },
  'War Magic (Xanathar)': { levels:{3:[['Arcane Deflection','Reaction bonus to AC or saving throw with spellcasting limit.'],['Tactical Wit','Add Intelligence modifier to Initiative.']],6:[['Power Surge','Store surges and add force damage to spells.']],10:[['Durable Magic','While concentrating, gain AC and saving throw bonuses.']],14:[['Deflecting Shroud','Arcane Deflection deals force damage to nearby enemies.']] } },

  'Warrior of the Open Hand (PHB 2024)': { levels:{3:[['Open Hand Technique','Flurry of Blows adds knock Prone, push, or reaction denial.']],6:[['Wholeness of Body','Self-healing feature.']],11:[['Fleet Step','Mobility/action economy improvement.']],17:[['Quivering Palm','Delayed high-damage strike using Focus.']] } },
  'Warrior of Mercy (PHB 2024)': { levels:{3:[['Hand of Healing','Spend Focus to heal with unarmed strike mechanics.'],['Hand of Harm','Spend Focus to add necrotic damage.']],6:[['Physician’s Touch','Healing removes conditions; harm can poison.']],11:[['Flurry of Healing and Harm','Apply healing/harm during Flurry more efficiently.']],17:[['Hand of Ultimate Mercy','Revive a dead creature.']] } },
  'Warrior of Shadow (PHB 2024)': { levels:{3:[['Shadow Arts','Spend Focus for darkness/stealth magic and darkvision support.']],6:[['Shadow Step','Teleport between dim/dark areas and gain attack advantage.']],11:[['Improved Shadow Step','Shadow teleport gains an attack/damage rider.']],17:[['Cloak of Shadows','Become Invisible in dim/darkness with combat benefits.']] } },
  'Warrior of the Elements (PHB 2024)': { levels:{3:[['Elemental Attunement','Unarmed strikes gain reach/damage type and elemental options.']],6:[['Environmental Burst','Area damage/control elemental feature.']],11:[['Stride of the Elements','Gain elemental movement such as flight/swim.']],17:[['Elemental Epitome','High-level elemental resistance and damage boost.']] } },
  'Way of the Astral Self (Tasha)': { levels:{3:[['Arms of the Astral Self','Spend Focus/Ki to summon astral arms with reach and Wisdom-based attacks.']],6:[['Visage of the Astral Self','Gain senses/communication benefits.']],11:[['Body of the Astral Self','Defensive/damage improvement while astral features active.']],17:[['Awakened Astral Self','Full form improves AC and attacks.']] } },
  'Way of the Drunken Master (Xanathar)': { levels:{3:[['Bonus Proficiencies','Gain Performance and brewer’s supplies.'],['Drunken Technique','Flurry of Blows grants Disengage and speed.']],6:[['Tipsy Sway','Stand from Prone cheaply and redirect missed attacks.']],11:[['Drunkard’s Luck','Cancel Disadvantage for Focus/Ki cost.']],17:[['Intoxicated Frenzy','Flurry can attack multiple creatures.']] } },
  'Way of the Kensei (Xanathar)': { levels:{3:[['Path of the Kensei','Choose kensei weapons and gain defensive/ranged attack options.']],6:[['One with the Blade','Kensei weapons count as magical and can spend Focus/Ki for extra damage.']],11:[['Sharpen the Blade','Spend Focus/Ki to add attack/damage bonus to kensei weapon.']],17:[['Unerring Accuracy','Reroll a missed kensei weapon attack once per turn.']] } },
  'Way of the Sun Soul (Xanathar)': { levels:{3:[['Radiant Sun Bolt','Ranged radiant spell attack using Monk combat scaling.']],6:[['Searing Arc Strike','Spend Focus/Ki to cast Burning Hands after Attack action.']],11:[['Searing Sunburst','Create radiant area burst with Focus/Ki scaling.']],17:[['Sun Shield','Emit light and deal radiant reaction damage.']] } },

  'Oath of Devotion (PHB 2024)': { levels:{3:[['Oath Spells','Always prepared oath spells.'],['Channel Divinity Options','Gain oath-specific Channel Divinity options for weapon accuracy/control.']],7:[['Aura of Devotion','Aura protects against charm.']],15:[['Smite of Protection','Smite grants defensive benefit.']],20:[['Holy Nimbus','Capstone aura damages enemies and improves defense.']] } },
  'Oath of Glory (PHB 2024)': { levels:{3:[['Oath Spells','Always prepared oath spells.'],['Channel Divinity Options','Athletic/mobility and smite support options.']],7:[['Aura of Alacrity','Increase movement speed for you and nearby allies.']],15:[['Glorious Defense','Reaction increases AC and can counterattack.']],20:[['Living Legend','Capstone improves Charisma checks, attack reliability, and defenses.']] } },
  'Oath of Vengeance (PHB 2024)': { levels:{3:[['Oath Spells','Always prepared oath spells.'],['Channel Divinity Options','Mark/control a target and gain attack advantage against it.']],7:[['Relentless Avenger','Move after Opportunity Attacks.']],15:[['Soul of Vengeance','Reaction attack against your marked target.']],20:[['Avenging Angel','Capstone flight and fear aura.']] } },
  'Oath of the Ancients (PHB 2024)': { levels:{3:[['Oath Spells','Always prepared oath spells.'],['Channel Divinity Options','Restraining/control and turning options.']],7:[['Aura of Warding','Resistance against spell damage for you and nearby allies.']],15:[['Undying Sentinel','Avoid dropping to 0 HP and age protections.']],20:[['Elder Champion','Capstone regeneration and improved spell/channel effects.']] } },
  'Oath of the Watchers (Tasha)': { levels:{3:[['Oath Spells','Always prepared oath spells.'],['Channel Divinity Options','Mental save support and turn extraplanar creatures.']],7:[['Aura of the Sentinel','Improve Initiative for you and nearby allies.']],15:[['Vigilant Rebuke','Reaction damage against creatures that force successful mental saves.']],20:[['Mortal Bulwark','Capstone truesight/advantage/banishment rider against extraplanar threats.']] } },
  'Oath of Conquest (Xanathar)': { levels:{3:[['Oath Spells','Always prepared oath spells.'],['Channel Divinity Options','Frighten nearby enemies or improve an attack roll.']],7:[['Aura of Conquest','Frightened enemies in aura have Speed 0 and take psychic damage.']],15:[['Scornful Rebuke','Attackers take psychic damage.']],20:[['Invincible Conqueror','Capstone resistance, extra attack, and improved criticals.']] } },
  'Oath of Redemption (Xanathar)': { levels:{3:[['Oath Spells','Always prepared oath spells.'],['Channel Divinity Options','Boost Persuasion or reflect attacker damage.']],7:[['Aura of the Guardian','Take damage for nearby allies as a Reaction.']],15:[['Protective Spirit','Regain Hit Points when below half.']],20:[['Emissary of Redemption','Resistance to creature damage and reflected radiant damage with restrictions.']] } }
};

function selectedSubclassName(classObj){
  if (!classObj) return '';
  return state.choices?.[`${classObj.id}|3|subclass|0`] || '';
}
function subclassMechanics(name){ return SUBCLASS_MECHANICS[name] || null; }
function subclassProgressionLevels(data){ return data ? Object.keys(data.levels||{}).map(Number).sort((a,b)=>a-b) : []; }
function createMechanicLines(entries){
  const ul=document.createElement('ul'); ul.className='featureDesc';
  (entries||[]).forEach(([name,desc])=>{
    const li=document.createElement('li');
    li.innerHTML = `<strong>${name}</strong>: ${desc}`;
    ul.appendChild(li);
  });
  return ul;
}
function renderSubclassProgressionPanel(name){
  const data = subclassMechanics(name);
  const panel=document.createElement('div'); panel.className='subclassProgressionPanel';
  if (!name || !data) return panel;
  const h=document.createElement('div'); h.className='subclassPanelTitle'; h.innerHTML=`<strong>${name}</strong> — Subclass Progression`; panel.appendChild(h);
  subclassProgressionLevels(data).forEach(lvl=>{
    const sec=document.createElement('div'); sec.className='subclassLevelPreview';
    sec.innerHTML = `<div class="subclassLevelTitle">Level ${lvl}</div>`;
    sec.appendChild(createMechanicLines(data.levels[lvl]));
    panel.appendChild(sec);
  });
  return panel;
}
function selectedSubclassFeaturesForLevel(classObj, lvl){
  const name = selectedSubclassName(classObj);
  const data = subclassMechanics(name);
  if (!data || !data.levels || !data.levels[lvl]) return [];
  return data.levels[lvl].map(([featureName, desc], idx)=>({
    id:`subclass_${classObj.id}_${lvl}_${idx}`,
    name: featureName,
    type:'subclassFeature',
    scope:'subclass',
    desc,
    subclassName:name
  }));
}

function renderFeature(lvl, feat){
  const div = document.createElement('div'); div.className = 'feature';
  const head = document.createElement('div');
  head.className = 'featureHead';
  const title = document.createElement('strong');
  if (feat.scope === 'species') title.appendChild(speciesFeatureLinkForFeature(feat));
  else title.textContent = feat.name;
  const sm = document.createElement('small');
  sm.textContent = feat.scope==='species' ? 'species' : feat.type;
  head.appendChild(title);
  head.appendChild(document.createTextNode(' '));
  head.appendChild(sm);
  div.appendChild(head);
  const desc = featureDesc(feat);
  if (desc) { const p=document.createElement('p'); p.className='featureDesc'; p.textContent=desc; div.appendChild(p); }

  const isASI = feat.id.startsWith('asi_') || feat.name.includes('Epic Boon');
  if (isASI) { div.appendChild(renderFeatPicker(lvl, feat)); return div; }

  if (feat.type === 'spellList') { div.appendChild(renderSpellList(feat)); return div; }

  if (feat.type.includes('choice') || feat.type.includes('Choice')) {
    const choice = document.createElement('div'); choice.className='choice'; choice.innerHTML = `<b>Required choices: ${feat.count || 1}</b>`;
    for (let i=0;i<(feat.count||1);i++) {
      const row = document.createElement('div'); row.className='choiceRow'; const id = key(lvl, feat.id, i); const sel = document.createElement('select');
      const already = isRepeatSensitive(feat) ? globallyChosenOptions(lvl, feat.id, i) : new Set();
      const opts = allowedOptionsForFeature(feat, lvl);
      opts.forEach(opt => {
        const o=document.createElement('option'); o.value=opt;
        const used = already.has(opt);
        o.textContent = used ? `${opt} — already chosen` : opt;
        o.disabled = used;
        if (used) o.className='alreadyOption';
        sel.appendChild(o);
      });
      const saved = state.choices[id];
      sel.value = opts.includes(saved) ? saved : (opts.find(o => !already.has(o)) || opts[0] || '');
      if (sel.selectedOptions[0]?.disabled) sel.value = opts.find(o => !already.has(o)) || opts[0] || '';
      state.choices[id] = sel.value;
      if (already.has(sel.value)) row.classList.add('alreadyChosen');
      sel.addEventListener('change', e => { state.choices[id]=e.target.value; render(); });
      row.append(`Choice ${i+1}: `, sel);
      if (sel.value) {
        const preview=document.createElement('div');
        preview.className='inlineSelectionDetails';
        preview.appendChild(optionLabelNode(feat, sel.value));
        row.appendChild(preview);
      }
      choice.appendChild(row);
    }
    div.appendChild(choice);
    if (feat.id === 'subclass' && typeof renderSubclassProgressionPanel === 'function') {
      const chosen = state.choices[key(lvl, feat.id, 0)];
      const panel = renderSubclassProgressionPanel(chosen);
      if (panel && panel.childNodes.length) div.appendChild(panel);
    }
  }
  if (feat.subclassName === 'Battle Master (PHB 2024)') {
    const addMap = {3:3, 7:2, 10:2, 15:2};
    const count = addMap[lvl] || 0;
    if (count) {
      const bm = document.createElement('div'); bm.className='choice';
      bm.innerHTML = `<b>Battle Master Maneuvers: choose ${count}</b>`;
      for (let i=0;i<count;i++) {
        const row=document.createElement('div'); row.className='choiceRow';
        const id=key(lvl,'battle_master_maneuver',i);
        const sel=document.createElement('select');
        const already=globallyChosenOptions(lvl,'battle_master_maneuver',i);
        COMMON.maneuvers.forEach(opt=>{
          const o=document.createElement('option'); o.value=opt;
          const used=already.has(opt); o.textContent=used?`${opt} — already chosen`:opt; o.disabled=used; sel.appendChild(o);
        });
        const saved=state.choices[id];
        sel.value=COMMON.maneuvers.includes(saved)?saved:(COMMON.maneuvers.find(o=>!already.has(o))||COMMON.maneuvers[0]);
        state.choices[id]=sel.value;
        sel.addEventListener('change', e=>{state.choices[id]=e.target.value; render();});
        row.append(`Maneuver ${i+1}: `, sel);
        bm.appendChild(row);
      }
      div.appendChild(bm);
    }
  }
  return div;
}

function featsForLevel(lvl, feat){
  const arr = (PLANNER_DATA.feats||[]).filter(f => {
    if (lvl >= 19) return f.level <= 19;
    if (lvl >= 4) return f.level <= 4;
    return f.level <= 1;
  });
  return [{id:'asi', name:'Pure Ability Increase (+2 or +1/+1)', level:4}, ...arr.filter(f=>f.level!==1)];
}
function chosenFeatIds(currentKey){
  const ids=new Set();
  Object.entries(state.feats||{}).forEach(([k,v])=>{ if(k!==currentKey && v?.featId && v.featId!=='asi') ids.add(v.featId); });
  return ids;
}

const FEAT_MECHANICS = {
  alert:['Add your Proficiency Bonus to Initiative rolls.','You can swap Initiative with one willing ally at the start of combat.'],
  crafter:['Gain proficiency with three Artisan\'s Tools.','After a Long Rest, craft a nonmagical item from the feat\'s allowed list at a discount/with faster access.'],
  savage_attacker:['Once per turn when you hit with a weapon, you can roll the weapon damage dice twice and use either roll.'],
  healer:['When you use a Healer\'s Kit, the target can spend one Hit Point Die and regain extra Hit Points.','You can reroll some healing dice and use the higher result.'],
  skilled:['Gain proficiency in any combination of three skills or tools.'],
  magic_initiate_cleric:['Choose two Cleric cantrips.','Choose one level 1 Cleric spell.','You can cast the level 1 spell once per Long Rest without a spell slot, and can also cast it with your spell slots if you have them.','Choose Intelligence, Wisdom, or Charisma as the spellcasting ability.'],
  magic_initiate_druid:['Choose two Druid cantrips.','Choose one level 1 Druid spell.','You can cast the level 1 spell once per Long Rest without a spell slot, and can also cast it with your spell slots if you have them.','Choose Intelligence, Wisdom, or Charisma as the spellcasting ability.'],
  magic_initiate_wizard:['Choose two Wizard cantrips.','Choose one level 1 Wizard spell.','You can cast the level 1 spell once per Long Rest without a spell slot, and can also cast it with your spell slots if you have them.','Choose Intelligence, Wisdom, or Charisma as the spellcasting ability.'],
  musician:['Gain proficiency with three Musical Instruments.','After a Short or Long Rest, you can give Heroic Inspiration to allies who hear you play.'],
  lucky:['Gain Luck Points equal to your Proficiency Bonus.','Spend Luck Points to gain Advantage on a D20 Test or impose Disadvantage on an attack against you.'],
  tavern_brawler:['Your Unarmed Strike uses 1d4 for damage.','Once per turn, reroll a damage die from your Unarmed Strike.','You are better at shoving and using improvised weapons.'],
  tough:['Your Hit Point maximum increases by 2 per character level.'],
  actor:['Increase Charisma by 1.','Advantage on Charisma checks to pass yourself off as another person.','You can mimic speech or sounds after hearing them.'],
  athlete:['Increase Strength or Dexterity by 1.','Improves climbing, jumping, and standing from Prone.'],
  charger:['Increase Strength or Dexterity by 1.','After moving straight toward a target, your attack or shove gains an extra benefit.'],
  chef:['Increase Constitution or Wisdom by 1.','Gain Cook\'s Utensils proficiency.','Prepare food that supports healing and grants temporary Hit Points.'],
  crossbow_expert:['Increase Dexterity by 1.','Ignore the Loading property of crossbows.','You can fire in melee without Disadvantage.','Supports extra crossbow attacks when using eligible weapons.'],
  defensive_duelist:['Increase Dexterity by 1.','While holding a Finesse weapon, use your Reaction to add Proficiency Bonus to AC against one melee attack.'],
  dual_wielder:['Increase Strength or Dexterity by 1.','Improves fighting with two weapons and enables an additional off-hand attack option.'],
  durable:['Increase Constitution by 1.','You gain Advantage on Death Saving Throws.','Hit Point Dice healing is improved.'],
  elemental_adept:['Increase Intelligence, Wisdom, or Charisma by 1.','Choose one damage type. Your spells of that type ignore Resistance and treat low damage dice better.'],
  fey_touched:['Increase Intelligence, Wisdom, or Charisma by 1.','Learn Misty Step and one level 1 Divination or Enchantment spell.','Each learned spell can be cast once per Long Rest without a spell slot.'],
  grappler:['Increase Strength or Dexterity by 1.','Your attacks against a creature Grappled by you gain Advantage.','You can damage and Grapple with the same Unarmed Strike.'],
  great_weapon_master:['Increase Strength by 1.','Gain extra damage with heavy weapons.','After a critical hit or dropping a creature, you can make a Bonus Action attack.'],
  heavily_armored:['Increase Strength or Constitution by 1.','Gain proficiency with Heavy Armor.'],
  heavy_armor_master:['Increase Strength or Constitution by 1.','While wearing Heavy Armor, reduce incoming Bludgeoning, Piercing, and Slashing damage from attacks.'],
  inspiring_leader:['Increase Wisdom or Charisma by 1.','After a Short or Long Rest, give temporary Hit Points to allies who hear your speech.'],
  keen_mind:['Increase Intelligence by 1.','Gain a skill proficiency or Expertise from the feat\'s options.','You can take the Study action as a Bonus Action.'],
  lightly_armored:['Increase Strength or Dexterity by 1.','Gain proficiency with Light Armor, Medium Armor, and Shields.'],
  mage_slayer:['Increase Strength or Dexterity by 1.','When you damage a concentrating creature, it has Disadvantage to maintain Concentration.','You can better resist magic through the feat\'s defensive benefit.'],
  martial_weapon_training:['Increase Strength or Dexterity by 1.','Gain proficiency with Martial Weapons.'],
  medium_armor_master:['Increase Strength or Dexterity by 1.','Improve Medium Armor use, including better Dexterity contribution and stealth handling.'],
  mounted_combatant:['Increase Strength, Dexterity, or Wisdom by 1.','Gain Advantage on attacks against smaller unmounted creatures while mounted.','Protect your mount and improve mounted Dexterity saves.'],
  observant:['Increase Intelligence or Wisdom by 1.','Gain a skill proficiency or Expertise from the feat\'s options.','You can take the Search action as a Bonus Action.'],
  piercer:['Increase Strength or Dexterity by 1.','Once per turn, reroll one Piercing damage die.','Critical hits with Piercing damage roll one extra damage die.'],
  poisoner:['Increase Dexterity or Intelligence by 1.','Gain proficiency with Poisoner\'s Kit.','Craft and apply poison more effectively.'],
  polearm_master:['Increase Strength or Dexterity by 1.','Make a Bonus Action attack with the opposite end of certain polearms.','Gain a special Reaction attack when a creature enters your reach.'],
  resilient:['Increase one ability by 1.','Gain proficiency in saving throws with the chosen ability.'],
  ritual_caster:['Increase Intelligence, Wisdom, or Charisma by 1.','Choose rituals and cast them without spending spell slots when using ritual casting.'],
  sentinel:['Increase Strength or Dexterity by 1.','Opportunity Attacks can stop movement.','You can punish enemies that attack allies near you.'],
  shadow_touched:['Increase Intelligence, Wisdom, or Charisma by 1.','Learn Invisibility and one level 1 Illusion or Necromancy spell.','Each learned spell can be cast once per Long Rest without a spell slot.'],
  sharpshooter:['Increase Dexterity by 1.','Your ranged attacks ignore some cover and melee interference.','Long-range shooting is improved.'],
  shield_master:['Increase Strength by 1.','Use your shield offensively and defensively, including shoving and improving Dexterity saves.'],
  skill_expert:['Increase one ability by 1.','Gain one skill proficiency.','Gain Expertise in one skill you are proficient with.'],
  skulker:['Increase Dexterity by 1.','Improves hiding and attacking while hidden.','Missing with an attack while hidden does not automatically reveal you.'],
  slasher:['Increase Strength or Dexterity by 1.','Once per turn, reduce a target\'s Speed after dealing Slashing damage.','Critical hits with Slashing damage hinder the target.'],
  speedy:['Increase Dexterity or Constitution by 1.','Increase Speed and improve Dash movement in combat.'],
  spell_sniper:['Increase Intelligence, Wisdom, or Charisma by 1.','Learn one cantrip that uses an attack roll.','Your spell attack range improves and ignores some cover.'],
  telekinetic:['Increase Intelligence, Wisdom, or Charisma by 1.','Learn or improve Mage Hand.','Use a Bonus Action to telekinetically shove a creature.'],
  telepathic:['Increase Intelligence, Wisdom, or Charisma by 1.','Communicate telepathically with creatures within range.','Learn Detect Thoughts with a free casting per Long Rest.'],
  war_caster:['Increase Intelligence, Wisdom, or Charisma by 1.','Advantage on Constitution saves to maintain Concentration.','Can perform Somatic components while holding weapons or shields.','Can cast a spell instead of making an Opportunity Attack.'],
  weapon_master:['Increase Strength or Dexterity by 1.','Gain proficiency with weapons and/or weapon mastery options as defined by the feat.'],
  epic_boon_combat_prowess:['Increase Strength or Dexterity by 1.','When you miss with a melee attack, you can turn the miss into a hit once per combat/rest cycle as defined by the boon.'],
  epic_boon_high_magic:['Increase Intelligence, Wisdom, or Charisma by 1.','Gain an additional level 9 spell slot.'],
  epic_boon_recovery:['Increase Constitution by 1.','Once per Long Rest, regain many Hit Points when reduced to low health.','Death Saving Throws are improved.'],
  epic_boon_speed:['Increase Dexterity by 1.','Increase Speed and gain extra mobility options.'],
  epic_boon_fate:['Increase one ability by 1.','Influence D20 Tests nearby with a fate-altering die.'],
  crusher_tasha:['Increase Strength or Constitution by 1.','Once per turn when you deal Bludgeoning damage, move the target 5 feet to an unoccupied space if size limits allow.','Critical hits with Bludgeoning damage grant Advantage to attacks against the target until the start of your next turn.'],
  artificer_initiate_tasha:['Learn one Artificer cantrip.','Learn one 1st-level Artificer spell and cast it once per Long Rest without a spell slot.','Gain proficiency with one type of artisan tool and may use it as a spellcasting focus for the learned spell.'],
  eldritch_adept_tasha:['Choose one Eldritch Invocation for which you meet the prerequisites.','Whenever you gain a level, you can replace the invocation with another eligible one.'],
  fighting_initiate_tasha:['Choose one Fighting Style available to the Fighter class.','Whenever you gain a level, you can replace the Fighting Style with another eligible one.'],
  gunner_tasha:['Increase Dexterity by 1.','Gain proficiency with firearms if they exist in the campaign.','Ignore the Loading property of firearms.','Being within 5 feet of a hostile creature does not impose Disadvantage on your ranged attack rolls.'],
  metamagic_adept_tasha:['Learn two Metamagic options from the Sorcerer class.','Gain 2 Sorcery Points usable only on Metamagic.','Sorcery Points return on a Long Rest.'],
  bountiful_luck_xanathar:['When an ally you can see within 30 feet rolls a 1 on a d20, you can use your Reaction to let the ally reroll.','You cannot use your Lucky trait before the end of your next turn.'],
  dragon_fear_xanathar:['Increase Strength, Constitution, or Charisma by 1.','Instead of exhaling destructive energy with Breath Weapon, roar to frighten nearby creatures.'],
  dragon_hide_xanathar:['Increase Strength, Constitution, or Charisma by 1.','Your scales harden, improving natural armor.','You grow retractable claws that can be used as natural weapons.'],
  drow_high_magic_xanathar:['Learn additional drow magic, including Detect Magic at will and higher-level spells once per Long Rest.','Uses Charisma as the spellcasting ability.'],
  dwarven_fortitude_xanathar:['Increase Constitution by 1.','Whenever you take the Dodge action in combat, you can spend one Hit Die to heal.'],
  elven_accuracy_xanathar:['Increase Dexterity, Intelligence, Wisdom, or Charisma by 1.','When you have Advantage on an attack using Dexterity, Intelligence, Wisdom, or Charisma, you can reroll one of the dice once.'],
  fade_away_xanathar:['Increase Dexterity or Intelligence by 1.','After taking damage, use a Reaction to magically become Invisible until the end of your next turn or until you attack, deal damage, or force a save.'],
  fey_teleportation_xanathar:['Increase Intelligence or Charisma by 1.','Learn Sylvan.','Learn Misty Step and cast it once per Short or Long Rest.'],
  flames_of_phlegethos_xanathar:['Increase Intelligence or Charisma by 1.','When rolling Fire damage for a spell, reroll any 1 on the damage dice.','After casting a Fire spell, wreathe yourself in flames that can damage nearby attackers.'],
  infernal_constitution_xanathar:['Increase Constitution by 1.','Gain resistance to Cold and Poison damage.','Gain Advantage on saving throws against being Poisoned.'],
  orcish_fury_xanathar:['Increase Strength or Constitution by 1.','Once per Short or Long Rest, add an extra weapon damage die when you hit.','When Relentless Endurance triggers, you can make one weapon attack as a Reaction.'],
  prodigy_xanathar:['Gain one skill proficiency, one tool proficiency, and one language.','Gain Expertise in one skill you are proficient with.'],
  second_chance_xanathar:['Increase Dexterity, Constitution, or Charisma by 1.','When a creature hits you with an attack, use your Reaction to force a reroll.'],
  squat_nimbleness_xanathar:['Increase Strength or Dexterity by 1.','Increase walking speed by 5 feet.','Gain proficiency in Acrobatics or Athletics.','Gain Advantage to escape being Grappled.'],
  svirfneblin_magic_xanathar:['Learn innate deep gnome magic such as Nondetection and other illusion/abjuration spells as defined by the feat.'],
  wood_elf_magic_xanathar:['Learn one Druid cantrip.','Learn Longstrider and Pass without Trace, each castable once per Long Rest.','Wisdom is your spellcasting ability for these spells.']
};
function featMechanicsLines(ft, fs){
  if (!ft) return [];
  let lines = [];
  if (ft.description) lines.push(ft.description);
  if (FEAT_MECHANICS[ft.id]) lines.push(...FEAT_MECHANICS[ft.id]);

  // Avoid redundant Ability Increase text. Some feat mechanic summaries already
  // include "Increase Strength or Dexterity by 1" or similar, so we don't
  // add a second generic "Ability Increase: +1..." line in those cases.
  const hasAbilityIncreaseLine = lines.some(line =>
    /increase .* by 1/i.test(line) || /ability increase/i.test(line)
  );
  if (ft.bonus === 1) {
    if (!hasAbilityIncreaseLine) {
      const abilityList = (ft.abilities || ATTRS.map(a=>a.label)).join(', ');
      lines.push(`Ability Increase: +1 to one of: ${abilityList}.`);
    }
    if (fs?.ability) {
      const chosen = ATTRS.find(a=>a.id===fs.ability)?.label || fs.ability;
      lines.push(`Currently applied: ${chosen} +1.`);
    }
  }
  if (ft.note) lines.push(ft.note);

  // Normalize repeated punctuation/spacing and remove exact duplicates after trim.
  const seen = new Set();
  return lines.map(line => String(line).replace(/\s+/g,' ').trim())
    .filter(Boolean)
    .filter(line => { const key=line.toLowerCase(); if(seen.has(key)) return false; seen.add(key); return true; });
}
function renderMechanicsBlock(titleText, lines){
  const details=document.createElement('div');
  details.className='selectedFeatureDetails';
  const title=document.createElement('div');
  title.innerHTML=`<strong>${titleText}</strong>`;
  details.appendChild(title);
  if (lines.length) {
    const ul=document.createElement('ul');
    ul.className='featureDesc';
    lines.forEach(line=>{ const li=document.createElement('li'); li.textContent=line; ul.appendChild(li); });
    details.appendChild(ul);
  }
  return details;
}

function renderFeatPicker(lvl, feat){
  const wrap=document.createElement('div'); wrap.className='featPicker';
  const fk=featKey(lvl, feat.id); if(!state.feats[fk]) state.feats[fk]={featId:'asi',asiMode:'+2'};
  const fs=state.feats[fk]; const sel=document.createElement('select');
  const usedFeats = chosenFeatIds(fk);
  featsForLevel(lvl, feat).forEach(f=>{ const o=document.createElement('option'); o.value=f.id; const used=usedFeats.has(f.id); o.textContent=`Lvl ${f.level}+ — ${f.name}${used?' — already chosen':''}`; o.disabled=used; sel.appendChild(o); });
  sel.value=fs.featId || 'asi'; sel.addEventListener('change',e=>{state.feats[fk]={featId:e.target.value,asiMode:'+2'}; render();});
  wrap.append('Feat/ASI: ', sel);
  if (fs.featId === 'asi') {
    const mode=document.createElement('select'); ['+2','+1/+1'].forEach(m=>{const o=document.createElement('option');o.value=m;o.textContent=m;mode.appendChild(o);}); mode.value=fs.asiMode||'+2';
    mode.addEventListener('change',e=>{fs.asiMode=e.target.value; render();}); wrap.append(' Mode: ',mode);
    const a=document.createElement('select'); fillAttrSelect(a,null,fs.asiA,true); a.addEventListener('change',e=>{fs.asiA=e.target.value; render();}); wrap.append(' Ability: ',a);
    if ((fs.asiMode||'+2') === '+1/+1') { const b=document.createElement('select'); fillAttrSelect(b,null,fs.asiB,true); b.addEventListener('change',e=>{fs.asiB=e.target.value; render();}); wrap.append(' Second: ',b); }
  } else {
    const ft=(PLANNER_DATA.feats||[]).find(f=>f.id===fs.featId);
    if (ft?.bonus === 1) { const a=document.createElement('select'); fillAttrSelect(a,ft.abilities||null,fs.ability,true); a.addEventListener('change',e=>{fs.ability=e.target.value; render();}); wrap.append(' Ability +1: ',a); }
    if (ft) {
      const selected = document.createElement('div');
      selected.className = 'inlineSelectionDetails featSelectedLink';
      selected.append('Selected Feat: ');
      selected.appendChild(featLinkNode(ft, fs));
      wrap.appendChild(selected);
    }
    const lines = featMechanicsLines(ft, fs);
    if (lines.length) wrap.appendChild(renderMechanicsBlock(`${ft.name} Mechanics`, lines));
  }
  return wrap;
}

function renderSummary(){
  const c = currentClass(); const bg=currentBackground(); const lines = [];
  lines.push(`Character: ${$('charName').value || '(unnamed)'}`);
  const sp=currentSpecies();
  lines.push(`Class: ${c.name}`); lines.push(`Level: ${state.level}`); if(bg) lines.push(`Origin: ${bg.name} — Feat: ${bg.feat}`); if(sp) lines.push(`Species: ${sp.name}`);
  lines.push(''); lines.push('Ability Scores — Point Buy + Origin + Feats:');
  const bonuses=bonusMap(); ATTRS.forEach(a => lines.push(`${a.label}: ${state.attributes[a.id]} + ${bonuses[a.id]} = ${totalAttr(a.id)} (${modText(modifier(totalAttr(a.id)))})`));
  lines.push(`Points used: ${pointBuyUsed()}/27`); lines.push(`Main source: ${c.source}, reference ${c.pageRef}`); lines.push(''); lines.push('Selections:');
  for (let lvl=1; lvl<=state.level; lvl++) allFeaturesForLevel(c,lvl).forEach(feat => {
    lines.push(`Level ${lvl} — ${feat.name}`);
    const isASI = feat.id.startsWith('asi_') || feat.name.includes('Epic Boon');
    if (isASI) { const fs=state.feats[featKey(lvl, feat.id)]; if(fs) lines.push(`   - ${fs.featId}`); }
    else if (feat.type.includes('choice') || feat.type.includes('Choice')) for (let i=0;i<(feat.count||1);i++) { const opts=feat.options||['']; const saved=state.choices[key(lvl, feat.id, i)]; lines.push(`   - ${opts.includes(saved) ? saved : opts[0]}`); }
  });
  $('summary').textContent = lines.join('\n');
}
function save(){ state.charName = $('charName').value; state.classId = $('classSelect').value; state.backgroundId=$('backgroundSelect').value; state.speciesId=$('speciesSelect')?.value||state.speciesId; state.level = clampLevel($('levelInput').value); localStorage.setItem('dndPlannerState', JSON.stringify(state)); alert('Saved in this browser.'); }
function exportJSON(){ state.charName = $('charName').value; state.classId = $('classSelect').value; state.backgroundId=$('backgroundSelect').value; state.speciesId=$('speciesSelect')?.value||state.speciesId; state.level = clampLevel($('levelInput').value); const blob = new Blob([JSON.stringify(state,null,2)], {type:'application/json'}); const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = `character-${state.charName || 'dnd'}.json`; a.click(); }
function importJSON(e){ const f = e.target.files[0]; if(!f) return; const r = new FileReader(); r.onload = () => { state = JSON.parse(r.result); localStorage.setItem('dndPlannerState', JSON.stringify(state)); location.reload(); }; r.readAsText(f); }
init();


// beta 0.1.103 — Rules data audit pass 1.
// Adds source-driven spell option filtering, Warlock level 2 spell update,
// broader class spell availability panels, and stronger feat/skill tooltip fallbacks.
(function applyRulesAudit_0_1_103(){
  const SPELLCASTER_CLASS_IDS = new Set(['bard','cleric','druid','sorcerer','ranger','wizard','paladin','warlock']);
  const SPELL_LEVEL_LABEL = {1:'1st',2:'2nd',3:'3rd',4:'4th',5:'5th',6:'6th',7:'7th',8:'8th',9:'9th'};

  window.__classMaxSpellLevel = function(classId, characterLevel){
    const lvl = Math.max(1, Number(characterLevel || 1));
    if (classId === 'warlock') {
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
    if (classId === 'bard' || classId === 'cleric' || classId === 'druid' || classId === 'sorcerer' || classId === 'wizard') {
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
  };

  function addUniqueRaw(target, items){
    if (!Array.isArray(target) || !Array.isArray(items)) return;
    const seen = new Set(target.map(x => canonicalName(x).toLowerCase()));
    items.forEach(item => {
      const k = canonicalName(item).toLowerCase();
      if (!seen.has(k)) { target.push(item); seen.add(k); }
    });
  }

  window.__classSpellOptions = function(classId, characterLevel, includeCantrips=false){
    const out=[];
    const add=(arr)=>addUniqueRaw(out, arr||[]);
    if (includeCantrips) add(SPELLS[`${classId}_cantrips`]);
    const max = window.__classMaxSpellLevel(classId, characterLevel);
    for(let sl=1; sl<=max; sl++) add(SPELLS[`${classId}_${sl}`]);
    return out;
  };

  // Dynamic selectors/list sources keep old saves but display all legal options up to the shown class level.
  window.__rulesAuditAllowedOptions = function(feat, lvl){
    let opts = feat.options || [];
    const cls = currentClass()?.id;
    const fname = (feat.name || '').toLowerCase();
    const fid = (feat.id || '').toLowerCase();
    if (feat.type === 'spellChoice') {
      if (fname.includes('cantrip') || fid.includes('cantrip')) {
        opts = window.__classSpellOptions(cls, lvl, true).filter(x => {
          const meta = spellMeta(x);
          return (meta?.level || '').toLowerCase().includes('cantrip');
        });
        if (!opts.length) opts = SPELLS[`${cls}_cantrips`] || feat.options || [];
      } else if (SPELLCASTER_CLASS_IDS.has(cls)) {
        opts = window.__classSpellOptions(cls, lvl, false);
      }
    }
    if (cls === 'warlock' && (feat.name||'').toLowerCase().includes('invocation')) {
      opts = opts.filter(opt => !(String(opt).startsWith('Thirsting Blade') && lvl < 5));
    }
    return opts;
  };

  // Mutate PLANNER_DATA to expose missing level spell-selection hooks.
  function makeSpellChoice(id, name, count){ return {id, name, type:'spellChoice', count, options:[]}; }
  function makeSpellList(id, name){ return {id, name, type:'spellList', options:[]}; }
  function ensureFeature(classId, lvl, feature){
    const c = (PLANNER_DATA.classes||[]).find(x=>x.id===classId); if(!c) return;
    if (!c.levels[lvl]) c.levels[lvl]=[];
    if (!c.levels[lvl].some(f=>f.id===feature.id)) c.levels[lvl].push(feature);
  }

  // Warlock known-spell progression bugfix: level 2 gets a new spell selector.
  ensureFeature('warlock', 2, makeSpellChoice('warlock_pact_spell_update_2','Pact Spell Selection Update',1));

  // Add mechanical spell availability panels to all spellcasting classes at each spell level unlock.
  const unlocks = {
    bard:[1,3,5,7,9,11,13,15,17], cleric:[1,3,5,7,9,11,13,15,17], druid:[1,3,5,7,9,11,13,15,17], sorcerer:[1,3,5,7,9,11,13,15,17], wizard:[1,3,5,7,9,11,13,15,17],
    warlock:[1,3,5,7,9], ranger:[1,5,9,13,17], paladin:[1,5,9,13,17]
  };
  Object.entries(unlocks).forEach(([classId, levels])=>{
    levels.forEach(lvl=>{
      const max = window.__classMaxSpellLevel(classId, lvl);
      const name = `Available ${classId[0].toUpperCase()+classId.slice(1)} Spells up to ${SPELL_LEVEL_LABEL[max] || max}`;
      ensureFeature(classId, lvl, makeSpellList(`available_${classId}_spells_upto_${max}`, name));
    });
  });

  // Add broad spell selection/update selectors for classes with spells known/prepared so validation can happen at every relevant level.
  ['bard','sorcerer','warlock'].forEach(classId=>{
    for(let lvl=2; lvl<=10; lvl++) ensureFeature(classId,lvl,makeSpellChoice(`${classId}_spell_selection_update_${lvl}`,'Spell Selection Update',1));
  });
  for(let lvl=2; lvl<=20; lvl++) ensureFeature('wizard',lvl,makeSpellChoice(`wizard_spellbook_update_${lvl}`,'Spellbook Spells Added',2));
  ['cleric','druid','ranger','paladin'].forEach(classId=>{
    for(let lvl=2; lvl<=20; lvl++) ensureFeature(classId,lvl,makeSpellList(`${classId}_prepared_spell_reference_${lvl}`,'Prepared Spell Reference'));
  });

  PLANNER_DATA.version = 'beta-0.1.119-en-us';
  PLANNER_DATA.note = 'beta 0.1.103 EN-US: rules data audit pass 1, Warlock spell progression fix, dynamic class spell lists, spell availability panels, Thirsting Blade gate preserved, feat/skill tooltip fallbacks improved.';
})();

// Override option filtering with the rules-audit version.
function allowedOptionsForFeature(feat, lvl){
  if (window.__rulesAuditAllowedOptions) return window.__rulesAuditAllowedOptions(feat, lvl);
  let opts = feat.options || [];
  if (currentClass()?.id === 'warlock' && (feat.name||'').toLowerCase().includes('invocation')) {
    opts = opts.filter(opt => !(String(opt).startsWith('Thirsting Blade') && lvl < 5));
  }
  return opts;
}

// Render spell lists from the dynamic class spell engine when the feature is a reference panel.
function renderSpellList(feat){
  const box = document.createElement('div'); box.className='spellListBox';
  const cls = currentClass()?.id;
  let list = feat.options || [];
  if ((!list || !list.length) && window.__classSpellOptions && cls) list = window.__classSpellOptions(cls, state.level || 1, false);
  box.innerHTML = `<b>Available list for validation:</b> <span class="muted">${list.length} options</span>`;
  const details=document.createElement('details');
  const summary=document.createElement('summary'); summary.textContent='Show list'; details.appendChild(summary);
  const ul=document.createElement('ul'); ul.className='spellList';
  list.forEach(item=>{const li=document.createElement('li'); li.appendChild(optionLabelNode(feat, item)); ul.appendChild(li);});
  details.appendChild(ul); box.appendChild(details); return box;
}

// Stronger feat tooltip fallback: every feat should show usable data, never only a placeholder.
function featTooltipHtmlFromFeat(ft, fs={}){
  if (!ft) return '';
  const rows=[];
  rows.push(`<strong>${ft.name}</strong>`);
  if (ft.source) rows.push(`<b>Source:</b> ${ft.source}`);
  if (ft.level) rows.push(`<b>Minimum Level:</b> ${ft.level}`);
  if (ft.prereq || ft.prerequisite) rows.push(`<b>Prerequisite:</b> ${ft.prereq || ft.prerequisite}`);
  const lines = featMechanicsLines(ft, fs);
  if (lines.length) rows.push(...lines.map(line=>`• ${line}`));
  if (!lines.length && ft.bonus === 1) rows.push(`• Ability Increase: +1 to ${ft.abilities ? ft.abilities.join(', ') : 'one ability'}.`);
  if (!lines.length && !ft.bonus) rows.push('• Mechanical details pending validation from the feat database.');
  return rows.join('<br>');
}

// More explicit spell tooltip fallback. No “see source” placeholders.
function spellMeta(raw){
  const name = canonicalName(raw);
  const indexed = spellIndex()[name] || {};
  const meta = SPELL_META[name] || {};
  if (!SPELL_META[name] && !indexed.level) return null;
  return Object.assign({
    level: indexed.level || 'Pending validation',
    school: 'Pending validation',
    casting: 'Pending validation',
    range: 'Pending validation',
    components: 'Pending validation',
    duration: 'Pending validation',
    text: 'Mechanical stat block pending detailed validation.'
  }, indexed, meta);
}

// Refresh after data mutation.
try { render(); } catch(e) { console.warn('beta 0.1.103 refresh skipped', e); }


// beta 0.1.103 — pending fixes and Origin Feat generated choices.
(function applyBeta_0_1_103(){
  // Version marker
  if (typeof PLANNER_DATA !== 'undefined') {
    PLANNER_DATA.version = 'beta-0.1.119-en-us';
    PLANNER_DATA.note = 'beta 0.1.103 EN-US: Origin Feat level 1 choice menus, Hex damage dice tooltip fix, persistent/manual level collapse behavior.';
  }

  // 1) Hex tooltip/stat block fix: explicitly show the extra damage dice.
  if (typeof SPELL_META !== 'undefined' && SPELL_META['Hex']) {
    SPELL_META['Hex'].damage = '+1d6 Necrotic damage on each hit you make against the target';
    SPELL_META['Hex'].text = 'Bonus Action to mark a creature. Until the spell ends, you deal an extra 1d6 Necrotic damage to the target whenever you hit it with an attack. Also choose one ability; the target has Disadvantage on ability checks using that ability.';
  }

  // 2) Persistent manual level open/close state.
  if (!state.openLevels) state.openLevels = {};
  function levelOpenKey(classId, lvl){ return `${classId}|${lvl}`; }
  function getLevelOpen(classId, lvl){
    const k = levelOpenKey(classId, lvl);
    // Default is open. The user must manually collapse it.
    return state.openLevels[k] !== false;
  }
  function setLevelOpen(classId, lvl, open){
    state.openLevels[levelOpenKey(classId, lvl)] = !!open;
  }

  // 3) Background/Origin Feat generated Level 1 choices.
  function sourceSpellListForMagicInitiate(source, kind){
    const key = source.toLowerCase();
    if (kind === 'cantrips') return (SPELLS && SPELLS[`${key}_cantrips`]) || [];
    if (kind === 'level1') return (SPELLS && SPELLS[`${key}_1`]) || [];
    return [];
  }
  function originFeatFeaturesForLevel(lvl){
    if (Number(lvl) !== 1) return [];
    const bg = currentBackground && currentBackground();
    if (!bg || !bg.feat) return [];
    const featName = String(bg.feat);
    const out = [];
    const base = {scope:'originFeat'};

    const mi = featName.match(/Magic Initiate \((Cleric|Druid|Wizard)\)/i);
    if (mi) {
      const listName = mi[1][0].toUpperCase() + mi[1].slice(1).toLowerCase();
      out.push(Object.assign({}, base, {
        id:`origin_magic_initiate_${listName.toLowerCase()}_cantrips`,
        name:`Origin Feat — Magic Initiate (${listName}) Cantrips`,
        type:'originSpellChoice',
        count:2,
        options:sourceSpellListForMagicInitiate(listName, 'cantrips'),
        desc:`Choose two ${listName} cantrips granted by your Origin Feat.`
      }));
      out.push(Object.assign({}, base, {
        id:`origin_magic_initiate_${listName.toLowerCase()}_spell`,
        name:`Origin Feat — Magic Initiate (${listName}) Level 1 Spell`,
        type:'originSpellChoice',
        count:1,
        options:sourceSpellListForMagicInitiate(listName, 'level1'),
        desc:`Choose one level 1 ${listName} spell granted by your Origin Feat. It can be cast once per Long Rest without a spell slot.`
      }));
      out.push(Object.assign({}, base, {
        id:`origin_magic_initiate_${listName.toLowerCase()}_ability`,
        name:`Origin Feat — Magic Initiate (${listName}) Spellcasting Ability`,
        type:'choice',
        count:1,
        options:['Intelligence','Wisdom','Charisma'],
        desc:'Choose the spellcasting ability for the spells granted by this Origin Feat.'
      }));
    }

    if (/Skilled/i.test(featName)) {
      const skills = ['Acrobatics','Animal Handling','Arcana','Athletics','Deception','History','Insight','Intimidation','Investigation','Medicine','Nature','Perception','Performance','Persuasion','Religion','Sleight of Hand','Stealth','Survival'];
      const tools = ['Alchemist’s Supplies','Brewer’s Supplies','Calligrapher’s Supplies','Carpenter’s Tools','Cartographer’s Tools','Cobbler’s Tools','Cook’s Utensils','Glassblower’s Tools','Jeweler’s Tools','Leatherworker’s Tools','Mason’s Tools','Painter’s Supplies','Potter’s Tools','Smith’s Tools','Tinker’s Tools','Weaver’s Tools','Woodcarver’s Tools','Disguise Kit','Forgery Kit','Herbalism Kit','Navigator’s Tools','Poisoner’s Kit','Thieves’ Tools'];
      out.push(Object.assign({}, base, {
        id:'origin_skilled_choices',
        name:'Origin Feat — Skilled Proficiencies',
        type:'choice',
        count:3,
        options:[...skills, ...tools],
        desc:'Choose any combination of three skills or tools granted by the Skilled Origin Feat.'
      }));
    }

    if (/Crafter/i.test(featName)) {
      const artisan = ['Alchemist’s Supplies','Brewer’s Supplies','Calligrapher’s Supplies','Carpenter’s Tools','Cartographer’s Tools','Cobbler’s Tools','Cook’s Utensils','Glassblower’s Tools','Jeweler’s Tools','Leatherworker’s Tools','Mason’s Tools','Painter’s Supplies','Potter’s Tools','Smith’s Tools','Tinker’s Tools','Weaver’s Tools','Woodcarver’s Tools'];
      out.push(Object.assign({}, base, {
        id:'origin_crafter_tools',
        name:'Origin Feat — Crafter Tool Proficiencies',
        type:'choice',
        count:3,
        options:artisan,
        desc:'Choose three Artisan’s Tools granted by the Crafter Origin Feat.'
      }));
    }

    if (/Musician/i.test(featName)) {
      const instruments = ['Bagpipes','Drum','Dulcimer','Flute','Horn','Lute','Lyre','Pan Flute','Shawm','Viol'];
      out.push(Object.assign({}, base, {
        id:'origin_musician_instruments',
        name:'Origin Feat — Musician Instrument Proficiencies',
        type:'choice',
        count:3,
        options:instruments,
        desc:'Choose three Musical Instruments granted by the Musician Origin Feat.'
      }));
    }

    return out;
  }

  // Override allFeaturesForLevel to inject Origin Feat generated choices at Level 1.
  const previousAllFeaturesForLevel = allFeaturesForLevel;
  allFeaturesForLevel = function(c, lvl){
    const existing = previousAllFeaturesForLevel(c, lvl) || [];
    if (Number(lvl) === 1) {
      const extra = originFeatFeaturesForLevel(lvl);
      const existingIds = new Set(existing.map(f=>f.id));
      extra.forEach(f=>{ if(!existingIds.has(f.id)) existing.push(f); });
    }
    return existing;
  };

  // Override render to preserve/manualize level block collapse state.
  render = function(){
    state.classId = $('classSelect').value;
    state.backgroundId = $('backgroundSelect').value;
    state.speciesId = $('speciesSelect')?.value || state.speciesId;
    state.level = clampLevel($('levelInput').value);
    renderOrigin(); renderSpeciesDetails(); renderAttributes();
    const c = currentClass(); const box = $('features'); box.innerHTML = '';
    for (let lvl=1; lvl<=state.level; lvl++) {
      const feats = allFeaturesForLevel(c, lvl); if (!feats.length) continue;
      const block = document.createElement('details');
      block.className = 'levelBlock levelDropdown';
      block.open = getLevelOpen(c.id, lvl);
      block.addEventListener('toggle', () => { setLevelOpen(c.id, lvl, block.open); });

      const summary = document.createElement('summary');
      summary.className = 'levelSummary';
      const unlockNames = feats.map(f => f.name).join(' • ');
      summary.innerHTML = `<span class="levelTitle">Level ${lvl}</span><span class="levelUnlocks">${unlockNames}</span>`;
      block.appendChild(summary);

      const content = document.createElement('div');
      content.className = 'levelContent';
      feats.forEach(feat => content.appendChild(renderFeature(lvl, feat)));
      block.appendChild(content);
      box.appendChild(block);
    }
    renderSummary();
  };

  // Override save/export to persist open states and version data cleanly.
  const previousSave = save;
  save = function(){
    state.charName = $('charName').value;
    state.classId = $('classSelect').value;
    state.backgroundId=$('backgroundSelect').value;
    state.speciesId=$('speciesSelect')?.value||state.speciesId;
    state.level = clampLevel($('levelInput').value);
    state.plannerVersion = 'beta 0.1.103 EN-US';
    localStorage.setItem('dndPlannerState', JSON.stringify(state));
    alert('Saved in this browser.');
  };
  exportJSON = function(){
    state.charName = $('charName').value;
    state.classId = $('classSelect').value;
    state.backgroundId=$('backgroundSelect').value;
    state.speciesId=$('speciesSelect')?.value||state.speciesId;
    state.level = clampLevel($('levelInput').value);
    state.plannerVersion = 'beta 0.1.103 EN-US';
    const blob = new Blob([JSON.stringify(state,null,2)], {type:'application/json'});
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `character-${state.charName || 'dnd'}.json`;
    a.click();
  };

  try { render(); } catch(e) { console.warn('beta 0.1.103 render refresh skipped', e); }
})();

// beta 0.1.109 EN-US — separated spell DB + invocation tooltip pass.
(function applyBeta_0_1_105(){
  if (typeof PLANNER_DATA !== 'undefined') {
    PLANNER_DATA.version = 'beta-0.1.119-en-us';
    PLANNER_DATA.note = 'beta 0.1.109 EN-US: consolidated spells_DB structure; spell stat blocks, class tags, planner dropdowns, and Spell Reference use one canonical offline file.';
  }

  // Merge the separated spell DB into the legacy tooltip meta so older code paths still work.
  if (typeof SPELL_META !== 'undefined' && window.SPELLS_DB) {
    Object.entries(window.SPELLS_DB).forEach(([name, meta]) => {
      SPELL_META[name] = Object.assign({}, SPELL_META[name] || {}, meta);
    });
  }

  // Invocation DB: condensed mechanical tooltips for selected Eldritch Invocations.
  window.INVOCATION_DB = Object.assign({}, window.INVOCATION_DB || {}, {
    'Agonizing Blast': {source:'PHB 2024', prereq:'Warlock cantrip: Eldritch Blast', text:'Add your Charisma modifier to the damage you deal with Eldritch Blast.'},
    'Armor of Shadows': {source:'PHB 2024', prereq:'None', text:'You can cast Mage Armor on yourself without expending a spell slot.'},
    'Devil’s Sight': {source:'PHB 2024', prereq:'None', text:'You can see normally in darkness, both magical and nonmagical, within the invocation range.'},
    'Eldritch Mind': {source:'PHB 2024', prereq:'None', text:'You have Advantage on Constitution saving throws that you make to maintain Concentration.'},
    'Eldritch Spear': {source:'PHB 2024', prereq:'Warlock cantrip: Eldritch Blast', text:'The range of Eldritch Blast increases.'},
    'Fiendish Vigor': {source:'PHB 2024', prereq:'None', text:'You can cast False Life on yourself without expending a spell slot.'},
    'Lessons of the First Ones': {source:'PHB 2024', prereq:'None', text:'Gain one Origin Feat of your choice that you qualify for.'},
    'Mask of Many Faces': {source:'PHB 2024', prereq:'None', text:'You can cast Disguise Self without expending a spell slot.'},
    'Misty Visions': {source:'PHB 2024', prereq:'None', text:'You can cast Silent Image without expending a spell slot.'},
    'Pact of the Blade': {source:'PHB 2024', prereq:'Warlock Level 1+', text:'Gain a pact weapon option. Supports weapon-focused Warlock mechanics.'},
    'Pact of the Chain': {source:'PHB 2024', prereq:'Warlock Level 1+', text:'Gain Find Familiar through your pact and access to special familiar options as defined by the invocation.'},
    'Pact of the Tome': {source:'PHB 2024', prereq:'Warlock Level 1+', text:'Gain a Book of Shadows and extra cantrip access as defined by the invocation.'},
    'Repelling Blast': {source:'PHB 2024', prereq:'Warlock cantrip: Eldritch Blast', text:'When you hit a creature with Eldritch Blast, you can push it away.'},
    'Thirsting Blade': {source:'PHB 2024', prereq:'Warlock Level 5; Pact of the Blade', text:'You can attack more than once when taking the Attack action with your pact weapon. Must not appear before Warlock Level 5.'}
  });

  function cleanInvocationName(raw){
    return canonicalName(String(raw || '').split('—')[0].trim());
  }
  window.invocationTooltipHtml = function(raw){
    const name = cleanInvocationName(raw);
    const meta = window.INVOCATION_DB[name];
    if (!meta) return `<strong>${name}</strong><br><em>Invocation mechanics pending validation.</em>`;
    const rows = [`<strong>${name}</strong>`];
    if (meta.source) rows.push(`<b>Source:</b> ${meta.source}`);
    if (meta.prereq) rows.push(`<b>Prerequisite:</b> ${meta.prereq}`);
    rows.push(`<b>Mechanics:</b> ${meta.text}`);
    return rows.join('<br>');
  };

  // Override spellMeta to use separated DB first and avoid Pending Validation when DB exists.
  spellMeta = function(raw){
    const name = canonicalName(raw);
    const indexed = spellIndex()[name] || {};
    const db = (window.SPELLS_DB && window.SPELLS_DB[name]) || {};
    const meta = (typeof SPELL_META !== 'undefined' && SPELL_META[name]) || {};
    if (!Object.keys(db).length && !Object.keys(meta).length && !indexed.level) return null;
    return Object.assign({
      level: indexed.level || 'Pending validation',
      school: 'Pending validation',
      casting: 'Pending validation',
      range: 'Pending validation',
      components: 'Pending validation',
      duration: 'Pending validation',
      text: 'Mechanical stat block pending detailed validation.'
    }, indexed, meta, db);
  };

  spellTooltipHtml = function(raw){
    const name = canonicalName(raw);
    const meta = spellMeta(raw);
    if (!meta) return `<strong>${name}</strong><br><em>Spell stat block pending validation.</em>`;
    const rows = [
      ['Source', meta.source], ['Level', meta.level], ['School', meta.school], ['Casting Time', meta.casting],
      ['Range', meta.range], ['Components', meta.components], ['Duration', meta.duration], ['Save', meta.save],
      ['Attack', meta.attack], ['Damage / Type', meta.damage], ['Healing', meta.healing], ['Scaling', meta.scaling]
    ].filter(([,v]) => v && !String(v).match(/^Pending validation$/i));
    let html = `<strong>${name}</strong>` + rows.map(([k,v]) => `<br><b>${k}:</b> ${v}`).join('');
    if (Array.isArray(meta.cantripProgression) && meta.cantripProgression.length) {
      html += `<br><b>Cantrip Progression:</b>` + meta.cantripProgression.map(x => `<br>• ${x}`).join('');
    }
    if (meta.text) html += `<br><b>Effect:</b> ${meta.text}`;
    return html;
  };

  // Override option tooltips so invocations receive mouseover links like spells/feats.
  optionTooltipHtml = function(feat, opt){
    const fname=(feat.name||'').toLowerCase();
    if (feat.type === 'spellChoice' || fname.includes('spell') || fname.includes('cantrip')) return spellTooltipHtml(opt);
    if (fname.includes('skill') || fname.includes('expertise')) return skillTooltipHtml(opt);
    if (fname.includes('invocation')) return window.invocationTooltipHtml(opt);
    return '';
  };
  optionLabelNode = function(feat, opt){
    const html = optionTooltipHtml(feat, opt);
    return html ? makeTooltipLink(displayName(opt), html) : document.createTextNode(opt);
  };

  // Force Hellish Rebuke and Hex values after all earlier patches.
  if (typeof SPELL_META !== 'undefined') {
    SPELL_META['Hellish Rebuke'] = Object.assign({}, SPELL_META['Hellish Rebuke'] || {}, window.SPELLS_DB['Hellish Rebuke']);
    SPELL_META['Hex'] = Object.assign({}, SPELL_META['Hex'] || {}, window.SPELLS_DB['Hex']);
  }

  // Version stamp for exported saves.
  const oldSave = save;
  save = function(){
    state.charName = $('charName').value;
    state.classId = $('classSelect').value;
    state.backgroundId=$('backgroundSelect').value;
    state.speciesId=$('speciesSelect')?.value||state.speciesId;
    state.level = clampLevel($('levelInput').value);
    state.plannerVersion = 'beta 0.1.109 EN-US';
    localStorage.setItem('dndPlannerState', JSON.stringify(state));
    alert('Saved in this browser.');
  };
  exportJSON = function(){
    state.charName = $('charName').value;
    state.classId = $('classSelect').value;
    state.backgroundId=$('backgroundSelect').value;
    state.speciesId=$('speciesSelect')?.value||state.speciesId;
    state.level = clampLevel($('levelInput').value);
    state.plannerVersion = 'beta 0.1.109 EN-US';
    const blob = new Blob([JSON.stringify(state,null,2)], {type:'application/json'});
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `character-${state.charName || 'dnd'}.json`;
    a.click();
  };

  try { render(); } catch(e) { console.warn('beta 0.1.105 render refresh skipped', e); }
})();


// beta 0.1.107 — Spell Reference tab / offline class spell index refresh.
// Uses the same SPELLS_DB and class spell option engine as the planner so validation is shared.
(function applySpellReferenceTab_0_1_106(){
  function ready(fn){
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', fn);
    else fn();
  }

  function spellSort(a,b){
    return String(canonicalName(a)).localeCompare(String(canonicalName(b)));
  }

  function spellLevelSortValue(label){
    const s=String(label||'').toLowerCase();
    if (s.includes('cantrip')) return 0;
    const m=s.match(/(\d+)/);
    return m ? Number(m[1]) : 99;
  }

  function spellLevelGroup(raw){
    const meta = spellMeta(raw) || (window.SPELLS_DB && window.SPELLS_DB[canonicalName(raw)]) || {};
    const lvl = meta.level || 'Pending validation';
    if (String(lvl).toLowerCase().includes('cantrip')) return 'Cantrips';
    return `${lvl} Level Spells`;
  }

  function allKnownClassIds(){
    const ids = new Set();
    (PLANNER_DATA.classes||[]).forEach(c=>ids.add(c.id));
    Object.keys(SPELLS||{}).forEach(k=>{
      const m=k.match(/^(.+?)_(cantrips|\d)$/);
      if (m) ids.add(m[1]);
    });
    return Array.from(ids);
  }

  function classDisplayName(classId){
    return (PLANNER_DATA.classes||[]).find(c=>c.id===classId)?.name || classId.replace(/\b\w/g, ch=>ch.toUpperCase());
  }

  function classSpellListForReference(classId){
    let items=[];
    if (window.__classSpellOptions) {
      items = window.__classSpellOptions(classId, 20, true) || [];
    }
    if (!items.length) {
      const add=(arr)=>{(arr||[]).forEach(x=>{if(!items.some(y=>canonicalName(y)===canonicalName(x))) items.push(x);});};
      add(SPELLS[`${classId}_cantrips`]);
      for(let i=1;i<=9;i++) add(SPELLS[`${classId}_${i}`]);
    }
    return items.sort(spellSort);
  }

  function buildSpellReferenceTab(){
    const main=document.querySelector('main');
    if (!main || document.getElementById('spellReferenceTab')) return;

    const tabs=document.createElement('nav');
    tabs.className='topTabs';
    tabs.setAttribute('aria-label','Planner tabs');
    const btnPlanner=document.createElement('button');
    btnPlanner.type='button'; btnPlanner.className='topTabButton active'; btnPlanner.textContent='Character Planner';
    const btnSpells=document.createElement('button');
    btnSpells.type='button'; btnSpells.className='topTabButton'; btnSpells.textContent='Spell Reference';
    tabs.append(btnPlanner, btnSpells);
    main.parentNode.insertBefore(tabs, main);

    const plannerPane=document.createElement('div');
    plannerPane.id='plannerTab';
    plannerPane.className='plannerTabPane';
    Array.from(main.children).forEach(child=>plannerPane.appendChild(child));
    main.appendChild(plannerPane);

    const spellPane=document.createElement('div');
    spellPane.id='spellReferenceTab';
    spellPane.className='plannerTabPane';
    spellPane.hidden=true;
    const card=document.createElement('section');
    card.className='card';
    card.innerHTML = `<h2>Spell Reference</h2><p class="spellReferenceIntro">Quick table consult and validation view. This tab uses the same offline spell database and class spell index used by the planner tooltips.</p>`;
    const container=document.createElement('div');
    container.id='spellReferenceContent';
    card.appendChild(container);
    spellPane.appendChild(card);
    main.appendChild(spellPane);

    function show(which){
      const spells = which === 'spells';
      spellPane.hidden = !spells;
      plannerPane.hidden = spells;
      btnSpells.classList.toggle('active', spells);
      btnPlanner.classList.toggle('active', !spells);
      if (spells) renderSpellReferenceContent();
    }
    btnPlanner.addEventListener('click', ()=>show('planner'));
    btnSpells.addEventListener('click', ()=>show('spells'));
  }

  function renderSpellReferenceContent(){
    const box=document.getElementById('spellReferenceContent');
    if (!box) return;
    box.innerHTML='';
    allKnownClassIds().sort((a,b)=>classDisplayName(a).localeCompare(classDisplayName(b))).forEach(classId=>{
      const spells=classSpellListForReference(classId);
      if (!spells.length) return;
      const byLevel=new Map();
      spells.forEach(sp=>{
        const group=spellLevelGroup(sp);
        if(!byLevel.has(group)) byLevel.set(group, []);
        byLevel.get(group).push(sp);
      });
      const classDetails=document.createElement('details');
      classDetails.className='spellClassBlock';
      const sum=document.createElement('summary');
      sum.innerHTML = `${classDisplayName(classId)} <span class="spellReferenceCount">${spells.length} spells/cantrips</span>`;
      classDetails.appendChild(sum);
      Array.from(byLevel.keys()).sort((a,b)=>spellLevelSortValue(a)-spellLevelSortValue(b)).forEach(group=>{
        const levelDetails=document.createElement('details');
        levelDetails.className='spellLevelBlock';
        levelDetails.open = group === 'Cantrips';
        const levelSummary=document.createElement('summary');
        const groupItems=byLevel.get(group).sort(spellSort);
        levelSummary.innerHTML = `${group} <span class="spellReferenceCount">${groupItems.length}</span>`;
        levelDetails.appendChild(levelSummary);
        const ul=document.createElement('ul');
        ul.className='spellReferenceList';
        groupItems.forEach(sp=>{
          const li=document.createElement('li');
          li.appendChild(makeTooltipLink(canonicalName(sp), spellTooltipHtml(sp), 'rulesLink spellRulesLink'));
          ul.appendChild(li);
        });
        levelDetails.appendChild(ul);
        classDetails.appendChild(levelDetails);
      });
      box.appendChild(classDetails);
    });
  }

  ready(function(){
    buildSpellReferenceTab();
    window.renderSpellReferenceContent = renderSpellReferenceContent;
  });
})();

// beta 0.1.109 EN-US — make planner spell selectors and Spell Reference read from SPELLS_DB metadata.
(function applyConsolidatedSpellRegistry_0_1_108(){
  if (!window.SPELL_REGISTRY) return;

  const oldClassSpellOptions = window.__classSpellOptions;
  window.__classSpellOptions = function(classId, characterLevel, includeCantrips=false){
    const fromDb = window.SPELL_REGISTRY.getClassSpells(classId, characterLevel, includeCantrips);
    if (fromDb && fromDb.length) return fromDb;
    return oldClassSpellOptions ? oldClassSpellOptions(classId, characterLevel, includeCantrips) : [];
  };

  const oldSpellMeta = spellMeta;
  spellMeta = function(raw){
    const name = canonicalName(raw);
    const db = window.SPELL_REGISTRY.getSpell(name) || (window.SPELLS_DB && window.SPELLS_DB[name]);
    const old = oldSpellMeta ? oldSpellMeta(raw) : null;
    if (!db && old) return old;
    if (!db) return null;
    const clsText = db.classes ? Object.entries(db.classes).map(([cls,lvls])=>`${cls} ${lvls.map(l=>l===0?'Cantrip':l).join('/')}`).join('; ') : '';
    return Object.assign({}, old || {}, db, {
      classTags: clsText,
      source: db.sources && db.sources.length ? db.sources.join(', ') : (db.source || old?.source || 'PHB 2024 / Supplements')
    });
  };

  const oldSpellTooltipHtml = spellTooltipHtml;
  spellTooltipHtml = function(raw){
    const html = oldSpellTooltipHtml ? oldSpellTooltipHtml(raw) : '';
    const meta = spellMeta(raw);
    if (!meta) return html;
    const tags = meta.classTags ? `<br><b>Lists:</b> ${meta.classTags}` : '';
    if (html && tags && !html.includes('<b>Lists:</b>')) return html + tags;
    return html;
  };

  if (typeof PLANNER_DATA !== 'undefined') {
    PLANNER_DATA.version = 'beta-0.1.119-en-us';
    PLANNER_DATA.note = 'beta 0.1.109 EN-US: spells_DB.js is the only spell data source; both planner spell menus and Spell Reference tab read from the same offline registry.';
  }

  try { render(); } catch(e) { console.warn('beta 0.1.108 render refresh skipped', e); }
})();
