import { _decorator, Component, Node, Sprite } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('TileBase')
export class TileBase extends Component {

    @property(Sprite)
    potentialBonusIcon: Sprite = null;

    private tileType: string;
    private row: number;
    private col: number;

    private isBonus: boolean;
    private isEmpty: boolean;
    private isShifts: boolean;
    private isSpecial: boolean;

    private potentialBonus: string = "";


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

    isEmptyTile(): boolean {
        return this.isEmpty;
    }

    isTileShifts(): boolean {
        return this.isShifts;
    }

    isSpecialTile(): boolean {
        return this.isSpecial;
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

    getMatchesByType(field: Node[][]): Node[] {
        let matches = [];
        return matches;
    }

    getPotentialBonus(): string {
        return this.potentialBonus;
    }

    setPotentialBonus(bonus: string) {

    }

    clearPotentialBonus() {
        this.potentialBonus = "";
        this.potentialBonusIcon.spriteFrame = null;
    }

    giveDamage(field: Node[][]) {}


    onTouchStart(event: cc.Event.EventTouch) {
        this.node.emit("click", this.node);
    }


    clear() {}
}


