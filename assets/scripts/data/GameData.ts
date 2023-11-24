import { _decorator, Component, Node, Vec2 } from 'cc';
const { ccclass, property } = _decorator;


@ccclass('LevelData')
export class LevelData {
    @property
    id = '';
    @property([Vec2])
    emptyTiles: Vec2[] = [];
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


