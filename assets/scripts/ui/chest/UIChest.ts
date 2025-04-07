import { _decorator, Component, Node, ProgressBar, Label, Button, Vec3, tween } from 'cc';
import { Chest } from '../../game/Chest';
import { ResolutionManager } from '../../utils/ResolutionManager';
import { GameData } from '../../data/GameData';
import { ChestRewardData } from '../../data/ChestData';
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


    onLoad() {
        //window.addEventListener('resize', this.refreshScale.bind(this));
    }
    
    start() {
        this.chest.node.on("refresh", this.refresh);

        this.rewardBtn.node.on(Button.EventType.CLICK, this.onRewardBtnClick, this);

        this.refresh();

        GameData.instance.node.on("levels_loaded", () => this.refresh());
    }

    refresh() {
        if(!this.chest) {
            return;
        }

        tween(this.node).stop();

        if(this.progressBar) {
            this.progressBar.node.active = !this.chest.isStageComplete();
        }

        if(this.progressLabel) {
            this.progressLabel.node.active = !this.chest.isStageComplete();
        }
        
        if(this.rewardBtn) {
            this.rewardBtn.node.active = this.chest.isStageComplete();
        }

        if(this.chest.isStageComplete()) {
            let scale = ResolutionManager.instance.isPortraitOrientation() ? 2 : 1.1;
            this.node.setScale(new Vec3(scale, scale, 1));

            tween(this.node)
                .to(0.05, { scale: new Vec3(scale - 0.08, scale + 0.08, 1) }, { easing: 'linear' })
                .to(0.07, { scale: new Vec3(scale + 0.03, scale - 0.03, 1) }, { easing: 'elasticInOut' })
                .to(0.07, { scale: new Vec3(scale - 0.03, scale + 0.03, 1) }, { easing: 'elasticInOut' })
                .to(0.07, { scale: new Vec3(scale, scale, scale) }, { easing: 'elasticInOut' })
                .repeatForever()
                .start();
        }
        else {
            let scale = ResolutionManager.instance.isPortraitOrientation() ? 1.8 : 0.9;
            this.node.setScale(new Vec3(scale, scale, 1));

            let collectables = this.chest.getCollectables();
            let stageStep = this.chest.getStageStep();

            if(this.progressBar) {
                this.progressBar.progress = collectables / stageStep;

                let newProgress = collectables / stageStep;

                if(newProgress > this.progressBar.progress) {
                    //shake
                    tween(this.node)
                        .to(0.05, { scale: new Vec3(scale - 0.08, scale + 0.08, 1) }, { easing: 'linear' })
                        .to(0.07, { scale: new Vec3(scale + 0.03, scale - 0.03, 1) }, { easing: 'elasticInOut' })
                        .to(0.07, { scale: new Vec3(scale - 0.03, scale + 0.03, 1) }, { easing: 'elasticInOut' })
                        .to(0.07, { scale: new Vec3(scale, scale, scale) }, { easing: 'elasticInOut' })
                        .start();
                }

                tween(this.progressBar)
                    .to(0.8, { progress: newProgress })
                    //.call(() => this.setProgress())
                    .start();
            }

            if(this.progressLabel) {
                this.progressLabel.string = collectables + "/" + stageStep;
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
}


