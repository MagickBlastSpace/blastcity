import { _decorator, Component, Node, Button, Label, Sprite, SpriteFrame } from 'cc';
import { UIFrameBase } from '../UIFrameBase';
import { GameData } from '../../data/GameData';
import { UserData } from '../../data/UserData';
import { SaveData } from '../../data/SaveData';
const { ccclass, property } = _decorator;

@ccclass('UIStartFrame')
export class UIStartFrame extends UIFrameBase {

    @property(Button)
    playBtn: Button = null;

    @property([Button])
    eventBtns: Button[] = [];
    @property([UIFrameBase])
    eventPopups: UIFrameBase[] = [];

    @property(UIFrameBase)
    briefingPopup: UIFrameBase = null;

    @property(Label)
    levelLabel: Label = null;
    @property(Label)
    difficultyLabel: Label = null;


    start() {
        SaveData.instance.node.on("user_data", () => this.refresh());
        SaveData.instance.node.on("level_progress_loaded", () => this.hide());
        this.briefingPopup.node.on("play", () => this.hide());

        this.playBtn.node.on(Button.EventType.CLICK, this.onPlayBtnClick, this);

        SaveData.instance.loadLevelProgressData();
        SaveData.instance.loadStartBonusesData();
        SaveData.instance.loadButlersGiftData();

        for(let i = 0; i < this.eventBtns.length && i < this.eventPopups.length; i++) {
            this.eventBtns[i].node.on(Button.EventType.CLICK, () => this.onEventBtnClick(i), this);
        }

        GameData.instance.node.on("levels_loaded", () => this.unlockPlay());

        this.playBtn.node.active = false;

        this.refresh();
    }

    onPlayBtnClick() {
        this.hideAllPopups();

        this.briefingPopup.show();
    }


    refresh() {
        let currentLevelNumber = UserData.instance.getProgress() + 1;
        this.levelLabel.string = "Level " + currentLevelNumber;
    }

    refreshEventsIcons() {
        for(let i = 0; i < this.eventBtns.length && i < this.eventPopups.length; i++) {
            this.eventBtns[i].node.getComponent("UIEventButton").setProgress();
        }
    }

    show() {
        super.show();

        this.refresh();
        this.refreshEventsIcons();
    }


    onEventBtnClick(index: number) {
        this.hideAllPopups();

        this.eventPopups[index].show();
    }


    unlockPlay() {
        this.refresh();

        this.playBtn.node.active = true;
    }


    hideAllPopups() {
        for(let i = 0; i < this.eventPopups.length; i++) {
            this.eventPopups[i].hideClean();
        }

        this.briefingPopup.hideClean();
    }
}


