import { _decorator, Component, Node, Label } from 'cc';
import { ClanMemberData } from '../../data/ClanData';
import { UserData } from '../../data/UserData';
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


    init(index: number, data: ClanMemberData) {
        this.indexLabel.string = index;

        this.nameLabel.string = data.name;
        this.scoreLabel.string = data.score;

        this.isPlayer.active = UserData.instance.getPlayerName() === data.name;
    }
}


