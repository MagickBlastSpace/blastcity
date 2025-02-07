import { _decorator, Component, Node } from 'cc';
import { UIEventTeamTreasure } from '../TeamTreasure/UIEventTeamTreasure';
const { ccclass, property } = _decorator;

@ccclass('UIEventTroyanHorse')
export class UIEventTroyanHorse extends UIEventTeamTreasure {
    refresh() {
        this.isEventStarted = this.eventController.getIsStarted();
        this.isEventComplete = this.eventController.getIsComplete();

        this.playersLayout.active = this.isEventStarted && !this.isEventComplete;
   
        this.startBtn.node.active = !this.isEventStarted && !this.isEventComplete;
        
        let rewardsData = this.eventController.getRewardsData();
        let isPicked = this.eventController.getIsRewardPicked();
        let totalProgress = this.eventController.getTotalTeamProgress();

        for(let i = 0; i < rewardsData.length && i < this.rewards.length && i < isPicked.length; i++) {
            this.rewards[i].refresh(rewardsData[i], isPicked[i], totalProgress);
        }

        this.total.string = totalProgress + "/" + rewardsData[rewardsData.length - 1].progress;

        if(this.progressBar) {
            this.progressBar.progress = totalProgress / rewardsData[rewardsData.length - 1].progress;
        }
    }
}


