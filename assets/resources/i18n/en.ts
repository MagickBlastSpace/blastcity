
const win = window as any;

export const languages = {
  "StartFrame": {
    "Level": "Level",
    "Play": "Play",
    "Settings": "Settings",
    "Music": "Music",
    "Sounds": "Sounds",
    "Language": "Language",
    "Point": "Loading",
    "Boosters": "Choose boosters",
    "Gift": "Gift of Athena",
    "Difficulty": "Complexity",
    "Difficulty_Common": "Regular",
    "Difficulty_Hard": "Difficult",
    "Difficulty_Superhard": "Super difficult",
    "Difficulty_Bonus": "Bonus",
    "GiftInfo": "Complete the levels the first time to start the next game with an enhanced gift!"
  },
  "rating": {
    "rating": "Player Rating",
    "players": "Players",
    "friends": "Friends",
    "clans": "Clans",
    "searchfriend": "Find a Friend",
    "level": "Level",
    "slots": "Places",
    "score": "Glasses",
    "listfriends": "Friends List",
    "friendrequest": "Friendship Request",
    "recfriend": "Recommended friends",
    "world": "World",
    "country": []
  },
  "clans": {
    "clans": "Clans",
    "join": "Join",
    "view": "View",
    "search": "Search",
    "namehint": "Clan Name",
    "show": "Show",
    "showhint": "Find clans that suit you",
    "create": "Create",
    "banner": "Banner",
    "createname": "Enter Clan name",
    "createdescritpion": "Description of the Clan",
    "typehint": "Clan Type",
    "open": "Open",
    "closed": "Closed",
    "levelhint": "Required Experience"
  },
  "events": {
    "levelreq": "Required level",
    "rfname": "Rocket Party",
    "rfdescription": "",
    "atname": "Aphrodite's Treasure",
    "atdescription": "",
    "bpname": "Battle Pass",
    "bpactivare": "Activate",
    "bptake": "Take",
    "bpbonusname": "Bonus Bank",
    "bpbonusdescription": "",
    "bpfree": "For free",
    "bppaid": "Battle Pass",
    "bphint": "Collect more stars to get this reward"
  },
  "misc": {
    "min": "Min"
  },
  "tutorial": {
    "balloon": "Tap cubes next to a VASE to collect it!",
    "duck": "Bring a HEART STATUE to the bottom to collect it!",
    "bubble": "Tap cubes in a BUBBLE to collect it!",
    "box": "Tap cubes next to a BOX to break it!",
    "coin": "Tap cubes next to a COIN to collect it!",
    "magic_hat": "Tap cubes next to a BOWL to collect OLIVES!",
    "colored_balloon": "Make a color match next to a COLORED VASE to collect it!",
    "lamp": "Make 2 matches next to a LAMP to collect it!",
    "jelly": "Tap cubes next to the JELLY before it spreads!",
    "colored_box": "Make a color match next to a COLORED BOX to collect it!",
    "pinata": "STONE can only be cleared by Rocket or Bomb!",
    "jars": "Tap cubes next to CAN TOSS to knock cans down!",
    "easter_egg": "Tap cubes to paint an EASTER EGG then make a color match!",
    "jail": "Tap cubes next to a CAGE to release what's inside!",
    "big_pinata": "Hit GIANT STONE 3 times with Rocket of Bomb to clear it!",
    "shell": "Make 2 consecutive matches next to an OYSTER to collect it!",
    "lemonade": "Make a color match for each LEMONADE BOTTLE to break it!",
    "watermelon": "Make 3 matches next to a WATERMELON to collect it!",
    "iron_box": "IRON BOX can only be cleared be Rocket or Bomb!",
    "fish": "Tap cubes next to a SHELL to create bubble!",
    "honey_jar": "Make 2 matches next to a HONEY JAR to collect it!",
    "safe": "Make a match next to an open safe to collect GEMS!",
    "billboard": "Make a match next to light bulbs to clear th BILLBOARD",
    "lemonade_color": "Careful! All the LEMONADE BOTTLES are the same color!",
    "pump": "Tap cubes next to a POTTER'S WHEEL to create Vases!",
    "cosmo_rocket": "Collect cubes to launch SPACE ROCKETS!",
    "soap": "Tap cubes next to a SOAP to create bubbles!"
  }
};

if (!win.languages) {
    win.languages = {};
}

win.languages.en = languages;
