import { _decorator, Component, Node, Sprite } from 'cc';
import { SpriteTileData } from '../../game/Tile';
const { ccclass, property } = _decorator;

@ccclass('UIStartBonusItem')
export class UIStartBonusItem extends Component {

    @property(Sprite)
    icon: Sprite = null;

    @property([SpriteTileData])
    commonIcons: SpriteTileData[] = [];

    @property
    bonusName: string = "";

    @property(Node)
    activeState: Node = null;

    @property(Node)
    startBonuses: Node = null;


    onLoad() {
        this.node.on(cc.Node.EventType.TOUCH_END, this.onClick, this);

        this.startBonuses.on("refresh", (activeBonuses) => this.refresh(activeBonuses));
    }

    start() {
        this.icon.spriteFrame = this.commonIcons.find(i => i.id === this.bonusName)?.icon;
    }

    onClick(event: cc.Event.EventTouch): void {
        this.node.emit("activate", this.bonusName);
    }


    refresh(activeBonuses: string[]) {
        this.setActiveState(activeBonuses.includes(this.bonusName));
    }
    
    setActiveState(isActive: boolean) {
        this.activeState.active = isActive;
    }
}

