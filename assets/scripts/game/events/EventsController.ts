import { _decorator, Component, Node } from 'cc';
import { EventBase } from './EventBase';
import { EventProgressData, InitEventData } from '../../data/EventData';
import { SaveData } from '../../data/SaveData';
import { Net } from '../../net/Net';
const { ccclass, property } = _decorator;

@ccclass('EventsController')
export class EventsController extends Component {
    
    @property(Node)
    events: [Node] = [];

    @property([InitEventData])
    eventsData: InitEventData[] = [];

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
        }

        Net.instance.requestEventsChannels();
        Net.instance.requestClansChannels();
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
}


