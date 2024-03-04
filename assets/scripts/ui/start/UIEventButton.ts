import { _decorator, Component, Node, Label } from 'cc';
import { EventBase } from '../../game/events/EventBase';
const { ccclass, property } = _decorator;

@ccclass('UIEventButton')
export class UIEventButton extends Component {
    
    @property(EventBase)
    eventController: EventBase = null;

    @property(Label)
    timeLabel: Label = null;


    update(deltaTime: number) {
        this.timeLabel.string = this.eventController.getRemainingTimeString();
    }
}


