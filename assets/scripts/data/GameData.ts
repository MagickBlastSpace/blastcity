import { _decorator, Component, Node, Vec2, Prefab } from 'cc';
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

    static fromJSON(jsonString: string): LevelData {
        const jsonData = JSON.parse(jsonString);
        const levelData = new LevelData();
        levelData.id = jsonData.id;

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
                tileData.id = specialTile.id;
                tileData.row = specialTile.row;
                tileData.col = specialTile.col;
                return tileData;
            });
        }

        if (jsonData.statuses) {
            levelData.statuses = jsonData.statuses.map((specialTile: any) => {
                const tileData = new SpecialTileData();
                tileData.id = specialTile.id;
                tileData.row = specialTile.row;
                tileData.col = specialTile.col;
                return tileData;
            });
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
    }
}


