// D&D Monster Library
// Edit this file to add or modify monsters.
// This is a JS wrapper so it works with file:// protocol.
window.MONSTER_DATA = [
  {
    "name": "Basilisk",
    "size": "Medium",
    "type": "Monstrosity",
    "alignment": "Unaligned",
    "source": "D&D 2024 Basic Rules",
    "ac": 15,
    "hp": 52,
    "hitDice": "8d8 + 16",
    "initiative": "-1 (9)",
    "speed": "20 ft.",
    "cr": "3 (XP 700; PB +2)",
    "abilities": {
      "str": {
        "score": 16,
        "save": null
      },
      "dex": {
        "score": 8,
        "save": null
      },
      "con": {
        "score": 15,
        "save": null
      },
      "int": {
        "score": 2,
        "save": null
      },
      "wis": {
        "score": 8,
        "save": null
      },
      "cha": {
        "score": 7,
        "save": null
      }
    },
    "skills": "",
    "resistances": "",
    "immunities": "",
    "vulnerabilities": "",
    "conditionImmunities": "",
    "senses": "Darkvision 60 ft., Passive Perception 9",
    "languages": "None",
    "gear": "",
    "traits": [],
    "actions": [
      {
        "name": "Bite",
        "description": "Melee Attack Roll: +5, reach 5 ft. Hit: 10 (2d6 + 3) Piercing damage plus 7 (2d6) Poison damage."
      }
    ],
    "bonusActions": [
      {
        "name": "Petrifying Gaze (Recharge 4\u20136)",
        "description": "Constitution Saving Throw: DC 12, each creature in a 30-foot Cone. If the basilisk sees its reflection in the Cone, the basilisk must make this save. First Failure: The target has the Restrained condition and repeats the save at the end of its next turn if it is still Restrained, ending the effect on itself on a success. Second Failure: The target has the Petrified condition instead of the Restrained condition."
      }
    ],
    "reactions": [],
    "legendaryPreamble": "",
    "legendaryActions": [],
    "mythicPreamble": "",
    "mythicActions": [],
    "lairActions": [],
    "description": "",
    "habitat": "",
    "treasure": ""
  },
  {
    "name": "Bearded Devil",
    "size": "Medium",
    "type": "Fiend (Devil)",
    "alignment": "Lawful Evil",
    "source": "D&D 2024 Basic Rules",
    "ac": 13,
    "hp": 58,
    "hitDice": "9d8 + 18",
    "initiative": "+2 (12)",
    "speed": "30 ft.",
    "cr": "3 (XP 700; PB +2)",
    "abilities": {
      "str": {
        "score": 16,
        "save": 5
      },
      "dex": {
        "score": 15,
        "save": null
      },
      "con": {
        "score": 15,
        "save": 4
      },
      "int": {
        "score": 9,
        "save": null
      },
      "wis": {
        "score": 11,
        "save": null
      },
      "cha": {
        "score": 14,
        "save": 4
      }
    },
    "skills": "",
    "resistances": "Cold",
    "immunities": "Fire, Poison; Frightened, Poisoned",
    "vulnerabilities": "",
    "conditionImmunities": "",
    "senses": "Darkvision 120 ft. (unimpeded by magical Darkness), Passive Perception 10",
    "languages": "Infernal; telepathy 120 ft.",
    "gear": "",
    "traits": [
      {
        "name": "Magic Resistance",
        "description": "The devil has Advantage on saving throws against spells and other magical effects."
      }
    ],
    "actions": [
      {
        "name": "Multiattack",
        "description": "The devil makes one Beard attack and one Infernal Glaive attack."
      },
      {
        "name": "Beard",
        "description": "Melee Attack Roll: +5, reach 5 ft. Hit: 7 (1d8 + 3) Piercing damage, and the target has the Poisoned condition until the start of the devil's next turn. Until this poison ends, the target can't regain Hit Points."
      },
      {
        "name": "Infernal Glaive",
        "description": "Melee Attack Roll: +5, reach 10 ft. Hit: 8 (1d10 + 3) Slashing damage. If the target is a creature and doesn't already have an infernal wound, it is subjected to the following effect. Constitution Saving Throw: DC 12. Failure: The target receives an infernal wound. While wounded, the target loses 5 (1d10) Hit Points at the start of each of its turns. The wound closes after 1 minute, after a spell restores Hit Points to the target, or after the target or a creature within 5 feet of it takes an action to stanch the wound, doing so by succeeding on a DC 12 Wisdom (Medicine) check."
      }
    ],
    "bonusActions": [],
    "reactions": [],
    "legendaryPreamble": "",
    "legendaryActions": [],
    "mythicPreamble": "",
    "mythicActions": [],
    "lairActions": [],
    "description": "",
    "habitat": "",
    "treasure": ""
  },
  {
    "name": "Celentan",
    "size": "Medium",
    "type": "Fey (Elf)",
    "alignment": "Chaotic Good",
    "source": "Matt",
    "ac": 19,
    "hp": 197,
    "hitDice": "26d8 + 80",
    "initiative": "+4 (14)",
    "speed": "50 ft.",
    "cr": "12 (8400 XP; PB +4)",
    "abilities": {
      "str": {
        "score": 18,
        "save": 8
      },
      "dex": {
        "score": 20,
        "save": 9
      },
      "con": {
        "score": 19,
        "save": 8
      },
      "int": {
        "score": 16,
        "save": 3
      },
      "wis": {
        "score": 17,
        "save": 3
      },
      "cha": {
        "score": 19,
        "save": 4
      }
    },
    "skills": "Deception +8, Perception +7, Athletics +8, Arcana +7",
    "resistances": "Fire, Cold or Psychic (based on aspect)",
    "immunities": "",
    "vulnerabilities": "",
    "conditionImmunities": "Charmed, Frightened",
    "senses": "Darkvision 60 ft., Passive Perception 17",
    "languages": "Common, Elvish, Sylvan",
    "traits": [
      {
        "name": "Fey Presence",
        "description": "Any non-eladrin creature that starts its turn within 60 feet of the eladrin must make a DC 16 Wisdom saving throw. On a failed save, the creature becomes frightened of or charmed by the eladrin for 1 minute. A creature can repeat the saving throw at the end of each of its turns, ending the effect on itself on a success. If a creature's saving throw is successful or the effect ends for it, the creature is immune to this eladrin's Fey Presence for the next 24 hours."
      },
      {
        "name": "Magic Resistance",
        "description": "The eladrin has advantage on saving throws against spells and other magical effects."
      }
    ],
    "actions": [
      {
        "name": "Multiattack",
        "description": "The eladrin makes two Curved sword attacks or two Magic surge attacks."
      },
      {
        "name": "Longsword",
        "description": "*Melee Weapon Attack*: +10 to hit, reach 5 ft., one target. *Hit*: 14 (2d8 + 4) slashing damage, or 16 (2d10 + 5) slashing damage if used with two hands, plus 9 (2d8) cold/fire/psychic damage, based on form."
      },
      {
        "name": "Magic surge",
        "description": "*Ranged Spell Attack*: +8 to hit, reach 120 ft., one target. *Hit*: 18 (4d8) cold/fire/psychic damage, based on form."
      },
      {
        "name": "Spellcasting",
        "description": "The eladrin casts one of the following spells, requiring no material components and using Intelligence as the spellcasting ability (spell save DC 16):\n\nAt will: *hold person, suggestion, minor restoration*\n\n 2/Day each: Greater restoration, Fire Ball (level 5 version), Wall of fire"
      }
    ],
    "bonusActions": [
      {
        "name": "Fey Step (Recharge 4\u20136)",
        "description": "The eladrin teleports, along with any equipment it is wearing or carrying, up to 30 feet to an unoccupied space it can see."
      }
    ],
    "reactions": [
      {
        "name": "Arcane rebuke",
        "description": "When the eladrin takes damage from a creature the eladrin can see within 60 feet of it, the eladrin can force that creature to make a DC 16 Constitution saving throw. On a failed save, the creature takes 11 (2d10) cold/fire/psychic damage, based on form."
      }
    ],
    "legendaryPreamble": "",
    "legendaryActions": [],
    "mythicPreamble": "",
    "mythicActions": [],
    "lairActions": [],
    "description": "",
    "habitat": "",
    "treasure": ""
  },
  {
    "name": "Displacer Beast",
    "size": "Large",
    "type": "Monstrosity",
    "alignment": "Lawful Evil",
    "source": "D&D 2024 Basic Rules",
    "ac": 13,
    "hp": 76,
    "hitDice": "9d10 + 27",
    "initiative": "+4 (14)",
    "speed": "40 ft.",
    "cr": "3 (XP 700; PB +2)",
    "abilities": {
      "str": {
        "score": 18,
        "save": null
      },
      "dex": {
        "score": 15,
        "save": null
      },
      "con": {
        "score": 16,
        "save": null
      },
      "int": {
        "score": 6,
        "save": null
      },
      "wis": {
        "score": 12,
        "save": null
      },
      "cha": {
        "score": 8,
        "save": null
      }
    },
    "skills": "",
    "resistances": "",
    "immunities": "",
    "vulnerabilities": "",
    "conditionImmunities": "",
    "senses": "Darkvision 60 ft., Passive Perception 11",
    "languages": "Understands Sylvan but can't speak",
    "gear": "",
    "traits": [
      {
        "name": "Avoidance",
        "description": "If the displacer beast is subjected to an effect that allows it to make a saving throw to take only half damage, it instead takes no damage if it succeeds on the save and half damage if it fails. It can't use this trait if it has the Incapacitated condition."
      },
      {
        "name": "Displacement",
        "description": "Attack rolls against the displacer beast have Disadvantage, since it projects an illusion that makes it appear to be near its actual location. This trait is suppressed while the displacer beast has the Incapacitated condition."
      }
    ],
    "actions": [
      {
        "name": "Multiattack",
        "description": "The displacer beast makes one Rend attack and one Tentacle attack."
      },
      {
        "name": "Rend",
        "description": "Melee Attack Roll: +6, reach 5 ft. Hit: 9 (1d10 + 4) Slashing damage. If the target is a Large or smaller creature, it has the Prone condition."
      },
      {
        "name": "Tentacle",
        "description": "Melee Attack Roll: +6, reach 10 ft. Hit: 11 (2d6 + 4) Piercing damage."
      }
    ],
    "bonusActions": [],
    "reactions": [],
    "legendaryPreamble": "",
    "legendaryActions": [],
    "mythicPreamble": "",
    "mythicActions": [],
    "lairActions": [],
    "description": "",
    "habitat": "",
    "treasure": ""
  },
  {
    "name": "Elanvirel",
    "size": "Medium",
    "type": "Fey (Elf)",
    "alignment": "Neutral Good",
    "source": "Matt",
    "ac": 19,
    "hp": 197,
    "hitDice": "26d8 + 80",
    "initiative": "+4 (14)",
    "speed": "50 ft.",
    "cr": "12 (8400 XP; PB +4)",
    "abilities": {
      "str": {
        "score": 14,
        "save": 2
      },
      "dex": {
        "score": 18,
        "save": 4
      },
      "con": {
        "score": 16,
        "save": 3
      },
      "int": {
        "score": 18,
        "save": 8
      },
      "wis": {
        "score": 19,
        "save": 8
      },
      "cha": {
        "score": 16,
        "save": 7
      }
    },
    "skills": "Insight +8, Perception +8, Nature +8, Arcana +8",
    "resistances": "Fire, Cold or Psychic (based on aspect)",
    "immunities": "",
    "vulnerabilities": "",
    "conditionImmunities": "Charmed, Frightened",
    "senses": "Darkvision 60 ft., Passive Perception 18",
    "languages": "Common, Elvish, Sylvan",
    "traits": [
      {
        "name": "Sorrowful Presence",
        "description": "Any non-eladrin creature that starts its turn within 60 feet of the eladrin must make a DC 16 Wisdom saving throw. On a failed save, the creature becomes charmed by the eladrin for 1 minute. While charmed in this way, the creature has disadvantage on ability checks and saving throws. The charmed creature can repeat the saving throw at the end of each of its turns, ending the effect on itself on a success. If a creature's saving throw is successful or the effect ends for it, the creature is immune to this eladrin's Sorrowful Presence for the next 24 hours. Whenever the eladrin deals damage to the charmed creature, the charmed creature can repeat the saving throw, ending the effect on itself on a success."
      },
      {
        "name": "Magic Resistance",
        "description": "The eladrin has advantage on saving throws against spells and other magical effects."
      }
    ],
    "actions": [
      {
        "name": "Multiattack",
        "description": "The eladrin makes two Curved sword attacks or two Magic surge attacks."
      },
      {
        "name": "Curved sword",
        "description": "*Melee Weapon Attack*: +7 to hit, reach 5 ft., one target. *Hit*: 13 (2d8 + 4) slashing damage, plus 9 (2d8) cold/fire/psychic damage, based on form."
      },
      {
        "name": "Magic surge",
        "description": "*Ranged Spell Attack*: +8 to hit, reach 120 ft., one target. *Hit*: 18 (4d8) cold/fire/psychic damage, based on form."
      },
      {
        "name": "Spellcasting",
        "description": "The eladrin casts one of the following spells, requiring no material components and using Intelligence as the spellcasting ability (spell save DC 16):\n\nAt will: *fog cloud, gust of wind, sleet storm, remove curse, minor restoration*\n\n 2/Day each: Greater restoration, Cone of cold"
      }
    ],
    "bonusActions": [
      {
        "name": "Fey Step (Recharge 4\u20136)",
        "description": "The eladrin teleports, along with any equipment it is wearing or carrying, up to 30 feet to an unoccupied space it can see."
      }
    ],
    "reactions": [
      {
        "name": "Arcane rebuke",
        "description": "When the eladrin takes damage from a creature the eladrin can see within 60 feet of it, the eladrin can force that creature to make a DC 16 Constitution saving throw. On a failed save, the creature takes 11 (2d10) cold/fire/psychic damage, based on form."
      }
    ],
    "legendaryPreamble": "",
    "legendaryActions": [],
    "mythicPreamble": "",
    "mythicActions": [],
    "lairActions": [],
    "description": "",
    "habitat": "",
    "treasure": ""
  },
  {
    "name": "Elven Lost Soul",
    "size": "Medium",
    "type": "Undead (Elf)",
    "alignment": "typically Chaotic Neutral",
    "source": "Homebrew",
    "ac": 12,
    "hp": 44,
    "hitDice": "8d8 + 8",
    "initiative": "+2",
    "speed": "0 ft., Fly 40 ft. (hover)",
    "cr": "2 (450 XP; PB +2)",
    "abilities": {
      "str": {
        "score": 6,
        "save": null
      },
      "dex": {
        "score": 14,
        "save": null
      },
      "con": {
        "score": 12,
        "save": null
      },
      "int": {
        "score": 12,
        "save": null
      },
      "wis": {
        "score": 14,
        "save": 4
      },
      "cha": {
        "score": 16,
        "save": 5
      }
    },
    "skills": "Insight +4, Performance +5, Perception +4",
    "resistances": "Acid, Cold, Fire, Lightning, Thunder; Bludgeoning, Piercing, and Slashing from nonmagical attacks",
    "immunities": "Necrotic, Poison",
    "vulnerabilities": "",
    "conditionImmunities": "Charmed, Exhaustion, Grappled, Paralyzed, Petrified, Poisoned, Prone, Restrained",
    "senses": "Darkvision 60 ft., Passive Perception 14",
    "languages": "Common, Elvish, Sylvan",
    "traits": [
      {
        "name": "Incorporeal Movement",
        "description": "The lost soul can move through other creatures and objects as if they were difficult terrain. It takes 5 (1d10) force damage if it ends its turn inside an object."
      },
      {
        "name": "Fey Ancestry",
        "description": "The lost soul retains fragments of its fey nature. It has advantage on saving throws against being charmed, and magic can't put it to sleep."
      },
      {
        "name": "Lingering Joy",
        "description": "The lost soul emanates a faint aura of warmth and nostalgia. Each creature of the lost soul's choice that starts its turn within 10 feet of it must succeed on a DC 13 Wisdom saving throw or become charmed until the start of its next turn. While charmed in this way, the creature is filled with bittersweet happiness and has disadvantage on attack rolls against the lost soul. A creature that succeeds on this save is immune to this lost soul's Lingering Joy for 24 hours."
      },
      {
        "name": "Undead Nature",
        "description": "The lost soul doesn't require air, food, drink, or sleep."
      }
    ],
    "actions": [
      {
        "name": "Sorrowful Touch",
        "description": "*Melee Spell Attack*: +5 to hit, reach 5 ft., one target. *Hit*: 10 (2d6 + 3) psychic damage. A creature hit by this attack feels a wave of profound melancholy but takes no visible wound."
      },
      {
        "name": "Echoes of the Feywild (Recharge 5\u20136)",
        "description": "*Wisdom Saving Throw*: DC 13, each creature within 20 feet that can hear the lost soul. *Failure*: 9 (2d8) psychic damage and the target has the Frightened condition until the end of its next turn as it is overwhelmed by visions of the Feywild forever lost. *Success*: Half damage and the creature is not frightened."
      }
    ],
    "bonusActions": [
      {
        "name": "Fey Step (Recharge 4\u20136)",
        "description": "The lost soul teleports, along with any equipment it is wearing or carrying, up to 30 feet to an unoccupied space it can see. When it reappears, flowers briefly bloom and wilt at its feet."
      }
    ],
    "reactions": [],
    "legendaryPreamble": "",
    "legendaryActions": [],
    "mythicPreamble": "",
    "mythicActions": [],
    "lairActions": [],
    "description": "An Elven Lost Soul is the lingering spirit of a Feywild elf who perished while carrying an unresolved sorrow \u2014 an unrequited love, a broken oath to the Seelie Court, or the destruction of a sacred grove. Unlike most undead, these spirits are not inherently malevolent. They drift through the world trailing faint music and the scent of wildflowers, their translucent forms still bearing the ethereal beauty of their former lives.\n\nThey laugh, they dance, they hum half-remembered songs \u2014 but beneath the joy lies a grief so deep it can wound the living. Those who linger too long near a Lost Soul may find themselves weeping without knowing why, or paralyzed by a longing for something they cannot name.\n\nMost Lost Souls haunt places of natural beauty \u2014 moonlit clearings, ancient elven ruins, or the banks of rivers where the boundary between the Material Plane and the Feywild grows thin. They are not hostile by nature, but their sorrow is a weapon they cannot fully control, and they may lash out when reminded of what they have lost.",
    "habitat": "Forest, Feywild Crossings, Ruins",
    "treasure": "Individual"
  },
  {
    "name": "Elven Lost Soul (Greater)",
    "size": "Medium",
    "type": "Undead (Elf)",
    "alignment": "typically Chaotic Neutral",
    "source": "Homebrew",
    "ac": 13,
    "hp": 82,
    "hitDice": "15d8 + 15",
    "initiative": "+3",
    "speed": "0 ft., Fly 40 ft. (hover)",
    "cr": "4 (1100 XP; PB +2)",
    "abilities": {
      "str": {
        "score": 6,
        "save": null
      },
      "dex": {
        "score": 16,
        "save": null
      },
      "con": {
        "score": 12,
        "save": null
      },
      "int": {
        "score": 14,
        "save": null
      },
      "wis": {
        "score": 16,
        "save": 5
      },
      "cha": {
        "score": 18,
        "save": 6
      }
    },
    "skills": "Insight +5, Performance +6, Perception +5, Persuasion +6",
    "resistances": "Acid, Cold, Fire, Lightning, Thunder; Bludgeoning, Piercing, and Slashing from nonmagical attacks",
    "immunities": "Necrotic, Poison",
    "vulnerabilities": "",
    "conditionImmunities": "Charmed, Exhaustion, Grappled, Paralyzed, Petrified, Poisoned, Prone, Restrained",
    "senses": "Darkvision 60 ft., Passive Perception 15",
    "languages": "Common, Elvish, Sylvan",
    "traits": [
      {
        "name": "Incorporeal Movement",
        "description": "The lost soul can move through other creatures and objects as if they were difficult terrain. It takes 5 (1d10) force damage if it ends its turn inside an object."
      },
      {
        "name": "Fey Ancestry",
        "description": "The lost soul retains fragments of its fey nature. It has advantage on saving throws against being charmed, and magic can't put it to sleep."
      },
      {
        "name": "Lingering Joy",
        "description": "The lost soul emanates a powerful aura of warmth and nostalgia. Each creature of the lost soul's choice that starts its turn within 15 feet of it must succeed on a DC 14 Wisdom saving throw or become charmed until the start of its next turn. While charmed in this way, the creature is filled with bittersweet happiness and has disadvantage on attack rolls against the lost soul. A creature that succeeds on this save is immune to this lost soul's Lingering Joy for 24 hours."
      },
      {
        "name": "Between Worlds",
        "description": "The lost soul exists on the threshold between the Material Plane and the Feywild. It can see 60 feet into the Feywild when on the Material Plane, and vice versa. As a bonus action, it can become visible or invisible to creatures on the opposite plane."
      },
      {
        "name": "Undead Nature",
        "description": "The lost soul doesn't require air, food, drink, or sleep."
      }
    ],
    "actions": [
      {
        "name": "Multiattack",
        "description": "The lost soul makes two Sorrowful Touch attacks."
      },
      {
        "name": "Sorrowful Touch",
        "description": "*Melee Spell Attack*: +6 to hit, reach 5 ft., one target. *Hit*: 11 (2d6 + 4) psychic damage. A creature reduced to 0 hit points by this attack doesn't die but falls unconscious and is stable. The creature is trapped in a vivid dream of the lost soul's happiest memories, and must be woken by another creature using an action."
      },
      {
        "name": "Echoes of the Feywild (Recharge 5\u20136)",
        "description": "*Wisdom Saving Throw*: DC 14, each creature within 30 feet that can hear the lost soul. The lost soul unleashes a haunting melody that warps the air with fleeting visions of the Feywild \u2014 sunlit glades that crumble to ash, laughter that turns to weeping. *Failure*: 14 (4d6) psychic damage and the target has the Frightened condition until the end of its next turn. *Success*: Half damage and the creature is not frightened."
      },
      {
        "name": "Spellcasting",
        "description": "The lost soul casts one of the following spells, requiring no material components and using Charisma as the spellcasting ability (spell save DC 14):\n\nAt will: *dancing lights, minor illusion, thaumaturgy*\n1/day each: *calm emotions, enthrall, faerie fire*"
      }
    ],
    "bonusActions": [
      {
        "name": "Fey Step (Recharge 4\u20136)",
        "description": "The lost soul teleports, along with any equipment it is wearing or carrying, up to 30 feet to an unoccupied space it can see. When it reappears, flowers briefly bloom and wilt around it, and creatures within 5 feet must succeed on a DC 14 Wisdom saving throw or be moved to tears, becoming incapacitated until the end of their next turn."
      }
    ],
    "reactions": [
      {
        "name": "Mournful Rebuke",
        "description": "When a creature within 30 feet that the lost soul can see deals damage to it, the lost soul can force the attacker to make a DC 14 Charisma saving throw. On a failure, the attacker takes 7 (2d6) psychic damage and must use its reaction, if available, to move up to half its speed directly away from the lost soul. On a success, the creature takes half damage and doesn't move."
      }
    ],
    "legendaryPreamble": "",
    "legendaryActions": [],
    "mythicPreamble": "",
    "mythicActions": [],
    "lairActions": [],
    "description": "A Greater Elven Lost Soul is the spirit of a Feywild elf of considerable power \u2014 a fey knight, an archdruid's consort, or a bard whose songs once shaped the seasons. Their deaths were not quiet. They fell to betrayal, to curses, or to the slow withering of a bond with the Feywild itself, severed by some catastrophe they could not prevent.\n\nThese spirits are far more aware than their lesser kin. They remember who they were. They remember their names, their loves, their oaths. And they remember the moment everything was taken from them. This makes them simultaneously more dangerous and more capable of reason. A Greater Lost Soul might bargain, might aid a party it sees as kindred spirits, or might become a tragic antagonist who genuinely believes it is protecting the world from a sorrow only it can perceive.\n\nTheir presence warps the environment more intensely than lesser Lost Souls. Trees bloom out of season in their wake, only to shed their petals moments later. Music drifts from nowhere. The air tastes like honey and salt. Those who spend too long in their company begin to forget their own sorrows, replacing them with the lost soul's \u2014 a gentle possession of the heart, not the body.\n\nGreater Lost Souls are sometimes found at the heart of corrupted Feywild crossings, maintaining a bridge between planes that should have closed long ago. They may be encountered as guardians of forgotten elven tombs, protectors of sleeping fey lords, or simply as wanderers \u2014 dancing alone in the moonlight, waiting for someone to remember the words to a song that ended centuries ago.",
    "habitat": "Forest, Feywild Crossings, Ruins, Elven Tombs",
    "treasure": "Individual, Arcana"
  },
  {
    "name": "Guard",
    "size": "Medium or Small",
    "type": "Humanoid",
    "alignment": "Neutral",
    "source": "D&D 2024 Basic Rules",
    "ac": 16,
    "hp": 11,
    "hitDice": "2d8 + 2",
    "initiative": "+1 (11)",
    "speed": "30 ft.",
    "cr": "1/8 (XP 25; PB +2)",
    "abilities": {
      "str": {
        "score": 13,
        "save": null
      },
      "dex": {
        "score": 12,
        "save": null
      },
      "con": {
        "score": 12,
        "save": null
      },
      "int": {
        "score": 10,
        "save": null
      },
      "wis": {
        "score": 11,
        "save": null
      },
      "cha": {
        "score": 10,
        "save": null
      }
    },
    "skills": "Perception +2",
    "resistances": "",
    "immunities": "",
    "vulnerabilities": "",
    "conditionImmunities": "",
    "senses": "Passive Perception 12",
    "languages": "Common",
    "gear": "Chain Shirt, Shield, Spear",
    "traits": [],
    "actions": [
      {
        "name": "Spear",
        "description": "Melee or Ranged Attack Roll: +3, reach 5 ft. or range 20/60 ft. Hit: 4 (1d6 + 1) Piercing damage."
      }
    ],
    "bonusActions": [],
    "reactions": [],
    "legendaryPreamble": "",
    "legendaryActions": [],
    "mythicPreamble": "",
    "mythicActions": [],
    "lairActions": [],
    "description": "Guards are perceptive, but most have little martial training. They might be bouncers, lookouts, members of a city watch, or other keen-eyed warriors.",
    "habitat": "",
    "treasure": ""
  },
  {
    "name": "Guard Captain",
    "size": "Medium or Small",
    "type": "Humanoid",
    "alignment": "Neutral",
    "source": "D&D 2024 Basic Rules",
    "ac": 18,
    "hp": 75,
    "hitDice": "10d8 + 30",
    "initiative": "+4 (14)",
    "speed": "30 ft.",
    "cr": "4 (XP 1,100; PB +2)",
    "abilities": {
      "str": {
        "score": 18,
        "save": null
      },
      "dex": {
        "score": 14,
        "save": null
      },
      "con": {
        "score": 16,
        "save": null
      },
      "int": {
        "score": 12,
        "save": null
      },
      "wis": {
        "score": 14,
        "save": null
      },
      "cha": {
        "score": 13,
        "save": null
      }
    },
    "skills": "Athletics +6, Perception +4",
    "resistances": "",
    "immunities": "",
    "vulnerabilities": "",
    "conditionImmunities": "",
    "senses": "Passive Perception 14",
    "languages": "Common",
    "gear": "Breastplate, Javelins (6), Longsword, Shield",
    "traits": [],
    "actions": [
      {
        "name": "Multiattack",
        "description": "The guard makes two attacks, using Javelin or Longsword in any combination."
      },
      {
        "name": "Javelin",
        "description": "Melee or Ranged Attack Roll: +6, reach 5 ft. or range 30/120 ft. Hit: 14 (3d6 + 4) Piercing damage."
      },
      {
        "name": "Longsword",
        "description": "Melee Attack Roll: +6, reach 5 ft. Hit: 15 (2d10 + 4) Slashing damage."
      }
    ],
    "bonusActions": [],
    "reactions": [],
    "legendaryPreamble": "",
    "legendaryActions": [],
    "mythicPreamble": "",
    "mythicActions": [],
    "lairActions": [],
    "description": "Guard captains often have ample professional experience. They might be accomplished bodyguards, protectors of magic treasures, veteran watch members, or similar wardens.",
    "habitat": "",
    "treasure": ""
  },
  {
    "name": "Hobgoblin Captain",
    "size": "Medium",
    "type": "Fey (Goblinoid)",
    "alignment": "Lawful Evil",
    "source": "D&D 2024 Basic Rules",
    "ac": 17,
    "hp": 58,
    "hitDice": "9d8 + 18",
    "initiative": "+4 (14)",
    "speed": "30 ft.",
    "cr": "3 (XP 700; PB +2)",
    "abilities": {
      "str": {
        "score": 15,
        "save": null
      },
      "dex": {
        "score": 14,
        "save": null
      },
      "con": {
        "score": 14,
        "save": null
      },
      "int": {
        "score": 12,
        "save": null
      },
      "wis": {
        "score": 10,
        "save": null
      },
      "cha": {
        "score": 13,
        "save": null
      }
    },
    "skills": "",
    "resistances": "",
    "immunities": "",
    "vulnerabilities": "",
    "conditionImmunities": "",
    "senses": "Darkvision 60 ft., Passive Perception 10",
    "languages": "Common, Goblin",
    "gear": "Greatsword, Half-Plate Armor, Longbow",
    "traits": [
      {
        "name": "Aura of Authority",
        "description": "While in a 10-foot Emanation originating from the hobgoblin, the hobgoblin and its allies have Advantage on attack rolls and saving throws, provided the hobgoblin doesn't have the Incapacitated condition."
      }
    ],
    "actions": [
      {
        "name": "Multiattack",
        "description": "The hobgoblin makes two attacks, using Greatsword or Longbow in any combination."
      },
      {
        "name": "Greatsword",
        "description": "Melee Attack Roll: +4, reach 5 ft. Hit: 9 (2d6 + 2) Slashing damage plus 3 (1d6) Poison damage."
      },
      {
        "name": "Longbow",
        "description": "Ranged Attack Roll: +4, range 150/600 ft. Hit: 6 (1d8 + 2) Piercing damage plus 5 (2d4) Poison damage."
      }
    ],
    "bonusActions": [],
    "reactions": [],
    "legendaryPreamble": "",
    "legendaryActions": [],
    "mythicPreamble": "",
    "mythicActions": [],
    "lairActions": [],
    "description": "Hobgoblins embody the primal urge to grow and spread, expressing such drives by bending the world to their whims. Lone hobgoblins claim woodland territories and plunder the wilds. In groups, they form hierarchical, martial societies bent on conquering lands and stripping them of resources to serve their expansionist zeal. Hobgoblins often subjugate animals, monsters, and destructive Fey\u2014particularly goblins and bugbears\u2014to serve their plans. Hobgoblins might ally with dragons, warlords, the servants of warlike gods, or other powerful creatures that promise them control of new territories. Should hobgoblins bring an entire land to heel, they seek new conquests, venturing across seas, into the Underdark, or to stars and planes of existence beyond. Hobgoblin captains are battlefield tacticians. They lead their allies to victory by employing martial skill and rallying others with orders and threats. Hobgoblin captains usually oversee hobgoblin battle groups or gangs of weaker monsters.",
    "habitat": "",
    "treasure": ""
  },
  {
    "name": "Hobgoblin Warrior",
    "size": "Medium",
    "type": "Fey (Goblinoid)",
    "alignment": "Lawful Evil",
    "source": "D&D 2024 Basic Rules",
    "ac": 18,
    "hp": 11,
    "hitDice": "2d8 + 2",
    "initiative": "+3 (13)",
    "speed": "30 ft.",
    "cr": "1/2 (XP 100; PB +2)",
    "abilities": {
      "str": {
        "score": 13,
        "save": null
      },
      "dex": {
        "score": 12,
        "save": null
      },
      "con": {
        "score": 12,
        "save": null
      },
      "int": {
        "score": 10,
        "save": null
      },
      "wis": {
        "score": 10,
        "save": null
      },
      "cha": {
        "score": 9,
        "save": null
      }
    },
    "skills": "",
    "resistances": "",
    "immunities": "",
    "vulnerabilities": "",
    "conditionImmunities": "",
    "senses": "Darkvision 60 ft., Passive Perception 10",
    "languages": "Common, Goblin",
    "gear": "Half-Plate Armor, Longbow, Longsword, Shield",
    "traits": [
      {
        "name": "Pack Tactics",
        "description": "The hobgoblin has Advantage on an attack roll against a creature if at least one of the hobgoblin's allies is within 5 feet of the creature and the ally doesn't have the Incapacitated condition."
      }
    ],
    "actions": [
      {
        "name": "Longsword",
        "description": "Melee Attack Roll: +3, reach 5 ft. Hit: 12 (2d10 + 1) Slashing damage."
      },
      {
        "name": "Longbow",
        "description": "Ranged Attack Roll: +3, range 150/600 ft. Hit: 5 (1d8 + 1) Piercing damage plus 7 (3d4) Poison damage."
      }
    ],
    "bonusActions": [],
    "reactions": [],
    "legendaryPreamble": "",
    "legendaryActions": [],
    "mythicPreamble": "",
    "mythicActions": [],
    "lairActions": [],
    "description": "Hobgoblins embody the primal urge to grow and spread, expressing such drives by bending the world to their whims. Lone hobgoblins claim woodland territories and plunder the wilds. In groups, they form hierarchical, martial societies bent on conquering lands and stripping them of resources to serve their expansionist zeal. Hobgoblins often subjugate animals, monsters, and destructive Fey\u2014particularly goblins and bugbears\u2014to serve their plans. Hobgoblins might ally with dragons, warlords, the servants of warlike gods, or other powerful creatures that promise them control of new territories. Should hobgoblins bring an entire land to heel, they seek new conquests, venturing across seas, into the Underdark, or to stars and planes of existence beyond. Hobgoblin warriors might hunt and raid alone or with trained mastiffs, worgs, goblin gangs, or other allies. They employ simple tactics and exploit every advantage their allies provide. They willingly sacrifice companions in their pursuit of victory.",
    "habitat": "",
    "treasure": ""
  },
  {
    "name": "Knight",
    "size": "Medium or Small",
    "type": "Humanoid",
    "alignment": "Any Alignment",
    "source": "D&D 2024 Basic Rules",
    "ac": 18,
    "hp": 52,
    "hitDice": "8d8 + 16",
    "initiative": "+0 (10)",
    "speed": "30 ft.",
    "cr": "3 (XP 700; PB +2)",
    "abilities": {
      "str": {
        "score": 16,
        "save": null
      },
      "dex": {
        "score": 11,
        "save": null
      },
      "con": {
        "score": 14,
        "save": 4
      },
      "int": {
        "score": 11,
        "save": null
      },
      "wis": {
        "score": 11,
        "save": 2
      },
      "cha": {
        "score": 15,
        "save": null
      }
    },
    "skills": "",
    "resistances": "",
    "immunities": "",
    "vulnerabilities": "",
    "conditionImmunities": "",
    "senses": "Passive Perception 10",
    "languages": "Common plus one other language",
    "gear": "Greatsword, Heavy Crossbow, Plate Armor",
    "traits": [],
    "actions": [
      {
        "name": "Multiattack",
        "description": "The knight makes two attacks, using Greatsword or Heavy Crossbow in any combination."
      },
      {
        "name": "Greatsword",
        "description": "Melee Attack Roll: +5, reach 5 ft. Hit: 10 (2d6 + 3) Slashing damage plus 4 (1d8) Radiant damage."
      },
      {
        "name": "Heavy Crossbow",
        "description": "Ranged Attack Roll: +2, range 100/400 ft. Hit: 11 (2d10) Piercing damage plus 4 (1d8) Radiant damage."
      }
    ],
    "bonusActions": [],
    "reactions": [
      {
        "name": "Parry",
        "description": "Trigger: The knight is hit by a melee attack roll while holding a weapon. Response: The knight adds 2 to its AC against that attack, possibly causing it to miss."
      }
    ],
    "legendaryPreamble": "",
    "legendaryActions": [],
    "mythicPreamble": "",
    "mythicActions": [],
    "lairActions": [],
    "description": "Knights are skilled warriors trained for war and tested in battle. Many serve the rulers of a realm, a religion, or an order devoted to a cause. Knights frequently lead troops in combat or work in units that dominate the battlefield. They're often attended by squires, who might be less skilled soldiers or commoners.",
    "habitat": "",
    "treasure": ""
  },
  {
    "name": "Kobold Warrior",
    "size": "Small",
    "type": "Dragon",
    "alignment": "Neutral",
    "source": "D&D 2024 Basic Rules",
    "ac": 14,
    "hp": 7,
    "hitDice": "3d6 - 3",
    "initiative": "+2 (12)",
    "speed": "30 ft.",
    "cr": "1/8 (XP 25; PB +2)",
    "abilities": {
      "str": {
        "score": 7,
        "save": null
      },
      "dex": {
        "score": 15,
        "save": null
      },
      "con": {
        "score": 9,
        "save": null
      },
      "int": {
        "score": 8,
        "save": null
      },
      "wis": {
        "score": 7,
        "save": null
      },
      "cha": {
        "score": 8,
        "save": null
      }
    },
    "skills": "",
    "resistances": "",
    "immunities": "",
    "vulnerabilities": "",
    "conditionImmunities": "",
    "senses": "Darkvision 60 ft., Passive Perception 8",
    "languages": "Common, Draconic",
    "gear": "Daggers (3)",
    "traits": [
      {
        "name": "Pack Tactics",
        "description": "The kobold has Advantage on an attack roll against a creature if at least one of the kobold's allies is within 5 feet of the creature and the ally doesn't have the Incapacitated condition."
      },
      {
        "name": "Sunlight Sensitivity",
        "description": "While in sunlight, the kobold has Disadvantage on ability checks and attack rolls."
      }
    ],
    "actions": [
      {
        "name": "Dagger",
        "description": "Melee or Ranged Attack Roll: +4, reach 5 ft. or range 20/60 ft. Hit: 4 (1d4 + 2) Piercing damage."
      }
    ],
    "bonusActions": [],
    "reactions": [],
    "legendaryPreamble": "",
    "legendaryActions": [],
    "mythicPreamble": "",
    "mythicActions": [],
    "lairActions": [],
    "description": "Cowardly cousins to chromatic dragons, kobolds serve draconic overlords as warriors and servants. These scrappy menaces mimic the behaviors of their dragon masters. Though their small stature and recklessness make kobolds poor imitators of dragons, what they lack in ferocity they make up for in zeal and ingenuity. They are especially adept at creating traps and setting ambushes. Kobolds' scales resemble those of chromatic dragons that live near their warrens. Rarely, kobolds possess features evocative of metallic dragons or other dragon-like creatures. Kobold warriors use hit-and-run tactics to raid their enemies and defend their homes. To avoid danger, they frequently employ haphazard traps.",
    "habitat": "Arctic, Coastal, Desert, Forest, Hill, Mountain, Swamp, Underdark, Urban",
    "treasure": ""
  },
  {
    "name": "Mage",
    "size": "Medium or Small",
    "type": "Humanoid (Wizard)",
    "alignment": "Neutral",
    "source": "D&D 2024 Basic Rules",
    "ac": 15,
    "hp": 81,
    "hitDice": "18d8",
    "initiative": "+2 (12)",
    "speed": "30 ft.",
    "cr": "6 (XP 2,300; PB +3)",
    "abilities": {
      "str": {
        "score": 9,
        "save": null
      },
      "dex": {
        "score": 14,
        "save": null
      },
      "con": {
        "score": 11,
        "save": null
      },
      "int": {
        "score": 17,
        "save": 6
      },
      "wis": {
        "score": 12,
        "save": 4
      },
      "cha": {
        "score": 11,
        "save": null
      }
    },
    "skills": "Arcana +6, History +6, Perception +4",
    "resistances": "",
    "immunities": "",
    "vulnerabilities": "",
    "conditionImmunities": "",
    "senses": "Passive Perception 14",
    "languages": "Common plus three other languages",
    "gear": "Wand",
    "traits": [],
    "actions": [
      {
        "name": "Multiattack",
        "description": "The mage makes three Arcane Burst attacks."
      },
      {
        "name": "Arcane Burst",
        "description": "Melee or Ranged Attack Roll: +6, reach 5 ft. or range 120 ft. Hit: 16 (3d8 + 3) Force damage."
      },
      {
        "name": "Spellcasting",
        "description": "The mage casts one of the following spells, using Intelligence as the spellcasting ability (spell save DC 14):\n\nAt Will: Detect Magic, Light, Mage Armor (included in AC), Mage Hand, Prestidigitation\n\n2/Day Each: Fireball (level 4 version), Invisibility\n\n1/Day Each: Cone of Cold, Fly"
      }
    ],
    "bonusActions": [
      {
        "name": "Misty Step (3/Day)",
        "description": "The mage casts Misty Step, using the same spellcasting ability as Spellcasting."
      }
    ],
    "reactions": [
      {
        "name": "Protective Magic (3/Day)",
        "description": "The mage casts Counterspell or Shield in response to the spell's trigger, using the same spellcasting ability as Spellcasting."
      }
    ],
    "legendaryPreamble": "",
    "legendaryActions": [],
    "mythicPreamble": "",
    "mythicActions": [],
    "lairActions": [],
    "description": "",
    "habitat": "",
    "treasure": ""
  },
  {
    "name": "Manticore",
    "size": "Large",
    "type": "Monstrosity",
    "alignment": "Lawful Evil",
    "source": "D&D 2024 Basic Rules",
    "ac": 14,
    "hp": 68,
    "hitDice": "8d10 + 24",
    "initiative": "+3 (13)",
    "speed": "30 ft., Fly 50 ft.",
    "cr": "3 (XP 700; PB +2)",
    "abilities": {
      "str": {
        "score": 17,
        "save": null
      },
      "dex": {
        "score": 16,
        "save": null
      },
      "con": {
        "score": 17,
        "save": null
      },
      "int": {
        "score": 7,
        "save": null
      },
      "wis": {
        "score": 12,
        "save": null
      },
      "cha": {
        "score": 8,
        "save": null
      }
    },
    "skills": "",
    "resistances": "",
    "immunities": "",
    "vulnerabilities": "",
    "conditionImmunities": "",
    "senses": "Darkvision 60 ft., Passive Perception 11",
    "languages": "Common",
    "gear": "",
    "traits": [],
    "actions": [
      {
        "name": "Multiattack",
        "description": "The manticore makes three attacks, using Rend or Tail Spike in any combination."
      },
      {
        "name": "Rend",
        "description": "Melee Attack Roll: +5, reach 5 ft. Hit: 7 (1d8 + 3) Slashing damage."
      },
      {
        "name": "Tail Spike",
        "description": "Ranged Attack Roll: +5, range 100/200 ft. Hit: 7 (1d8 + 3) Piercing damage."
      }
    ],
    "bonusActions": [],
    "reactions": [],
    "legendaryPreamble": "",
    "legendaryActions": [],
    "mythicPreamble": "",
    "mythicActions": [],
    "lairActions": [],
    "description": "",
    "habitat": "",
    "treasure": ""
  },
  {
    "name": "Medusa",
    "size": "Medium",
    "type": "Monstrosity",
    "alignment": "Lawful Evil",
    "source": "D&D 2024 Basic Rules",
    "ac": 15,
    "hp": 127,
    "hitDice": "17d8 + 51",
    "initiative": "+6 (16)",
    "speed": "30 ft.",
    "cr": "6 (XP 2,300; PB +3)",
    "abilities": {
      "str": {
        "score": 10,
        "save": null
      },
      "dex": {
        "score": 17,
        "save": null
      },
      "con": {
        "score": 16,
        "save": null
      },
      "int": {
        "score": 12,
        "save": null
      },
      "wis": {
        "score": 13,
        "save": 4
      },
      "cha": {
        "score": 15,
        "save": null
      }
    },
    "skills": "Deception +5, Perception +4, Stealth +6",
    "resistances": "",
    "immunities": "",
    "vulnerabilities": "",
    "conditionImmunities": "",
    "senses": "Darkvision 150 ft., Passive Perception 14",
    "languages": "Common plus one other language",
    "gear": "",
    "traits": [],
    "actions": [
      {
        "name": "Multiattack",
        "description": "The medusa makes two Claw attacks and one Snake Hair attack, or it makes three Poison Ray attacks."
      },
      {
        "name": "Claw",
        "description": "Melee Attack Roll: +6, reach 5 ft. Hit: 10 (2d6 + 3) Slashing damage."
      },
      {
        "name": "Snake Hair",
        "description": "Melee Attack Roll: +6, reach 5 ft. Hit: 5 (1d4 + 3) Piercing damage plus 14 (4d6) Poison damage."
      },
      {
        "name": "Poison Ray",
        "description": "Ranged Attack Roll: +5, range 150 ft. Hit: 11 (2d8 + 2) Poison damage."
      }
    ],
    "bonusActions": [
      {
        "name": "Petrifying Gaze (Recharge 5\u20136)",
        "description": "Constitution Saving Throw: DC 13, each creature in a 30-foot Cone. If the medusa sees its reflection in the Cone, the medusa must make this save. First Failure: The target has the Restrained condition and repeats the save at the end of its next turn if it is still Restrained, ending the effect on itself on a success. Second Failure: The target has the Petrified condition instead of the Restrained condition."
      }
    ],
    "reactions": [],
    "legendaryPreamble": "",
    "legendaryActions": [],
    "mythicPreamble": "",
    "mythicActions": [],
    "lairActions": [],
    "description": "",
    "habitat": "",
    "treasure": ""
  },
  {
    "name": "Minotaur of Baphomet",
    "size": "Large",
    "type": "Monstrosity",
    "alignment": "Chaotic Evil",
    "source": "D&D 2024 Basic Rules",
    "ac": 14,
    "hp": 85,
    "hitDice": "10d10 + 30",
    "initiative": "+0 (10)",
    "speed": "40 ft.",
    "cr": "3 (XP 700; PB +2)",
    "abilities": {
      "str": {
        "score": 18,
        "save": null
      },
      "dex": {
        "score": 11,
        "save": null
      },
      "con": {
        "score": 16,
        "save": null
      },
      "int": {
        "score": 6,
        "save": null
      },
      "wis": {
        "score": 16,
        "save": null
      },
      "cha": {
        "score": 9,
        "save": null
      }
    },
    "skills": "Perception +7, Survival +7",
    "resistances": "",
    "immunities": "",
    "vulnerabilities": "",
    "conditionImmunities": "",
    "senses": "Darkvision 60 ft., Passive Perception 17",
    "languages": "Abyssal",
    "gear": "",
    "traits": [],
    "actions": [
      {
        "name": "Abyssal Glaive",
        "description": "Melee Attack Roll: +6, reach 10 ft. Hit: 10 (1d12 + 4) Slashing damage plus 10 (3d6) Necrotic damage."
      },
      {
        "name": "Gore (Recharge 5\u20136)",
        "description": "Melee Attack Roll: +6, reach 5 ft. Hit: 18 (4d6 + 4) Piercing damage. If the target is a Large or smaller creature and the minotaur moved 10+ feet straight toward it immediately before the hit, the target takes an extra 10 (3d6) Piercing damage and has the Prone condition."
      }
    ],
    "bonusActions": [],
    "reactions": [],
    "legendaryPreamble": "",
    "legendaryActions": [],
    "mythicPreamble": "",
    "mythicActions": [],
    "lairActions": [],
    "description": "",
    "habitat": "",
    "treasure": ""
  },
  {
    "name": "Oni",
    "size": "Large",
    "type": "Fiend",
    "alignment": "Lawful Evil",
    "source": "D&D 2024 Basic Rules",
    "ac": 17,
    "hp": 119,
    "hitDice": "14d10 + 42",
    "initiative": "+0 (10)",
    "speed": "30 ft., Fly 30 ft. (hover)",
    "cr": "7 (XP 2,900; PB +3)",
    "abilities": {
      "str": {
        "score": 19,
        "save": null
      },
      "dex": {
        "score": 11,
        "save": 3
      },
      "con": {
        "score": 16,
        "save": 6
      },
      "int": {
        "score": 14,
        "save": null
      },
      "wis": {
        "score": 12,
        "save": 4
      },
      "cha": {
        "score": 15,
        "save": 5
      }
    },
    "skills": "Arcana +5, Deception +8, Perception +4",
    "resistances": "Cold",
    "immunities": "",
    "vulnerabilities": "",
    "conditionImmunities": "",
    "senses": "Darkvision 60 ft., Passive Perception 14",
    "languages": "Common, Giant",
    "gear": "",
    "traits": [
      {
        "name": "Regeneration",
        "description": "The oni regains 10 Hit Points at the start of each of its turns if it has at least 1 Hit Point."
      }
    ],
    "actions": [
      {
        "name": "Multiattack",
        "description": "The oni makes two Claw or Nightmare Ray attacks. It can replace one attack with a use of Spellcasting."
      },
      {
        "name": "Claw",
        "description": "Melee Attack Roll: +7, reach 10 ft. Hit: 10 (1d12 + 4) Slashing damage plus 9 (2d8) Necrotic damage."
      },
      {
        "name": "Nightmare Ray",
        "description": "Ranged Attack Roll: +5, range 60 ft. Hit: 9 (2d6 + 2) Psychic damage, and the target has the Frightened condition until the start of the oni's next turn."
      },
      {
        "name": "Shape-Shift",
        "description": "The oni shape-shifts into a Small or Medium Humanoid or a Large Giant, or it returns to its true form. Other than its size, its game statistics are the same in each form. Any equipment it is wearing or carrying isn't transformed."
      },
      {
        "name": "Spellcasting",
        "description": "The oni casts one of the following spells, requiring no Material components and using Charisma as the spellcasting ability (spell save DC 13):\n\n1/Day Each: Charm Person (level 2 version), Darkness, Gaseous Form, Sleep"
      }
    ],
    "bonusActions": [
      {
        "name": "Invisibility",
        "description": "The oni casts Invisibility on itself, requiring no spell components and using the same spellcasting ability as Spellcasting."
      }
    ],
    "reactions": [],
    "legendaryPreamble": "",
    "legendaryActions": [],
    "mythicPreamble": "",
    "mythicActions": [],
    "lairActions": [],
    "description": "",
    "habitat": "",
    "treasure": ""
  },
  {
    "name": "Scout Captain",
    "size": "Medium or Small",
    "type": "Humanoid",
    "alignment": "Neutral",
    "source": "D&D 2024 Basic Rules",
    "ac": 15,
    "hp": 66,
    "hitDice": "12d8 + 12",
    "initiative": "+5 (15)",
    "speed": "30 ft., Climb 30 ft.",
    "cr": "3 (XP 700; PB +2)",
    "abilities": {
      "str": {
        "score": 11,
        "save": null
      },
      "dex": {
        "score": 16,
        "save": 5
      },
      "con": {
        "score": 12,
        "save": null
      },
      "int": {
        "score": 14,
        "save": 4
      },
      "wis": {
        "score": 15,
        "save": null
      },
      "cha": {
        "score": 11,
        "save": null
      }
    },
    "skills": "Perception +6, Stealth +7, Survival +6",
    "resistances": "",
    "immunities": "",
    "vulnerabilities": "",
    "conditionImmunities": "",
    "senses": "Passive Perception 16",
    "languages": "Common plus one other language",
    "gear": "Longbow, Shortsword, Studded Leather Armor",
    "traits": [],
    "actions": [
      {
        "name": "Multiattack",
        "description": "The scout makes two attacks, using Shortsword or Longbow in any combination."
      },
      {
        "name": "Shortsword",
        "description": "Melee Attack Roll: +5, reach 5 ft. Hit: 6 (1d6 + 3) Piercing damage, plus 10 (3d6) Piercing damage if the attack was made with Advantage."
      },
      {
        "name": "Longbow",
        "description": "Ranged Attack Roll: +5, range 150/600 ft. Hit: 7 (1d8 + 3) Piercing damage, plus 10 (3d6) Piercing damage if the attack was made with Advantage."
      }
    ],
    "bonusActions": [
      {
        "name": "Aim",
        "description": "The scout has Advantage on the next attack roll it makes during the current turn."
      }
    ],
    "reactions": [
      {
        "name": "Uncanny Dodge",
        "description": "Trigger: The scout is hit by an attack roll. Response: The scout halves the damage (round down) it takes from that attack."
      }
    ],
    "legendaryPreamble": "",
    "legendaryActions": [],
    "mythicPreamble": "",
    "mythicActions": [],
    "lairActions": [],
    "description": "",
    "habitat": "",
    "treasure": ""
  },
  {
    "name": "Silent Knight",
    "size": "Medium",
    "type": "Humanoid",
    "alignment": "Neutral",
    "source": "Homebrew",
    "ac": 18,
    "hp": 75,
    "hitDice": "10d8 + 30",
    "initiative": "+1 (11)",
    "speed": "30 ft.",
    "cr": "4 (1100 XP; PB +2)",
    "abilities": {
      "str": {
        "score": 16,
        "save": 5
      },
      "dex": {
        "score": 12,
        "save": 3
      },
      "con": {
        "score": 16,
        "save": null
      },
      "int": {
        "score": 14,
        "save": null
      },
      "wis": {
        "score": 10,
        "save": null
      },
      "cha": {
        "score": 8,
        "save": null
      }
    },
    "skills": "Athletics +5, History +4, Perception +4",
    "resistances": "",
    "immunities": "",
    "vulnerabilities": "",
    "conditionImmunities": "",
    "senses": "Blindsight 10 ft., Passive Perception 14",
    "languages": "Common, Common Sign Language",
    "traits": [
      {
        "name": "Hushed Edge",
        "description": "The knight wields a magic greatsword that radiates silence. While the knight holds the weapon, no sound can be created within or pass through a 20-foot-radius Sphere centered on it. Any creature entirely inside the sphere is immune to Thunder damage and has the Deafened condition. Casting a spell that has a Verbal component is impossible within the sphere."
      },
      {
        "name": "Magic Absorption",
        "description": "Once per turn, when the knight takes damage from a spell or magical effect, it reduces the total damage by 2."
      },
      {
        "name": "Psionic Resilience",
        "description": "The knight has Advantage on saving throws against spells."
      }
    ],
    "actions": [
      {
        "name": "Multiattack",
        "description": "The knight makes two Hushed Greatsword attacks."
      },
      {
        "name": "Hushed Greatsword",
        "description": "Melee Attack Roll: +5, reach 5 ft. Hit: 10 (2d6 + 3) Slashing damage damage."
      }
    ],
    "bonusActions": [
      {
        "name": "Psionic Strike (3/Day)",
        "description": "Immediately after hitting a target within 30 feet with the Hushed Greatsword and dealing damage, the knight deals an extra 11 (3d6) Force damage to the target."
      }
    ],
    "reactions": [
      {
        "name": "Protective Field",
        "description": "Trigger: The knight or a creature it can see within 30 feet takes damage. Response: The knight reduces the damage by 6 (1d6 + 3)."
      }
    ],
    "legendaryPreamble": "",
    "legendaryActions": [],
    "mythicPreamble": "",
    "mythicActions": [],
    "lairActions": [],
    "description": "Silent Knights are psionic warriors trained in an esoteric martial tradition that prizes discipline over bluster. They wield enchanted blades that project a field of absolute silence, making them devastating opponents for spellcasters and ideal sentinels for places where magic must be suppressed. They communicate entirely through sign language and psionic intuition, and their eerie, soundless combat style unnerves even seasoned fighters.",
    "habitat": "Urban, Underground",
    "treasure": "Armaments"
  },
  {
    "name": "Summer Eladrin",
    "size": "Medium",
    "type": "Fey (Elf)",
    "alignment": "typically Chaotic Neutral",
    "source": "Monsters of the Multiverse",
    "ac": 19,
    "hp": 165,
    "hitDice": "22d8 + 66",
    "initiative": "",
    "speed": "50 ft.",
    "cr": "10 (5900 XP; PB +4)",
    "abilities": {
      "str": {
        "score": 19,
        "save": null
      },
      "dex": {
        "score": 21,
        "save": null
      },
      "con": {
        "score": 16,
        "save": null
      },
      "int": {
        "score": 14,
        "save": null
      },
      "wis": {
        "score": 12,
        "save": null
      },
      "cha": {
        "score": 18,
        "save": null
      }
    },
    "skills": "Athletics +8, Intimidation +8",
    "resistances": "Fire",
    "immunities": "",
    "vulnerabilities": "",
    "conditionImmunities": "",
    "senses": "Darkvision 60 ft., Passive Perception 9",
    "languages": "Common, Elvish, Sylvan",
    "traits": [
      {
        "name": "Fearsome Presence",
        "description": "Any non-eladrin creature that starts its turn within 60 feet of the eladrin must make a DC 16 Wisdom saving throw. On a failed save, the creature becomes frightened of the eladrin for 1 minute. A creature can repeat the saving throw at the end of each of its turns, ending the effect on itself on a success. If a creature's saving throw is successful or the effect ends for it, the creature is immune to any eladrin's Fearsome Presence for the next 24 hours."
      },
      {
        "name": "Magic Resistance",
        "description": "The eladrin has advantage on saving throws against spells and other magical effects."
      }
    ],
    "actions": [
      {
        "name": "Multiattack",
        "description": "The eladrin makes two Longsword or Longbow attacks."
      },
      {
        "name": "Longsword",
        "description": "*Melee Weapon Attack*: +8 to hit, reach 5 ft., one target. *Hit*: 13 (2d8 + 4) slashing damage, or 15 (2d10 + 4) slashing damage if used with two hands, plus 9 (2d8) fire damage."
      },
      {
        "name": "Longbow",
        "description": "*Ranged Weapon Attack*: +9 to hit, range 150/600 ft., one target. *Hit*: 14 (2d8 + 5) piercing damage plus 9 (2d8) fire damage."
      }
    ],
    "bonusActions": [
      {
        "name": "Fey Step (Recharge 4\u20136)",
        "description": "The eladrin teleports, along with any equipment it is wearing or carrying, up to 30 feet to an unoccupied space it can see."
      }
    ],
    "reactions": [
      {
        "name": "Parry",
        "description": "The eladrin adds 3 to its AC against one melee attack that would hit it. To do so, the eladrin must see the attacker and be wielding a melee weapon."
      }
    ],
    "legendaryPreamble": "",
    "legendaryActions": [],
    "mythicPreamble": "",
    "mythicActions": [],
    "lairActions": [],
    "description": "",
    "habitat": "",
    "treasure": ""
  },
  {
    "name": "Tough Boss",
    "size": "Medium or Small",
    "type": "Humanoid",
    "alignment": "Any Alignment",
    "source": "D&D 2024 Basic Rules",
    "ac": 16,
    "hp": 82,
    "hitDice": "11d8 + 33",
    "initiative": "+2 (12)",
    "speed": "30 ft.",
    "cr": "4 (XP 1,100; PB +2)",
    "abilities": {
      "str": {
        "score": 17,
        "save": 5
      },
      "dex": {
        "score": 14,
        "save": null
      },
      "con": {
        "score": 16,
        "save": 5
      },
      "int": {
        "score": 11,
        "save": null
      },
      "wis": {
        "score": 10,
        "save": null
      },
      "cha": {
        "score": 11,
        "save": 2
      }
    },
    "skills": "",
    "resistances": "",
    "immunities": "",
    "vulnerabilities": "",
    "conditionImmunities": "",
    "senses": "Passive Perception 10",
    "languages": "Common plus one other language",
    "gear": "Chain Mail, Heavy Crossbow, Warhammer",
    "traits": [
      {
        "name": "Pack Tactics",
        "description": "The tough has Advantage on an attack roll against a creature if at least one of the tough's allies is within 5 feet of the creature and the ally doesn't have the Incapacitated condition."
      }
    ],
    "actions": [
      {
        "name": "Multiattack",
        "description": "The tough makes two attacks, using Warhammer or Heavy Crossbow in any combination."
      },
      {
        "name": "Warhammer",
        "description": "Melee Attack Roll: +5, reach 5 ft. Hit: 12 (2d8 + 3) Bludgeoning damage, and if the target is Large or smaller, the tough can push the target up to 10 feet straight away from itself."
      },
      {
        "name": "Heavy Crossbow",
        "description": "Ranged Attack Roll: +4, range 100/400 ft. Hit: 13 (2d10 + 2) Piercing damage."
      }
    ],
    "bonusActions": [],
    "reactions": [],
    "legendaryPreamble": "",
    "legendaryActions": [],
    "mythicPreamble": "",
    "mythicActions": [],
    "lairActions": [],
    "description": "",
    "habitat": "",
    "treasure": ""
  },
  {
    "name": "Troll",
    "size": "Large",
    "type": "Giant",
    "alignment": "Chaotic Evil",
    "source": "D&D 2024 Basic Rules",
    "ac": 15,
    "hp": 94,
    "hitDice": "9d10 + 45",
    "initiative": "+1 (11)",
    "speed": "30 ft.",
    "cr": "5 (XP 1,800; PB +3)",
    "abilities": {
      "str": {
        "score": 18,
        "save": null
      },
      "dex": {
        "score": 13,
        "save": null
      },
      "con": {
        "score": 20,
        "save": null
      },
      "int": {
        "score": 7,
        "save": null
      },
      "wis": {
        "score": 9,
        "save": null
      },
      "cha": {
        "score": 7,
        "save": null
      }
    },
    "skills": "Perception +5",
    "resistances": "",
    "immunities": "",
    "vulnerabilities": "",
    "conditionImmunities": "",
    "senses": "Darkvision 60 ft., Passive Perception 15",
    "languages": "Giant",
    "gear": "",
    "traits": [
      {
        "name": "Loathsome Limbs (4/Day)",
        "description": "If the troll ends any turn Bloodied and took 15+ Slashing damage during that turn, one of the troll's limbs is severed, falls into the troll's space, and becomes a Troll Limb. The limb acts immediately after the troll's turn. The troll has 1 Exhaustion level for each missing limb, and it grows replacement limbs the next time it regains Hit Points."
      },
      {
        "name": "Regeneration",
        "description": "The troll regains 15 Hit Points at the start of each of its turns. If the troll takes Acid or Fire damage, this trait doesn't function on the troll's next turn. The troll dies only if it starts its turn with 0 Hit Points and doesn't regenerate."
      }
    ],
    "actions": [
      {
        "name": "Multiattack",
        "description": "The troll makes three Rend attacks."
      },
      {
        "name": "Rend",
        "description": "Melee Attack Roll: +7, reach 10 ft. Hit: 11 (2d6 + 4) Slashing damage."
      }
    ],
    "bonusActions": [
      {
        "name": "Charge",
        "description": "The troll moves up to half its Speed straight toward an enemy it can see."
      }
    ],
    "reactions": [],
    "legendaryPreamble": "",
    "legendaryActions": [],
    "mythicPreamble": "",
    "mythicActions": [],
    "lairActions": [],
    "description": "",
    "habitat": "",
    "treasure": ""
  },
  {
    "name": "Werebear",
    "size": "Medium or Small",
    "type": "Monstrosity (Lycanthrope)",
    "alignment": "Neutral Good",
    "source": "D&D 2024 Basic Rules",
    "ac": 15,
    "hp": 135,
    "hitDice": "18d8 + 54",
    "initiative": "+3 (13)",
    "speed": "30 ft., 40 ft. (bear form only), Climb 30 ft. (bear form only)",
    "cr": "5 (XP 1,800; PB +3)",
    "abilities": {
      "str": {
        "score": 19,
        "save": null
      },
      "dex": {
        "score": 10,
        "save": null
      },
      "con": {
        "score": 17,
        "save": null
      },
      "int": {
        "score": 11,
        "save": null
      },
      "wis": {
        "score": 12,
        "save": null
      },
      "cha": {
        "score": 12,
        "save": null
      }
    },
    "skills": "Perception +7",
    "resistances": "",
    "immunities": "",
    "vulnerabilities": "",
    "conditionImmunities": "",
    "senses": "Darkvision 60 ft., Passive Perception 17",
    "languages": "Common (can't speak in bear form)",
    "gear": "Handaxes (4)",
    "traits": [],
    "actions": [
      {
        "name": "Multiattack",
        "description": "The werebear makes two attacks, using Handaxe or Rend in any combination. It can replace one attack with a Bite attack."
      },
      {
        "name": "Bite (Bear or Hybrid Form Only)",
        "description": "Melee Attack Roll: +7, reach 5 ft. Hit: 17 (2d12 + 4) Piercing damage. If the target is a Humanoid, it is subjected to the following effect. Constitution Saving Throw: DC 14. Failure: The target is cursed. If the cursed target drops to 0 Hit Points, it instead becomes a Werebear under the DM's control and has 10 Hit Points. Success: The target is immune to this werebear's curse for 24 hours."
      },
      {
        "name": "Handaxe (Humanoid or Hybrid Form Only)",
        "description": "Melee or Ranged Attack Roll: +7, reach 5 ft. or range 20/60 ft. Hit: 14 (3d6 + 4) Slashing damage."
      },
      {
        "name": "Rend (Bear or Hybrid Form Only)",
        "description": "Melee Attack Roll: +7, reach 5 ft. Hit: 13 (2d8 + 4) Slashing damage."
      }
    ],
    "bonusActions": [
      {
        "name": "Shape-Shift",
        "description": "The werebear shape-shifts into a Large bear-humanoid hybrid form or a Large bear, or it returns to its true humanoid form. Its game statistics, other than its size, are the same in each form. Any equipment it is wearing or carrying isn't transformed."
      }
    ],
    "reactions": [],
    "legendaryPreamble": "",
    "legendaryActions": [],
    "mythicPreamble": "",
    "mythicActions": [],
    "lairActions": [],
    "description": "",
    "habitat": "",
    "treasure": ""
  },
  {
    "name": "Wight",
    "size": "Medium",
    "type": "Undead",
    "alignment": "Neutral Evil",
    "source": "D&D 2024 Basic Rules",
    "ac": 14,
    "hp": 82,
    "hitDice": "11d8 + 33",
    "initiative": "+4 (14)",
    "speed": "30 ft.",
    "cr": "3 (XP 700; PB +2)",
    "abilities": {
      "str": {
        "score": 15,
        "save": null
      },
      "dex": {
        "score": 14,
        "save": null
      },
      "con": {
        "score": 16,
        "save": null
      },
      "int": {
        "score": 10,
        "save": null
      },
      "wis": {
        "score": 13,
        "save": null
      },
      "cha": {
        "score": 15,
        "save": null
      }
    },
    "skills": "Perception +3, Stealth +4",
    "resistances": "Necrotic",
    "immunities": "Poison; Exhaustion, Poisoned",
    "vulnerabilities": "",
    "conditionImmunities": "",
    "senses": "Darkvision 60 ft., Passive Perception 13",
    "languages": "Common plus one other language",
    "gear": "Studded Leather Armor",
    "traits": [
      {
        "name": "Sunlight Sensitivity",
        "description": "While in sunlight, the wight has Disadvantage on ability checks and attack rolls."
      }
    ],
    "actions": [
      {
        "name": "Multiattack",
        "description": "The wight makes two attacks, using Necrotic Sword or Necrotic Bow in any combination. It can replace one attack with a use of Life Drain."
      },
      {
        "name": "Necrotic Sword",
        "description": "Melee Attack Roll: +4, reach 5 ft. Hit: 6 (1d8 + 2) Slashing damage plus 4 (1d8) Necrotic damage."
      },
      {
        "name": "Necrotic Bow",
        "description": "Ranged Attack Roll: +4, range 150/600 ft. Hit: 6 (1d8 + 2) Piercing damage plus 4 (1d8) Necrotic damage."
      },
      {
        "name": "Life Drain",
        "description": "Constitution Saving Throw: DC 13, one creature within 5 feet. Failure: 6 (1d8 + 2) Necrotic damage, and the target's Hit Point maximum decreases by an amount equal to the damage taken. A Humanoid slain by this attack rises 24 hours later as a Zombie under the wight's control, unless the Humanoid is restored to life or its body is destroyed. The wight can have no more than twelve zombies under its control at a time."
      }
    ],
    "bonusActions": [],
    "reactions": [],
    "legendaryPreamble": "",
    "legendaryActions": [],
    "mythicPreamble": "",
    "mythicActions": [],
    "lairActions": [],
    "description": "",
    "habitat": "",
    "treasure": ""
  },
  {
    "name": "Winter Eladrin",
    "size": "Medium",
    "type": "Fey (Elf)",
    "alignment": "typically Chaotic Neutral",
    "source": "Monsters of the Multiverse",
    "ac": 19,
    "hp": 165,
    "hitDice": "22d8 + 66",
    "initiative": "",
    "speed": "30 ft.",
    "cr": "10 (5900 XP; PB +4)",
    "abilities": {
      "str": {
        "score": 11,
        "save": null
      },
      "dex": {
        "score": 16,
        "save": null
      },
      "con": {
        "score": 16,
        "save": null
      },
      "int": {
        "score": 18,
        "save": null
      },
      "wis": {
        "score": 17,
        "save": null
      },
      "cha": {
        "score": 13,
        "save": null
      }
    },
    "skills": "",
    "resistances": "Cold",
    "immunities": "",
    "vulnerabilities": "",
    "conditionImmunities": "",
    "senses": "Darkvision 60 ft., Passive Perception 13",
    "languages": "Common, Elvish, Sylvan",
    "traits": [
      {
        "name": "Magic Resistance",
        "description": "The eladrin has advantage on saving throws against spells and other magical effects."
      },
      {
        "name": "Sorrowful Presence",
        "description": "Any non-eladrin creature that starts its turn within 60 feet of the eladrin must make a DC 13 Wisdom saving throw. On a failed save, the creature becomes charmed by the eladrin for 1 minute. While charmed in this way, the creature has disadvantage on ability checks and saving throws. The charmed creature can repeat the saving throw at the end of each of its turns, ending the effect on itself on a success. If a creature's saving throw is successful or the effect ends for it, the creature is immune to any eladrin's Sorrowful Presence for the next 24 hours. Whenever the eladrin deals damage to the charmed creature, the charmed creature can repeat the saving throw, ending the effect on itself on a success."
      }
    ],
    "actions": [
      {
        "name": "Multiattack",
        "description": "The eladrin makes two Longsword or Longbow attacks. It can replace one attack with a use of Spellcasting."
      },
      {
        "name": "Longsword",
        "description": "*Melee Weapon Attack*: +4 to hit, reach 5 ft., one target. *Hit*: 4 (1d8) slashing damage, or 5 (1d10) slashing damage if used with two hands, plus 13 (3d8) cold damage."
      },
      {
        "name": "Longbow",
        "description": "*Ranged Weapon Attack*: +7 to hit, range 150/600 ft., one target. *Hit*: 7 (1d8 + 3) piercing damage plus 13 (3d8) cold damage."
      },
      {
        "name": "Spellcasting",
        "description": "The eladrin casts one of the following spells, requiring no material components and using Intelligence as the spellcasting ability (spell save DC 16):\n\nAt will: *fog cloud, gust of wind, sleet storm*"
      }
    ],
    "bonusActions": [
      {
        "name": "Fey Step (Recharge 4\u20136)",
        "description": "The eladrin teleports, along with any equipment it is wearing or carrying, up to 30 feet to an unoccupied space it can see."
      }
    ],
    "reactions": [
      {
        "name": "Frigid Rebuke",
        "description": "When the eladrin takes damage from a creature the eladrin can see within 60 feet of it, the eladrin can force that creature to make a DC 16 Constitution saving throw. On a failed save, the creature takes 11 (2d10) cold damage."
      }
    ],
    "legendaryPreamble": "",
    "legendaryActions": [],
    "mythicPreamble": "",
    "mythicActions": [],
    "lairActions": [],
    "description": "",
    "habitat": "",
    "treasure": ""
  },
  {
    "name": "Zur Et",
    "size": "Medium",
    "type": "Aberration (Githzerai)",
    "alignment": "Lawful Neutral",
    "source": "Homebrew",
    "ac": 19,
    "hp": 229,
    "hitDice": "27d8 + 108",
    "initiative": "+10 (20)",
    "speed": "50 ft., Fly 10 ft. (Hover)",
    "cr": "16 (15000 XP; PB +5)",
    "abilities": {
      "str": {
        "score": 16,
        "save": null
      },
      "dex": {
        "score": 20,
        "save": 10
      },
      "con": {
        "score": 18,
        "save": null
      },
      "int": {
        "score": 18,
        "save": 9
      },
      "wis": {
        "score": 22,
        "save": 11
      },
      "cha": {
        "score": 12,
        "save": null
      }
    },
    "skills": "Acrobatics +10, Athletics +8, Insight +11, Perception +11, Stealth +10",
    "resistances": "Psychic",
    "immunities": "",
    "vulnerabilities": "",
    "conditionImmunities": "Charmed, Frightened",
    "senses": "Truesight 60 ft., Passive Perception 21",
    "languages": "Common, Gith, Deep Speech, telepathy 120 ft.",
    "traits": [
      {
        "name": "Magic Resistance",
        "description": "Zur Et has Advantage on saving throws against spells and other magical effects."
      },
      {
        "name": "Psionic Bastion",
        "description": "Zur Et is immune to any effect that would read his thoughts, determine whether he is lying, or magically influence his emotions. He can suppress or resume this trait as a Bonus Action."
      },
      {
        "name": "Legendary Resistance (3/Day)",
        "description": "If Zur Et fails a saving throw, he can choose to succeed instead."
      },
      {
        "name": "Zerth Discipline",
        "description": "Zur Et's unarmed strikes and psionic abilities count as magical. When Zur Et hits a creature with an unarmed strike, he can force it to make a DC 18 Constitution Saving Throw. On a failure, the creature can't take Reactions until the start of its next turn."
      },
      {
        "name": "Manifest Deck (Special)",
        "description": "Like all who carry a mystic deck, Zur Et can use an Action to play a card and conjure a creature of CR 5 or lower into an unoccupied space within 60 feet. Unlike most deck wielders, Zur Et's psionic mastery allows him to maintain two conjured creatures simultaneously without Concentration. Each manifestation acts on its own Initiative, obeys Zur Et's telepathic commands (no action required), and vanishes after 1 minute, when reduced to 0 HP, or when dismissed (no action required)."
      }
    ],
    "actions": [
      {
        "name": "Multiattack",
        "description": "Zur Et makes four Unarmed Strike or Psi Bolt attacks in any combination. He can replace one attack with Telekinetic Grasp."
      },
      {
        "name": "Unarmed Strike",
        "description": "*Melee Attack Roll:* +10 to hit, reach 10 ft. *Hit:* 15 (2d8 + 6) Force damage."
      },
      {
        "name": "Psi Bolt",
        "description": "*Ranged Attack Roll:* +11 to hit, range 120 ft. *Hit:* 17 (2d10 + 6) Psychic damage."
      },
      {
        "name": "Telekinetic Grasp",
        "description": "*Wisdom Saving Throw:* DC 18, one Large or smaller creature Zur Et can see within 60 ft. *Failure:* The target is lifted, moved up to 30 feet in any direction, and has the Restrained condition until the end of Zur Et's next turn. A Restrained creature can repeat the save at the end of its turn, ending the effect on a success. *Success:* The target is pushed 10 feet."
      },
      {
        "name": "Psychic Annihilation (Recharge 5-6)",
        "description": "Zur Et focuses his mind into a devastating psionic pulse. Each creature of his choice within 30 feet must make a DC 18 Intelligence Saving Throw. *Failure:* 49 (9d10) Psychic damage, and the creature has the Stunned condition until the end of its next turn. *Success:* Half damage only."
      }
    ],
    "bonusActions": [
      {
        "name": "Step Between Thoughts",
        "description": "Zur Et teleports up to 30 feet to an unoccupied space he can see."
      },
      {
        "name": "Flurry of the Focused Mind",
        "description": "Immediately after taking the Attack action, Zur Et makes two Unarmed Strike attacks. Each strike that hits deals an additional 4 (1d8) Psychic damage."
      }
    ],
    "reactions": [
      {
        "name": "Psionic Deflection",
        "description": "*Trigger:* A creature Zur Et can see within 60 feet casts a spell or makes an attack. *Response:* The creature must succeed on a DC 18 Wisdom Saving Throw or have Disadvantage on the triggering attack roll, or all creatures targeted by the triggering spell have Advantage on their saving throws against it."
      }
    ],
    "legendaryPreamble": "Legendary Action Uses: 3. Immediately after another creature's turn, Zur Et can take one of the following legendary actions. He regains all uses at the start of his turn.",
    "legendaryActions": [
      {
        "name": "Shift",
        "description": "Zur Et uses Step Between Thoughts."
      },
      {
        "name": "Strike",
        "description": "Zur Et makes one Unarmed Strike or Psi Bolt attack."
      },
      {
        "name": "Psychokinetic Slam (Costs 2 Actions)",
        "description": "Zur Et targets one creature he can see within 60 feet. The target must succeed on a DC 18 Strength Saving Throw or be hurled up to 30 feet in a direction of Zur Et's choice and knocked Prone. If the target collides with a solid surface or another creature, both take 11 (3d6) Force damage."
      },
      {
        "name": "Mind Scour (Costs 2 Actions)",
        "description": "Zur Et targets one creature he can see within 60 feet. *Intelligence Saving Throw:* DC 18. *Failure:* 22 (4d10) Psychic damage and the target can't take Reactions and has Disadvantage on attack rolls until the end of its next turn. *Success:* Half damage only."
      }
    ],
    "mythicPreamble": "",
    "mythicActions": [],
    "lairActions": [],
    "description": "",
    "habitat": "",
    "treasure": ""
  }
];
