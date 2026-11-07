/**
 * Совместимость со старыми названиями объектов в JSON уровней GamePush.
 *
 * После обновления уровней на GamePush соответствующие записи
 * можно удалить из словаря.
 *
 * Формат:
 * старое название → актуальное название
 */

export const LEGACY_LEVEL_IDS: Readonly<Record<string, string>> = {
    Fish: 'Otter',
    fish: 'otter',

    Watermelon: 'Pumpkin',
    watermelon: 'pumpkin',

    BigPinata: 'big_hive',
    Big_Pinata: 'big_hive',
    big_pinata: 'big_hive',
    Big_Hive: 'big_hive',

    Pinata: 'hive',
    pinata: 'hive',
    Hive: 'hive',
};

export class LevelIdTranslator {

    static translateId(id: string): string {
        return LEGACY_LEVEL_IDS[id] ?? id;
    }

    static translateLevel<T>(level: T): T {
        if (!level || typeof level !== 'object') {
            return level;
        }

        const translated = structuredClone(level) as T;

        const data = translated as any;

        const translateItems = (items: any[]) => {
            if (!Array.isArray(items)) {
                return;
            }

            for (const item of items) {
                if (item && typeof item.id === 'string') {
                    item.id = LevelIdTranslator.translateId(item.id);
                }
            }
        };

        translateItems(data.specialTiles);
        translateItems(data.goals);
        translateItems(data.statuses);
        translateItems(data.dynamiteGoals);

        return translated;
    }
}
