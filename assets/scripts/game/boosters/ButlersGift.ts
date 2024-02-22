import { _decorator, Component, Node } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('ButlersGift')
export class ButlersGift extends Component {

    @property(Node)
    level: Node = null;

    private streak: number = 0;
    private maxStreak: number = 3;

    private isGifted: boolean = false;


    start() {
        this.level.on("complete", (isWin) => this.updateProgress(isWin));
        this.isGifted = false;
    }


    updateProgress(isWin: boolean) {
        if(isWin && this.streak < this.maxStreak) {
            this.streak++;
        }
        else if(!isWin) {
            this.streak = 0;
        }

        this.isGifted = false;

        this.node.emit("refresh", this.streak);
    }

    getBonusPool(): string[] {
        let pool = [];

        if(this.streak > 0) {
            pool.push("rocket");
        }

        if(this.streak > 1) {
            pool.push("bomb");
        }

        if(this.streak > 2) {
            pool.push("discoball");
        }

        return pool;
    }

    isGiftAvailable(): boolean {
        return this.streak > 0 && !this.isGifted;
    }


    getStreak(): number {
        return this.streak;
    }

    setStreak(streak: number) {
        this.streak = streak;
    }

    getIsGifted(): boolean {
        return this.isGifted;
    }

    setIsGifted(isGifted: boolean) {
        this.isGifted = isGifted;
    }

    getMaxStreak(): number {
        return this.maxStreak;
    }


    clear() {
        this.isGifted = true;
    }
}


