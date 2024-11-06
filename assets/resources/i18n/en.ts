
const win = window as any;

export const languages = {
    "StartFrame": {
        "Level": "Level",
        "Play": "Play",
        "Boosters": "Choose Boosters",
        "Gift": "Athena's Gift",
        "Difficulty": "Difficulty",
        "Difficulty_Common": "Common",
        "Difficulty_Hard": "Hard",
        "Difficulty_Superhard": "Superhard",
        "Difficulty_Bonus": "Bonus",
        "GiftInfo": "Don't fail to get extra boosters in next game!"
    },
    "LevelResultFrame": {
        "ShowAds": "",
        "Reward": ""
    }
};

if (!win.languages) {
    win.languages = {};
}

win.languages.en = languages;
