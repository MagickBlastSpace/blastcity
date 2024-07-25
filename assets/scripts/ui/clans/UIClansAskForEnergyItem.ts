declare const gamepush: any;

import { _decorator, Component, Node, Label, Button } from 'cc';
import { UserData } from '../../data/UserData';
const { ccclass, property } = _decorator;

@ccclass('UIClansAskForEnergyItem')
export class UIClansAskForEnergyItem extends Component {

    @property(Label)
    nameLabel: Label = null;

    @property(Button)
    helpButton: Button = null;

    private playerName: string = "";
    private playerId: number = 0;


    start() {
        this.helpButton.node.on(Button.EventType.CLICK, this.help, this);
    }
    
    init(message: any) {
        if(message.player.name === UserData.instance.getPlayerName()) {
            this.nameLabel.string = "You asked for help";
            this.helpButton.node.active = false;
        }
        else {
            this.nameLabel.string = message.player.name + " asked for help";
            this.helpButton.node.active = true;
        }

        this.playerId = message.authorId;
        this.playerName = message.player.name;
    }

    
    help() {
        gamepush.channels.sendPersonalMessage({
            playerId: this.playerId,
            text: UserData.instance.getPlayerName() + " gives you 1 energy!",
            tags: ['energy'],
        });

        this.node.destroy();
    }
}


