declare const gamepush: any;

import { _decorator, Component, Label, Button } from 'cc';
import { UserData } from '../../data/UserData';
import { Localization } from '../../utils/Localization';

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

    private isMock: boolean = false;


    start() {
        if (this.acceptButton) {
            this.acceptButton.node.on(
                Button.EventType.CLICK,
                this.accept,
                this
            );
        }

        if (this.rejectButton) {
            this.rejectButton.node.on(
                Button.EventType.CLICK,
                this.reject,
                this
            );
        }
    }


    init(message: any, isMock: boolean = false) {
        this.isMock = isMock;

        this.nameLabel.string =
            message.player.name +
            ' ' +
            Localization.instance.getLabelByKey('rating.requestlabel');

        this.playerId = message.player.id;
        this.messageId = message.id;
    }


    accept() {
        if (this.isMock) {
            console.log('[FRIEND REQUEST] Mock accept clicked');
            return;
        }

        gamepush.channels.sendFeedMessage({
            playerId: this.playerId,
            text: 'Friend request accepted',
            tags: ['friend_accept'],
        });

        UserData.instance.addFriend(this.playerId);

        gamepush.channels.deleteMessage({
            messageId: this.messageId
        });

        this.node.destroy();
    }


    reject() {
        if (this.isMock) {
            console.log('[FRIEND REQUEST] Mock reject clicked');
            return;
        }

        gamepush.channels.sendFeedMessage({
            playerId: this.playerId,
            text: 'Friend request rejected',
            tags: ['friend_reject'],
        });

        gamepush.channels.deleteMessage({
            messageId: this.messageId
        });

        this.node.destroy();
    }
}