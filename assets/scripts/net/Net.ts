declare const gamepush: any;

import { _decorator, Component, Node } from 'cc';
import { UserData } from '../data/UserData';
const { ccclass, property } = _decorator;


@ccclass('LeaderboardQueueItem')
export class LeaderboardQueueItem {
    @property
    eventId = "";
    @property
    variantId = "";
    @property
    scoreCount = 0;
}


@ccclass('Net')
export class Net extends Component {

    @property(Node)
    level: Node = null;

    private leaderboardPublishQueue: LeaderboardQueueItem[] = [];
    private isPublishing: boolean = false;

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
    async publishScore(eventId: string, variantId: string, scoreCount: number) {
        if(this.isPublishing) {
            let newQueueItem = new LeaderboardQueueItem();
            newQueueItem.eventId = eventId;
            newQueueItem.variantId = variantId;
            newQueueItem.scoreCount = scoreCount;

            this.leaderboardPublishQueue.push(newQueueItem);

            return;
        }

        this.isPublishing = true;

        let leaderboardTag = "SCORE";
        
        if(eventId !== "") {
            leaderboardTag += "_" + eventId.toUpperCase();
        }

        const result = await gamepush.leaderboard.publishRecord({
            tag: leaderboardTag,
            variant: variantId,
            override: true,
            record: {
                score: scoreCount,
                default: 1,
            },
        });

        const { record, fields } = result;

        this.isPublishing = false;

        if(this.leaderboardPublishQueue.length > 0) {
            let queueItem = this.leaderboardPublishQueue.pop();
            if(queueItem) {
                this.publishScore(queueItem.eventId, queueItem.variantId, queueItem.scoreCount);
            }
        }
    }

    async removeScore(eventId: string, variantId: string) {
        this.publishScore(eventId, variantId, 0);
    }


    async publishGamepushLevelRecord(levelId: string, movesCount: number, scoreCount: number) {
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


    async fetchScoreLeaderboardData(eventId: string, variantId: string) {
        let leaderboardTag = "SCORE";
        
        if(eventId !== "") {
            leaderboardTag += "_" + eventId.toUpperCase();
        }

        const result = await gamepush.leaderboard.fetchScoped({
            tag: leaderboardTag,
            variant: variantId,
            order: 'DESC',
            limit: 50,
            includeFields: ['score'],
            withMe: 'last',
            showNearest: 1,
        });

        return result;
    }

    async fetchScoreLeaderboardDataUnscoped(lb_tag: string) {
        const result = await gamepush.leaderboard.fetch({
            tag: lb_tag,
            order: 'DESC',
            limit: 50,
            includeFields: ['score'],
            withMe: 'last',
        });

        return result;
    }

    async getPlayersByIds(playerIds: number[]) {
        const result = await gamepush.players.fetch({
            ids: playerIds,
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

    async tryToCancelJoinClanChannel(id: number) {
        try {
            const response = await gamepush.channels.cancelJoin({ channelId: id });
        } catch (error) {
            console.log('Error tryToCancelJoinClanChannel:', error);
        }
    }

    async tryToLeaveClanChannel(id: number) {
        try {
            const response = await gamepush.channels.leave({ channelId: id });
        } catch (error) {
            console.log('Error tryToJoinClanChannel:', error);
        }
    }

    async createClanChannel(data: string, isPrivate: boolean) {
        try {
            const response = await gamepush.channels.createChannel({ 
                template: "clan",
                name: data,
                private: isPrivate,
            });
        } catch (error) {
            console.log('Error create clan ch:', error);
        }
    }

    async fetchClanJoinRequests(id: number) {
        try {
            const response = await gamepush.channels.fetchJoinRequests({
                channelId: id,
                limit: 20,
                offset: 0
              });
        } catch (error) {
            console.log('Error fetching join reqs in clan channel:', error);
        }
    }

    acceptClanJoinRequests(player: number, clan: number) {
        gamepush.channels.acceptJoinRequest({ channelId: clan, playerId: player });
    }

    rejectClanJoinRequests(player: number, clan: number) {
        gamepush.channels.rejectJoinRequest({ channelId: clan, playerId: player });
    }

    kickClanMember(player: number, clan: number) {
        gamepush.channels.kick({ channelId: clan, playerId: player });
    }
}


