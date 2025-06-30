import { _decorator, Component, view, ResolutionPolicy, Canvas, find, Node, Vec3, Widget, Layout, director } from 'cc';
import { UIFrameBase } from '../ui/UIFrameBase';
import { UIChest } from '../ui/chest/UIChest';
import { UIEventButton } from '../ui/start/UIEventButton';
import { UIAdaptivityBase } from '../ui/UIAdaptivityBase';
const { ccclass, property } = _decorator;

@ccclass('ResolutionManager')
export class ResolutionManager extends Component {

    @property
    width_landscape = 3654;
    @property
    height_landscape = 2008;

    @property
    width_portrait = 2300;
    @property
    height_portrait = 5000;

    @property([Node])
    landscapeNodes: Node[] = [];
    @property([Node])
    portraitNodes: Node[] = [];

    @property(Node)
    field: Node = null;

    @property(Node)
    boostersPortrait: Node = null;
    @property(Node)
    goalsPortrait: Node = null;

    @property([Node])
    mainMenuScalableItems: Node[] = [];
    @property([Node])
    clansScalableItems: Node[] = [];

    @property([Node])
    popups: Node[] = [];
    @property([Node])
    popups_v2: Node[] = [];
    @property([UIFrameBase])
    popupComponents: UIFrameBase[] = [];

    @property([UIEventButton])
    eventBtnsComp: UIEventButton[] = [];

    @property(Widget)
    kingLeagueBtn: Widget = null;
    @property([Widget])
    resources: Widget[] = [];
    @property(Widget)
    tutorialPopup: Widget = null;
    @property(Widget)
    friendsSearch: Widget = null;

    @property([UIAdaptivityBase])
    adaptiveFrames: UIAdaptivityBase[] = [];

    public static instance: ResolutionManager = null;

    private orientation: string = "";

    private boundOnWindowResize: () => void;


    onLoad() {
        ResolutionManager.instance = this;

        this.boundOnWindowResize = this.onWindowResize.bind(this);
        window.addEventListener('resize', this.boundOnWindowResize);

        //this.adjustResolution();
        this.scheduleOnce(() => this.adjustResolution(), 0.1);
    }

    onDestroy() {
        window.removeEventListener('resize', this.boundOnWindowResize);
    }

    onWindowResize() {
        console.log("Window resize called");

        this.adjustResolution();
    }

    adjustResolution() {
        const canvas = find('Canvas').getComponent(Canvas);

        let ratio = window.innerWidth / window.innerHeight;

        console.log("Ratio: " + ratio);

        if (window.innerWidth > window.innerHeight) {
            console.log("Landscape mode");
            this.setLandscapeMode();

        } else {
            console.log("Portrait mode");
            this.setPortraitMode();
        }

        //director.once(director.EVENT_AFTER_DRAW, this.updateAdaptiveFrames, this);
        this.updateAdaptiveFrames();

        this.scaleItemsByScreenRatio(ratio);
    }


    updateAdaptiveFrames() {
        for (let i = 0; i < this.adaptiveFrames.length; i++) {
            const frame = this.adaptiveFrames[i];
            if (frame.node && frame.node.activeInHierarchy) {
                frame.refresh();
            }
        }
    }



    setLandscapeMode() {
        this.orientation = "landscape";

        this.enableLandscapeNodes(true);
        this.enablePortraitNodes(false);

        for(let i = 0; i < this.mainMenuScalableItems.length; i++) {
            this.mainMenuScalableItems[i].setScale(new Vec3(1, 1, 1));
        }
        for(let i = 0; i < this.clansScalableItems.length; i++) {
            this.clansScalableItems[i].setScale(new Vec3(1, 1, 1));
        }
        for(let i = 0; i < this.popups.length; i++) {
            this.popups[i].setScale(new Vec3(1, 1, 1));
        }
        for(let i = 0; i < this.popups_v2.length; i++) {
            this.popups_v2[i].setScale(new Vec3(0.6, 0.6, 1));
        }
        for(let i = 0; i < this.popupComponents.length; i++) {
            this.popupComponents[i].updateWidgetAlignment(this.isPortraitOrientation());
        }

        for(let i = 0; i < this.eventBtnsComp.length; i++) {
            this.eventBtnsComp[i].updateAdaptivity();
        }

        this.kingLeagueBtn.bottom = 970;
        this.kingLeagueBtn.center = 0;

        for(let i = 0; i < this.resources.length; i++) {
            this.resources[i].top = 250;
        }

        this.tutorialPopup.top = 120;
    }

    setPortraitMode() {
        this.orientation = "portrait";

        this.enableLandscapeNodes(false);
        this.enablePortraitNodes(true);

        for(let i = 0; i < this.mainMenuScalableItems.length; i++) {
            this.mainMenuScalableItems[i].setScale(new Vec3(2, 2, 1));
        }
        for(let i = 0; i < this.clansScalableItems.length; i++) {
            this.clansScalableItems[i].setScale(new Vec3(1.5, 1.5, 1));
        }
        for(let i = 0; i < this.popups.length; i++) {
            this.popups[i].setScale(new Vec3(2, 2, 1));
        }
        for(let i = 0; i < this.popups_v2.length; i++) {
            this.popups_v2[i].setScale(new Vec3(1.8, 1.8, 1));
        }
        for(let i = 0; i < this.popupComponents.length; i++) {
            this.popupComponents[i].updateWidgetAlignment(this.isPortraitOrientation());
        }

        for(let i = 0; i < this.eventBtnsComp.length; i++) {
            this.eventBtnsComp[i].updateAdaptivity();
        }

        this.kingLeagueBtn.bottom = 2400;
        this.kingLeagueBtn.center = 0;

        for(let i = 0; i < this.resources.length; i++) {
            this.resources[i].top = 400;
        }

        this.tutorialPopup.top = 1000;
    }


    enableLandscapeNodes(isActive: boolean) {
        for(let i = 0; i < this.landscapeNodes.length; i++) {
            this.landscapeNodes[i].active = isActive;
        }
    }

    enablePortraitNodes(isActive: boolean) {
        for(let i = 0; i < this.portraitNodes.length; i++) {
            this.portraitNodes[i].active = isActive;
        }
    }


    scaleItemsByScreenRatio(ratio: number) {
        if(ratio > 1.4) {
            this.friendsSearch.bottom = 850;
        }
        else if(ratio > 1) {
            this.friendsSearch.bottom = 600;
        }
        else if(ratio > 0.8) {
            this.friendsSearch.bottom = 600;
        }
        else if(ratio > 0.72) {
            this.friendsSearch.bottom = 350;
        }
        else if(ratio > 0.6) {
            this.friendsSearch.bottom = 250;
        }
        else if(ratio > 0.5) {
            this.friendsSearch.bottom = 250;
        }
        else {
            this.friendsSearch.bottom = 250;
        }

        let fieldComp = this.field.getComponent("Field");
        fieldComp.centrate();
    }


    isPortraitOrientation(): boolean {
        return this.orientation === "portrait";
    }


    addPopup(popup: Node) {
        const adaptivityComp = popup.getComponent("UIAdaptivityBase");
        if (adaptivityComp) {
            return;
        }

        this.popups.push(popup);

        let popupComponent = popup.getComponent("UIFrameBase");

        if(popupComponent) {
            this.popupComponents.push(popupComponent);
        }
    }

    addPopup_v2(popup: Node) {
        const adaptivityComp = popup.getComponent("UIAdaptivityBase");
        if (adaptivityComp) {
            return;
        }
        
        this.popups_v2.push(popup);

        let popupComponent = popup.getComponent("UIFrameBase");

        if(popupComponent) {
            this.popupComponents.push(popupComponent);
        }
    }

    addAdaptiveFrame(frame: Node) {
        const adaptivityComp = frame.getComponent("UIAdaptivityBase");
        if (adaptivityComp) {
            this.adaptiveFrames.push(adaptivityComp);
        }
    }
}


