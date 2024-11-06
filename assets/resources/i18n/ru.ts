
const win = window as any;

export const languages = {
    "StartFrame": {
        "Level": "Уровень",
        "Play": "Играть",
        "Boosters": "Выбери бустеры",
        "Gift": "Дар Афины",
        "Difficulty": "Сложность",
        "Difficulty_Common": "Обычная",
        "Difficulty_Hard": "Тяжелая",
        "Difficulty_Superhard": "Супер тяжелая",
        "Difficulty_Bonus": "Бонус",
        "GiftInfo": "Проходи уровни с первого раза, что бы начать следующую игру с усиленным даром!"
    },
    "LevelResultFrame": {
        "ShowAds": "",
        "Reward": ""
    }
};

if (!win.languages) {
    win.languages = {};
}

win.languages.ru = languages;
