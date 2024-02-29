import { _decorator, Component, Node } from 'cc';
import { EventBase } from './EventBase';
import { DailyEventData } from '../../data/GameData';
const { ccclass, property } = _decorator;

@ccclass('EventsController')
export class EventsController extends Component {
    
    @property(EventBase)
    lavaAdventureEvent: EventBase;

    /*@property(DailyEventData)
    lavaAdventureEventData: DailyEventData;*/

    start() {
        this.init();
    }

    init() {
        this.lavaAdventureEvent.init(8, 24);
    }
}


