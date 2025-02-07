declare const gamepush: any;

import { _decorator, Component, Node, Label, Button, SpriteFrame, Sprite } from 'cc';
import { UserData } from '../../data/UserData';
import { Profile } from '../../game/Profile';
import { Net } from '../../net/Net';
const { ccclass, property } = _decorator;

@ccclass('UIClansAskForEnergyItem')
export class UIClansAskForEnergyItem extends Component {

    @property(Label)
    nameLabel: Label = null;

    @property(Button)
    helpButton: Button = null;

    @property(Sprite)
    avatar: Sprite = null;

    private playerName: string = "";
    private playerId: number = 0;


    start() {
        this.helpButton.node.on(Button.EventType.CLICK, this.help, this);
    }
    
    init(message: any) {
        this.nameLabel.string = message.player.name;

        this.helpButton.node.active = message.player.name !== UserData.instance.getPlayerName();

        this.playerId = message.authorId;
        this.playerName = message.player.name;

        this.loadAvatar(this.playerId);
    }

    
    help() {
        gamepush.channels.sendPersonalMessage({
            playerId: this.playerId,
            text: UserData.instance.getPlayerName() + " gives you 1 energy!",
            tags: ['energy'],
        });

        gamepush.player.add('stat_energy_given', 1);

        this.node.destroy();
    }


    async loadAvatar(id: number) {
        try {
            let ids = [id];
            const result = await Net.instance.getPlayersByIds(ids);
            
            const { players } = result;
            
            if(players.length > 0) {
                if(this.avatar) {
                    this.avatar.spriteFrame = Profile.instance.getAvatarById(players[0].state["avatar_id"]);
                }
            }
        }

        catch (error) {
            console.log('Error fetching players:', error);
        }
    }
}


