import { _decorator, Component, Node, Label, ProgressBar, tween, assetManager, Prefab, instantiate, Vec2, Vec3, UITransform } from 'cc';
import { EventBase } from '../../game/events/EventBase';
import { UIEventPopupFrameBase } from '../events/UIEventPopupFrameBase';
import { AssetsLoader } from '../../utils/AssetsLoader';
import { ResolutionManager } from '../../utils/ResolutionManager';
const { ccclass, property } = _decorator;

@ccclass('UIEventButton')
export class UIEventButton extends Component {
    
    @property(EventBase)
    eventController: EventBase = null;

    @property(Label)
    timeLabel: Label = null;

    @property(Label)
    progressLabel: Label = null;

    @property(ProgressBar)
    progressBar: ProgressBar = null;

    @property
    eventName: string = "";

    @property
    isPortraitVersionAvailable: boolean = false;

    @property(Node)
    popupLayout: Node = null;

    @property(Node)
    rewardIndicator: Node = null;

    private instantiatedNode: Node | null = null;
    private eventPopup: any = null;

    private isInited: boolean = false;


    onLoad() {
        this.node.on(Node.EventType.TOUCH_START, this.onTouchStart, this);
    }

    onDestroy() {
        this.node.off(cc.Node.EventType.TOUCH_START, this.onTouchStart, this);
    }


    start() {
        //this.loadAssets();

        this.eventController.node.on("refresh", () => this.refresh());
    }

    update(deltaTime: number) {
        this.timeLabel.string = this.eventController.getRemainingTimeString();

        let isAvailable = this.eventController.isEventAvailable();

        this.node.active = isAvailable;

        if(!isAvailable) {
            return;
        }

        if(this.progressBar) {
            this.progressBar.progress = this.eventController.getTimeProgress();
        }

        if(this.progressLabel) {
            this.progressLabel.string = this.eventController.getCollectable() + "/" + this.eventController.getCurrentStageStep();
        }
    }

    refresh() {
        if(this.rewardIndicator) {
            this.rewardIndicator.active = this.eventController.isRewardAvailable();
        }
    }

    setProgress() {
        if(!this.eventController.isEventAvailable()) {
            if(this.progressBar) {
                tween(this.progressBar)
                    .to(0.8, { progress: 0 })
                    .call(() => this.setProgress())
                    .start();
            }
            
            return;
        }

        let eventProgress = this.eventController.getTimeProgress();

        if(this.progressBar) {
            tween(this.progressBar)
                .to(0.8, { progress: eventProgress })
                .call(() => this.setProgress())
                .start();
        }
    }


    showEventPrefab() {
        if(this.eventPopup) {
            this.eventPopup.show();

            return;
        }
    }


    hideClean() {
        if(this.eventPopup) {
            this.eventPopup.hideClean();
        }
    }


    onTouchStart(event: cc.Event.EventTouch) {
        this.node.emit("click", this.node);
    }


    getEventName(): string {
        return this.eventName;
    }

    getEventId(): string {
        return this.eventController.getEventId();
    }

    getPosition(): Vec2 {
        let worldPosition = new Vec3(0, 0, 0);
        
        const parent = this.node.parent;
        const uiTransform = this.node.getComponent(UITransform);
        
        if (parent && uiTransform) {
            const parentUITransform = parent.getComponent(UITransform);
            if (parentUITransform) {
                worldPosition = parentUITransform.convertToWorldSpaceAR(new Vec3(this.node.position.x, this.node.position.y, 0));
            } else {
                console.error("UITransform component is missing on parent node");
            }
        } else {
            console.error("UITransform component is missing on this node or node has no parent");
        }
    
        return new Vec2(worldPosition.x, worldPosition.y);
    }


    loadAssets(bundle: any) {
        if(this.isInited) {
            return;
        }

        this.isInited = true;

        let bundleToLoad = ResolutionManager.instance.isPortraitOrientation() && this.isPortraitVersionAvailable ? this.eventName + "_portrait" : this.eventName;

        bundle.load(bundleToLoad, Prefab, (err, prefab) => {
            if (err) {
                console.error(`Failed to load prefab: ${this.eventName}`, err);
                return;
            }

            console.log(`Successfully loaded prefab: ${this.eventName}`);

            this.instantiatedNode = instantiate(prefab);

            this.instantiatedNode.on("play", () => {
                this.node.emit("play");
            });

            this.popupLayout.addChild(this.instantiatedNode);

            this.eventPopup = this.instantiatedNode.getComponent("UIEvent" + this.eventName);
            this.eventPopup.init(this.eventController);

            ResolutionManager.instance.addPopup(this.instantiatedNode);

            this.instantiatedNode.active = false;
        });
    }
}


