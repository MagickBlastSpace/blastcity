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


    Balloon: 'CrystalBall',
    balloon: 'crystal_ball',
    Balloon_Blue: 'CrystalBall_Blue',
    balloon_blue: 'crystal_ball_blue',
    Balloon_Green: 'CrystalBall_Green',
    balloon_green: 'crystal_ball_green',
    Balloon_Red: 'CrystalBall_Red',
    balloon_red: 'crystal_ball_red',
    Balloon_Yellow: 'CrystalBall_Yellow',
    balloon_yellow: 'crystal_ball_yellow',
    Balloon_Purple: 'CrystalBall_Purple',
    balloon_purple: 'crystal_ball_purple',

};


export class LevelIdTranslator {

    static translateId(id: string): string {
        const translated =
            LEGACY_LEVEL_IDS[id] ??
            LEGACY_LEVEL_IDS[id.toLowerCase()] ??
            id;

        if(/^crystal_?ball(?:_(blue|green|red|yellow|purple))?$/i.test(translated)) {
            return translated
                .replace(/^crystal_?ball/i, 'crystalball')
                .toLowerCase();
        }

        return translated;
    }


    static getColoredGoalIdForTile(tileId: string): string {
        const currentId = LevelIdTranslator.translateId(tileId);

        const legacyId = Object.keys(LEGACY_LEVEL_IDS).find(
            (oldId) =>
                oldId === oldId.toLowerCase() &&
                oldId.includes('_') &&
                LevelIdTranslator.translateId(oldId) === currentId
        );

        const groupName = (legacyId ?? currentId).split('_')[0];

        return `colored_${groupName}`;
    }


    static getSpawnIdsForGoal(
        goalId: string,
        availableColors: string[]
    ): string[] {

        if(!goalId.startsWith('colored_')) {
            return [LevelIdTranslator.translateId(goalId)];
        }

        const groupName = goalId.substring('colored_'.length);

        return availableColors.map((color) =>
            LevelIdTranslator.translateId(
                `${groupName}_${color}`
            )
        );
    }


    static translateLevel<T>(level: T): T {
        if(!level || typeof level !== 'object') {
            return level;
        }

        const translated = structuredClone(level) as T;
        const data = translated as any;

        const translateItems = (items: any[]) => {
            if(!Array.isArray(items)) return;

            for(const item of items) {
                if(item && typeof item.id === 'string') {
                    item.id = LevelIdTranslator.translateId(item.id);
                }
            }
        };

        const translatePool = (pool: any): any => {
            if(!Array.isArray(pool)) return pool;

            return pool.map((id: any) =>
                typeof id === 'string'
                    ? LevelIdTranslator.translateId(id)
                    : id
            );
        };

        translateItems(data.specialTiles);

        if(Array.isArray(data.goals)) {
            translateItems(
                data.goals.filter((goal: any) =>
                    goal?.id?.toLowerCase() !== 'balloon'
                )
            );
        }

        translateItems(data.statuses);
        translateItems(data.dynamiteGoals);

        data.startPool = translatePool(data.startPool);

        if(Array.isArray(data.spawnPools)) {
            data.spawnPools = data.spawnPools.map(
                (pool: any) => translatePool(pool)
            );
        }

        return translated;
    }
}
