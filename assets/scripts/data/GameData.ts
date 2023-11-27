import { _decorator, Component, Node, Vec2 } from 'cc';
const { ccclass, property } = _decorator;


@ccclass('SpecialTileData')
export class SpecialTileData {
    @property
    id = 0;
    @property
    row = 0;
    @property
    col = 0;
}


@ccclass('LevelData')
export class LevelData {
    @property
    id = '';
    @property([Vec2])
    emptyTiles: Vec2[] = [];
    @property([SpecialTileData])
    specialTiles: SpecialTileData[] = [];
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


