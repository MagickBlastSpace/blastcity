import { _decorator, Component, Node, Button, Label, tween, Vec3, Prefab, instantiate, Widget } from 'cc';
import { UIEventPopupFrameBase } from './UIEventPopupFrameBase';
import { UserData } from '../../data/UserData';
import { ResolutionManager } from '../../utils/ResolutionManager';
const { ccclass, property } = _decorator;

@ccclass('UIEventLavaAdventure')
export class UIEventLavaAdventure extends UIEventPopupFrameBase {

    @property(Button)
    startBtn: Button = null;
    @property(Button)
    closeBtn: Button = null;
    @property(Button)
    closeBtn_2: Button = null;
    @property(Button)
    playBtn: Button = null;

    @property(Label)
    progressLabel: Label = null;
    @property(Label)
    playersLabel: Label = null;
    @property(Label)
    levelReqLabel: Label = null;
    @property(Label)
    timeLabel: Label = null;
    @property(Label)
    timeLabel_duplicate: Label = null;
    @property(Label)
    cooldownTimeLabel: Label = null;

    @property(Node)
    miniGame: Node = null;
    @property(Node)
    background: Node = null;
    @property(Node)
    player: Node = null;

    @property(Prefab)
    playerPrefab: Prefab = null;

    @property(Widget)
    frameWidget: Widget = null;

    private bckg_start_Y: number = 1700;
    private bckg_total_length: number = 3400;

    private player_start_X: number = -368;
    private player_end_X: number = 368;
    private player_Y: number = -435;

    private isEventStarted = false;


    onLoad() {
        window.addEventListener('resize', this.onWindowResize.bind(this));
    }

    onDestroy() {
        window.removeEventListener('resize', this.onWindowResize.bind(this));
    }

    onWindowResize() {
        this.updateWidgetAlignment();
    }


    start() {
        this.startBtn.node.on(Button.EventType.CLICK, this.onStartBtnClick, this);
        this.closeBtn.node.on(Button.EventType.CLICK, this.onCloseBtnClick, this);
        this.closeBtn_2.node.on(Button.EventType.CLICK, this.onCloseBtnClick, this);

        this.playBtn.node.on(Button.EventType.CLICK, this.onPlayBtnClick, this);
    }

    update(deltaTime: number) {
        if(!this.isInited) {
            return;
        }

        this.timeLabel.string = this.eventController.getRemainingTimeString();
        this.timeLabel_duplicate.string = this.eventController.getRemainingTimeString();

        this.cooldownTimeLabel.string = this.eventController.getRemainingCooldownString();
    }


    refresh() {
        if(!this.isInited) {
            return;
        }

        this.destroyAllPlayers();

        this.eventController.refresh();

        this.isEventStarted = this.eventController.getIsStarted();

        this.miniGame.active = this.isEventStarted;

        if(this.isEventStarted) {
            let curStage = this.eventController.getCurrentStage() + 1;
            this.progressLabel.string = curStage + "/" + this.eventController.getTotalSteps();

            let playersCount = this.eventController.getCollectable();
            this.playersLabel.string = playersCount + "/100";

            for(let i = 0; i < playersCount; i++) {
                const newPlayerNode = instantiate(this.playerPrefab);
                this.player.addChild(newPlayerNode);
            }

            let bckg_Y = this.bckg_start_Y - (this.bckg_total_length / (this.eventController.getTotalSteps() - 1) * this.eventController.getCurrentStage());

            this.background.setPosition(0, this.bckg_start_Y);

            tween(this.background)
                .to(0.5, { position: new Vec3(0, bckg_Y, 0) })
                .start();

            let player_X = this.eventController.getCurrentStage() % 2 === 0 ? this.player_start_X : this.player_end_X;

            tween(this.player)
                .to(0.5, { position: new Vec3(player_X, this.player_Y, 0) })
                .start();
        }

        if(!this.eventController.isRequiredLevelReached()) {
            this.levelReqLabel.string = "Required Level " + this.eventController.getLevelRequired();
        }
        else if(this.eventController.getIsComplete() && UserData.instance.isTemproraryBonusActive()) {
            this.levelReqLabel.string = "Can not start with bonuses";
        }
        else {
            this.levelReqLabel.string = "";
        }
        
        this.startBtn.node.active = this.eventController.canParticipate() && !this.isEventStarted && !(this.eventController.getIsComplete() && UserData.instance.isTemproraryBonusActive());
    }

    private destroyAllPlayers() {
        const children = this.player.children;

        for (let i = children.length - 1; i >= 0; i--) {
            children[i].destroy();
        }

        this.player.removeAllChildren();
    }


    show() {
        super.show();

        this.updateWidgetAlignment();

        this.refresh();
    }

    updateWidgetAlignment() {
        this.frameWidget.left = ResolutionManager.instance.isPortraitOrientation() ? 0 : 700;
        this.frameWidget.right = ResolutionManager.instance.isPortraitOrientation() ? 0 : 700;
        
        this.frameWidget.updateAlignment();
    }


    onStartBtnClick() {
        if(!this.isInited) {
            return;
        }

        this.eventController.activateEvent();

        this.refresh();
    }

    onCloseBtnClick() {
        this.hide();
    }


    onPlayBtnClick() {
        this.hide();

        this.node.emit("play");
    }
}


