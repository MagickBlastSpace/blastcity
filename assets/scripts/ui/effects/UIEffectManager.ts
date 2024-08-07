import { _decorator, Component, Node, Prefab, Vec2, instantiate } from 'cc';
import { ResolutionManager } from '../../utils/ResolutionManager';
const { ccclass, property } = _decorator;

@ccclass('UIEffectManager')
export class UIEffectManager extends Component {

    @property(Prefab)
    coinReward: Prefab = null;
    @property(Prefab)
    extraHit: Prefab = null;

    @property(Node)
    effectsLayer: Node = null;

    @property(Node)
    field: Node = null;

    @property(Vec2)
    goalsPosition: Vec2 = null;
    @property(Vec2)
    goalsPosition_Portrait: Vec2 = null;

    @property(ResolutionManager)
    resolutionManager: ResolutionManager = null;

    @property
    tileSpacing: number = 0;
    @property
    xOffset: number = -660;
    @property
    yOffset: number = -660;
    @property
    tileSize: number = 165;


    start() {
        this.field.on("coin_reward", (row, col) => this.createEffectCoinReward(row, col));
        this.field.on("extra_hit", (row, col) => this.createEffectExtraHit(row, col));
    }

    createEffectCoinReward(row: number, col: number) {
        const coin = instantiate(this.coinReward);
        this.effectsLayer.addChild(coin);
        const coinComp = coin.getComponent("UIRewardEffect");

        let posX = col * (this.tileSize + this.tileSpacing) + this.xOffset;
        let posY = row * (this.tileSize + this.tileSpacing) + this.yOffset;

        let targetPosition = this.resolutionManager.isPortraitOrientation() ? this.goalsPosition_Portrait : this.goalsPosition;

        coinComp.init(new Vec2(posX, posY), targetPosition);
    }

    createEffectExtraHit(row: number, col: number) {
        /*const effect = instantiate(this.extraHit);
        this.effectsLayer.addChild(effect);
        const effectComp = effect.getComponent("UIExtraHitEffect");

        let posX = col * (this.tileSize + this.tileSpacing) + this.xOffset;
        let posY = row * (this.tileSize + this.tileSpacing) + this.yOffset;

        effectComp.init(new Vec2(posX, posY));*/
    }
}


