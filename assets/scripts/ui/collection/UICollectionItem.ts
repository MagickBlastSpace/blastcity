import { _decorator, Component, Node, Label, Button, assetManager, SpriteFrame, Sprite, ProgressBar, tween, UITransform } from 'cc';
import { CollectionData } from '../../data/CollectionData';
import { EventBase } from '../../game/events/EventBase';
import { Localization } from '../../utils/Localization';
const { ccclass, property } = _decorator;

@ccclass('UICollectionItem')
export class UICollectionItem extends Component {

    @property(Label)
    name_: Label = null;

    @property(Label)
    progress: Label = null;

    @property(Node)
    isComplete: Node = null;
    @property(Node)
    takeReward: Node = null;
    @property(Button)
    takeRewardBtn: Button = null;

    @property(Label)
    rewardLabel: Label = null;
    @property(Sprite)
    rewardIcon: Sprite = null;

    @property(SpriteFrame)
    gold: SpriteFrame = null;
    @property(SpriteFrame)
    rocket: SpriteFrame = null;
    @property(SpriteFrame)
    bomb: SpriteFrame = null;
    @property(SpriteFrame)
    discoball: SpriteFrame = null;
    @property(SpriteFrame)
    hammer: SpriteFrame = null;
    @property(SpriteFrame)
    cannon: SpriteFrame = null;
    @property(SpriteFrame)
    bow: SpriteFrame = null;
    @property(SpriteFrame)
    jester: SpriteFrame = null;
    @property(SpriteFrame)
    x2: SpriteFrame = null;
    @property(SpriteFrame)
    lives: SpriteFrame = null;

    @property(Button)
    clickBtn: Button = null;

    @property(Sprite)
    image: Sprite = null;

    @property(ProgressBar)
    progressBar: ProgressBar = null;
    @property(Node)
    progressContainer: Node = null;

    @property(Label)
    indicatorCount: Label = null;
    @property(Node)
    indicator: Node = null;

    private data: CollectionData;


    start() {
        this.clickBtn.node.on(Button.EventType.CLICK, this.onClickBtnClick, this);

        this.takeRewardBtn.node.on(Button.EventType.CLICK, this.onTakeRewardBtnClick, this);
    }

    
    refresh(data: CollectionData, progress: number, controller: EventBase) {
        this.name_.string = data.name_;

        this.progress.string = progress + "/" + data.cards.length;

        this.data = data;

        let progressValue = progress / data.cards.length;
        
        if(this.progressBar) {
            tween(this.progressBar)
                .to(0.8, { progress: progressValue })
                .start();
        }

        this.rewardLabel.string = "";

        if(data.rewards.length > 0) {
            if(data.rewards[0].gold > 0) {
                this.rewardIcon.spriteFrame = this.gold;
                this.rewardLabel.string = data.rewards[0].gold;
            }

            if(data.rewards[0].startBonus_Bomb > 0) {
                this.rewardIcon.spriteFrame = this.bomb;
                this.rewardLabel.string = data.rewards[0].startBonus_Bomb;
            }
            if(data.rewards[0].startBonus_Rocket > 0) {
                this.rewardIcon.spriteFrame = this.rocket;
                this.rewardLabel.string = data.rewards[0].startBonus_Rocket;
            }
            if(data.rewards[0].startBonus_Discoball > 0) {
                this.rewardIcon.spriteFrame = this.discoball;
                this.rewardLabel.string = data.rewards[0].startBonus_Discoball;
            }

            if(data.rewards[0].booster_Hammer > 0) {
                this.rewardIcon.spriteFrame = this.hammer;
                this.rewardLabel.string = data.rewards[0].booster_Hammer;
            }
            if(data.rewards[0].booster_Bow > 0) {
                this.rewardIcon.spriteFrame = this.bow;
                this.rewardLabel.string = data.rewards[0].booster_Bow;
            }
            if(data.rewards[0].booster_Cannon > 0) {
                this.rewardIcon.spriteFrame = this.cannon;
                this.rewardLabel.string = data.rewards[0].booster_Cannon;
            }
            if(data.rewards[0].booster_Jester > 0) {
                this.rewardIcon.spriteFrame = this.jester;
                this.rewardLabel.string = data.rewards[0].booster_Jester;
            }

            if(data.rewards[0].bomb_Minutes > 0) {
                this.rewardIcon.spriteFrame = this.bomb;
                this.rewardLabel.string = data.rewards[0].bomb_Minutes + " Min";
            }
            if(data.rewards[0].rocket_Minutes > 0) {
                this.rewardIcon.spriteFrame = this.rocket;
                this.rewardLabel.string = data.rewards[0].rocket_Minutes + " Min";
            }
            if(data.rewards[0].discoball_Minutes > 0) {
                this.rewardIcon.spriteFrame = this.discoball;
                this.rewardLabel.string = data.rewards[0].discoball_Minutes + " Min";
            }

            if(data.rewards[0].endlessLives_Minutes > 0) {
                this.rewardIcon.spriteFrame = this.lives;
                this.rewardLabel.string = data.rewards[0].endlessLives_Minutes + " Min";
            }
            if(data.rewards[0].modifierX2_Minutes > 0) {
                this.rewardIcon.spriteFrame = this.x2;
                this.rewardLabel.string = data.rewards[0].modifierX2_Minutes + " Min";
            }
        }

        this.isComplete.active = controller.isCollectionComplete(data.id);
        this.takeReward.active = !controller.isCollectionRewardTaken(data.id);
        this.progressContainer.active = !controller.isCollectionComplete(data.id);

        let unchecked = controller.getUncheckedCardsCountByCollection(data);
        this.indicator.active = unchecked > 0;
        this.indicatorCount.string = unchecked;

        const season_Prefix = controller.getSeasonPrefix();

        this.name_.string = Localization.instance.getLabelByKey("collection_data." + season_Prefix + data.id);

        assetManager.loadBundle("covers", (err, bundle) => {
            if (err) {
                console.error(`Failed to load bundle: covers`, err);
                return;
            }

            console.log(`Successfully loaded bundle: covers"`);

            bundle.load(season_Prefix + data.id + "/spriteFrame", SpriteFrame, (err, spriteFrame) => {
                if (err) {
                    console.error(`Failed to load prefab: ` + season_Prefix + data.id, err);
                    return;
                }

                console.log(`Successfully loaded prefab: ` + season_Prefix + data.id);

                this.image.spriteFrame = spriteFrame;
            });
        });
    }


    onClickBtnClick() {
        this.node.emit("click", this.data);
    }

    onTakeRewardBtnClick() {
        const btnWorldPos = this.takeRewardBtn.node.getWorldPosition();

        this.node.emit("reward", this.data, btnWorldPos);
    }
}


