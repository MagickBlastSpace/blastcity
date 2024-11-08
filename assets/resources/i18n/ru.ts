
const win = window as any;

export const languages = {
    "StartFrame": {
      "Level": "Уровень",
      "Play": "Играть",
      "Settings": "Настройки",
      "Music": "Музыка",
      "Sounds": "Звуки",
      "Language": "Язык",
      "Boosters": "Выбери бустеры",
      "Gift": "Дар Афины",
      "Difficulty": "Сложность",
      "Difficulty_Common": "Обычная",
      "Difficulty_Hard": "Сложная",
      "Difficulty_Superhard": "Супер сложная",
      "Difficulty_Bonus": "Бонус",
      "GiftInfo": "Проходи уровни с первого раза, что бы начать следующую игру с усиленным даром!"
    },
    "rating": {
      "rating": "Рейтинг Игроков",
      "players": "Игроки",
      "friends": "Друзья",
      "clans": "Кланы",
      "searchfriend": "Найти Друга",
      "level": "Уровень",
      "slots": "Места",
      "score": "Очки",
      "listfriends": "Список Друзей",
      "friendrequest": "Запрос Дружбы",
      "recfriend": "Рекомендованные друзья",
      "world": "Мир",
      "country": []
    },
    "clans": {
      "clans": "Кланы",
      "join": "Присоединиться",
      "view": "Просмотр",
      "search": "Поиск",
      "namehint": "Название Клана",
      "show": "Показать",
      "showhint": "Подобрать подходящие для вас кланы",
      "create": "Создать",
      "banner": "Знамя",
      "createname": "Ввести название Клана",
      "createdescritpion": "Описание Клана",
      "typehint": "Тип Клана",
      "open": "Открытый",
      "closed": "Закрытый",
      "levelhint": "Требуемый опыт"
    },
    "events": {
      "levelreq": "Требуемый уровень",
      "rfname": "Ракетная вечеринка",
      "rfdescription": "",
      "atname": "Сокровище Афродиты",
      "atdescription": "",
      "bpname": "Боевой пропуск",
      "bpactivare": "Активировать",
      "bptake": "Забрать",
      "bpbonusname": "Банк Бонусов",
      "bpbonusdescription": "",
      "bpfree": "Бесплатно",
      "bppaid": "Боевой пропуск",
      "bphint": "Соберите больше звезд чтобы получить эту награду"
    },
    "misc": {
      "min": "Мин"
    }
  };

if (!win.languages) {
    win.languages = {};
}

win.languages.ru = languages;
