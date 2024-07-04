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


    /*
    Leaderboards
    */
    publishScore(variantId: string, scoreCount: number) {
        gamepush.leaderboard.publishRecord({
            id: 12464,
            tag: 'SCORE',
            variant: variantId,
            override: true,
            record: {
                score: scoreCount,
            },
        });
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


    async fetchScoreLeaderboardData(variantId: string) {
        const result = await gamepush.leaderboard.fetchScoped({
            id: 12464,
            tag: 'SCORE',
            variant: variantId,
            order: 'DESC',
            limit: 10,
            includeFields: ['score'],
            withMe: 'last',
            showNearest: 1,
        });

        return result;
    }


    /*
    Events
    */
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

    async createChannel(eventId: string) {
        try {
            const response = await gamepush.channels.createChannel({ template: eventId });
        } catch (error) {
            console.log('Error create channels:', error);
        }
    }

    async requestMoreChannels(eventId: string) {
        try {
            const response = await gamepush.channels.fetchMoreChannels({
                tags: [eventId],
                limit: 100
            });
        } catch (error) {
            console.log('Error requestMoreChannels:', error);
        }
    }

    async tryToJoinMultiplayerChannel(id: number) {
        try {
            const response = await gamepush.channels.join({ channelId: id });
        } catch (error) {
            console.log('Error tryToJoinMultiplayerChannel:', error);
        }
    }

    async fetchMembersOfChannel(id: number) {
        console.log("Fetching members of channel: " + id);

        try {
            const response = await gamepush.channels.fetchMembers({
                channelId: id,
            });
        } catch (error) {
            console.log('Error fetchMembersOfChannel:', error);
        }
    }


    /*
    Clans
    */
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


