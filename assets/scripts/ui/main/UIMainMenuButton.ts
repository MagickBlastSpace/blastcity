import { _decorator, Component, Node, SpriteFrame, Sprite, tween, Vec2, Vec3 } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('UIMainMenuButton')
export class UIMainMenuButton extends Component {

    @property(Sprite)
    icon: Sprite = null;

    @property(Node)
    label: Node = null;
    @property(Node)
    img: Node = null;

    @property(SpriteFrame)
    active: SpriteFrame = null;
    @property(SpriteFrame)
    passive: SpriteFrame = null;


    setActiveIcon(isActive: boolean) {
        this.icon.spriteFrame = isActive ? this.active : this.passive;

        /*let icon_scale_X = isActive ? 1.36 : 1;

        tween(this.icon.node)
            .to(0.2, { scale: new Vec3(icon_scale_X, 1, 1) }, { easing: 'elasticInOut' })
            .call(() => this.setImgPosition(isActive))
            .start();*/

        this.setImgPosition(isActive);
    }

    setImgPosition(isActive: boolean) {
        let img_scale = isActive ? 1.36 : 1;
        let pos_Y = isActive ? 90 : 0;

        tween(this.img)
            .to(0.2, { scale: new Vec3(img_scale, img_scale, img_scale) }, { easing: 'elasticInOut' })
            .to(0.2, { position: new Vec3(0, pos_Y, 0) })
            .call(() => this.setLabel(isActive))
            .start();
    }

    setLabel(isActive: boolean) {
        this.label.active = isActive;
    }
}


