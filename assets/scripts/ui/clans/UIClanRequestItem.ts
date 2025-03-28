import { _decorator, Component, Node, Label, Button } from 'cc';
import { Net } from '../../net/Net';
import { Localization } from '../../utils/Localization';
const { ccclass, property } = _decorator;

@ccclass('UIClanRequestItem')
export class UIClanRequestItem extends Component {
    
    @property(Label)
    nameLabel: Label = null;

    @property(Button)
    acceptButton: Button = null;
    @property(Button)
    rejectButton: Button = null;

    private playerId: number = 0;
    private clanId: number = 0;


    start() {
        this.acceptButton.node.on(Button.EventType.CLICK, this.accept, this);
        this.rejectButton.node.on(Button.EventType.CLICK, this.reject, this);
    }
    
    init(message: any, clanId: number) {
        this.nameLabel.string = message.player.name + " " + Localization.instance.getLabelByKey("clans.activerequest");

        this.playerId = message.player.id;
        this.clanId = clanId;
    }

    
    accept() {
        Net.instance.acceptClanJoinRequests(this.playerId, this.clanId);
    }

    reject() {
        Net.instance.rejectClanJoinRequests(this.playerId, this.clanId);
    }
}


