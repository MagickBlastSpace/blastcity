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
    clickBtn: Button = null;

    @property(Node)
    isJoined: Node = null;

    private clanData: ClanData = null;


    start() {
        this.clickBtn.node.on(Button.EventType.CLICK, this.onShowInfoClick, this);
    }


    init(data: ClanData) {
        this.clanData = data;

        this.nameLabel.string = data.clanName;
        this.membersCountLabel.string = data.membersCount + "/" + data.capacity;

        this.isJoined.active = data.isJoined;
    }


    onShowInfoClick() {
        this.node.emit("show_info", this.clanData);
    }


    isFull(): boolean {
        return this.clanData.membersCount >= this.clanData.capacity;
    }
}


