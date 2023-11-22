import { _decorator, Component, Node } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('TileBase')
export class TileBase extends Component {

    private tileType: string;
    private row: number;
    private col: number;

    private isBonus: boolean;


    onLoad() {
        this.node.on(Node.EventType.TOUCH_START, this.onTouchStart, this);
    }

    onDestroy() {
        this.node.off(cc.Node.EventType.TOUCH_START, this.onTouchStart, this);
    }
    
    
    init(row: number, col: number, tileType: string) {
        this.row = row;
        this.col = col;
        this.tileType = tileType;
    }

    getTileType(): string {
        return this.tileType;
    }

    getRow(): number {
        return this.row;
    }

    getCol(): number {
        return this.col;
    }

    setRow(_row: number) {
        this.row = _row;
    }

    setCol(_col: number) {
        this.col = _col;
    }

    isBonusTile(): boolean {
        return this.isBonus;
    }

    isCurrentTile(row: number, col: number) {
        return row === this.row && col === this.col;
    }

    destroyTile() {
        this.node.destroy();
    }

    getMatches(field: Node[][]): Node[] {
        let matches = [];
        return matches;
    }


    onTouchStart(event: cc.Event.EventTouch) {
        this.node.emit("click", this.node);
    }
}


