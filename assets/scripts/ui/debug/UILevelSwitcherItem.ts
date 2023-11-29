import { _decorator, Component, Node, Label } from 'cc';
import { LevelData } from '../../data/GameData';
const { ccclass, property } = _decorator;

@ccclass('UILevelSwitcherItem')
export class UILevelSwitcherItem extends Component {
    @property(Label)
    label: Label = null;

    levelData: LevelData = null;


    start() {
        this.node.on(Node.EventType.TOUCH_END, this.onLevelClick, this);
    }

    init(data: LevelData) {
        this.levelData = data;

        this.refresh();
    }


    refresh() {
        this.label.string = this.levelData.id;
    }


    onLevelClick() {
        this.node.emit("click", this.levelData);
    }
}


