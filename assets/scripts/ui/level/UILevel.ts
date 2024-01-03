import { _decorator, Component, Node, Label } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('UILevel')
export class UILevel extends Component {

    @property(Node)
    level: Node = null;

    @property(Label)
    movesCount: Label = null;


    start() {
        this.level.on("refresh", (movesCount: number) => this.refresh(movesCount));
    }

    refresh(movesCount: number) {
        this.movesCount.string = "Moves: " + movesCount;
    }
}


