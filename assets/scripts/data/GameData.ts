import { _decorator, Component, Node, Vec2, Prefab } from 'cc';
import { Field } from '../game/Field';
const { ccclass, property } = _decorator;


@ccclass('SpecialTileData')
export class SpecialTileData {
    @property
    id = '';
    @property
    row = 0;
    @property
    col = 0;
}


@ccclass('SpecialPrefabData')
export class SpecialPrefabData {
    @property
    id = '';
    @property(Prefab)
    prefab: Prefab = null;
}


@ccclass('GoalData')
export class GoalData {
    @property
    id = '';
    @property
    count = 0;
}


@ccclass('LevelData')
export class LevelData {
    @property
    id = '';
    @property([Vec2])
    emptyTiles: Vec2[] = [];
    @property([SpecialTileData])
    specialTiles: SpecialTileData[] = [];
    @property([SpecialTileData])
    statuses: SpecialTileData[] = [];
    @property([Vec2])
    destroyedOnStart: Vec2[] = [];
    @property([cc.String])
    startPool: string[] = [];

    spawnPools: string[][] = [];

    @property([GoalData])
    goals: GoalData[] = [];
    @property
    movesCount = 0;
    @property
    rocketPreset = '';

    static fromJSON(jsonString: string): LevelData {
        const jsonData = JSON.parse(jsonString);
        const levelData = new LevelData();
        levelData.id = (jsonData.id || '').toLowerCase();
    
        if (jsonData.emptyTiles) {
            levelData.emptyTiles = jsonData.emptyTiles.map((coord: any) => {
                const vec2 = new Vec2();
                vec2.x = coord.x;
                vec2.y = coord.y;
                return vec2;
            });
        }
    
        if (jsonData.specialTiles) {
            levelData.specialTiles = jsonData.specialTiles.map((specialTile: any) => {
                const tileData = new SpecialTileData();
                tileData.id = (specialTile.id || '').toLowerCase();
                tileData.row = specialTile.row;
                tileData.col = specialTile.col;
                return tileData;
            });
        }
    
        if (jsonData.statuses) {
            levelData.statuses = jsonData.statuses.map((specialTile: any) => {
                const tileData = new SpecialTileData();
                tileData.id = (specialTile.id || '').toLowerCase();
                tileData.row = specialTile.row;
                tileData.col = specialTile.col;
                return tileData;
            });
        }
    
        if (jsonData.destroyedOnStart) {
            levelData.destroyedOnStart = jsonData.destroyedOnStart.map((coord: any) => {
                const vec2 = new Vec2();
                vec2.x = coord.x;
                vec2.y = coord.y;
                return vec2;
            });
        }
    
        if (jsonData.startPool) {
            levelData.startPool = jsonData.startPool.map((startItem: any) => {
                return (startItem || '').toLowerCase();
            });
        }
    
        if (jsonData.spawnPools) {
            levelData.spawnPools = jsonData.spawnPools.map((spawnItem: any) => {
                return spawnItem.map((color: string) => (color || '').toLowerCase()) || [];
            });
        }
    
        if (jsonData.goals) {
            levelData.goals = jsonData.goals.map((goal: any) => {
                const goalData = new GoalData();
                goalData.id = (goal.id || '').toLowerCase();
                goalData.count = goal.count;
                return goalData;
            });
        }
    
        if (jsonData.movesCount !== cc.undefined && jsonData.movesCount !== null) {
            levelData.movesCount = Number(jsonData.movesCount);
        } else {
            levelData.movesCount = 0;
        }

        if (jsonData.rocketPreset !== cc.undefined && jsonData.rocketPreset !== null) {
            levelData.rocketPreset = jsonData.rocketPreset.toLowerCase();
        } else {
            levelData.rocketPreset = "random";
        }
    
        return levelData;
    }
}


@ccclass()
export class GameData extends Component {

    @property([LevelData])
    levels: LevelData[] = [];

    public static instance: GameData = null;

    onLoad() {
        GameData.instance = this;

        //this.loadLevelsFromDirectory("levels");
    }

    static parseLevelData(jsonString: string): LevelData {
        const jsonData = JSON.parse(jsonString);
        return LevelData.fromJSON(JSON.stringify(jsonData));
    }


    loadLevelsFromDirectory(directoryPath: string) {
        this.levels = [];

        cc.loader.loadResDir(directoryPath, cc.TextAsset, (err, assets) => {
            if (err) {
                console.error('Error loading directory:', err);
                return;
            }

            console.log(assets.length);
    
            assets.forEach((asset: cc.TextAsset) => {
                const fileData = asset.text;
                const fileName = asset.name;

                console.log(fileData);
    
                const levelData = GameData.parseLevelData(fileData);
                this.levels.push(levelData);
                console.log('Level data loaded:', fileName);
            });
        });
    }
}


