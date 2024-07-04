import { _decorator, Component, Node } from 'cc';
import { UIEventWeeklyContest } from '../events/WeeklyContest/UIEventWeeklyContest';
import { UIFrameBase } from '../UIFrameBase';
const { ccclass, property } = _decorator;

@ccclass('UILeaderboardFrame')
export class UILeaderboardFrame extends UIFrameBase {

    @property(UIEventWeeklyContest)
    weeklyContest: UIEventWeeklyContest = null;


    show() {
        super.show();

        this.weeklyContest.show();
    }

    hide() {
        super.hide();

        this.weeklyContest.hide();
    }
}


