import { _decorator, Component, Node, Label } from 'cc';
import { UserData } from '../data/UserData';
const { ccclass, property } = _decorator;

@ccclass('UIResources')
export class UIResources extends Component {

    @property(Label)
    goldLabel: Label = null;


    start() {
        UserData.instance.node.on("resources_update", (gold) => this.refresh(gold));
    }

    refresh(gold: number) {
        this.goldLabel.string = gold;
    }
}


