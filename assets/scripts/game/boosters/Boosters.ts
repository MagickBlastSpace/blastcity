import { _decorator, Component, Node } from 'cc';
import { Booster } from './Booster';
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

    private activeBooster: string = "";

    private availableBoosters = ["hammer", "cannon", "arrow"];

    private respawnDelay: number = 0.35;
    private singleRespawnDelay: number = 0.1;


    start() {
        this.hammer.node.on("activate", () => this.setActiveBooster("hammer"));
        this.arrow.node.on("activate", () => this.setActiveBooster("arrow"));
        this.cannon.node.on("activate", () => this.setActiveBooster("cannon"));
        this.jester.node.on("activate", () => this.setShuffleEvent());
    }


    setActiveBooster(booster: string) {
        this.activeBooster = this.activeBooster !== booster ? booster : "";

        this.refresh();
    }

    getActiveBooster(): string {
        return this.activeBooster;
    }

    isBoosterActive(): boolean {
        return this.availableBoosters.includes(this.activeBooster);
    }


    setShuffleEvent() {
        this.node.emit("shuffle");
    }


    refresh() {
        this.hammer.setActiveState(this.activeBooster === "hammer");
        this.arrow.setActiveState(this.activeBooster === "arrow");
        this.cannon.setActiveState(this.activeBooster === "cannon");
    }


    useActiveBooster(field: Node[][], row: number, col: number) {
        switch(this.activeBooster) {
            case "hammer":
                this.singleExtraHit(row, col);
                break;
            case "arrow":
                this.rowExtraHit(field, row, col);
                break;
            case "cannon":
                this.colExtraHit(field, row, col);
                break;
        }

        this.activeBooster = "";
        this.refresh();
    }


    singleExtraHit(row: number, col: number) {
        this.node.emit("extra_hit", row, col, false);
        this.node.emit("respawn", this.singleRespawnDelay);
    }
    
    rowExtraHit(field: Node[][], row: number, col: number) {
        const numCols: number = field.length > 0 ? field[0].length : 0;

        const totalTime = this.respawnDelay / 2;

        for(let j = 0; j < numCols; j++) {
            this.node.emit("extra_hit", row, j, true, totalTime / numCols * j);
        }

        this.node.emit("respawn", this.respawnDelay);
    }

    colExtraHit(field: Node[][], row: number, col: number) {
        const numRows: number = field.length;

        const totalTime = this.respawnDelay / 2;

        for(let j = 0; j < numRows; j++) {
            this.node.emit("extra_hit", j, col, true, totalTime / numRows * j);
        }

        this.node.emit("respawn", this.respawnDelay);
    }
}


