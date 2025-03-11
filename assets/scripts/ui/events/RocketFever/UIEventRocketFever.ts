import { _decorator, Component, Node, Button, Label, ProgressBar, tween, instantiate, Prefab, Vec2, ScrollView } from 'cc';
import { UIFrameBase } from '../../UIFrameBase';
import { RocketFeverEvent } from '../../../game/events/RocketFeverEvent';
import { UIEventRocketFeverItem } from './UIEventRocketFeverItem';
import { UIPopupFrameBase } from '../../UIPopupFrameBase';
import { UIEventPopupFrameBase } from '../UIEventPopupFrameBase';
import { UIEventRocketFeverRewardIcon } from './UIEventRocketFeverRewardIcon';
import { ResolutionManager } from '../../../utils/ResolutionManager';
const { ccclass, property } = _decorator;

@ccclass('UIEventRocketFever')
export class UIEventRocketFever extends UIEventPopupFrameBase {

    @property(Button)
    startBtn: Button = null;
    @property(Button)
    closeBtn: Button = null;

    @property(Label)
    progressLabel: Label = null;
    @property(Label)
    timeLabel: Label = null;
    @property(Label)
    infoLabel: Label = null;

    @property(ProgressBar)
    progressBar: ProgressBar = null;
    @property(ScrollView)
    scrollView: ScrollView = null;

    @property(Prefab)
    itemPrefab: Prefab = null;
    @property(Node)
    itemsLayout: Node = null;

    @property(Node)
    rewardsContainer: Node = null;
    @property(Node)
    timerContainer: Node = null;
    @property(Node)
    progressContainer: Node = null;
    @property(Node)
    infoContainer: Node = null;

    @property(Node)
    rewardPopup: Node = null;

    @property(UIEventRocketFeverRewardIcon)
    rewardIcon: UIEventRocketFeverRewardIcon;

    private items: [UIEventRocketFeverItem] = [];

    private isEventStarted = false;
    private isEventComplete = false;


    start() {
        this.startBtn.node.on(Button.EventType.CLICK, this.onStartBtnClick, this);
        this.closeBtn.node.on(Button.EventType.CLICK, this.onCloseBtnClick, this);

        let data = this.eventController.getData();

        for(let i = 0; i < data.length; i++) {
            const itemNode = instantiate(this.itemPrefab);
            this.itemsLayout.addChild(itemNode);
            const item = itemNode.getComponent('UIEventRocketFeverItem');

            itemNode.on("take", (stageIndex) => {
                this.eventController.takeReward(stageIndex - 1);
            });

            this.items.push(item);
        }

        for(let i = 0; i < data.length && i < this.items.length; i++) {
            this.items[i].refresh(i + 1, data[i], this.eventController.getCurrentStage());
        }
    }

    update(deltaTime: number) {
        if(!this.isInited) {
            return;
        }
        
        this.timeLabel.string = this.eventController.getRemainingTimeString();
    }


    refresh() {
        this.eventController.refresh();

        this.isEventStarted = this.eventController.getIsStarted();
        this.isEventComplete = this.eventController.getIsComplete();

        if(this.isEventStarted && !this.isEventComplete) {
            this.infoContainer.active = false;
            this.rewardsContainer.active = true;

            this.progressLabel.string = this.eventController.getCollectable() + "/" + this.eventController.getCurrentStageStep();
            this.progressBar.progress = this.eventController.getTimeProgress();

            this.infoLabel.string = "";
        }
        else if(this.isEventComplete) {
            this.infoContainer.active = true;
            this.rewardsContainer.active = true;

            this.progressLabel.string = "Complete";
            this.progressBar.progress = 1.0;

            this.infoLabel.string = "Event Complete";
        }
        else if(!this.eventController.isRequiredLevelReached()) {
            this.infoContainer.active = true;
            this.rewardsContainer.active = false;

            this.progressLabel.string = "";
            this.progressBar.progress = 0.0;

            this.infoLabel.string = "Required Level " + this.eventController.getLevelRequired();
        }
        else {
            this.infoContainer.active = true;
            this.rewardsContainer.active = false;

            this.progressLabel.string = "";

            this.infoLabel.string = "Collect rockets to win rewards";
        }
        
        this.startBtn.node.active = !this.isEventStarted && !this.isEventComplete;

        let data = this.eventController.getData();

        let currentStage = this.eventController.getCurrentStage();

        for(let i = 0; i < data.length && i < this.items.length; i++) {
            this.items[i].refresh(i + 1, data[i], currentStage);
        }

        if(currentStage >= data.length) {
            currentStage = data.length - 1;
        }

        this.rewardIcon.refresh(data[currentStage]);
    }


    show() {
        super.show();

        this.refresh();

        this.scrollToCurrentStage();
    }


    scrollToCurrentStage() {
        let curStage = this.eventController.getCurrentStage() - 1;

        if(curStage < 0) {
            curStage = 0;
        }

        let percent = curStage / this.eventController.getTotalStages();

        /*let isPortrait = ResolutionManager.instance.isPortraitOrientation();
        if(isPortrait) {
            percent = 1 - percent;
        }*/

        this.scheduleOnce(() => {
            this.scrollView.scrollTo(new Vec2(0, percent), 0.5);

            this.eventController.takeAllRewards();
        }, 0.2);
    }


    onStartBtnClick() {
        this.eventController.activateEvent();

        this.refresh();
    }

    onCloseBtnClick() {
        this.hide();
    }
}


