import { _decorator, Component, Node, Label } from 'cc';
import { UIEventWeeklyContestPlayerItem } from '../WeeklyContest/UIEventWeeklyContestPlayerItem';
const { ccclass, property } = _decorator;

@ccclass('UIEventKingsCupPlayerItem')
export class UIEventKingsCupPlayerItem extends UIEventWeeklyContestPlayerItem {

    @property(Label)
    indexLabel: Label = null;


    init(index: number) {
        this.indexLabel.string = index;
    }
}


