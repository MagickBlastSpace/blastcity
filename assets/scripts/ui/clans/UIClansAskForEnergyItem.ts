declare const gamepush: any;

import { _decorator, Component, Node, Label, Button, SpriteFrame, Sprite, ProgressBar } from 'cc';
import { UserData } from '../../data/UserData';
import { Profile } from '../../game/Profile';
import { Net } from '../../net/Net';
const { ccclass, property } = _decorator;

@ccclass('UIClansAskForEnergyItem')
export class UIClansAskForEnergyItem extends Component {

    @property(Label)
    nameLabel: Label = null;
    @property(Label)
    helpProgressLabel: Label = null;

    @property(ProgressBar)
    helpProgress: ProgressBar = null;

    @property(Button)
    helpButton: Button = null;

    @property(Sprite)
    avatar: Sprite = null;

    private playerName: string = "";
    private playerId: number = 0;

    private messageId: number = 0;
    private channelId: number = 0;

    private helpedTimes: number = 0;
    private maxHelpedTimes: number = 10;


    start() {
        this.helpButton.node.on(Button.EventType.CLICK, this.help, this);
    }
    
    init(message: any) {
        this.nameLabel.string = message.player.name;

        this.helpButton.node.active = message.authorId !== UserData.instance.getPlayerId();

        this.playerId = message.authorId;
        this.playerName = message.player.name;

        this.messageId = message.id;

        this.loadAvatar(this.playerId);

        this.helpedTimes = 0;
        
        this.refresh();
    }


    refresh() {
        if(this.helpedTimes >= this.maxHelpedTimes) {
            gamepush.channels.deleteMessage({ messageId: this.messageId });

            this.node.active = false;

            return;
        }
        else {
            this.node.active = true;
        }

        this.helpProgressLabel.string = this.helpedTimes + "/" + this.maxHelpedTimes;
        this.helpProgress.progress = this.helpedTimes / this.maxHelpedTimes;
    }

    refreshAvailability(isHelped: boolean) {
        this.helpButton.node.active = !isHelped && this.playerId !== UserData.instance.getPlayerId();
    }

    
    help() {
        gamepush.channels.sendPersonalMessage({
            playerId: this.playerId,
            text: UserData.instance.getPlayerName() + " gives you 1 energy!",
            tags: ['energy'],
        });

        gamepush.player.add('stat_energy_given', 1);

        this.helpButton.node.active = false;

        this.node.emit("help", this.playerName, this.messageId);
    }

    addHelpProgress() {
        this.helpedTimes = this.helpedTimes + 1;

        this.refresh();
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


    getPlayerId(): number {
        return this.playerId;
    }

    getMessageId(): number {
        return this.messageId;
    }
}


