import { _decorator, Component, Node, Label } from 'cc';
import { RocketFeverEventData } from '../../../data/EventData';
const { ccclass, property } = _decorator;

@ccclass('UIEventRocketFeverItem')
export class UIEventRocketFeverItem extends Component {

    @property(Label)
    numberLabel: Label = null;
    @property(Label)
    rewardLabel: Label = null;

    @property(Node)
    complete: Node = null;


    refresh(stageNumber: number, data: RocketFeverEventData, currentStage: number) {
        this.numberLabel.string = stageNumber;
        this.rewardLabel.string = data.rewardGold;

        this.complete.active = currentStage >= stageNumber;
    }
}


