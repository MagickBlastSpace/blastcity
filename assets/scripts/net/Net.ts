declare const gamepush: any;

import { _decorator, Component, Node } from 'cc';
import { UserData } from '../data/UserData';
const { ccclass, property } = _decorator;


@ccclass('Net')
export class Net extends Component {

    @property(Node)
    level: Node = null;

    public static instance: Net = null;


    onLoad() {
        Net.instance = this;
    }

    start() {
        //this.level.on("publish_record", (levelId, movesCount, scoreCount) => this.publishGamepushLevelRecord(levelId, movesCount, scoreCount));
    }


    publishGamepushLevelRecord(levelId: string, movesCount: number, scoreCount: number) {
        console.log("Net module publishig record");

        gamepush.leaderboard.publishRecord({
            id: 11354,
            tag: 'LEVELS',
            variant: levelId,
            override: true,
            record: {
                moves: movesCount,
                score: scoreCount,
            },
        });
    }


    async requestEventsChannels() {
        try {
            const response = await gamepush.channels.fetchChannels({
                tags: ["event"],
                limit: 100
            });
        } catch (error) {
            console.log('Error request events channels:', error);
        }
    }

    async requestClansChannels() {
        try {
            const response = await gamepush.channels.fetchChannels({
                tags: ["clan"],
                limit: 100
            });
        } catch (error) {
            console.log('Error request clans channels:', error);
        }
    }

    async requestMoreClansChannels() {
        try {
            const response = await gamepush.channels.fetchMoreChannels({
                tags: ["clan"],
                limit: 100
            });
        } catch (error) {
            console.log('Error requestMoreClanChannels:', error);
        }
    }

    async tryToJoinClanChannel(newId: number, oldId: number) {
        try {
            this.tryToLeaveClanChannel(oldId);

            const response = await gamepush.channels.join({ channelId: newId });
        } catch (error) {
            console.log('Error tryToJoinClanChannel:', error);
        }
    }

    async tryToLeaveClanChannel(id: number) {
        try {
            const response = await gamepush.channels.leave({ channelId: id });
        } catch (error) {
            console.log('Error tryToJoinClanChannel:', error);
        }
    }

    async createClanChannel() {
        try {
            const response = await gamepush.channels.createChannel({ 
                template: "clan",
                name: 'Clan_' + UserData.instance.getPlayerName(),
            });
        } catch (error) {
            console.log('Error create clan ch:', error);
        }
    }
}


