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

    @property([UIEventButton])
    eventBtns: UIEventButton[] = [];


    setEventBtns(events: UIEventButton[]) {
        this.eventBtns = events;
    }


    initEventsProgressEffects(data: EventProgressData[]) {
        let timeBetweenEffects = 0.08;
        let totalTime = 0;

        for(let i = 0; i < data.length; i++) {

            this.scheduleOnce(() => {
                for(let j = 0; j < data[i].progress; j++) {
                    let event = data[i].eventName;
                    let eventPos = this.findEventPosition(event);
    
                    this.scheduleOnce(() => {
                        this.createProgressEffect(event, eventPos);
                    }, timeBetweenEffects * j);
                }
                
            }, totalTime);

            totalTime += timeBetweenEffects * data[i].progress;
        }
    }


    createProgressEffect(event: string, eventPos: Vec2) {
        const item = instantiate(this.eventProgressItem);
        this.effectsLayer.addChild(item);
        const itemComp = item.getComponent("UIEventProgressEffect");
        itemComp.setIcon(event);

        itemComp.init(new Vec2(0, 0), eventPos);
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
}


