import { _decorator, Widget, find, Button } from 'cc';

import { UIFrameBase } from '../UIFrameBase';
import { EventBase } from '../../game/events/EventBase';
import { UIPopupFrameBase } from '../UIPopupFrameBase';
import { UIEventLiveopsCardAdaptivity } from './UIEventLiveopsCardAdaptivity';
import { ResolutionManager } from '../../utils/ResolutionManager';

const { ccclass, property } = _decorator;

@ccclass('UIEventFrameBase')
export class UIEventFrameBase extends UIFrameBase {

    @property([Widget])
    widgets: Widget[] = [];

    @property(EventBase)
    eventController: EventBase = null;

    @property([UIPopupFrameBase])
    infoPopups: UIPopupFrameBase[] = [];

    @property(Button)
    infoBtn: Button = null;

    private currentTutorialPage: number = 0;


    onLoad() {
        this.addLiveopsCardAdaptivity();
    }


    init(event: EventBase) {
        this.setWidgetsTargetToMainCanvas();

        this.eventController = event;

        this.eventController.node.on("refresh", () => this.refresh());

        this.refresh();

        this.node
            .getComponent(UIEventLiveopsCardAdaptivity)
            ?.refresh();

        for(let i = 0; i < this.infoPopups.length; i++) {
            this.infoPopups[i].node.on(
                "hide",
                () => this.showNextTutorialPage()
            );

            this.infoPopups[i].node.on(
                "event_play",
                () => this.onPlay()
            );
        }

        if(this.infoBtn && this.infoBtn !== undefined) {
            this.infoBtn.node.on(
                Button.EventType.CLICK,
                this.onInfoBtnClick,
                this
            );
        }
    }


    refresh() {}


    show() {
        super.show();

        if(
            this.infoPopups.length > 0 &&
            !this.eventController.getIsTutorialComplete()
        ) {
            this.currentTutorialPage = 0;

            this.showNextTutorialPage();
        }

        this.eventController.setChecked();
    }


    adjustResolution() {
        ResolutionManager.instance.adjustResolution();

        for(let i = 0; i < this.widgets.length; i++) {
            if(this.widgets[i] && this.widgets[i].enabled) {
                this.widgets[i].updateAlignment();
            }
        }

        this.node
            .getComponent(UIEventLiveopsCardAdaptivity)
            ?.refresh();
    }


    private setWidgetsTargetToMainCanvas() {
        const canvasNode = find('Canvas');

        if(!canvasNode) {
            console.error('Main Canvas node not found');
            return;
        }

        for(let i = 0; i < this.widgets.length; i++) {
            if(this.widgets[i] && this.widgets[i].enabled) {
                this.widgets[i].target = canvasNode;
                this.widgets[i].updateAlignment();
            }
        }

        console.log('Widget target set to main Canvas successfully');
    }


    private addLiveopsCardAdaptivity() {
        if(
            !UIEventLiveopsCardAdaptivity.supportedCards.has(
                this.node.name
            )
        ) {
            return;
        }

        const legacy = this.node.getComponent(
            'UIEventTeamTreasureAdaptivity'
        );

        if(legacy) {
            legacy.enabled = false;
        }

        if(
            !this.node.getComponent(
                UIEventLiveopsCardAdaptivity
            )
        ) {
            this.node.addComponent(
                UIEventLiveopsCardAdaptivity
            );
        }
    }


    showNextTutorialPage() {
        if(
            this.currentTutorialPage >
            this.infoPopups.length - 1
        ) {
            this.eventController.completeTutorial();
            return;
        }

        this.infoPopups[
            this.currentTutorialPage
        ].show();

        this.currentTutorialPage++;
    }


    onInfoBtnClick() {
        if(this.infoPopups.length > 0) {
            this.currentTutorialPage = 0;

            this.showNextTutorialPage();
        }
    }


    onPlay() {
        this.node.emit("event_play");

        this.hide();
    }
}