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
    purple: SpriteFrame | null = null;

    private tileType: number;
    private row: number;
    private col: number;


    onLoad() {
        this.node.on(Node.EventType.TOUCH_START, this.onTouchStart, this);
    }

    onDestroy() {
        this.node.off(cc.Node.EventType.TOUCH_START, this.onTouchStart, this);
    }
    
    
    init(tileType: number, row: number, col: number) {
        this.tileType = tileType;
        this.row = row;
        this.col = col;
        
        switch(this.tileType) {
            case 0:
                this.icon.spriteFrame = this.blue;
                break;
            case 1:
                this.icon.spriteFrame = this.red;
                break;
            case 2:
                this.icon.spriteFrame = this.green;
                break;
            case 3:
                this.icon.spriteFrame = this.yellow;
                break;
            case 4:
                this.icon.spriteFrame = this.purple;
                break;
        }
    }

    getTileType(): number {
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


    onTouchStart(event: cc.Event.EventTouch) {
        this.node.emit("click", this.node);
    }
}


