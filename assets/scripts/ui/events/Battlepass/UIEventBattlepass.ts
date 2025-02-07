import { _decorator, Component, Node, Prefab, ProgressBar, Button, Label, instantiate, ScrollView, Vec2 } from 'cc';
import { UIEventPopupFrameBase } from '../UIEventPopupFrameBase';
import { UIEventBattlepassItem } from './UIEventBattlepassItem';
import { UserData } from '../../../data/UserData';
import { UIEventBattlepassBonusBank } from './UIEventBattlepassBonusBank';
const { ccclass, property } = _decorator;

@ccclass('UIEventBattlepass')
export class UIEventBattlepass extends UIEventPopupFrameBase {

    @property(Button)
    activateBtn: Button = null;
    @property(Button)
    closeBtn: Button = null;

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

    private items: [UIEventBattlepassItem] = [];


    start() {
        this.activateBtn.node.on(Button.EventType.CLICK, this.onActivateBtnClick, this);
        this.closeBtn.node.on(Button.EventType.CLICK, this.onCloseBtnClick, this);

        let data = this.eventController.getData();

        for(let i = 0; i < data.length; i++) {
            const itemNode = instantiate(this.itemPrefab);
            this.itemsLayout.addChild(itemNode);
            const item = itemNode.getComponent('UIEventBattlepassItem');

            itemNode.on("take", (stageIndex) => {
                this.eventController.takeReward(stageIndex - 1);
            });
            itemNode.on("take_premium", (stageIndex) => {
                this.eventController.takeReward_Premium(stageIndex - 1);
            });

            this.items.push(item);
        }

        for(let i = 0; i < data.length && i < this.items.length; i++) {
            this.items[i].refresh(i + 1, data[i], this.eventController.getCurrentStage());
            this.items[i].refreshAvailability(this.eventController.isRewardTaken(i), this.eventController.isRewardTaken_Premium(i));
        }

        this.itemsLayout.addChild(this.bonusSafe);

        this.bonusSafe.on("take", () => {
            this.eventController.takeBonusBank();
        });

        const percent = this.eventController.getCurrentStage() / this.eventController.getTotalStages();
        this.scrollView.scrollTo(new Vec2(0, percent), 0.5);
    }

    update(deltaTime: number) {
        if(!this.isInited) {
            return;
        }
        
        this.timeLabel.string = this.eventController.getRemainingTimeString();
    }


    refresh() {
        this.eventController.refresh();

        let isPrem = UserData.instance.getIsPremium();

        this.progressLabel.string = this.eventController.getCollectable() + "/" + this.eventController.getCurrentStageStep();
        
        this.activateBtn.node.active = !isPrem;

        let data = this.eventController.getData();

        for(let i = 0; i < data.length && i < this.items.length; i++) {
            this.items[i].refresh(i + 1, data[i], this.eventController.getCurrentStage());
            this.items[i].refreshAvailability(this.eventController.isRewardTaken(i), this.eventController.isRewardTaken_Premium(i));
        }

        this.stageLabel.string = this.eventController.getCurrentStage() + 1;

        this.progressBar.progress = this.eventController.getTimeProgress();

        this.bonusSafeComp.refresh(isPrem, this.eventController.getIsBankTakeAvailable(), this.eventController.getBonusBank());

        const percent = this.eventController.getCurrentStage() / this.eventController.getTotalStages();
        this.scrollView.scrollTo(new Vec2(0, percent), 0.5);
    }


    show() {
        super.show();

        this.refresh();
    }


    onActivateBtnClick() {
        UserData.instance.buyPremium();

        this.refresh();
    }

    onCloseBtnClick() {
        this.hide();
    }
}


