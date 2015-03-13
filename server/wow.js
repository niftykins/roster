WOW = {
	classes: {
		"warrior": 1,
		"paladin": 2,
		"hunter": 3,
		"rogue": 4,
		"priest": 5,
		"dk": 6,
		"shaman": 7,
		"mage": 8,
		"warlock": 9,
		"monk": 10,
		"druid": 11,

		1: "warrior",
		2: "paladin",
		3: "hunter",
		4: "rogue",
		5: "priest",
		6: "dk",
		7: "shaman",
		8: "mage",
		9: "warlock",
		10: "monk",
		11: "druid"
	},

	allClasses: ["warrior", "paladin", "hunter", "rogue", "priest", "dk", "shaman", "mage", "warlock", "monk", "druid"],

	allRoles: ["caster", "melee", "tank", "healer"],

	classCanUse: {
		"warrior": [
			"misc",
			"plate",
			"1h sword",
			"2h sword",
			"1h axe",
			"2h axe",
			"1h mace",
			"2h mace",
			"polearm",
			"shield",
		],

		"paladin": [
			"misc",
			"plate",
			"1h sword",
			"2h sword",
			"1h axe",
			"2h axe",
			"1h mace",
			"2h mace",
			"polearm",
			"shield"
		],

		"hunter": [
			"misc",
			"mail",
			"crossbow",
			"gun",
			"bow"
		],

		"rogue": [
			"misc",
			"leather",
			"1h sword",
			"1h axe",
			"1h mace",
			"dagger",
			"fist"
		],

		"priest": [
			"misc",
			"cloth",
			"staff",
			"1h mace",
			"dagger",
			"wand"
		],

		"dk": [
			"misc",
			"plate",
			"1h sword",
			"2h sword",
			"1h axe",
			"2h axe",
			"1h mace",
			"2h mace",
			"polearm"
		],

		"shaman": [
			"misc",
			"mail",
			"staff",
			"1h axe",
			"1h mace",
			"dagger",
			"shield",
			"fist"
		],

		"mage": [
			"misc",
			"cloth",
			"staff",
			"1h sword",
			"dagger",
			"wand"
		],

		"warlock": [
			"misc",
			"cloth",
			"staff",
			"1h sword",
			"dagger",
			"wand"
		],

		"monk": [
			"misc",
			"leather",
			"staff",
			"1h sword",
			"1h axe",
			"1h mace",
			"polearm",
			"fist"
		],

		"druid": [
			"misc",
			"leather",
			"staff",
			"1h mace",
			"2h mace",
			"dagger",
			"polearm",
			"fist"
		]
	},

	stat: {
		3: "agility",
		4: "strength",
		5: "intellect",
		7: "stamina",
		72: "agility/strength",
		73: "agility/intellect",
		74: "intellect/strength",

		45: "spell power",

		6: "spirit",
		50: "bonus armour",

		32: "crit",
		36: "haste",
		40: "versitility",
		49: "mastery",
		59: "multistrike"
	},

	inventoryType: {
		0: "",
		1: "head",
		2: "neck",
		3: "shoulder",
		4: "shirt",
		5: "chest",
		6: "waist",
		7: "legs",
		8: "feet",
		9: "wrist",
		10: "hands",
		11: "ring",
		12: "trinket",
		13: "1h",
		14: "shield",
		15: "ranged",
		16: "cloak",
		17: "2h",
		18: "bag",
		19: "tabard",
		20: "robe",
		21: "main hand",
		22: "offhand",
		23: "offhand",
		24: "ammo",
		25: "thrown",
		26: "ranged" // not sure
	},

	quality: {
		0: "poor", // 9D9D9D
		1: "common", // FFFFFF
		2: "uncommon", // 1EFF00
		3: "rare", // 0070DD
		4: "epic", // A335EE
		5: "legendary" // FF8000
	},

	itemClass: {
		2: {
			name: "weapon",
			itemSubClass: {
				0: "1h axe",
				1: "2h axe",
				2: "bow",
				3: "gun",
				4: "1h mace",
				5: "2h mace",
				6: "polearm",
				7: "1h sword",
				8: "2h sword",
				9: "obsolete",
				10: "staff",
				11: "1h exotic",
				12: "2h exotic",
				13: "fist",
				14: "misc",
				15: "dagger",
				16: "thrown",
				17: "spear",
				18: "crossbow",
				19: "wand",
				20: "fishing pole",
				41105: "1h melee weapon",
				173555: "melee weapon",
				262156: "ranged weapon"
			}
		},

		4: {
			name: "armour",
			itemSubClass: {
				0: "misc",
				1: "cloth",
				2: "leather",
				3: "mail",
				4: "plate",
				5: "cosmetic",
				6: "shield"
			}
		},

		15: {
			name: "misc",
			itemSubClass: {
				0: "tier token",
				5: "mount"
			}
		}
	}
};
