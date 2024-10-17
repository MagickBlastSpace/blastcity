import { _decorator, Component, Node } from 'cc';
import { UIEventButton } from './UIEventButton';
import { UIEventRocketFeverRewardIcon } from '../events/RocketFever/UIEventRocketFeverRewardIcon';
const { ccclass, property } = _decorator;

@ccclass('UIEventButtonRocketFever')
export class UIEventButtonRocketFever extends UIEventButton {

    @property(UIEventRocketFeverRewardIcon)
    rewardIcon: UIEventRocketFeverRewardIcon;


    update(deltaTime: number) {
        super.update();

        let data = this.eventController.getData();

        this.rewardIcon.refresh(data[this.eventController.getCurrentStage()]);
    }
}


