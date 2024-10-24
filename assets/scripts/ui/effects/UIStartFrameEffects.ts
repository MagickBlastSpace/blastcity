import { _decorator, Component, Node, Prefab, instantiate, Vec2, Vec3, UITransform } from 'cc';
import { UIEventButton } from '../start/UIEventButton';
import { EventProgressData } from '../../data/EventData';
const { ccclass, property } = _decorator;

@ccclass('UIStartFrameEffects')
export class UIStartFrameEffects extends Component {

    @property(Prefab)
    eventProgressItem: Prefab = null;

    @property(Node)
    effectsLayer: Node = null;

    @property(Node)
    playBtn: Node = null;

    @property([UIEventButton])
    eventBtns: UIEventButton[] = [];


    setEventBtns(events: UIEventButton[]) {
        this.eventBtns = events;
    }


    initEventsProgressEffects(data: EventProgressData[]) {
        let timeBetweenEffects = 0.8;
        let totalTime = 0;

        for(let i = 0; i < data.length; i++) {

            let event = data[i].eventName;
            let eventPos = this.findEventPosition(event);
            let startPos = this.findStartPosition();

            this.scheduleOnce(() => {
                this.createProgressEffect(event, eventPos, startPos, data[i].progress);
            }, totalTime);

            totalTime += timeBetweenEffects;
        }
    }


    createProgressEffect(event: string, eventPos: Vec2, startPos: Vec2, count: number) {
        const item = instantiate(this.eventProgressItem);
        this.effectsLayer.addChild(item);
        const itemComp = item.getComponent("UIEventProgressEffect");
        itemComp.setIcon(event);
        itemComp.setCount(count);

        itemComp.init(startPos, eventPos);
    }


    findEventPosition(event: string): Vec2 {
        if (this.eventBtns.length === 0) {
            return new Vec2(0, 0);
        }
        
        let worldPos = this.eventBtns[0].getPosition();
        
        for (let i = 0; i < this.eventBtns.length; i++) {
            if (event === this.eventBtns[i].getEventId()) {
                worldPos = this.eventBtns[i].getPosition();
                
                const uiTransform = this.node.getComponent(UITransform);
                if (uiTransform) {
                    const localPos = uiTransform.convertToNodeSpaceAR(new Vec3(worldPos.x, worldPos.y, 0));
                    return new Vec2(localPos.x, localPos.y);
                } else {
                    console.error("UITransform component missing on this node");
                    return new Vec2();
                }
            }
        }
        
        const uiTransform = this.node.getComponent(UITransform);
        if (uiTransform) {
            const localPos = uiTransform.convertToNodeSpaceAR(new Vec3(worldPos.x, worldPos.y, 0));
            return new Vec2(localPos.x, localPos.y);
        } else {
            console.error("UITransform component missing on this node");
            return new Vec2();
        }
    }

    findStartPosition(): Vec2 {
        let worldPosition = new Vec3(0, 0, 0);
    
        const uiTransform = this.playBtn.getComponent(UITransform);
        if (uiTransform) {
            worldPosition = uiTransform.convertToWorldSpaceAR(new Vec3(0, 0, 0));
        } else {
            console.error("UITransform component is missing on the playBtn node");
        }

        const localUiTransform = this.node.getComponent(UITransform);
        if (localUiTransform) {
            const localPos = localUiTransform.convertToNodeSpaceAR(new Vec3(worldPosition.x, worldPosition.y, 0));
            return new Vec2(localPos.x, localPos.y);
        } else {
            console.error("UITransform component missing on this node");
        }
    
        return new Vec2(worldPosition.x, worldPosition.y);
    }
}


