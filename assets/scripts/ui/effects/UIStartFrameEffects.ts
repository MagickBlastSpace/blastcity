import { _decorator, Component, Node, Prefab, instantiate, Vec2, Vec3, UITransform } from 'cc';
import { UIEventButton } from '../start/UIEventButton';
import { EventProgressData } from '../../data/EventData';
import { UIChest } from '../chest/UIChest';
const { ccclass, property } = _decorator;

@ccclass('UIStartFrameEffects')
export class UIStartFrameEffects extends Component {

    @property(Prefab)
    eventProgressItem: Prefab = null;

    @property(Node)
    effectsLayer: Node = null;

    @property(Node)
    playBtn: Node = null;

    @property(Node)
    chest: Node = null;
    @property(UIChest)
    chestComp: UIChest;

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
            let eventPos = event === "chest" ? this.findChestPosition() : this.findEventPosition(event);
            let startPos = this.findStartPosition();

            this.scheduleOnce(() => {
                this.createProgressEffect(event, eventPos, startPos, data[i].progress);
            }, totalTime);

            totalTime += timeBetweenEffects;
        }

        return totalTime;
    }


    createProgressEffect(event: string, eventPos: Vec2, startPos: Vec2, count: number) {
        const item = instantiate(this.eventProgressItem);
        this.effectsLayer.addChild(item);
        const itemComp = item.getComponent("UIEventProgressEffect");
        itemComp.setIcon(event);
        itemComp.setCount(count);

        item.on("event_progress_done", (eName) => this.onEventProgressDone(eName));

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
        return this.findNodePosition(this.playBtn);
    }

    findChestPosition(): Vec2 {
        return this.findNodePosition(this.chest);
    }


    findNodePosition(nodeToObserve: Node): Vec2 {
        let worldPosition = new Vec3(0, 0, 0);
    
        const uiTransform = nodeToObserve.getComponent(UITransform);
        if (uiTransform) {
            worldPosition = uiTransform.convertToWorldSpaceAR(new Vec3(0, 0, 0));
        } else {
            console.error("UITransform component is missing on the nodeToObserve node");
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


    onEventProgressDone(eName: string) {
        this.node.emit("event_progress_done", eName);
    }
}


