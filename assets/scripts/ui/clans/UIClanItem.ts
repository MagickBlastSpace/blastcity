import { _decorator, Component, Node, Button, Label } from 'cc';
import { Clans } from '../../game/Clans';
import { ClanData } from '../../data/ClanData';
const { ccclass, property } = _decorator;

@ccclass('UIClanItem')
export class UIClanItem extends Component {

    @property(Label)
    nameLabel: Label = null;
    @property(Label)
    membersCountLabel: Label = null;

    @property(Button)
    joinBtn: Button = null;
    @property(Button)
    leaveBtn: Button = null;

    @property(Node)
    isJoined: Node = null;

    private clanData: ClanData = null;


    start() {
        this.joinBtn.node.on(Button.EventType.CLICK, this.onJoinBtnClick, this);
        this.leaveBtn.node.on(Button.EventType.CLICK, this.onLeaveBtnClick, this);
    }


    init(data: ClanData) {
        this.clanData = data;

        this.nameLabel.string = data.clanName;
        this.membersCountLabel.string = data.membersCount + "/" + data.capacity;
        
        this.isJoined.active = data.isJoined;
    }


    onJoinBtnClick() {
        if(this.isFull()) {
            return;
        }

        this.node.emit("join", this.clanData.clanId);
    }

    onLeaveBtnClick() {
        this.node.emit("leave", this.clanData.clanId);
    }


    isFull(): boolean {
        return this.clanData.membersCount >= this.clanData.capacity;
    }
}


