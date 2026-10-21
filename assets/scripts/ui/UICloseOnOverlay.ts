import {
    _decorator,
    Component,
    EventTouch,
    Node,
    UITransform,
    Vec2,
} from 'cc';

import { UIFrameBase } from './UIFrameBase';

const { ccclass, property } = _decorator;

@ccclass('UICloseOnOverlay')
export class UICloseOnOverlay extends Component {

    @property(UIFrameBase)
    popup: UIFrameBase = null;

    @property(Node)
    content: Node = null;


    onEnable() {
        this.node.on(
            Node.EventType.TOUCH_END,
            this.onOverlayTouch,
            this
        );
    }


    onDisable() {
        this.node.off(
            Node.EventType.TOUCH_END,
            this.onOverlayTouch,
            this
        );
    }


    private onOverlayTouch(event: EventTouch) {
        if(!this.popup) {
            console.warn(
                `[UICloseOnOverlay] Popup is not assigned for ${this.node.name}`
            );

            return;
        }

        if(this.content) {
            const transform =
                this.content.getComponent(UITransform);

            if(transform) {
                const touchPos =
                    event.getUILocation();

                const bounds =
                    transform.getBoundingBoxToWorld();

                const isInsideContent =
                    bounds.contains(
                        new Vec2(
                            touchPos.x,
                            touchPos.y
                        )
                    );

                if(isInsideContent) {
                    return;
                }
            }
        }

        event.propagationStopped = true;

        this.popup.hide();
    }
}
