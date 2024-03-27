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
        //this.rewardLabel.string = data.rewardGold;

        this.rewardLabel.string = "";

        if(data.rewards.length > 0) {
            if(data.rewards[0].gold > 0) {
                this.rewardLabel.string += data.rewards[0].gold + " Gold ";
            }

            if(data.rewards[0].startBonus_Bomb > 0) {
                this.rewardLabel.string += data.rewards[0].startBonus_Bomb + " Start Bonus Bomb ";
            }
            if(data.rewards[0].startBonus_Rocket > 0) {
                this.rewardLabel.string += data.rewards[0].startBonus_Rocket + " Start Bonus Rocket ";
            }
            if(data.rewards[0].startBonus_Discoball > 0) {
                this.rewardLabel.string += data.rewards[0].startBonus_Discoball + " Start Bonus Discoball ";
            }

            if(data.rewards[0].booster_Hammer > 0) {
                this.rewardLabel.string += data.rewards[0].booster_Hammer + " Booster Hammer ";
            }
            if(data.rewards[0].booster_Bow > 0) {
                this.rewardLabel.string += data.rewards[0].booster_Bow + " Booster Bow ";
            }
            if(data.rewards[0].booster_Cannon > 0) {
                this.rewardLabel.string += data.rewards[0].booster_Cannon + " Booster Cannon ";
            }
            if(data.rewards[0].booster_Jester > 0) {
                this.rewardLabel.string += data.rewards[0].booster_Jester + " Booster Jester ";
            }

            if(data.rewards[0].bomb_Minutes > 0) {
                this.rewardLabel.string += data.rewards[0].bomb_Minutes + " Bomb Minutes ";
            }
            if(data.rewards[0].rocket_Minutes > 0) {
                this.rewardLabel.string += data.rewards[0].rocket_Minutes + " Rocket Minutes ";
            }
            if(data.rewards[0].discoball_Minutes > 0) {
                this.rewardLabel.string += data.rewards[0].discoball_Minutes + " Discoball Minutes ";
            }

            if(data.rewards[0].endlessLives_Minutes > 0) {
                this.rewardLabel.string += data.rewards[0].endlessLives_Minutes + " Endless Lives Minutes ";
            }
            if(data.rewards[0].modifierX2_Minutes > 0) {
                this.rewardLabel.string += data.rewards[0].modifierX2_Minutes + " Modifier x2 Minutes ";
            }
        }

        this.complete.active = currentStage >= stageNumber;
    }
}


