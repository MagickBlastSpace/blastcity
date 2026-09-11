import { _decorator, Component, Node, Vec3 } from 'cc';
import { EventBase } from './EventBase';
import { EventProgressData, EventRewardData, InitEventData } from '../../data/EventData';
import { SaveData } from '../../data/SaveData';
import { Net } from '../../net/Net';
import { UIPopupReward } from '../../ui/UIPopupReward';
import { UIEventBattlepassBonusBankReward } from '../../ui/events/Battlepass/UIEventBattlepassBonusBankReward';
import { UIRewardCloudManager } from '../../ui/UIRewardCloudManager';
const { ccclass, property } = _decorator;

@ccclass('EventsController')
export class EventsController extends Component {
    
    @property(Node)
    events: [Node] = [];

    @property([InitEventData])
    eventsData: InitEventData[] = [];

    @property(UIPopupReward)
    rewardPopup: UIPopupReward;
    @property(UIEventBattlepassBonusBankReward)
    bonusBankRewardPopup: UIEventBattlepassBonusBankReward;
    @property(UIRewardCloudManager)
    rewardCloudManager: UIRewardCloudManager;

    @property(Node)
    chest: Node;

    private progressQueue: EventProgressData[] = [];


    start() {
        this.init();
    }

    init() {
        for(let i = 0; i < this.events.length && i < this.eventsData.length; i++) {
            let eventComp = this.events[i].getComponent("EventBase");
            if(eventComp.isWeekly()) {
                eventComp.initWeekly(this.eventsData[i].startDayOfWeek, this.eventsData[i].startHour, this.eventsData[i].durationDays);
            }
            else {
                eventComp.init(this.eventsData[i].startHour, this.eventsData[i].durationHours);
            }

            SaveData.instance.loadEvent(eventComp.getEventId());

            this.events[i].on("progress", (count) => this.handleEventProgress(eventComp.getEventId(), count));
            this.events[i].on("reward", (data) => this.handleEventReward(data));
            this.events[i].on("reward_bonus_bank", (count) => this.handleBonusBankReward(count));
            this.events[i].on("reward_lite", (data, pos) => this.handleEventRewardLite(data, pos));
        }

        this.chest.on("progress", (count) => this.handleEventProgress("chest", count));

        Net.instance.requestEventsChannels();
    }


    handleEventProgress(eventName: string, progressCount: number) {
        let progressData = new EventProgressData();

        progressData.eventName = eventName;
        progressData.progress = progressCount;

        this.progressQueue.push(progressData);
    }

    getProgressData(): EventProgressData[] {
        return this.progressQueue;
    }

    clearProgressData() {
        this.progressQueue = [];
    }


    handleEventReward(data: EventRewardData) {
        this.rewardPopup.show();

        this.rewardPopup.init(data);
    }

    handleEventRewardLite(data: EventRewardData, pos: Vec3) {
        this.rewardCloudManager.init(data, pos);
    }

    handleBonusBankReward(count: number) {
        this.bonusBankRewardPopup.show();

        this.bonusBankRewardPopup.init(count);
    }


    debug_SwitchEvents() {
        for(let i = 0; i < this.eventsData.length; i++) {
            if(this.eventsData[i].startDayOfWeek === 1 && this.eventsData[i].durationDays === 4) {
                this.eventsData[i].startDayOfWeek = 5;
                this.eventsData[i].durationDays = 3;
            }
            else if(this.eventsData[i].startDayOfWeek === 5 && this.eventsData[i].durationDays === 3) {
                this.eventsData[i].startDayOfWeek = 1;
                this.eventsData[i].durationDays = 4;
            }
        }

        this.init();
    }
}


