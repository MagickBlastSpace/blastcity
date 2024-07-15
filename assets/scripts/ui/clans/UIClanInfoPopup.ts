import { _decorator, Component, Node, Prefab, instantiate, Label, Button } from 'cc';
import { UIPopupFrameBase } from '../UIPopupFrameBase';
import { ClanData, ClanMemberData } from '../../data/ClanData';
import { Net } from '../../net/Net';
import { UIClanMemberItem } from './UIClanMemberItem';
const { ccclass, property } = _decorator;

@ccclass('UIClanInfoPopup')
export class UIClanInfoPopup extends UIPopupFrameBase {

    @property([UIClanMemberItem])
    items: UIClanMemberItem[] = [];
    @property(Prefab)
    itemPrefab: Prefab = null;
    @property(Node)
    itemsLayout: Node = null;

    @property(Label)
    clanName: Label = null;
    @property(Label)
    membersCount: Label = null;
    @property(Label)
    score: Label = null;

    @property(Button)
    joinBtn: Button = null;
    @property(Button)
    leaveBtn: Button = null;

    @property(Button)
    closeBtn: Button = null;

    private clanData: ClanData = null;


    start() {
        this.joinBtn.node.on(Button.EventType.CLICK, this.onJoinBtnClick, this);
        this.leaveBtn.node.on(Button.EventType.CLICK, this.onLeaveBtnClick, this);

        this.closeBtn.node.on(Button.EventType.CLICK, this.onCloseBtnClick, this);
    }


    init(data: ClanData) {
        this.clanData = data;
    }
    
    async refresh() {
        if(!this.clanData || this.clanData === undefined) {
            return;
        }

        let members = [];

        this.clanName.string = this.clanData.clanName;
        this.membersCount.string = this.clanData.membersCount + "/" + this.clanData.capacity;

        this.joinBtn.node.active = !this.isFull() && !this.clanData.isJoined;
        this.leaveBtn.node.active = this.clanData.isJoined;
    
        try {
            const result = await Net.instance.fetchScoreLeaderboardData("clan", "clan_" + this.clanData.clanId);
            const { players, fields, topPlayers, abovePlayers, belowPlayers, player } = result;

            let totalScore = 0;
    
            for(let i = 0; i < players.length; i++) {
                if(players[i].score > 0) {
                    let player = new ClanMemberData();
                    player.name = players[i].name;
                    player.score = players[i].score;
    
                    members.push(player);

                    totalScore += players[i].score;
                }
            }

            this.score.string = totalScore;
    
            for(let i = 0; i < this.items.length; i++) {
                this.items[i].node.active = false;
            }
            
            for(let i = 0; i < members.length; i++) {
                if(i >= this.items.length) {
                    const itemNode = instantiate(this.itemPrefab);
                    this.itemsLayout.addChild(itemNode);
            
                    let item = itemNode.getComponent("UIClanMemberItem");
            
                    this.items.push(item);
                }

                this.items[i].node.active = true;
                this.items[i].init(i + 1, members[i]);
            }
    
        } catch (error) {
            console.log('Error fetching clan leaderboard data:', error);
        }
    }


    show() {
        super.show();

        this.refresh();
    }


    onJoinBtnClick() {
        if(this.isFull()) {
            return;
        }

        this.node.emit("join", this.clanData.clanId);
    }

    onLeaveBtnClick() {
        this.node.emit("leave", this.clanData.clanId);

        this.hide();
    }


    isFull(): boolean {
        return this.clanData.membersCount >= this.clanData.capacity;
    }


    onCloseBtnClick() {
        this.hide();
    }
}


