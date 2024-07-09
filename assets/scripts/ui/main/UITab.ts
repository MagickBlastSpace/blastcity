import { _decorator, Component, Node, Sprite, SpriteFrame, Button } from 'cc';
import { UIFrameBase } from '../UIFrameBase';
const { ccclass, property } = _decorator;

@ccclass('UITab')
export class UITab extends Component {
    @property(Sprite)
    icon: Sprite = null;

    @property(SpriteFrame)
    active: SpriteFrame = null;
    @property(SpriteFrame)
    passive: SpriteFrame = null;

    @property
    frameIndex: number = 0;

    @property(Button)
    clickBtn: Button = null;


    start() {
        this.clickBtn.node.on(Button.EventType.CLICK, this.onBtnClick, this);
    }
    
    setActiveIcon(isActive: boolean) {
        this.icon.spriteFrame = isActive ? this.active : this.passive;
    }


    onBtnClick() {
        this.node.emit("tab", this.frameIndex);
    }
}


