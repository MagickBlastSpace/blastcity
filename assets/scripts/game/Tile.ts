import { _decorator, Component, Node, Sprite, SpriteFrame, Vec2, Vec3, UITransform } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('Tile')
export class Tile extends Component {

    @property(Sprite)
    icon: Sprite = null;

    @property(SpriteFrame)
    blue: SpriteFrame | null = null;
    @property(SpriteFrame)
    red: SpriteFrame | null = null;
    @property(SpriteFrame)
    green: SpriteFrame | null = null;
    @property(SpriteFrame)
    yellow: SpriteFrame | null = null;

    @property(SpriteFrame)
    bomb: SpriteFrame | null = null;

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

        this.isBonus = false;
        
        switch(this.tileType) {
            case '0':
                this.icon.spriteFrame = this.blue;
                break;
            case '1':
                this.icon.spriteFrame = this.red;
                break;
            case '2':
                this.icon.spriteFrame = this.green;
                break;
            case '3':
                this.icon.spriteFrame = this.yellow;
                break;
            case 'bomb':
                this.isBonus = true;
                this.icon.spriteFrame = this.bomb;
                break;
        }
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


    onTouchStart(event: cc.Event.EventTouch) {
        this.node.emit("click", this.node);
    }
}


