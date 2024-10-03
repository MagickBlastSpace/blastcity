import { _decorator, Component, Node, Label, Sprite, SpriteFrame } from 'cc';
import { UIEventWeeklyContestPlayerItem } from '../events/WeeklyContest/UIEventWeeklyContestPlayerItem';
import { UIClanItem } from '../clans/UIClanItem';
import { ClanData } from '../../data/ClanData';
const { ccclass, property } = _decorator;

@ccclass('UILeaderboardClanItem')
export class UILeaderboardClanItem extends UIClanItem {

    @property(Label)
    scoreLabel: Label = null;

    @property(Sprite)
    placeIcon: Sprite = null;
    @property([SpriteFrame])
    placeIcons: SpriteFrame[] = [];

    private index: number = 0;

    
    setScore(score: number) {
        this.scoreLabel.string = score;
    }

    setIndex(index: number) {
        this.index = index;
    }


    init(data: ClanData) {
        super.init(data);

        if(this.placeIcon && this.placeIcon !== undefined) {
            if(this.index > 2 || this.index < 0) {
                this.placeIcon.spriteFrame = null;
            }
            this.placeIcon.spriteFrame = this.placeIcons[this.index];
        }
    }
}


