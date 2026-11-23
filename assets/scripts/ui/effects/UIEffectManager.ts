import { _decorator, Component, instantiate, Node, Prefab, UITransform, Vec2, Vec3 } from 'cc';
import { SpecialPrefabData } from '../../data/GameData';
import { ResolutionManager } from '../../utils/ResolutionManager';
import { UILevelGoal } from '../level/UILevelGoal';
import { UIRewardEffect } from './UIRewardEffect';
import { UISpecGoalEffect } from './UISpecGoalEffect';
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

    @property([UILevelGoal])
    goalsPositions: UILevelGoal[] = [];
    @property([UILevelGoal])
    goalsPositions_Portrait: UILevelGoal[] = [];

    @property
    tileSpacing: number = 0;
    @property
    xOffset: number = -660;
    @property
    yOffset: number = -660;
    @property
    tileSize: number = 165;

    @property([SpecialPrefabData])
    specialPrefabs: SpecialPrefabData[] = [];

    start(): void {
        this.field.on('coin_reward', this.createEffectCoinReward, this);
        this.field.on('goal_effect', this.createSpecGoalEffect, this);
        this.field.on('goal_effect_positioned', this.createSpecGoalEffectPositioned, this);
    }

    protected onDestroy(): void {
        if(!this.field?.isValid) return;

        this.field.off('coin_reward', this.createEffectCoinReward, this);
        this.field.off('goal_effect', this.createSpecGoalEffect, this);
        this.field.off('goal_effect_positioned', this.createSpecGoalEffectPositioned, this);
    }

    createEffectCoinReward(row: number, col: number) {
        const coin = instantiate(this.coinReward);
        this.effectsLayer.addChild(coin);
        const coinComp = coin.getComponent(UIRewardEffect);

        let posX = col * (this.tileSize + this.tileSpacing) + this.xOffset;
        let posY = row * (this.tileSize + this.tileSpacing) + this.yOffset;

        let portraitGoalPosition = this.findGoalPosition(this.goalsPositions_Portrait, "coin");
        let landscapeGoalPosition = this.findGoalPosition(this.goalsPositions, "coin");

        let targetPosition = ResolutionManager.instance.isPortraitOrientation() ? portraitGoalPosition : landscapeGoalPosition;

        coinComp.init(
            new Vec2(posX, posY),
            targetPosition,
            () => {
                if(this.field?.isValid) {
                    this.field.emit('win_coin_arrived');
                }
            }
        );
    }

    createSpecGoalEffect(spec: string, row: number, col: number) {
        const prefab = this.specialPrefabs.find(p => p.id === 'goal_fly')?.prefab;

        if(!prefab) {
            console.warn('[GOAL EFFECT] goal_fly prefab not found');
            return;
        }

        const specNode = instantiate(prefab);
        this.effectsLayer.addChild(specNode);
        const specComp = specNode.getComponent(UISpecGoalEffect);

        let posX = col * (this.tileSize + this.tileSpacing) + this.xOffset;
        let posY = row * (this.tileSize + this.tileSpacing) + this.yOffset;

        posY = spec === "duck" || spec === "big_duck" ? posY - this.tileSize : posY;

        let portraitGoalPosition = this.findGoalPosition(this.goalsPositions_Portrait, spec);
        let landscapeGoalPosition = this.findGoalPosition(this.goalsPositions, spec);

        let targetPosition = ResolutionManager.instance.isPortraitOrientation() ? portraitGoalPosition : landscapeGoalPosition;

        specComp.init(new Vec2(posX, posY), targetPosition);
    }

    createSpecGoalEffectPositioned(spec: string, x: number, y: number) {
        const prefab = this.specialPrefabs.find(p => p.id === 'goal_fly')?.prefab;

        if(!prefab) {
            console.warn('[GOAL EFFECT] goal_fly prefab not found');
            return;
        }

        const specNode = instantiate(prefab);
        this.effectsLayer.addChild(specNode);
        const specComp = specNode.getComponent(UISpecGoalEffect);

        let posX = x;
        let posY = y;

        posY = spec === "duck" || spec === "big_duck" ? posY - this.tileSize : posY;

        let portraitGoalPosition = this.findGoalPosition(this.goalsPositions_Portrait, spec);
        let landscapeGoalPosition = this.findGoalPosition(this.goalsPositions, spec);

        let targetPosition = ResolutionManager.instance.isPortraitOrientation() ? portraitGoalPosition : landscapeGoalPosition;

        specComp.init(new Vec2(posX, posY), targetPosition);
    }


    findGoalPosition(goals: UILevelGoal[], goalId: string): Vec2 {
        if (goals.length === 0) {
            return new Vec2();
        }

        let worldPos = goals[0].getPosition();

        for (let i = 0; i < goals.length; i++) {
            if (goalId === goals[i].getGoalId()) {
                worldPos = goals[i].getPosition();

                const uiTransform = this.node.getComponent(UITransform);
                if (uiTransform) {
                    const localPos = uiTransform.convertToNodeSpaceAR(new Vec3(worldPos.x, worldPos.y, 0));
                    return new Vec2(localPos.x, localPos.y);
                } else {
                    console.error("UITransform component missing on this node");
                    return new Vec2();
                }
            }
        }

        const uiTransform = this.node.getComponent(UITransform);
        if (uiTransform) {
            const localPos = uiTransform.convertToNodeSpaceAR(new Vec3(worldPos.x, worldPos.y, 0));
            return new Vec2(localPos.x, localPos.y);
        } else {
            console.error("UITransform component missing on this node");
            return new Vec2();
        }
    }
}


