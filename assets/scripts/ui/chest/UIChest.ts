import { _decorator, Component, Node, ProgressBar, Label, Button, Vec3, tween, Vec2 } from 'cc';
import { Chest } from '../../game/Chest';
import { ResolutionManager } from '../../utils/ResolutionManager';
import { GameData } from '../../data/GameData';
import { ChestRewardData } from '../../data/ChestData';
import { UIRewardInfoMinified } from '../UIRewardInfoMinified';
const { ccclass, property } = _decorator;

@ccclass('UIChest')
export class UIChest extends Component {

    @property(Chest)
    chest: Chest = null;

    @property(Label)
    progressLabel: Label = null;

    @property(ProgressBar)
    progressBar: ProgressBar = null;

    @property(Button)
    rewardBtn: Button = null;
    @property(Button)
    showRewardInfoBtn: Button = null;

    @property(Node)
    rewardInfo: Node = null;
    @property(UIRewardInfoMinified)
    rewardInfoComp: UIRewardInfoMinified;

    @property(Node)
    content: Node = null;

    private originalContentPos: Vec2;
    private shakeTween: any = null;


    onLoad() {
        //window.addEventListener('resize', this.refreshScale.bind(this));
    }
    
    start() {
        this.chest.node.on("refresh", this.refresh);

        this.rewardBtn.node.on(Button.EventType.CLICK, this.onRewardBtnClick, this);
        this.showRewardInfoBtn.node.on(Button.EventType.CLICK, this.onShowRewardInfoBtnClick, this);

        this.refresh();

        GameData.instance.node.on("levels_loaded", () => this.refresh());
    }

    private shakeTween: Tween<Node> | null = null;

    refresh() {
        if (!this.chest) return;

        // Stop shake tween only if it's running
        if (this.shakeTween) {
            this.shakeTween.stop();
            this.shakeTween = null;
        }

        if (this.progressBar) {
            this.progressBar.node.active = !this.chest.isStageComplete();
        }

        if (this.progressLabel) {
            this.progressLabel.node.active = !this.chest.isStageComplete();
        }

        if (this.rewardBtn) {
            this.rewardBtn.node.active = this.chest.isStageComplete();
        }

        if (this.chest.isStageComplete()) {
            let scale = ResolutionManager.instance.isPortraitOrientation() ? 2 : 1.1;
            this.node.setScale(new Vec3(scale, scale, 1));

            console.log("endless shaking");

            this.startShake();
        } else {
            let scale = ResolutionManager.instance.isPortraitOrientation() ? 1.8 : 0.9;
            this.node.setScale(new Vec3(scale, scale, 1));

            if (this.progressBar) {
                let newProgress = this.chest.getCollectables() / this.chest.getStageStep();

                if (newProgress > this.progressBar.progress) {
                    tween(this.node)
                        .to(0.05, { scale: new Vec3(scale - 0.08, scale + 0.08, 1) }, { easing: 'linear' })
                        .to(0.07, { scale: new Vec3(scale + 0.03, scale - 0.03, 1) }, { easing: 'elasticInOut' })
                        .to(0.07, { scale: new Vec3(scale - 0.03, scale + 0.03, 1) }, { easing: 'elasticInOut' })
                        .to(0.07, { scale: new Vec3(scale, scale, scale) }, { easing: 'elasticInOut' })
                        .start();

                    tween(this.progressBar)
                        .to(0.8, { progress: newProgress })
                        .start();
                } else {
                    this.progressBar.progress = newProgress;
                }
            }

            if (this.progressLabel) {
                this.progressLabel.string = `${this.chest.getCollectables()}/${this.chest.getStageStep()}`;
            }
        }
    }


    startShake() {
        const shakeAmount = 5;
        const shakeDuration = 0.1;
    
        if (this.content && !this.shakeTween) {
            this.shakeTween = tween(this.content)
                .repeatForever(
                    tween()
                        .by(shakeDuration, { position: new Vec3(shakeAmount, 0, 0) })
                        .by(shakeDuration, { position: new Vec3(-shakeAmount * 2, 0, 0) })
                        .by(shakeDuration, { position: new Vec3(shakeAmount, 0, 0) })
                        .by(shakeDuration, { position: new Vec3(0, shakeAmount, 0) })
                        .by(shakeDuration, { position: new Vec3(0, -shakeAmount * 2, 0) })
                        .by(shakeDuration, { position: new Vec3(0, shakeAmount, 0) })
                )
                .start();
        }
    }

    stopShake() {
        if (this.content && this.shakeTween) {
            this.shakeTween.stop();
    
            this.shakeTween = null;

            if(this.originalContentPos && !this.originalContentPos === undefined) {
                this.content.setPosition(new Vec3(this.originalContentPos.x, this.originalContentPos.y, 0));
            }
        }
    }


    refreshScale(isPortrait: boolean) {
        if(this.chest.isStageComplete()) {
            let scale = isPortrait ? 1.1 : 2;
            this.node.setScale(new Vec3(scale, scale, 1));
        }
        else {
            let scale = isPortrait ? 0.9 : 1.8;
            this.node.setScale(new Vec3(scale, scale, 1));
        }
    }


    onRewardBtnClick() {
        this.chest.completeStage();

        this.refresh();
    }


    onShowRewardInfoBtnClick() {
        this.rewardInfo.active = true;

        this.rewardInfoComp.initReward_Chest(this.chest.getCurrentReward());
    }
}


