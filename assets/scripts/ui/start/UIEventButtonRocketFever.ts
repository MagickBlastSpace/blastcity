import { _decorator, Component, Node } from 'cc';
import { UIEventButton } from './UIEventButton';
import { UIEventRocketFeverRewardIcon } from '../events/RocketFever/UIEventRocketFeverRewardIcon';
const { ccclass, property } = _decorator;

@ccclass('UIEventButtonRocketFever')
export class UIEventButtonRocketFever extends UIEventButton {

    @property(UIEventRocketFeverRewardIcon)
    rewardIcon: UIEventRocketFeverRewardIcon;


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

        this.rewardIcon.refresh(data[currentStage]);
    }
}


