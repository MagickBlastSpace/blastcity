import { _decorator, Component, Node, Widget, find, Canvas, Button } from 'cc';
import { UIPopupFrameBase } from '../UIPopupFrameBase';
import { EventBase } from '../../game/events/EventBase';
import { UIEventLiveopsCardAdaptivity } from './UIEventLiveopsCardAdaptivity';
const { ccclass, property } = _decorator;

@ccclass('UIEventPopupFrameBase')
export class UIEventPopupFrameBase extends UIPopupFrameBase {

    @property([Widget])
    widgets: Widget[] = [];

    @property(EventBase)
    eventController: EventBase = null;

    @property([UIPopupFrameBase])
    infoPopups: UIPopupFrameBase[] = [];

    @property(Button)
    infoBtn: Button = null;

    private isInited: boolean = false;

    private currentTutorialPage: number = 0;


    onLoad() {
        this.isInited = false;
        this.addLiveopsCardAdaptivity();
    }

    
    init(event: EventBase) {
        this.setWidgetsTargetToMainCanvas();

        this.eventController = event;

        this.eventController.node.on("refresh", () => this.refresh());

        this.isInited = true;

        this.refresh();
        this.node.getComponent(UIEventLiveopsCardAdaptivity)?.refresh();

        for(let i = 0; i < this.infoPopups.length; i++) {
            this.infoPopups[i].node.on("hide", () => this.showNextTutorialPage());
            this.infoPopups[i].node.on("event_play", () => this.onPlay());
        }

        if(this.infoBtn && this.infoBtn !== undefined) {
            this.infoBtn.node.on(Button.EventType.CLICK, this.onInfoBtnClick, this);
        }
    }


    refresh() {}

    show() {
        super.show();

        if(this.infoPopups.length > 0 && !this.eventController.getIsTutorialComplete()) {
            this.currentTutorialPage = 0;

            this.showNextTutorialPage();
        }

        this.eventController.setChecked();
    }


    private setWidgetsTargetToMainCanvas() {
        const canvasNode = find('Canvas');
        if (!canvasNode) {
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


    adjustResolution() {
        super.adjustResolution();

        for(let i = 0; i < this.widgets.length; i++) {
            if(this.widgets[i] && this.widgets[i].enabled) {
                this.widgets[i].updateAlignment();
            }
        }

        this.node.getComponent(UIEventLiveopsCardAdaptivity)?.refresh();
    }

    private addLiveopsCardAdaptivity() {
        if (!UIEventLiveopsCardAdaptivity.supportedCards.has(this.node.name)) return;

        // The legacy TeamTreasure component performs non-uniform scaling.
        // Disable it at runtime only, leaving the prefab serialization intact.
        const legacy = this.node.getComponent('UIEventTeamTreasureAdaptivity');
        if (legacy) legacy.enabled = false;

        if (!this.node.getComponent(UIEventLiveopsCardAdaptivity)) {
            this.node.addComponent(UIEventLiveopsCardAdaptivity);
        }
    }


    showNextTutorialPage() {
        if(this.currentTutorialPage > this.infoPopups.length - 1) {
            this.eventController.completeTutorial();

            return;
        }

        this.infoPopups[this.currentTutorialPage].show();

        this.currentTutorialPage = this.currentTutorialPage + 1;
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


