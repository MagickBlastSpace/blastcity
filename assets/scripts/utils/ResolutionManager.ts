import { _decorator, Component, view, ResolutionPolicy, Canvas, find, Node, Vec3, Widget } from 'cc';
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
    eventBtns: Node[] = [];
    @property([Node])
    popups: Node[] = [];

    @property(Widget)
    mainBtns: Widget = null;
    @property([Widget])
    eventBtnsLayouts: Widget[] = [];

    @property(Widget)
    playBtn: Widget = null;
    @property([Widget])
    resources: Widget[] = [];


    onLoad() {
        console.log("Resolution manager load");

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
        this.enableLandscapeNodes(true);
        this.enablePortraitNodes(false);

        this.mainBtns.left = 700;
        this.mainBtns.right = 700;
        this.mainBtns.bottom = 0;

        for(let i = 0; i < this.mainMenuScalableItems.length; i++) {
            this.mainMenuScalableItems[i].setScale(new Vec3(1, 1, 1));
        }
        for(let i = 0; i < this.popups.length; i++) {
            this.popups[i].setScale(new Vec3(1, 1, 1));
        }
        for(let i = 0; i < this.eventBtns.length; i++) {
            this.eventBtns[i].setScale(new Vec3(1.4, 1.4, 1.4));
        }

        for(let i = 0; i < this.eventBtnsLayouts.length; i++) {
            this.eventBtnsLayouts[i].top = 37.5;
            this.eventBtnsLayouts[i].bottom = 37.5;
        }

        this.playBtn.bottom = 350;
        this.playBtn.center = -420;

        for(let i = 0; i < this.resources.length; i++) {
            this.resources[i].top = 250;
        }

        this.mainBtns.updateAlignment();
    }

    setPortraitMode() {
        this.enableLandscapeNodes(false);
        this.enablePortraitNodes(true);

        this.mainBtns.left = 0;
        this.mainBtns.right = 0;
        this.mainBtns.bottom = 150;

        for(let i = 0; i < this.mainMenuScalableItems.length; i++) {
            this.mainMenuScalableItems[i].setScale(new Vec3(2, 2, 1));
        }
        for(let i = 0; i < this.popups.length; i++) {
            this.popups[i].setScale(new Vec3(2, 2, 1));
        }
        for(let i = 0; i < this.eventBtns.length; i++) {
            this.eventBtns[i].setScale(new Vec3(2.2, 2.2, 2.2));
        }

        for(let i = 0; i < this.eventBtnsLayouts.length; i++) {
            this.eventBtnsLayouts[i].top = 300;
            this.eventBtnsLayouts[i].bottom = 500;
        }

        this.playBtn.bottom = 800;
        this.playBtn.center = 0;

        for(let i = 0; i < this.resources.length; i++) {
            this.resources[i].top = 400;
        }

        this.mainBtns.updateAlignment();
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
            this.field.setScale(new Vec3(1.7, 1.7, 1));

            this.boostersPortrait.setScale(new Vec3(1.4, 1.4, 1));
            this.goalsPortrait.setScale(new Vec3(1, 1, 1));
        }
        else if(ratio > 0.72) {
            this.field.setScale(new Vec3(1.7, 1.7, 1));

            this.boostersPortrait.setScale(new Vec3(1.6, 1.6, 1));
            this.goalsPortrait.setScale(new Vec3(1.5, 1.5, 1));
        }
        else {
            this.field.setScale(new Vec3(1.9, 1.9, 1));

            this.boostersPortrait.setScale(new Vec3(1.8, 1.8, 1));
            this.goalsPortrait.setScale(new Vec3(1.7, 1.7, 1));
        }
    }
}


