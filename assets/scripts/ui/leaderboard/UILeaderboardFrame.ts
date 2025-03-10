import { _decorator, Component, Node, Label } from 'cc';
import { UIEventWeeklyContest } from '../events/WeeklyContest/UIEventWeeklyContest';
import { UIFrameBase } from '../UIFrameBase';
import { UITab } from '../main/UITab';
import { UIProfilePopup } from '../profile/UIProfilePopup';
import { ClanData } from '../../data/ClanData';
import { UIClanInfoPopup } from '../clans/UIClanInfoPopup';
const { ccclass, property } = _decorator;

@ccclass('UILeaderboardFrame')
export class UILeaderboardFrame extends UIFrameBase {

    @property(Label)
    timeLabel: Label = null;

    @property(UIEventWeeklyContest)
    weeklyContest: UIEventWeeklyContest = null;

    @property([UITab])
    tabs: UITab = [];

    @property([UIFrameBase])
    frames: UIFrameBase = [];

    @property(UIProfilePopup)
    profilePopup: UIProfilePopup = null;

    @property(UIClanInfoPopup)
    clanPopup: UIClanInfoPopup = null;


    start() {
        for(let i = 0; i < this.tabs.length; i++) {
            this.tabs[i].node.on("tab", (index) => this.showFrame(index));
        }

        for(let i = 0; i < this.frames.length; i++) {
            this.frames[i].node.on("profile", (data) => this.showProfile(data));
            this.frames[i].node.on("clan", (data) => this.showClan(data));
        }
    }

    update(deltaTime: number) {
        if(!this.node.active) {
            return;
        }

        this.timeLabel.string = this.weeklyContest.getRemainingTimeString();
    }

    
    show() {
        super.show();

        this.showFrame(1);
    }

    hide() {
        super.hide();

        this.hideAllFrames();
    }


    showFrame(index: number) {
        this.setAllBtnsPassive();
        this.hideAllFrames();

        this.tabs[index].setActiveIcon(true);

        this.frames[index].show();
    }


    setAllBtnsPassive() {
        for(let i = 0; i < this.tabs.length; i++) {
            this.tabs[i].setActiveIcon(false);
        }
    }

    hideAllFrames() {
        for(let i = 0; i < this.frames.length; i++) {
            this.frames[i].hideClean();
        }
    }


    showProfile(playerId: number) {
        this.profilePopup.init(playerId);

        this.profilePopup.show();
    }

    showClan(clanData: ClanData) {
        this.clanPopup.init(clanData);

        this.clanPopup.show();
    }
}


