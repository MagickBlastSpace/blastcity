import { _decorator, Component, Node, Label, Slider, tween, Sprite, SpriteFrame, Button } from 'cc';
import { PlayerEventData } from '../../../data/EventData';
import { UserData } from '../../../data/UserData';
import { Net } from '../../../net/Net';
import { Profile } from '../../../game/Profile';
const { ccclass, property } = _decorator;

@ccclass('UIEventSkyRacePlayerItem')
export class UIEventSkyRacePlayerItem extends Component {

    @property(Label)
    playerName: Label = null;
    @property(Label)
    clanName: Label = null;
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

    @property([Node])
    rewards: Node[] = [];

    @property(Sprite)
    placeIcon: Sprite = null;
    @property([SpriteFrame])
    placeIcons: SpriteFrame[] = [];

    @property(Sprite)
    avatar: Sprite = null;

    @property(Button)
    takeRewardBtn: Button = null;
    @property(Button)
    showRewardBtn: Button = null;

    @property
    index: number = 0;
    
    private isRewardTaken: boolean = false;

    private data: PlayerEventData;

    
    start() {
        if(this.takeRewardBtn && this.takeRewardBtn !== undefined) {
            this.takeRewardBtn.node.on(Button.EventType.CLICK, this.onTakeClick, this);
        }

        if(this.showRewardBtn && this.showRewardBtn !== undefined) {
            this.showRewardBtn.node.on(Button.EventType.CLICK, this.onShowRewardClick, this);
        }
    }
    
    init(index: number) {
        this.index = index;
    }
    
    refresh(data: PlayerEventData, isRewardAvailable: boolean) {
        this.data = data;

        this.playerName.string = data.playerName;
        this.progressLabel.string = data.progressValue;

        this.isRewardTaken = !isRewardAvailable;

        this.isPlayer.active = UserData.instance.getPlayerId() === this.data.playerId;

        if(this.placeIcon && this.placeIcon !== undefined) {
            if(this.index > 2 || this.index < 0) {
                this.placeIcon.spriteFrame = null;
                this.placeIcon.node.active = false;
            }
            else {
                this.placeIcon.node.active = true;
                this.placeIcon.spriteFrame = this.placeIcons[this.index];
            }
        }

        this.loadAvatar(data.playerId);
        
        if (!this.slider) {
            //console.warn("Slider component is not assigned.");
            return;
        }

        tween(this.slider)
            .to(2, { progress: data.progressValue / 15 }, { easing: 'quadInOut' })
            .call(() => {
                this.checkReward();
            })
            .start();
    }


    checkReward() {
        if(this.isRewardAvailable()) {
            this.showRewardLayout();
        }
    }


    setBasicState() {
        this.playerName.string = "";
        this.progressLabel.string = "0";

        this.isPlayer.active = false;

        if(this.placeIcon && this.placeIcon !== undefined) {
            this.placeIcon.spriteFrame = null;
            this.placeIcon.node.active = false;
        }

        if(this.avatar) {
            this.avatar.spriteFrame = null;
        }

        if(this.slider) {
            this.slider.progress = 0;
        }

        this.rewardsLayout.active = false;
        this.rewardsPlayerLayout.active = false;
    }


    showRewardLayout() {
        if(this.rewardsLayout && this.rewardsLayout !== undefined) {
            if(this.index < 0 || this.index >= this.rewards.length) {
                this.rewardsLayout.active = false;

                return;
            }

            this.rewardsLayout.active = true;

            for(let i = 0; i < this.rewards.length; i++) {
                this.rewards[i].active = false;
            }

            if(this.index < this.rewards.length && this.index >= 0) {
                this.rewards[this.index].active = true;
            }
        }
        
        if(this.rewardsPlayerLayout && this.rewardsPlayerLayout !== undefined) {
            this.rewardsPlayerLayout.active = this.isRewardAvailable();
        }
    }

    isRewardAvailable(): boolean {
        return this.data.progressValue >= 15 && UserData.instance.getPlayerId() === this.data.playerId && !this.isRewardTaken && this.index >= 0 && this.index < 3
    }


    async loadAvatar(id: number) {
        if(id === 0) {
            return;
        }
        
        try {
            let ids = [id];
            const result = await Net.instance.getPlayersByIds(ids);
            
            const { players } = result;
            
            if(players.length > 0) {
                if(this.avatar) {
                    this.avatar.spriteFrame = Profile.instance.getAvatarById(players[0].state["avatar_id"]);
                }

                if(this.clanName) {
                    this.clanName.string = players[0].state["clanname"];
                }
            }
        }

        catch (error) {
            console.log('Error fetching players:', error);
        }
    }


    onTakeClick() {
        this.node.emit("take_reward");

        this.isRewardTaken = true;
        
        if(this.rewardsPlayerLayout) {
            this.rewardsPlayerLayout.active = false;
        }

        if(this.rewardsLayout) {
            this.rewardsLayout.active = false;
        }
    }

    onShowRewardClick() {
        if(this.rewardsLayout) {
            if(this.rewardsLayout.active) {
                this.rewardsLayout.active = false;
            }
            else {
                this.showRewardLayout();
            }
        }
    }
}


