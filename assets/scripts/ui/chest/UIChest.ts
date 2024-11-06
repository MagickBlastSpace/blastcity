import { _decorator, Component, Node, ProgressBar, Label, Button, Vec3 } from 'cc';
import { Chest } from '../../game/Chest';
import { ResolutionManager } from '../../utils/ResolutionManager';
import { GameData } from '../../data/GameData';
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
        window.addEventListener('resize', this.refreshScale.bind(this));
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

            //this.node.emit("complete", true);
        }
        else {
            let scale = ResolutionManager.instance.isPortraitOrientation() ? 1.8 : 0.9;
            this.node.setScale(new Vec3(scale, scale, 1));

            let collectables = this.chest.getCollectables();
            let stageStep = this.chest.getStageStep();

            if(this.progressBar) {
                this.progressBar.progress = collectables / stageStep;
            }

            if(this.progressLabel) {
                this.progressLabel.string = collectables + "/" + stageStep;
            }

            //this.node.emit("complete", false);
        }
    }

    refreshScale() {
        if(this.chest.isStageComplete()) {
            let scale = ResolutionManager.instance.isPortraitOrientation() ? 1.1 : 2;
            this.node.setScale(new Vec3(scale, scale, 1));
        }
        else {
            let scale = ResolutionManager.instance.isPortraitOrientation() ? 0.9 : 1.8;
            this.node.setScale(new Vec3(scale, scale, 1));
        }
    }


    onRewardBtnClick() {
        this.chest.completeStage();

        this.refresh();
    }
}


