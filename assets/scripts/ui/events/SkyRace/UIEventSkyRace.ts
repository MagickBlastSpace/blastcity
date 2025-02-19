import { _decorator, Component, Node, Button, Label, Widget } from 'cc';
import { SkyRaceEvent } from '../../../game/events/competitive/SkyRaceEvent';
import { UIEventSkyRacePlayerItem } from './UIEventSkyRacePlayerItem';
import { UIFrameBase } from '../../UIFrameBase';
import { EventBase } from '../../../game/events/EventBase';
import { UIPopupFrameBase } from '../../UIPopupFrameBase';
import { UIEventPopupFrameBase } from '../UIEventPopupFrameBase';
import { ResolutionManager } from '../../../utils/ResolutionManager';
const { ccclass, property } = _decorator;

@ccclass('UIEventSkyRace')
export class UIEventSkyRace extends UIEventPopupFrameBase {

    @property(Button)
    startBtn: Button = null;
    @property(Button)
    closeBtn: Button = null;
    @property(Button)
    closeBtn_Duplicate: Button = null;

    @property(Label)
    timeLabel: Label = null;
    @property(Label)
    timeLabel_Duplicate: Label = null;
    @property(Label)
    levelRequired: Label = null;

    @property(Node)
    playersLayout: Node = null;

    @property([UIEventSkyRacePlayerItem])
    items: UIEventSkyRacePlayerItem[] = [];

    @property(Widget)
    frameWidget: Widget = null;

    private isEventStarted = false;
    private isEventComplete = false;


    start() {
        this.startBtn.node.on(Button.EventType.CLICK, this.onStartBtnClick, this);
        this.closeBtn.node.on(Button.EventType.CLICK, this.onCloseBtnClick, this);
        if(this.closeBtn_Duplicate) {
            this.closeBtn_Duplicate.node.on(Button.EventType.CLICK, this.onCloseBtnClick, this);
        }

        for(let i = 0; i < this.items.length; i++) {
            this.items[i].init(i);
            this.items[i].node.on("take_reward", this.onTakeRewardBtnClick, this);
        }
    }

    update(deltaTime: number) {
        /*if(!this.isInited) {
            return;
        }*/

        this.timeLabel.string = this.eventController.getRemainingTimeString();
        if(this.timeLabel_Duplicate) {
            this.timeLabel_Duplicate.string = this.eventController.getRemainingTimeString();
        }
    }


    refresh() {
        this.isEventStarted = this.eventController.getIsStarted();

        this.playersLayout.active = this.isEventStarted;
   
        this.startBtn.node.active = !this.isEventStarted;

        let data = this.eventController.sortPlayersByProgress();

        let isRewardAvailable = this.eventController.isRewardAvailable();

        for(let i = 0; i < data.length && i < this.items.length; i++) {
            this.items[i].refresh(data[i], isRewardAvailable);
        }

        this.levelRequired.string = this.eventController.isRequiredLevelReached() ? "" : "Required Level " + this.eventController.getLevelRequired();

        this.updateWidgetAlignment(ResolutionManager.instance.isPortraitOrientation());
    }


    show() {
        super.show();

        this.eventController.updateMultiplayerData();
    }

    updateWidgetAlignment(isPortrait) {
        /*this.frameWidget.left = isPortrait ? 0 : 650;
        this.frameWidget.right = isPortrait ? 0 : 650;
        
        this.frameWidget.updateAlignment();*/
    }


    onStartBtnClick() {
        this.eventController.activateEvent();

        this.refresh();
    }

    onCloseBtnClick() {
        this.hide();
    }

    onTakeRewardBtnClick() {
        this.eventController.takeReward();

        this.refresh();
    }
}


