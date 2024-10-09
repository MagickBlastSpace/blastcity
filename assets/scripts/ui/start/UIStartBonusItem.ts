import { _decorator, Component, Node, Sprite, Label, SpriteFrame } from 'cc';
import { SpriteTileData } from '../../game/Tile';
import { UserData } from '../../data/UserData';
import { AudioController } from '../../utils/AudioController';
const { ccclass, property } = _decorator;

@ccclass('UIStartBonusItem')
export class UIStartBonusItem extends Component {

    @property(Sprite)
    icon: Sprite = null;

    @property(Sprite)
    frame: Sprite = null;
    @property(SpriteFrame)
    active: SpriteFrame = null;
    @property(SpriteFrame)
    inactive: SpriteFrame = null;

    @property(Node)
    activeState: Node = null;

    @property([SpriteTileData])
    commonIcons: SpriteTileData[] = [];

    @property
    bonusName: string = "";

    @property(Node)
    timePanel: Node = null;

    @property(Node)
    startBonuses: Node = null;

    @property(Label)
    countLabel: Label = null;
    @property(Label)
    timeLabel: Label = null;

    private count: number = 0;


    onLoad() {
        this.node.on(cc.Node.EventType.TOUCH_END, this.onClick, this);

        this.startBonuses.on("refresh", (activeBonuses) => this.refresh(activeBonuses));
    }

    start() {
        this.icon.spriteFrame = this.commonIcons.find(i => i.id === this.bonusName)?.icon;

        this.updateCount();

        UserData.instance.node.on("resources_update", (gold) => this.updateCount());
    }

    update(deltaTime: number) {
        this.timeLabel.string = UserData.instance.getRemainingTimeString(this.bonusName);

        this.timePanel.active = this.timeLabel.string !== "";
    }

    onClick(event: cc.Event.EventTouch): void {
        if(this.count <= 0 && !UserData.instance.isDevMode()) {
            return;
        }

        this.node.emit("activate", this.bonusName);

        AudioController.instance.playClick();
    }


    refresh(activeBonuses: string[]) {
        this.setActiveState(activeBonuses.includes(this.bonusName));
    }
    
    setActiveState(isActive: boolean) {
        this.frame.spriteFrame = isActive ? this.active : this.inactive;

        this.activeState.active = isActive;
    }


    updateCount() {
        this.count = UserData.instance.getResource(this.bonusName);
        this.countLabel.string = count;
    }
}

