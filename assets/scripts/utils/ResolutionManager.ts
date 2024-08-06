import { _decorator, Component, view, ResolutionPolicy, Canvas, find, Node, Vec3 } from 'cc';
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
            // Landscape mode
            //cc.view.setDesignResolutionSize(this.width_landscape, this.height_landscape, cc.ResolutionPolicy.FIXED_HEIGHT);

            //if (canvas) {
            //    canvas.fitHeight = true;
            //   canvas.fitWidth = false;
            //}

            this.enableLandscapeNodes(true);
            this.enablePortraitNodes(false);

        } else {
            console.log("Portrait mode");
            // Portrait mode
            //cc.view.setDesignResolutionSize(this.width_portrait, this.height_portrait, cc.ResolutionPolicy.FIXED_WIDTH);
            //cc.view.setDesignResolutionSize(this.width_landscape, this.height_landscape, cc.ResolutionPolicy.FIXED_HEIGHT);

            //if (canvas) {
            //   canvas.fitHeight = false;
             //   canvas.fitWidth = true;
            //}
            
            this.enableLandscapeNodes(false);
            this.enablePortraitNodes(true);
        }

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
}


