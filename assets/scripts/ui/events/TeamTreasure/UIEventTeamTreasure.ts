import { _decorator, Component, Node, Label } from 'cc';
import { UIEventKingsCup } from '../KingsCup/UIEventKingsCup';
import { UIEventTeamTreasureRewardItem } from './UIEventTeamTreasureRewardItem';
const { ccclass, property } = _decorator;

@ccclass('UIEventTeamTreasure')
export class UIEventTeamTreasure extends UIEventKingsCup {

    @property(Label)
    total: Label = null;

    @property([UIEventTeamTreasureRewardItem])
    rewards: UIEventTeamTreasureRewardItem[] = [];


    start() {
        super.start();

        for(let i = 0; i < this.rewards.length; i++) {
            this.rewards[i].node.on("pick", () => this.pickReward(i));
        }
    }


    refresh() {
        super.refresh();

        let rewardsData = this.eventController.getRewardsData();
        let isPicked = this.eventController.getIsRewardPicked();
        let totalProgress = this.eventController.getTotalTeamProgress();

        for(let i = 0; i < rewardsData.length && i < this.rewards.length && i < isPicked.length; i++) {
            this.rewards[i].refresh(rewardsData[i], isPicked[i], totalProgress);
        }

        this.total.string = totalProgress + "/" + rewardsData[rewardsData.length - 1].progress;
    }


    pickReward(index: number) {
        this.eventController.pickReward(index);

        this.refresh();
    }
}


