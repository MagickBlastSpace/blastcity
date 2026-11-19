import { _decorator, Component, Node } from 'cc';
import { LevelData, MovesShopStageData } from '../../data/GameData';
import { UserData } from '../../data/UserData';
import { Level } from '../Level';
import { StartBonuses } from './StartBonuses';
const { ccclass, property } = _decorator;

@ccclass('MovesShop')
export class MovesShop extends Component {

    @property(Node)
    field: Node = null;

    @property(Level)
    level: Level = null;

    @property([MovesShopStageData])
    stages: MovesShopStageData[] = [];

    @property(StartBonuses)
    startBonuses: StartBonuses = null;

    private currentStage: number = 0;

    private premiumExtraMovesCount: number = 5;


    start() {
        this.field.on("level_init", (level) => this.init(level));
    }

    init(level: LevelData) {
        this.currentStage = level.movesShopStage;
    }

    addStageProgress() {
        if(this.currentStage >= this.stages.length - 1) {
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

        this.startBonuses.clear();

        let isEnoughGold = UserData.instance.subResource("gold", curData.price);
        if(!isEnoughGold) {
            return false;
        }

        for(let i = 0; i < curData.rockets; i++) {
            this.startBonuses.activateBonusFromShop("rocket");
        }
        for(let i = 0; i < curData.bombs; i++) {
            this.startBonuses.activateBonusFromShop("bomb");
        }
        for(let i = 0; i < curData.discoballs; i++) {
            this.startBonuses.activateBonusFromShop("discoball");
        }

        const purchasedMoves = this.getTotalMovesCount();

        this.node.emit("extra_moves", purchasedMoves);

        UserData.instance.resetLevelFails();

        this.addStageProgress();

        return true;
    }


    getCurrentStage(): number {
        return this.currentStage;
    }

    setCurrentStage(stage: number) {
        this.currentStage = stage;
    }


    getTotalMovesCount(): number {
        const curData = this.getStageData();
        if (!curData) return 0;

        const failsCount = UserData.instance.getLevelFails();
        const additionalMoves = Math.max(0, failsCount) * 5;

        return Math.min(curData.moves + additionalMoves, 35);
    }

    bpActivateExtraMoves() {
        this.node.emit("extra_moves", this.premiumExtraMovesCount);
    }
}


