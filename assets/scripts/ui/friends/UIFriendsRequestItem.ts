declare const gamepush: any;

import { _decorator, Component, Node, Label, Button } from 'cc';
import { UserData } from '../../data/UserData';
const { ccclass, property } = _decorator;

@ccclass('UIFriendsRequestItem')
export class UIFriendsRequestItem extends Component {

    @property(Label)
    nameLabel: Label = null;

    @property(Button)
    acceptButton: Button = null;
    @property(Button)
    rejectButton: Button = null;

    private playerId: number = 0;
    private messageId: number = 0;


    start() {
        this.acceptButton.node.on(Button.EventType.CLICK, this.accept, this);
        this.rejectButton.node.on(Button.EventType.CLICK, this.reject, this);
    }
    
    init(message: any) {
        this.nameLabel.string = message.player.name + " requested to be your friend";

        this.playerId = message.player.id;
        this.messageId = message.id;
    }

    
    accept() {
        gamepush.channels.sendPersonalMessage({
            playerId: this.playerId,
            text: "Friend request accepted",
            tags: ['friend_accept'],
        });

        UserData.instance.addFriend(this.playerId);

        gamepush.channels.deleteMessage({ messageId: this.messageId });

        this.node.destroy();
    }

    reject() {
        gamepush.channels.sendPersonalMessage({
            playerId: this.playerId,
            text: "Friend request rejected",
            tags: ['friend_reject'],
        });

        gamepush.channels.deleteMessage({ messageId: this.messageId });

        this.node.destroy();
    }
}


