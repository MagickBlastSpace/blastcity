import { _decorator, Component, Node } from 'cc';
import { Booster } from './Booster';
import { UserData } from '../../data/UserData';
import { UIBoosterActivationFrame } from '../../ui/game/UIBoosterActivationFrame';
const { ccclass, property } = _decorator;

@ccclass('Boosters')
export class Boosters extends Component {
    @property(Booster)
    hammer: Booster = null;
    @property(Booster)
    arrow: Booster = null;
    @property(Booster)
    cannon: Booster = null;
    @property(Booster)
    jester: Booster = null;

    @property(UIBoosterActivationFrame)
    activationFrame: UIBoosterActivationFrame = null;

    private activeBooster: string = "";

    private availableBoosters = ["hammer", "cannon", "arrow"];

    private respawnDelay: number = 0.35;

    private timeArrow: number = 0;
    private timeHammer: number = 0.34;
    private timeCannon: number = 0.2;


    start() {
        this.hammer.node.on("activate", () => this.setActiveBooster("hammer"));
        this.arrow.node.on("activate", () => this.setActiveBooster("arrow"));
        this.cannon.node.on("activate", () => this.setActiveBooster("cannon"));
        this.jester.node.on("activate", () => this.setActiveBooster("jester"));

        this.deactivateAll();

        this.activationFrame.node.on("shuffle", this.setShuffleEvent());
        this.activationFrame.node.on("deactivate", this.deactivateAll());
    }


    setActiveBooster(booster: string) {
        this.activeBooster = this.activeBooster !== booster ? booster : "";

        this.activationFrame.refresh(this.activeBooster);
    }

    getActiveBooster(): string {
        return this.activeBooster;
    }

    isBoosterActive(): boolean {
        return this.availableBoosters.includes(this.activeBooster);
    }


    setShuffleEvent() {
        this.node.emit("booster_activation", "jesterhat", 4, 4);

        this.node.emit("shuffle");

        UserData.instance.subResource("jester", 1);

        this.deactivateAll();
    }


    deactivateAll() {
        this.activeBooster = "";

        this.activationFrame.refresh(this.activeBooster);
    }


    useActiveBooster(field: Node[][], row: number, col: number) {
        switch(this.activeBooster) {
            case "hammer":
                this.node.emit("booster_activation", this.activeBooster, row, col);

                this.scheduleOnce(() => {
                    this.singleExtraHit(row, col);
                }, this.timeHammer);

                UserData.instance.subResource("hammer", 1);

                break;
            case "arrow":
                this.node.emit("booster_activation", this.activeBooster, row, 4);

                this.scheduleOnce(() => {
                    this.rowExtraHit(field, row, col);
                }, this.timeArrow);

                UserData.instance.subResource("bow", 1);

                break;
            case "cannon":
                this.node.emit("booster_activation", this.activeBooster, 4, col);

                this.scheduleOnce(() => {
                    this.colExtraHit(field, row, col);
                }, this.timeCannon);

                UserData.instance.subResource("cannon", 1);

                break;
        }

        this.deactivateAll();
    }


    singleExtraHit(row: number, col: number) {
        this.node.emit("extra_hit", row, col, false);
        this.node.emit("respawn", 0);
    }
    
    rowExtraHit(field: Node[][], row: number, col: number) {
        const numCols: number = field.length > 0 ? field[0].length : 0;

        const totalTime = this.respawnDelay / 2;

        for(let j = 0; j < numCols; j++) {
            this.node.emit("extra_hit", row, j, true, totalTime / numCols * j);
        }

        this.node.emit("respawn", 0);
    }

    colExtraHit(field: Node[][], row: number, col: number) {
        const numRows: number = field.length;

        const totalTime = this.respawnDelay / 2;

        for(let j = 0; j < numRows; j++) {
            this.node.emit("extra_hit", j, col, true, totalTime / numRows * j);
        }

        this.node.emit("respawn", 0);
    }
}


