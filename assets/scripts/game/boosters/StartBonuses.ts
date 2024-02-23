import { _decorator, Component, Node } from 'cc';
import { SaveData } from '../../data/SaveData';
const { ccclass, property } = _decorator;

@ccclass('StartBonuses')
export class StartBonuses extends Component {

    @property(Node)
    movesShop: Node = null;

    @property([Node])
    bonuses: Node[] = [];

    private startBonusPool: string[] = [];


    onLoad() {
        this.startBonusPool = [];
    }

    start() {
        for(let i = 0; i < this.bonuses.length; i++) {
            this.bonuses[i].on("activate", (bonusName) => this.activateBonus(bonusName));
        }

        this.movesShop.on("activate", (bonusName) => this.activateBonusFromShop(bonusName));
    }


    activateBonus(bonusName: string) {
        if(!this.startBonusPool.includes(bonusName)) {
            this.startBonusPool.push(bonusName);
        }
        else {
            this.startBonusPool = this.startBonusPool.filter(item => item !== bonusName);
        }

        this.node.emit("refresh", this.startBonusPool);

        SaveData.instance.saveStartBonusesData();
    }

    activateBonusFromShop(bonusName: string) {
        this.startBonusPool.push(bonusName);

        SaveData.instance.saveStartBonusesData();
    }


    clear() {
        this.startBonusPool = [];

        this.node.emit("refresh", this.startBonusPool);

        SaveData.instance.saveStartBonusesData();
    }


    isStartBonusesAvailable(): boolean {
        return this.startBonusPool.length > 0;
    }


    getStartBonusPool(): string[] {
        return this.startBonusPool;
    }

    setStartBonusPool(pool: string[]) {
        this.startBonusPool = pool;

        this.node.emit("refresh", this.startBonusPool);
    }
}


