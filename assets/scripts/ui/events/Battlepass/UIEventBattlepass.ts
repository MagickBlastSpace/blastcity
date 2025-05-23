import { _decorator, Component, Node, Prefab, ProgressBar, Button, Label, instantiate, ScrollView, Vec2 } from 'cc';
import { UIEventPopupFrameBase } from '../UIEventPopupFrameBase';
import { UIEventBattlepassItem } from './UIEventBattlepassItem';
import { UserData } from '../../../data/UserData';
import { UIEventBattlepassBonusBank } from './UIEventBattlepassBonusBank';
import { ResolutionManager } from '../../../utils/ResolutionManager';
import { UIPopupFrameBase } from '../../UIPopupFrameBase';
import { UIEventBattlepassAdaptive } from './UIEventBattlepassAdaptive';
const { ccclass, property } = _decorator;

@ccclass('UIEventBattlepass')
export class UIEventBattlepass extends UIEventPopupFrameBase {

    @property(Button)
    activateBtn: Button = null;
    @property(Button)
    closeBtn: Button = null;
    @property(Button)
    closeBtn_Duplicate: Button = null;
    @property(Button)
    closeFrame: Button = null;
    @property(Button)
    takeUnpickedBtn: Button = null;
    @property(Button)
    startBtn: Button = null;

    @property(UIPopupFrameBase)
    endPopup: UIPopupFrameBase;
    @property(UIPopupFrameBase)
    startPopup: UIPopupFrameBase;

    @property(Label)
    progressLabel: Label = null;
    @property(Label)
    timeLabel: Label = null;
    @property(Label)
    stageLabel: Label = null;

    @property(ProgressBar)
    progressBar: ProgressBar = null;
    @property(ScrollView)
    scrollView: ScrollView = null;

    @property(Prefab)
    itemPrefab: Prefab = null;
    @property(Node)
    itemsLayout: Node = null;

    @property(Node)
    bonusSafe: Node = null;
    @property(UIEventBattlepassBonusBank)
    bonusSafeComp: UIEventBattlepassBonusBank;

    @property(Node)
    safeGold: Node = null;

    @property(UIEventBattlepassAdaptive)
    adaptivity: UIEventBattlepassAdaptive;

    private items: [UIEventBattlepassItem] = [];

    /*Debug*/
    @property(Button)
    addKeyBtn: Button = null;
    @property(Button)
    add10KeyBtn: Button = null;
    @property(Button)
    add100KeyBtn: Button = null;
    @property(Button)
    endBtn: Button = null;
    @property(Button)
    clearBtn: Button = null;

    @property(Node)
    debugInfoLayout: Node = null;

    @property(Label)
    gold: Label = null;
    @property(Label)
    rockets: Label = null;
    @property(Label)
    bombs: Label = null;
    @property(Label)
    discoballs: Label = null;

    @property(Label)
    rocketsTime: Label = null;
    @property(Label)
    bombsTime: Label = null;
    @property(Label)
    discoballsTime: Label = null;

    @property(Label)
    hammers: Label = null;
    @property(Label)
    bows: Label = null;
    @property(Label)
    cannons: Label = null;
    @property(Label)
    jesters: Label = null;

    @property(Label)
    livesTime: Label = null;
    @property(Label)
    cards: Label = null;


    start() {
        this.activateBtn.node.on(Button.EventType.CLICK, this.onActivateBtnClick, this);
        this.closeBtn.node.on(Button.EventType.CLICK, this.onCloseBtnClick, this);
        if(this.closeBtn_Duplicate) {
            this.closeBtn_Duplicate.node.on(Button.EventType.CLICK, this.onCloseBtnClick, this);
        }
        if(this.closeFrame) {
            this.closeFrame.node.on(Button.EventType.CLICK, this.onCloseBtnClick, this);
        }
        this.takeUnpickedBtn.node.on(Button.EventType.CLICK, this.onTakeUnpickedClick, this);
        this.startBtn.node.on(Button.EventType.CLICK, this.onStartClick, this);

        let data = this.eventController.getData();

        for(let i = 0; i < data.length; i++) {
            const itemNode = instantiate(this.itemPrefab);
            this.itemsLayout.addChild(itemNode);
            const item = itemNode.getComponent('UIEventBattlepassItem');

            itemNode.on("take", (stageIndex) => {
                this.eventController.takeReward(stageIndex);
            });
            itemNode.on("take_premium", (stageIndex) => {
                this.eventController.takeReward_Premium(stageIndex);
            });

            this.items.push(item);

            const adaptivityItem = itemNode.getComponent('UIEventBattlepassItemAdaptivity');
            this.adaptivity.addAdaptiveItem(adaptivityItem);
        }

        for(let i = 0; i < data.length && i < this.items.length; i++) {
            this.items[i].refresh(i, data[i], this.eventController.getCurrentStage());
            this.items[i].refreshAvailability(this.eventController.isRewardTaken(i), this.eventController.isRewardTaken_Premium(i));
        }

        this.itemsLayout.addChild(this.bonusSafe);

        const percent = this.eventController.getCurrentStage() / this.eventController.getTotalStages();
        this.scrollView.scrollTo(new Vec2(0, percent), 0.5);

        /*Debug*/
        this.addKeyBtn.node.on(Button.EventType.CLICK, this.onAddKeyClick, this);
        this.add10KeyBtn.node.on(Button.EventType.CLICK, this.onAdd10KeyClick, this);
        this.add100KeyBtn.node.on(Button.EventType.CLICK, this.onAdd100KeyClick, this);
        this.endBtn.node.on(Button.EventType.CLICK, this.onEndClick, this);
        this.clearBtn.node.on(Button.EventType.CLICK, this.onClearClick, this);
    }

    update(deltaTime: number) {
        /*if(!this.isInited) {
            return;
        }*/
        
        this.timeLabel.string = this.eventController.getRemainingTimeString();
    }


    refresh() {
        this.eventController.refresh();

        let isPrem = UserData.instance.getIsPremium();

        this.progressLabel.string = this.eventController.getCollectable() + "/" + this.eventController.getCurrentStageStep();
        
        this.activateBtn.node.active = !isPrem;

        let data = this.eventController.getData();

        for(let i = 0; i < data.length && i < this.items.length; i++) {
            this.items[i].refresh(i, data[i], this.eventController.getCurrentStage());
            this.items[i].refreshAvailability(this.eventController.isRewardTaken(i), this.eventController.isRewardTaken_Premium(i));
        }

        this.stageLabel.string = this.eventController.getCurrentStage() + 1;

        this.progressBar.progress = this.eventController.getTimeProgress();

        this.bonusSafeComp.refresh(isPrem, this.eventController.getBonusBank(), this.eventController.isMaxStage());

        if(this.eventController.isUnpickedRewardAvailable() || this.eventController.getIsComplete()) {
            this.endPopup.show();
        }

        this.safeGold.active = this.eventController.isMaxStage();

        this.adaptivity.refresh();

        /*Debug*/
        if(this.eventController.getIsDebugMode()) {
            this.gold.string = "Gold: " + UserData.instance.getResource("gold");

            this.bombs.string = "Bombs: " + UserData.instance.getResource("bomb");
            this.rockets.string = "Rockets: " + UserData.instance.getResource("rocket");
            this.discoballs.string = "Disco: " + UserData.instance.getResource("discoball");

            this.bombsTime.string = "B Time: " + UserData.instance.getRemainingTimeString("bomb");
            this.rocketsTime.string = "R Time: " + UserData.instance.getRemainingTimeString("rocket");
            this.discoballsTime.string = "D Time: " + UserData.instance.getRemainingTimeString("discoball");

            this.livesTime.string = "Lives Time: " + UserData.instance.getRemainingTimeString("endless_lives");

            this.hammers.string = "Hammers: " + UserData.instance.getResource("hammer");
            this.bows.string = "Arrows: " + UserData.instance.getResource("bow");
            this.cannons.string = "Cannons: " + UserData.instance.getResource("cannon");
            this.jesters.string = "Jesters: " + UserData.instance.getResource("jester");

            this.cards.string = "Cards: " + UserData.instance.getResource("cards");
        }
    }


    show() {
        super.show();

        this.refresh();

        this.scrollToCurrentStage();

        /*Debug*/
        this.showDebugUI(this.eventController.getIsDebugMode());
    }


    scrollToCurrentStage() {
        let curStage = this.eventController.getCurrentStage() - 1;

        if(curStage < 0) {
            curStage = 0;
        }

        let percent = curStage / this.eventController.getTotalStages();

        //let isPortrait = ResolutionManager.instance.isPortraitOrientation();
        let isPortrait = true;
        if(isPortrait) {
            percent = 1 - percent;
        }

        this.scheduleOnce(() => {
            this.scrollView.scrollTo(new Vec2(0, percent), 0.5);
        }, 0.2);
    }


    async onActivateBtnClick() {
        this.activateBtn.node.active = false;

        await UserData.instance.buyPremium();

        this.refresh();
    }

    onCloseBtnClick() {
        this.hide();
    }

    onTakeUnpickedClick() {
        this.eventController.takeUnpickedRewards();

        this.endPopup.hide();

        this.startPopup.show();
    }

    onStartClick() {
        //this.eventController.activateEvent();

        this.startPopup.hide();
    }


    /*Debug*/
    onAddKeyClick() {
        this.eventController.cheatKeys(1);
    }

    onAdd10KeyClick() {
        this.eventController.cheatKeys(10);
    }

    onAdd100KeyClick() {
        this.eventController.cheatKeys(100);
    }


    showDebugUI(isActive: boolean) {
        this.addKeyBtn.node.active = isActive;
        this.add10KeyBtn.node.active = isActive;
        this.add100KeyBtn.node.active = isActive;
        this.endBtn.node.active = isActive;
        this.clearBtn.node.active = isActive;

        this.debugInfoLayout.active = isActive;
    }


    onEndClick() {
        this.eventController.setEnd();
    }

    onClearClick() {
        this.eventController.clearSave();

        this.hide();
    }
}


