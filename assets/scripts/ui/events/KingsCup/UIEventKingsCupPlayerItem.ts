import { _decorator, Component, Node, Label } from 'cc';
import { UIEventSkyRacePlayerItem } from '../SkyRace/UIEventSkyRacePlayerItem';
const { ccclass, property } = _decorator;

@ccclass('UIEventKingsCupPlayerItem')
export class UIEventKingsCupPlayerItem extends UIEventSkyRacePlayerItem {

    @property(Label)
    indexLabel: Label = null;


    init(index: number) {
        this.index = index - 1;

        this.indexLabel.string = index;

        let isRewardAvailable = this.index > -1 && this.index < this.rewards.length;

        if(this.showRewardBtn && this.showRewardBtn !== undefined) {
            this.showRewardBtn.node.active = isRewardAvailable;
        }   
    }
}


