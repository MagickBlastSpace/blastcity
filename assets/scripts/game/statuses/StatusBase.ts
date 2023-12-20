import { _decorator, Component, Node, tween, Vec3 } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('StatusBase')
export class StatusBase extends Component {
    
    private statusType: string;
    private row: number;
    private col: number;

    private isBlockMovement: boolean;
    private isBlockInteraction: boolean;
    private isBlockDestroyTile: boolean;

    private isMatchHit: boolean;

    private isDamaged: boolean;

    private currentTween: any = null;
    
    
    init(row: number, col: number, statusType: string) {
        this.row = row;
        this.col = col;
        this.statusType = statusType;
    }


    getStatusType(): string {
        return this.statusType;
    }


    getRow(): number {
        return this.row;
    }

    getCol(): number {
        return this.col;
    }


    isBlockingMovement(): boolean {
        return this.isBlockMovement;
    }

    isBlockingInteraction(): boolean {
        return this.isBlockInteraction;
    }

    isBlockingDestroyTile(): boolean {
        return this.isBlockDestroyTile;
    }

    isMatchHitResponsive(): boolean {
        return this.isMatchHit;
    }


    destroyStatus() {
        this.startDestroyConsequences();

        if (!this.currentTween) {
            this.currentTween = tween(this.node)
                .to(0.15, { scale: new Vec3(2.5, 2.5, 2.5) }, { easing: 'linear' })
                .call(() => this.node.destroy())
                .start();
        }
    }

    destroyClear() {
        this.node.destroy();
    }


    startDestroyConsequences() {}


    getDamage() {}

    setAsDamaged() {
        this.isDamaged = true;
    }


    isReadyToDestroy(): boolean {
        return false;
    }
}


