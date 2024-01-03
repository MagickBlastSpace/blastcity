import { _decorator, Component, Node } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('Level')
export class Level extends Component {
    
    @property(Node)
    field: Node = null;

    private moves: number = 0;

    private isInited: boolean = false;


    start() {
        this.field.on("move", () => this.moveCallback());
        this.field.on("level_init", (movesCount: number) => this.init(movesCount));
    }


    init(movesCount: number) {
        this.moves = movesCount;

        this.node.emit("refresh", this.moves);

        this.isInited = true;
    }


    moveCallback() {
        if(!this.isInited) {
            return;
        }

        if(this.moves > 0) {
            this.moves--;
        }

        this.node.emit("refresh", this.moves);
    }
}


