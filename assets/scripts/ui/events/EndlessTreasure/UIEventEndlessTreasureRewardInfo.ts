import { _decorator, Component, Node } from 'cc';
import { UIRewardInfo } from '../../UIRewardInfo';
import { EventRewardData } from '../../../data/EventData';
const { ccclass, property } = _decorator;

@ccclass('UIEventEndlessTreasureRewardInfo')
export class UIEventEndlessTreasureRewardInfo extends UIRewardInfo {

    
    init(data: EventRewardData) {
        if(data.isChest) {
            this.setAllInactive();

            this.rewardNodes[0].active = true;
            this.rewardIcons[0].spriteFrame = this.chest;
            this.rewardLabels[0].string = "";

            return;
        }

        super.init(data);
    }
}


