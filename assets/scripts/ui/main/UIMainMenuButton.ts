import { _decorator, Component, Node, SpriteFrame, Sprite } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('UIMainMenuButton')
export class UIMainMenuButton extends Component {

    @property(Sprite)
    icon: Sprite = null;

    @property(SpriteFrame)
    active: SpriteFrame = null;
    @property(SpriteFrame)
    passive: SpriteFrame = null;


    setActiveIcon(isActive: boolean) {
        this.icon.spriteFrame = isActive ? this.active : this.passive;
    }
}


