import { _decorator, Component, view, ResolutionPolicy, Canvas, find, Node, Vec3, Widget, Layout } from 'cc';
import { UIFrameBase } from '../ui/UIFrameBase';
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

    @property(Node)
    mainMenuBtns: Node = null;

    @property([Node])
    mainMenuScalableItems: Node[] = [];
    @property([Node])
    leaderboardScalableItems: Node[] = [];
    @property([Node])
    clansScalableItems: Node[] = [];

    @property([Node])
    eventBtns: Node[] = [];
    @property([Node])
    eventProgressBtns: Node[] = [];
    @property([Node])
    popups: Node[] = [];
    @property([UIFrameBase])
    popupComponents: UIFrameBase[] = [];

    @property([Widget])
    eventBtnsWidgets: Widget[] = [];
    @property([Layout])
    eventBtnsLs: Layout[] = [];
    @property(Widget)
    mainMenuBtnsWidget: Widget = null;

    @property(Widget)
    playBtn: Widget = null;
    @property(Widget)
    rewardBtn: Widget = null;
    @property(Widget)
    kingLeagueBtn: Widget = null;
    @property([Widget])
    resources: Widget[] = [];
    @property(Widget)
    tutorialPopup: Widget = null;

    public static instance: ResolutionManager = null;

    private orientation: string = "";


    onLoad() {
        ResolutionManager.instance = this;

        window.addEventListener('resize', this.onWindowResize.bind(this));

        this.adjustResolution();
    }

    onDestroy() {
        window.removeEventListener('resize', this.onWindowResize.bind(this));
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

        this.scaleItemsByScreenRatio(ratio);
    }


    setLandscapeMode() {
        this.orientation = "landscape";

        this.enableLandscapeNodes(true);
        this.enablePortraitNodes(false);

        this.mainMenuBtns.setScale(new Vec3(1, 1, 1));
        for(let i = 0; i < this.mainMenuScalableItems.length; i++) {
            this.mainMenuScalableItems[i].setScale(new Vec3(1, 1, 1));
        }
        for(let i = 0; i < this.leaderboardScalableItems.length; i++) {
            this.leaderboardScalableItems[i].setScale(new Vec3(1, 1, 1));
        }
        for(let i = 0; i < this.clansScalableItems.length; i++) {
            this.clansScalableItems[i].setScale(new Vec3(1, 1, 1));
        }
        for(let i = 0; i < this.popups.length; i++) {
            this.popups[i].setScale(new Vec3(1, 1, 1));
        }
        for(let i = 0; i < this.popupComponents.length; i++) {
            this.popupComponents[i].updateWidgetAlignment(this.isPortraitOrientation());
        }
        for(let i = 0; i < this.eventBtns.length; i++) {
            this.eventBtns[i].setScale(new Vec3(1.4, 1.4, 1.4));
        }
        for(let i = 0; i < this.eventProgressBtns.length; i++) {
            this.eventProgressBtns[i].setScale(new Vec3(1.4, 1.4, 1.4));
        }

        for(let i = 0; i < this.eventBtnsWidgets.length; i++) {
            this.eventBtnsWidgets[i].top = 37.5;
            this.eventBtnsWidgets[i].bottom = 37.5;
        }

        for(let i = 0; i < this.eventBtnsLs.length; i++) {
            this.eventBtnsLs[i].spacingY = 25;

            this.eventBtnsLs[i].updateLayout();
        }

        this.playBtn.bottom = 400;
        this.playBtn.center = 0;

        this.rewardBtn.bottom = 400;
        this.rewardBtn.center = 0;

        this.kingLeagueBtn.bottom = 970;
        this.kingLeagueBtn.center = 0;

        for(let i = 0; i < this.resources.length; i++) {
            this.resources[i].top = 250;
        }

        this.mainMenuBtnsWidget.bottom = 0;

        this.tutorialPopup.top = 120;
    }

    setPortraitMode() {
        this.orientation = "portrait";

        this.enableLandscapeNodes(false);
        this.enablePortraitNodes(true);

        this.mainMenuBtns.setScale(new Vec3(1.66, 1.66, 1));
        for(let i = 0; i < this.mainMenuScalableItems.length; i++) {
            this.mainMenuScalableItems[i].setScale(new Vec3(2, 2, 1));
        }
        for(let i = 0; i < this.leaderboardScalableItems.length; i++) {
            this.leaderboardScalableItems[i].setScale(new Vec3(1.5, 1.5, 1));
        }
        for(let i = 0; i < this.clansScalableItems.length; i++) {
            this.clansScalableItems[i].setScale(new Vec3(1.5, 1.5, 1));
        }
        for(let i = 0; i < this.popups.length; i++) {
            this.popups[i].setScale(new Vec3(2, 2, 1));
        }
        for(let i = 0; i < this.popupComponents.length; i++) {
            this.popupComponents[i].updateWidgetAlignment(this.isPortraitOrientation());
        }
        for(let i = 0; i < this.eventBtns.length; i++) {
            this.eventBtns[i].setScale(new Vec3(2.2, 2.2, 2.2));
        }
        for(let i = 0; i < this.eventProgressBtns.length; i++) {
            this.eventProgressBtns[i].setScale(new Vec3(3, 3, 3));
        }

        for(let i = 0; i < this.eventBtnsWidgets.length; i++) {
            this.eventBtnsWidgets[i].top = 1000;
            this.eventBtnsWidgets[i].bottom = 500;
        }

        for(let i = 0; i < this.eventBtnsLs.length; i++) {
            this.eventBtnsLs[i].spacingY = 125;

            this.eventBtnsLs[i].updateLayout();
        }

        this.playBtn.bottom = 800;
        this.playBtn.center = 0;

        this.rewardBtn.bottom = 800;
        this.rewardBtn.center = 0;

        this.kingLeagueBtn.bottom = 2400;
        this.kingLeagueBtn.center = 0;

        for(let i = 0; i < this.resources.length; i++) {
            this.resources[i].top = 400;
        }

        this.mainMenuBtnsWidget.bottom = 0;

        this.tutorialPopup.top = 1000;

        //this.mainBtns.updateAlignment();
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
            this.field.setScale(new Vec3(1, 1, 1));
        }
        else if(ratio > 1) {
            this.field.setScale(new Vec3(1.2, 1.2, 1));
        }
        else if(ratio > 0.8) {
            this.field.setScale(new Vec3(1.5, 1.5, 1));

            this.boostersPortrait.setScale(new Vec3(1.4, 1.4, 1));
            this.goalsPortrait.setScale(new Vec3(1.7, 1.7, 1));
        }
        else if(ratio > 0.72) {
            this.field.setScale(new Vec3(1.8, 1.8, 1));

            this.boostersPortrait.setScale(new Vec3(1.6, 1.6, 1));
            this.goalsPortrait.setScale(new Vec3(2, 2, 1));
        }
        else if(ratio > 0.6) {
            this.field.setScale(new Vec3(1.8, 1.8, 1));

            this.boostersPortrait.setScale(new Vec3(1.8, 1.8, 1));
            this.goalsPortrait.setScale(new Vec3(2, 2, 1));
        }
        else if(ratio > 0.5) {
            this.field.setScale(new Vec3(2, 2, 1));

            this.boostersPortrait.setScale(new Vec3(2, 2, 1));
            this.goalsPortrait.setScale(new Vec3(2, 2, 1));
        }
        else {
            this.field.setScale(new Vec3(2.2, 2.2, 1));

            this.boostersPortrait.setScale(new Vec3(1.8, 1.8, 1));
            this.goalsPortrait.setScale(new Vec3(2.2, 2.2, 1));
        }

        let fieldComp = this.field.getComponent("Field");
        fieldComp.centrate();
    }


    isPortraitOrientation(): boolean {
        return this.orientation === "portrait";
    }


    addPopup(popup: Node) {
        this.popups.push(popup);

        let popupComponent = popup.getComponent("UIFrameBase");

        if(popupComponent) {
            this.popupComponents.push(popupComponent);
        }
    }
}


