import { _decorator, Component, Node, Label, Button } from 'cc';
import { ClanMemberData } from '../../data/ClanData';
import { UserData } from '../../data/UserData';
import { Net } from '../../net/Net';
const { ccclass, property } = _decorator;

@ccclass('UIClanMemberItem')
export class UIClanMemberItem extends Component {

    @property(Label)
    indexLabel: Label = null;
    @property(Label)
    nameLabel: Label = null;
    @property(Label)
    scoreLabel: Label = null;

    @property(Node)
    isPlayer: Node = null;

    @property(Button)
    kickBtn: Button = null;
    @property(Button)
    profileBtn: Button = null;

    private data: ClanMemberData = null;


    start() {
        this.kickBtn.node.on(Button.EventType.CLICK, this.kickPlayer, this);
        this.profileBtn.node.on(Button.EventType.CLICK, this.showProfile, this);
    }


    init(index: number, data: ClanMemberData) {
        this.indexLabel.string = index;

        this.nameLabel.string = data.name;
        this.scoreLabel.string = data.score;

        this.isPlayer.active = UserData.instance.getPlayerName() === data.name;

        this.data = data;
    }


    enableKick(isEnabled: boolean) {
        this.kickBtn.node.active = isEnabled && this.data.playerId !== UserData.instance.getPlayerId();
    }


    kickPlayer() {
        this.node.emit("kick", this.data.playerId);
    }

    showProfile() {
        this.node.emit("profile", this.data.playerId);
    }
}


