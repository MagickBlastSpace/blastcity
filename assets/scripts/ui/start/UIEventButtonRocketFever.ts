import { _decorator, Component, Node, tween } from 'cc';
import { UIEventButton } from './UIEventButton';
import { UIEventRocketFeverRewardIcon } from '../events/RocketFever/UIEventRocketFeverRewardIcon';
const { ccclass, property } = _decorator;

@ccclass('UIEventButtonRocketFever')
export class UIEventButtonRocketFever extends UIEventButton {

    @property(UIEventRocketFeverRewardIcon)
    rewardIcon: UIEventRocketFeverRewardIcon;


    update(deltaTime: number) {
        let timeStr = this.eventController.getRemainingTimeString();
        if(timeStr === "00:00:00" || timeStr === "00 d 00 h") {
            this.node.active = false;

            return;
        }

        this.timeLabel.string = timeStr;

        let isAvailable = this.eventController.isInteractable();

        this.node.active = isAvailable;

        if(!isAvailable) {
            return;
        }
    }


    refresh() {
        super.refresh();

        let data = this.eventController.getData();

        let currentStage = this.eventController.getCurrentStage();
        if(currentStage >= data.length) {
            currentStage = data.length - 1;
        }

        if(currentStage < 0) {
            return;
        }

        if(this.progressBar) {
            let newProgress = this.eventController.getTimeProgress();

            if(newProgress > this.progressBar.progress) {
                tween(this.progressBar)
                    .to(0.8, { progress: newProgress })
                    .call(() => this.afterRefresh(data, currentStage))
                    .start();
            }
            else {
                this.progressBar.progress = newProgress;

                this.afterRefresh(data, currentStage);
            }
        }

        
    }

    afterRefresh(data: any, currentStage: number) {
        if(this.progressLabel) {
            if(this.eventController.getIsComplete()) {
                this.progressLabel.string = "Complete";
            }
            else {
                this.progressLabel.string = this.eventController.getCollectable() + "/" + this.eventController.getCurrentStageStep();
            }
        }

        this.rewardIcon.refresh(data[currentStage]);

        if(this.eventController.isRewardAvailable()) {
            this.eventController.takeAllRewards();
        }
    }
}


