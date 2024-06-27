declare const gamepush: any;

import { _decorator, Component, Node } from 'cc';
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
}


