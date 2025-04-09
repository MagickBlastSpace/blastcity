import { _decorator, Component, Node, Sprite, tween, Vec3, Color, SpriteFrame } from 'cc';
import { SpriteTileData } from '../../../game/Tile';
import { SpriteColorData } from '../../../data/GameData';
const { ccclass, property } = _decorator;

@ccclass('UIEventMagicCauldronItem')
export class UIEventMagicCauldronItem extends Component {
    
    @property(Sprite)
    icon: Sprite = null;

    @property([SpriteTileData])
    iconsData: SpriteTileData[] = [];

    @property([SpriteColorData])
    colorsData: SpriteColorData[] = [];

    @property(Sprite)
    indicator: Sprite = null;

    @property(SpriteFrame)
    active: SpriteFrame = null;
    @property(SpriteFrame)
    passive: SpriteFrame = null;

    @property
    isClickable: boolean = false;

    private col: string = "";


    start() {
        if(this.isClickable) {
            this.node.on(Node.EventType.TOUCH_START, this.onTouchStart, this);
        }
    }


    onTouchStart(event: cc.Event.EventTouch) {
        if(this.col !== "" && this.col !== "none" && this.col !== "undefined") {
            this.node.emit("remove", this.col);
        }
    }


    refresh(color: string) {
        this.col = color;

        if(color === "none" || (color === "undefined" && this.isClickable)) {
            if(this.icon.spriteFrame !== null) {
                tween(this.icon.node).stop();
                tween(this.icon.node)
                    .to(0.3, { scale: new Vec3(0, 0, 0) }, { easing: 'backIn' })
                    .call(() => {
                        this.icon.spriteFrame = null;
                    })
                    .start();
            }
                
            this.icon.spriteFrame = null;

            return;
        }

        tween(this.icon.node).stop();
        tween(this.icon.node)
            .to(0.3, { scale: new Vec3(1, 1, 1) }, { easing: 'backOut' })
            .start();

        this.icon.color = Color.WHITE;
        this.icon.spriteFrame = this.iconsData.find(i => i.id === color)?.icon;
    }

    setColor(color: string) {
        let colorData = this.colorsData.find(i => i.cid === color);
        if(colorData && colorData !== undefined) {
            this.icon.color = new Color(colorData.r, colorData.g, colorData.b, colorData.a);
        }
    }

    setIndicator(isActive: boolean) {
        this.indicator.spriteFrame = isActive ? this.active : this.passive;
    }

    removeIndicator() {
        this.indicator.spriteFrame = null;
    }
}


