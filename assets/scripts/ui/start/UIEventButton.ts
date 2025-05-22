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

    @property
    is_v2: boolean = false;

    private eventPopup: any = null;
    private eventPopup_portrait: any = null;

    private isInited: boolean = false;
    private isLoaded: boolean = false;
    private isOpenScheduled: boolean = false;


    onLoad() {
        this.node.on(Node.EventType.TOUCH_START, this.onTouchStart, this);
    }

    onDestroy() {
        this.node.off(cc.Node.EventType.TOUCH_START, this.onTouchStart, this);
    }


    start() {
        //this.loadAssets();

        this.eventController.node.on("refresh", () => this.refresh());

        this.refresh();
    }

    update(deltaTime: number) {
        let timeStr = this.eventController.getRemainingTimeString();
        if(timeStr === "00:00:00" || timeStr === "00 d 00 h") {
            this.node.active = false;

            return;
        }

        this.timeLabel.string = timeStr;

        let isAvailable = this.eventController.isInteractable();

        this.node.active = isAvailable;

        if(!isAvailable) {
            return;
        }

        if(this.progressBar) {
            this.progressBar.progress = this.eventController.getTimeProgress();
        }

        if(this.progressLabel) {
            if(this.eventController.getIsComplete()) {
                this.progressLabel.string = "Complete";
            }
            else {
                this.progressLabel.string = this.eventController.getCollectable() + "/" + this.eventController.getCurrentStageStep();
            }
        }
    }

    refresh() {
        if(this.rewardIndicator) {
            this.rewardIndicator.active = this.eventController.isRewardAvailable();
        }

        let timeStr = this.eventController.getRemainingTimeString();
        if(timeStr === "00:00:00" || timeStr === "00 d 00 h") {
            this.node.active = false;

            return;
        }

        let isAvailable = this.eventController.isInteractable();

        this.node.active = isAvailable;

        if(this.eventController.getIsPositionUpdated()) {
            this.showEventPrefab();

            this.eventController.resetPositionUpdated();
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
        let isPortrait = ResolutionManager.instance.isPortraitOrientation() && this.isPortraitVersionAvailable;

        if(isPortrait && this.eventPopup_portrait) {
            if(this.eventPopup) {
                this.eventPopup.hideClean();
            }
            
            if(!this.eventPopup_portrait.node.active) {
                this.eventPopup_portrait.show();
            }
        }
        else if(this.eventPopup) {
            if(this.eventPopup_portrait) {
                this.eventPopup_portrait.hideClean();
            }
            
            if(!this.eventPopup.node.active) {
                this.eventPopup.show();
            }
        }
    }

    scheduleOpen() {
        if(this.isLoaded) {
            this.showEventPrefab();
        }
        else {
            this.isOpenScheduled = true;
        }
    }

    updateAdaptivity() {
        if(this.eventPopup) {
            if(this.eventPopup.node.active) {
                this.showEventPrefab();

                return;
            }
        }

        if(this.eventPopup_portrait) {
            if(this.eventPopup_portrait.node.active) {
                this.showEventPrefab();

                return;
            }
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
        if (this.isInited) {
            return;
        }
        
        this.isInited = true;
        
        const bundlesToLoad = [this.eventName];
        if (this.isPortraitVersionAvailable) {
            bundlesToLoad.push(`${this.eventName}_portrait`);
        }
        
        bundlesToLoad.forEach(bundleName => {
            bundle.load(bundleName, Prefab, (err, prefab) => {
                if (err) {
                    console.error(`Failed to load prefab: ${bundleName}`, err);
                    return;
                }
    
                console.log(`Successfully loaded prefab: ${bundleName}`);
                
                const instantiatedNode = instantiate(prefab);
                instantiatedNode.on("play", () => this.node.emit("event_play"));
                instantiatedNode.on("event_play", () => this.node.emit("event_play"));
                this.popupLayout.addChild(instantiatedNode);

                if(this.is_v2) {
                    ResolutionManager.instance.addPopup_v2(instantiatedNode);
                }
                else {
                    ResolutionManager.instance.addPopup(instantiatedNode);
                }

                ResolutionManager.instance.addAdaptiveFrame(instantiatedNode);
                
                instantiatedNode.active = false;
                
                if (bundleName === this.eventName) {
                    this.eventPopup = instantiatedNode.getComponent("UIEvent" + this.eventName);
                    this.eventPopup.init(this.eventController);
                } else {
                    this.eventPopup_portrait = instantiatedNode.getComponent("UIEvent" + this.eventName);
                    this.eventPopup_portrait.init(this.eventController);
                }

                this.isLoaded = true;

                if(this.isOpenScheduled) {
                    this.showEventPrefab();
                }
            });
        });
    }
}


