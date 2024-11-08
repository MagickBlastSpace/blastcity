
const win = window as any;

export const languages = {
    "StartFrame": {
    "Level": "Level",
    "Play": "Play",
    "Settings": "Settings",
    "Music": "Music",
    "Sounds": "Sounds",
    "Language": "Language",
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
    "rfdescription": "#VALUE!",
    "atname": "Aphrodite's Treasure",
    "atdescription": "#VALUE!",
    "bpname": "Battle Pass",
    "bpactivare": "Activate",
    "bptake": "Take",
    "bpbonusname": "Bonus Bank",
    "bpbonusdescription": "#VALUE!",
    "bpfree": "For free",
    "bppaid": "Battle Pass",
    "bphint": "Collect more stars to get this reward"
  },
  "misc": {
    "min": "Min"
  }
};

if (!win.languages) {
    win.languages = {};
}

win.languages.en = languages;
