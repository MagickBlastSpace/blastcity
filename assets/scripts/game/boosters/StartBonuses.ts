import { _decorator, Component, Node } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('StartBonuses')
export class StartBonuses extends Component {

    @property(Node)
    movesShop: Node = null;

    @property([Node])
    bonuses: Node[] = [];

    private startBonusPool: string[] = [];


    start() {
        for(let i = 0; i < this.bonuses.length; i++) {
            this.bonuses[i].on("activate", (bonusName) => this.activateBonus(bonusName));
        }

        this.movesShop.on("activate", (bonusName) => this.activateBonusFromShop(bonusName));

        this.clear();
    }


    activateBonus(bonusName: string) {
        if(!this.startBonusPool.includes(bonusName)) {
            this.startBonusPool.push(bonusName);
        }
        else {
            this.startBonusPool = this.startBonusPool.filter(item => item !== bonusName);
        }

        this.node.emit("refresh", this.startBonusPool);
    }

    activateBonusFromShop(bonusName: string) {
        this.startBonusPool.push(bonusName);
    }


    clear() {
        this.startBonusPool = [];

        this.node.emit("refresh", this.startBonusPool);
    }


    isStartBonusesAvailable(): boolean {
        return this.startBonusPool.length > 0;
    }

    getStartBonusPool(): string[] {
        return this.startBonusPool;
    }
}


