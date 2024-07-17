import { _decorator, Component, Node, Label, Button } from 'cc';
import { UIPopupFrameBase } from '../UIPopupFrameBase';
import { Net } from '../../net/Net';
const { ccclass, property } = _decorator;

@ccclass('UIProfilePopup')
export class UIProfilePopup extends UIPopupFrameBase {

    @property(Label)
    clanName: Label = null;
    @property(Label)
    playerName: Label = null;
    @property(Label)
    score: Label = null;

    @property(Button)
    addToFriendsBtn: Button = null;
    @property(Button)
    removeFromFriendsBtn: Button = null;
    @property(Button)
    openChatBtn: Button = null;

    @property(Button)
    closeBtn: Button = null;

    private playerId: number = 0;


    start() {
        this.addToFriendsBtn.node.on(Button.EventType.CLICK, this.onAddBtnClick, this);
        this.removeFromFriendsBtn.node.on(Button.EventType.CLICK, this.onRemoveBtnClick, this);
        this.openChatBtn.node.on(Button.EventType.CLICK, this.onOpenChatBtnClick, this);

        this.closeBtn.node.on(Button.EventType.CLICK, this.onCloseBtnClick, this);
    }


    init(id: number) {
        this.playerId = id;
    }
    
    async refresh() {
        this.playerName.string = "";
        this.clanName.string = "";
        this.score.string = "";

        if(!this.playerId || this.playerId === undefined || this.playerId === 0) {
            return;
        }
    
        try {
            let ids = [this.playerId];
            const result = await Net.instance.getPlayersByIds(ids);
            
            const { players } = result;
            
            if(players.length > 0) {
                this.playerName.string = players[0].state["name"];
                this.clanName.string = players[0].state["clanname"];
                this.score.string = "Level " + players[0].state["score"];
            }
        } catch (error) {
            console.log('Error fetching player profile:', error);
        }
    }


    show() {
        super.show();

        this.refresh();
    }


    onAddBtnClick() {}

    onRemoveBtnClick() {}

    onOpenChatBtnClick() {}


    onCloseBtnClick() {
        this.hide();
    }
}


