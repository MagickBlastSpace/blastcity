import { _decorator, Component, Node, Button, Label, ProgressBar, ScrollView, tween, Vec2, Widget, instantiate, UITransform } from 'cc';
import { UIFrameBase } from '../../UIFrameBase';
import { SpecialEventBase } from '../../../game/events/special/SpecialEventBase';
import { UIEventMagicCauldronItem } from './UIEventMagicCauldronItem';
import { UIEventMagicCauldronPredictionButton } from './UIEventMagicCauldronPredictionButton';
import { UIPopupFrameBase } from '../../UIPopupFrameBase';
import { UIEventPopupFrameBase } from '../UIEventPopupFrameBase';
import { UIEventMagicCauldronReward } from './UIEventMagicCauldronReward';
import { UIEventMagicCauldronHistoryShelf } from './UIEventMagicCauldronHistoryShelf';
import { Localization } from '../../../utils/Localization';
import { UIRewardInfoMinified } from '../../UIRewardInfoMinified';
const { ccclass, property } = _decorator;

@ccclass('UIEventMagicCauldron')
export class UIEventMagicCauldron extends UIEventPopupFrameBase {

    @property(Button)
    startBtn: Button = null;
    @property(Button)
    closeBtn: Button = null;
    @property(Button)
    showRewardInfoBtn: Button = null;

    @property(ProgressBar)
    progressBar: ProgressBar = null;

    @property(Label)
    reqLabel: Label = null;
    @property(Label)
    timeLabel: Label = null;
    @property(Label)
    collectablesCount: Label = null;
    @property(Label)
    levelIndex: Label = null;

    @property(Node)
    minigameContainer: Node = null;
    @property(Node)
    completeContainer: Node = null;
    @property(Node)
    goalNode: Node = null;
    @property(Node)
    effectsLayout: Node = null;

    @property(Node)
    rewardInfo: Node = null;
    @property(UIRewardInfoMinified)
    rewardInfoComp: UIRewardInfoMinified;

    @property([UIEventMagicCauldronItem])
    items: UIEventMagicCauldronItem[] = [];
    @property([UIEventMagicCauldronPredictionButton])
    predictionBtns: UIEventMagicCauldronPredictionButton[] = [];

    @property([UIEventMagicCauldronHistoryShelf])
    historyShelfs: UIEventMagicCauldronHistoryShelf[] = [];

    @property(UIEventMagicCauldronReward)
    reward: UIEventMagicCauldronReward = null;

    @property([Widget])
    frameWidgets: Widget[] = [];

    @property(ScrollView)
    scrollView: ScrollView = null!;

    private isEventStarted = false;
    private isEventComplete = false;

    private lastHistorySize: number = 0;

    private scrollDuration: number = 2;

    private flightDuration: number = 0.5;


    /*onLoad() {
        window.addEventListener('resize', this.onWindowResize.bind(this));
    }

    onDestroy() {
        window.removeEventListener('resize', this.onWindowResize.bind(this));
    }

    onWindowResize() {
        this.updateWidgetAlignment();
    }*/


    start() {
        this.startBtn.node.on(Button.EventType.CLICK, this.onStartBtnClick, this);
        this.closeBtn.node.on(Button.EventType.CLICK, this.onCloseBtnClick, this);
        this.showRewardInfoBtn.node.on(Button.EventType.CLICK, this.onShowRewardInfoBtnClick, this);

        this.eventController.node.on("refresh", () => this.refresh());
        this.eventController.node.on("stage_end", () => this.stageEnd());

        this.refresh();

        for(let i = 0; i < this.predictionBtns.length; i++) {
            this.predictionBtns[i].node.on("move", (color) => this.makeMove(color));
        }

        for(let i = 0; i < this.items.length; i++) {
            this.items[i].node.on("remove", (color) => this.removeColor(color));
        }

        this.lastHistorySize = 0;
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

        this.minigameContainer.active = this.isEventStarted && !this.isEventComplete;
        this.progressBar.node.active = this.isEventStarted && !this.isEventComplete;
        this.completeContainer.active = this.isEventComplete;

        if(this.isEventStarted && !this.isEventComplete) {
            let curLvl = this.eventController.getCurrentStage() + 1;
            this.reqLabel.string = "";
            this.collectablesCount.string = this.eventController.getCollectable();
            this.levelIndex.string = curLvl;

            tween(this.progressBar)
                .to(0.8, { progress: this.eventController.getCurrentStage() / this.eventController.getTotalLevels() })
                .start();
        }
        
        if(!this.eventController.isRequiredLevelReached()) {
            this.reqLabel.string = Localization.instance.getLabelByKey("events.levelreq") + " " + this.eventController.getLevelRequired();
        }
        
        this.startBtn.node.active = !this.isEventStarted && !this.isEventComplete;

        let predictions = this.eventController.getPredictions();
        let pool = this.eventController.getCurrentPool();
        let hints = this.eventController.getSpecialHints();

        let poolSize = pool.length;

        for(let i = 0; i < this.items.length; i++) {
            this.items[i].node.active = i < poolSize;

            let color = i < predictions.length ? predictions[i] : "none";

            if(color === "none") {
                if(i < hints.length) {
                    if(hints[i] !== "undefined") {
                        color = hints[i];
                    }
                }
            }
            
            this.items[i].refresh(color);

            this.items[i].setIndicator(hints.includes(color) && color !== "undefined");
        }

        let history = this.eventController.getHistory();
        let historySize = history.length;

        for(let i = 0; i < this.historyShelfs.length; i++) {
            this.historyShelfs[i].node.active = i < historySize;
        }

        if(historySize > this.lastHistorySize) {
            this.scheduleOnce(() => this.animateScrollToBottom(), 0.1);

            for(let i = this.lastHistorySize; i < historySize; i++) {
                this.historyShelfs[i].refresh(history[i], hints);
            }
        }

        this.lastHistorySize = historySize;

        for(let i = 0; i < this.predictionBtns.length; i++) {
            this.predictionBtns[i].node.active = i < poolSize;

            let color = i < pool.length ? pool[i] : "undefined";

            this.predictionBtns[i].node.active = !hints.includes(color);

            this.predictionBtns[i].refresh(color, predictions);
        }

        let rewardData = this.eventController.getReward();
        this.reward.refresh(rewardData);

        this.eventController.takeUnpickedRewards();
    }

    stageEnd() {
        let hints = this.eventController.getSpecialHints();
    
        let timeStep = 0.2;
        let totalTime = timeStep * hints.length;
    
        let isStageComplete = true;
    
        for (let i = 0; i < hints.length && i < this.items.length; i++) {
            let isComplete = hints[i] !== "undefined";

            if (!isComplete) {
                isStageComplete = false;
            }

            this.scheduleOnce(() => {
                this.items[i].setIndicator(isComplete);
            }, timeStep * i);
        }
    
        if (isStageComplete) {
            for (let i = 0; i < this.items.length; i++) {
                this.scheduleOnce(() => {
                    const original = this.items[i].node;
                    const clone = instantiate(original);

                    clone.getComponent("UIEventMagicCauldronItem").removeIndicator();
                    
                    this.effectsLayout.addChild(clone);
                    clone.setWorldPosition(original.getWorldPosition());
                    
                    const goalWorldPos = this.goalNode.getWorldPosition();
                    const localGoalPos = clone.parent.getComponent(UITransform)
                        .convertToNodeSpaceAR(goalWorldPos);

                    tween(clone)
                        .to(this.flightDuration, { position: localGoalPos }, { easing: 'quadInOut' })
                        .call(() => {
                            clone.destroy();
                        })
                        .start();
                }, totalTime);
            }
        }
    
        this.scheduleOnce(() => {
            this.refresh();
        }, totalTime + this.flightDuration);
    }
    


    show() {
        super.show();

        this.refresh();
    }

    updateWidgetAlignment(isPortrait: boolean) {
        for(let i = 0; i < this.frameWidgets.length; i++) {
            /*this.frameWidgets[i].left = isPortrait ? 0 : 650;
            this.frameWidgets[i].right = isPortrait ? 0 : 650;

            this.frameWidgets[i].updateAlignment();*/
        }
    }


    onStartBtnClick() {
        this.eventController.activateEvent();

        this.refresh();
    }

    onCloseBtnClick() {
        this.hide();
    }


    makeMove(color: string) {
        this.eventController.makeMove(color);
    }

    removeColor(color: string) {
        this.eventController.removeColor(color);
    }


    scrollToTop() {
        this.scrollView.scrollToOffset(new Vec2(0, 0), 0);
    }

    animateScrollToBottom() {
        const maxOffset = this.scrollView.getMaxScrollOffset();
        
        tween(this.scrollView.getScrollOffset())
            .to(this.scrollDuration, new Vec2(0, maxOffset.y), {
                onUpdate: (val: Vec2) => {
                    this.scrollView.scrollToOffset(val);
                }
            })
            .start();
    }


    onShowRewardInfoBtnClick() {
        this.rewardInfo.active = true;

        this.rewardInfoComp.initReward(this.eventController.getGrandRewardData());
    }
}


