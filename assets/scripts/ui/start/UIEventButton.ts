import { _decorator, Component, Node, Label, ProgressBar, tween } from 'cc';
import { EventBase } from '../../game/events/EventBase';
const { ccclass, property } = _decorator;

@ccclass('UIEventButton')
export class UIEventButton extends Component {
    
    @property(EventBase)
    eventController: EventBase = null;

    @property(Label)
    timeLabel: Label = null;

    @property(ProgressBar)
    progressBar: ProgressBar = null;


    start() {
        this.eventController.node.on("init", () => this.setProgress());
        this.eventController.node.on("refresh", () => this.setProgress());
    }
    
    update(deltaTime: number) {
        this.timeLabel.string = this.eventController.getRemainingTimeString();

        this.node.active = this.eventController.isEventAvailable();
    }

    setProgress() {
        let eventProgress = this.eventController.getTimeProgress();

        tween(this.progressBar)
            .to(0.8, { progress: eventProgress })
            .start();
    }
}


