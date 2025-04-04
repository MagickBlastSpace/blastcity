import { _decorator, Component, Node } from 'cc';
import { LevelData, MovesShopStageData } from '../../data/GameData';
import { UserData } from '../../data/UserData';
import { SaveData } from '../../data/SaveData';
import { StartBonuses } from './StartBonuses';
import { Level } from '../Level';
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
            //show gold shop
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

        this.node.emit("extra_moves", this.getTotalMovesCount());

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
        const failsCount = this.level.getFailsCount();

        let curData = this.getStageData();
        const moves = curData.moves;
        const additionalMoves = failsCount >= 5 ? 5 * (failsCount - 4) : 0;

        return moves + additionalMoves;
    }
}


