import { _decorator, Component, EventTouch, Node } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('TransparentButton')
export class TransparentButton extends Component {
    onLoad() {
        this.node.on(Node.EventType.TOUCH_START, this.allowEventPropagation, this, true);
        this.node.on(Node.EventType.TOUCH_END, this.allowEventPropagation, this, true);
    }

    private allowEventPropagation(event: EventTouch) {
        console.log("preventing swallow");
        
        event.preventSwallow  = true;
    }
}



