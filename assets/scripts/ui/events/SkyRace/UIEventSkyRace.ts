import { _decorator, Button, Label, Node, Widget } from 'cc';
import { PlayerEventData } from '../../../data/EventData';
import { CompetitiveEventBase } from '../../../game/events/competitive/CompetitiveEventBase';
import { Net } from '../../../net/Net';
import { Localization } from '../../../utils/Localization';
import { ResolutionManager } from '../../../utils/ResolutionManager';
import { UIEventLiveopsCardAdaptivity } from '../UIEventLiveopsCardAdaptivity';
import { UIEventPopupFrameBase } from '../UIEventPopupFrameBase';
import { UIEventSkyRacePlayerItem } from './UIEventSkyRacePlayerItem';
const { ccclass, property } = _decorator;

@ccclass('UIEventSkyRace')
export class UIEventSkyRace extends UIEventPopupFrameBase {

    @property(Button)
    startBtn: Button = null;
    @property(Button)
    closeBtn: Button = null;
    @property(Button)
    closeBtn_Duplicate: Button = null;
    @property(Button)
    infoBtn_Duplicate: Button = null;

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

    private isUiReady = false;

    private get competitiveEvent(): CompetitiveEventBase {
        return this.eventController as CompetitiveEventBase;
    }

    start() {
        this.startBtn.node.on( Button.EventType.CLICK, this.onStartBtnClick, this );

        this.closeBtn.node.on( Button.EventType.CLICK, this.onCloseBtnClick, this );

        if(this.closeBtn_Duplicate && this.closeBtn_Duplicate !== this.closeBtn) {
            this.closeBtn_Duplicate.node.on( Button.EventType.CLICK, this.onCloseBtnClick, this );
        }

        if(this.infoBtn_Duplicate && this.infoBtn_Duplicate !== this.infoBtn) {
            this.infoBtn_Duplicate.node.on( Button.EventType.CLICK, this.onInfoBtnClick, this );
        }

        for(let i = 0; i < this.items.length; i++) {
            this.items[i].init(i);

            this.items[i].node.on("take_reward", this.onTakeRewardBtnClick, this );
        }

        this.isUiReady = true;

        this.scheduleOnce(() => {
            this.refresh();
        }, 0);
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
        if(!this.isUiReady) {
            return;
        }

        this.renderSkyRace();
    }


    private renderSkyRace() {
        this.isEventStarted = this.eventController.getIsStarted();

        this.playersLayout.active = this.isEventStarted;

        this.startBtn.node.active = !this.isEventStarted;

        const data = this.competitiveEvent.sortPlayersByProgress();

        const isRewardAvailable = this.eventController.isRewardAvailable();

        console.log(  "Sky race reward available: " +  isRewardAvailable );

        for(let i = 0; i < this.items.length; i++) {
            this.items[i].setBasicState();
        }

        for(let i = 0; i < data.length && i < this.items.length; i++ ) {
            this.items[i].refresh(
                data[i],
                isRewardAvailable
            );
        }

        this.levelRequired.string = this.eventController.isRequiredLevelReached() ? ""
                : Localization.instance.getLabelByKey("events.levelreq") + " " +  this.eventController.getLevelRequired();

        this.updateWidgetAlignment(ResolutionManager.instance.isPortraitOrientation() );

        this.loadPlayersInfo(data);

        this.updateStartCardAdaptivity();
        this.updateTopControls();
        this.scheduleWidgetsAlignment();
    }

    private updateStartCardAdaptivity() {
        let adaptivity =
            this.node.getComponent(UIEventLiveopsCardAdaptivity);

        if (!this.isEventStarted && !adaptivity) {
            adaptivity =
                this.node.addComponent(
                    UIEventLiveopsCardAdaptivity
                );

            ResolutionManager.instance
                .addAdaptiveFrame(this.node);
        }

        adaptivity?.setSkyRaceStartLayout( !this.isEventStarted );
    }


    show() {
        this.isEventStarted = this.eventController.getIsStarted();

        this.updateStartCardAdaptivity();

        this.updateTopControls();

        super.show();
        this.scheduleWidgetsAlignment();

        this.competitiveEvent.updateMultiplayerData();
    }

    updateWidgetAlignment(isPortrait) {
        /*this.frameWidget.left = isPortrait ? 0 : 650;
        this.frameWidget.right = isPortrait ? 0 : 650;

        this.frameWidget.updateAlignment();*/
    }

    async loadPlayersInfo(data: PlayerEventData[]) {
        try {
            let ids = [];
            for(let i = 0; i < data.length; i++) {
                ids.push(data[i].playerId);
            }
            const result = await Net.instance.getPlayersByIds(ids);

            const { players } = result;

            for(let i = 0; i < players.length && i < this.items.length; i++) {
                this.items[i].setPlayerInfo(players[i]);
            }
        }

        catch (error) {
            console.log('Error fetching players:', error);
        }
    }


    onStartBtnClick() {
        this.eventController.activateEvent();

        this.refresh();
    }

    onCloseBtnClick() {
        this.hide();
    }

    onTakeRewardBtnClick() {
        const controller = this.eventController as CompetitiveEventBase & {
            takeReward?: () => void;
        };

        if(typeof controller.takeReward === 'function') {
            controller.takeReward();
        }

        this.refresh();
    }

    private updateTopControls() {
        this.closeBtn.node.active =
            !this.isEventStarted;

        if(this.infoBtn) {
            this.infoBtn.node.active =
                !this.isEventStarted;
        }

        if(this.closeBtn_Duplicate) {
            this.closeBtn_Duplicate.node.active =
                this.isEventStarted;
        }

        if(this.infoBtn_Duplicate) {
            this.infoBtn_Duplicate.node.active =
                this.isEventStarted;
        }
    }


    private scheduleWidgetsAlignment() {
        this.scheduleOnce(() => {
            for(const widget of this.widgets) {
                if(widget?.enabled) {
                    widget.updateAlignment();
                }
            }
        }, 0);
    }
}


