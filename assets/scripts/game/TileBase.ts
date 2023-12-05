import { _decorator, Component, Node, tween, Vec3 } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('TileBase')
export class TileBase extends Component {

    private tileType: string;
    private row: number;
    private col: number;

    private isBonus: boolean;
    private isEmpty: boolean;
    private isShifts: boolean;
    private isSpecial: boolean;

    private currentTween: any = null;


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

        this.currentTween = null;
    }


    getTileType(): string {
        return this.tileType;
    }

    setTileType(newType: string) {
        this.tileType = newType;
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

    isEmptyTile(): boolean {
        return this.isEmpty;
    }

    isTileShifts(): boolean {
        return this.isShifts;
    }

    isSpecialTile(): boolean {
        return this.isSpecial;
    }

    isCommonTile(): boolean {
        return !this.isBonus && !this.isSpecial && !this.isEmpty;
    }


    isCurrentTile(row: number, col: number) {
        return row === this.row && col === this.col;
    }


    destroyTile() {
        if (!this.currentTween) {
            this.currentTween = tween(this.node)
                .to(0.15, { scale: new Vec3(2.5, 2.5, 2.5) }, { easing: 'linear' })
                .call(() => this.node.destroy())
                .start();
        }
    }


    getMatches(field: Node[][]): Node[] {
        let matches = [];
        return matches;
    }

    getMatchesByType(field: Node[][]): Node[] {
        let matches = [];
        return matches;
    }

    giveDamage(field: Node[][]) {}


    onTouchStart(event: cc.Event.EventTouch) {
        this.node.emit("click", this.node);
    }

    clear() {}


    getAdjacentTiles(field: Node[][]): Node[] {
        let matches = [];

        const numRows: number = field.length;
        const numCols: number = field.length > 0 ? field[0].length : 0;

        if(this.row < numRows - 1) {
            matches.push(field[this.row + 1][this.col]);
        }
        if(this.row > 0) {
            matches.push(field[this.row - 1][this.col]);
        }
        if(this.col < numCols - 1) {
            matches.push(field[this.row][this.col + 1]);
        }
        if(this.col > 0) {
            matches.push(field[this.row][this.col - 1]);
        }

        return matches;
    }
}


