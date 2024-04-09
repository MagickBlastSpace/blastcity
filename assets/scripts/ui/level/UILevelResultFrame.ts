declare const gamepush: any;

import { _decorator, Component, Node, Label, Button } from 'cc';
import { UIStartFrame } from '../start/UIStartFrame';
import { UIFrameBase } from '../UIFrameBase';
import { UILevelMovesShop } from './UILevelMovesShop';
import { SaveData } from '../../data/SaveData';
import { ButlersGift } from '../../game/boosters/ButlersGift';
import { Level } from '../../game/Level';
const { ccclass, property } = _decorator;

@ccclass('UILevelResultFrame')
export class UILevelResultFrame extends UIFrameBase {

    @property(Label)
    resultLabel: Label = null;

    @property(Label)
    buttonLabel: Label = null;

    @property(Label)
    goldLabel: Label = null;

    @property(Button)
    playBtn: Button = null;

    @property(UIStartFrame)
    startFrame: UIStartFrame = null;

    @property(UILevelMovesShop)
    movesShop: UILevelMovesShop = null;

    @property(ButlersGift)
    butlersGift: ButlersGift = null;

    @property(Level)
    level: Level = null;

    private isSuccess: boolean = false;


    start() {
        this.playBtn.node.on(Button.EventType.CLICK, this.onPlayBtnClick, this);

        this.movesShop.node.on("buy", () => this.hide());
    }
    
    refresh(isSuccess: boolean, goldEarned: number) {
        this.isSuccess = isSuccess;

        this.resultLabel.string = isSuccess ? "Level Complete" : "Level Failed";
        this.buttonLabel.string = isSuccess ? "Next" : "Replay";
        this.goldLabel.string = goldEarned > 0 ? "Gold earned: " + goldEarned : "";

        this.movesShop.node.active = !isSuccess;
        this.movesShop.refresh();
    }

    onPlayBtnClick() {
        SaveData.instance.clearLevelProgress();

        if(!this.isSuccess) {
            this.butlersGift.clearStreak();
            this.level.fail();
        }

        this.startFrame.show();

        this.hide();

        //gamepush.ads.showFullscreen();
    }
}


