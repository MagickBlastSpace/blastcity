import { _decorator, Component, Node, Label, Slider, tween, Sprite, SpriteFrame, Button } from 'cc';
import { PlayerEventData } from '../../../data/EventData';
import { UserData } from '../../../data/UserData';
const { ccclass, property } = _decorator;

@ccclass('UIEventSkyRacePlayerItem')
export class UIEventSkyRacePlayerItem extends Component {

    @property(Label)
    playerName: Label = null;
    @property(Label)
    progressLabel: Label = null;

    @property(Slider)
    slider: Slider | null = null;

    @property(Node)
    isPlayer: Node = null;

    @property(Node)
    rewardsLayout: Node = null;
    @property(Node)
    rewardsPlayerLayout: Node = null;
    @property(Sprite)
    rewardIcon: Sprite = null;
    @property([SpriteFrame])
    rewardIcons: SpriteFrame[] = [];

    @property(Sprite)
    placeIcon: Sprite = null;
    @property([SpriteFrame])
    placeIcons: SpriteFrame[] = [];

    @property(Button)
    takeRewardBtn: Button = null;

    private index: number = 0;
    private isRewardTaken: boolean = false;

    
    start() {
        this.takeRewardBtn.node.on(Button.EventType.CLICK, this.onTakeClick, this);
    }
    
    init(index: number) {
        this.index = index;
    }
    
    refresh(data: PlayerEventData) {
        this.playerName.string = data.playerName;
        this.progressLabel.string = data.progressValue;

        this.isPlayer.active = UserData.instance.getPlayerName() === data.playerName || data.playerName === "My Team";

        if(this.rewardsLayout) {
            this.rewardsLayout.active = data.progressValue >= 15;

            if(this.rewardIcon) {
                this.rewardIcon.spriteFrame = this.rewardIcons[this.index];
            }
        }
        
        if(this.rewardsPlayerLayout) {
            this.rewardsPlayerLayout.active = data.progressValue >= 15 && UserData.instance.getPlayerName() === data.playerName && !this.isRewardTaken;
        }

        if(this.placeIcon) {
            if(this.index > 2 || this.index < 0) {
                this.placeIcon.spriteFrame = null;
            }
            this.placeIcon.spriteFrame = this.placeIcons[this.index];
        }
        

        if (!this.slider) {
            //console.warn("Slider component is not assigned.");
            return;
        }

        tween(this.slider)
            .to(2, { progress: data.progressValue / 15 }, { easing: 'quadInOut' })
            .start();
    }

    onTakeClick() {
        this.node.emit("take_reward");

        this.isRewardTaken = true;
        
        if(this.rewardsPlayerLayout) {
            this.rewardsPlayerLayout.active = false;
        }
    }
}


