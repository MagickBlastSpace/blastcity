import { _decorator, Component, Node, SpriteFrame, Sprite, Button, Color } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('UIProfileChangeItem')
export class UIProfileChangeItem extends Component {

    @property(Sprite)
    iconAvatar: Sprite = null;
    @property(Sprite)
    iconFrame: Sprite = null;
    @property(Sprite)
    iconColor: Sprite = null;
    @property(Sprite)
    iconBadge: Sprite = null;

    @property(Button)
    clickBtn: Button = null;

    @property(Node)
    active: Node = null;


    start() {
        this.clickBtn.node.on(Button.EventType.CLICK, this.onBtnClick, this);
    }

    
    init(type: string, spf: SpriteFrame) {
        switch(type) {
            case "avatar":
                this.iconAvatar.node.active = true;
                this.iconAvatar.spriteFrame = spf;

                break;
            
            case "frame":
                this.iconFrame.node.active = true;
                this.iconFrame.spriteFrame = spf;

                break;

            case "badge":
                this.iconBadge.node.active = true;
                this.iconBadge.spriteFrame = spf;

                break;
        }
    }

    initColor(col: Color) {
        this.iconColor.node.active = true;
        this.iconColor.color = col;
    }


    setActive(isActive: boolean) {
        this.active.active = isActive;
    }


    onBtnClick() {
        this.node.emit("click");
    }


    disableAll() {
        this.iconAvatar.node.active = false;
        this.iconFrame.node.active = false;
        this.iconColor.node.active = false;
        this.iconBadge.node.active = false;
    }
}


