import { _decorator, Component, Node } from 'cc';
import { MovesShopStageData } from '../../data/GameData';
import { UserData } from '../../data/UserData';
const { ccclass, property } = _decorator;

@ccclass('MovesShop')
export class MovesShop extends Component {

    @property(Node)
    field: Node = null;

    @property([MovesShopStageData])
    stages: MovesShopStageData[] = [];

    private currentStage: number = 0;


    start() {
        this.field.on("level_init", (level) => this.init());
    }

    init() {
        this.currentStage = 0;
    }

    addStageProgress() {
        if(!this.isMovesShopAvailable()) {
            return;
        }

        this.currentStage++;
    }

    isMovesShopAvailable(): boolean {
        return this.currentStage < this.stages.length;
    }


    getStageData(): MovesShopStageData {
        if(!this.isMovesShopAvailable()) {
            return null;
        }

        return this.stages[this.currentStage];
    }


    buyStage(): boolean {
        let curData = this.getStageData();

        UserData.instance.subResource("gold", curData.price);

        for(let i = 0; i < curData.rockets; i++) {
            this.node.emit("activate", "rocket");
        }
        for(let i = 0; i < curData.bombs; i++) {
            this.node.emit("activate", "bomb");
        }
        for(let i = 0; i < curData.discoballs; i++) {
            this.node.emit("activate", "discoball");
        }

        this.node.emit("extra_moves", curData.moves);

        this.addStageProgress();

        return true;
    }
}


