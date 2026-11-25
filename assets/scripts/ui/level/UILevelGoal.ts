import { _decorator, assetManager, Component, Label, Node, Sprite, SpriteFrame, UITransform, Vec2, Vec3 } from 'cc';
import { GoalData } from '../../data/GameData';
const { ccclass, property } = _decorator;

@ccclass('UILevelGoal')
export class UILevelGoal extends Component {

    @property(Label)
    count: Label = null;

    @property(Sprite)
    icon: Sprite = null;

    @property(Node)
    isComplete: Node = null;

    private goalId: string = '';
    private loadedIconId: string = '';
    private loadingIconId: string = '';
    private iconRequestId: number = 0;

    refresh(goal: GoalData): void {
        const goalId = goal.id;
        const iconId = goalId.toLowerCase();

        if(iconId === 'common') {
            if(this.goalId !== goalId) {
                this.iconRequestId++;
                this.goalId = goalId;
                this.loadedIconId = '';
                this.loadingIconId = '';

                if(this.icon) this.icon.spriteFrame = null;
            }

            this.node.active = false;
            return;
        }

        this.isComplete.active = goal.count === 0 && iconId !== 'coin';
        this.node.active = true;
        this.count.string = String(goal.count);

        if(this.goalId !== goalId) {
            this.iconRequestId++;
            this.goalId = goalId;
            this.loadedIconId = '';
            this.loadingIconId = '';

            if(this.icon) this.icon.spriteFrame = null;
        }

        if(this.loadedIconId === iconId) return;

        if(this.loadingIconId === iconId) return;

        const requestId = ++this.iconRequestId;
        this.loadingIconId = iconId;

        assetManager.loadBundle('goals', (bundleError, bundle) => {
            if(!this.isValid || requestId !== this.iconRequestId) return;

            if(bundleError || !bundle) {
                console.error('[GOAL ICON] Failed to load goals bundle:', bundleError);
                this.loadingIconId = '';
                return;
            }

            const assetPath = `${iconId}_goal/spriteFrame`;

            bundle.load(assetPath, SpriteFrame, (error, spriteFrame) => {
                if(!this.isValid || requestId !== this.iconRequestId) return;

                this.loadingIconId = '';

                if(error || !spriteFrame) {
                    console.error('[GOAL ICON] Failed to load:', assetPath, error);
                    return;
                }

                if(!this.icon?.isValid) return;

                this.icon.spriteFrame = spriteFrame;
                this.loadedIconId = iconId;

                console.log('[GOAL ICON] Loaded:', assetPath);
            });
        });
    }

    getPosition(): Vec2 {
        let worldPosition = new Vec3(0, 0, 0);

        const parent = this.node.parent;
        const uiTransform = this.node.getComponent(UITransform);

        if(parent && uiTransform) {
            const parentUITransform = parent.getComponent(UITransform);

            if(parentUITransform) {
                worldPosition = parentUITransform.convertToWorldSpaceAR(
                    new Vec3(this.node.position.x, this.node.position.y, 0)
                );
            } else {
                console.error('UITransform component is missing on parent node');
            }
        } else {
            console.error('UITransform component is missing on this node or node has no parent');
        }

        return new Vec2(worldPosition.x, worldPosition.y);
    }

    getGoalId(): string {
        return this.goalId;
    }

    protected onDestroy(): void {
        this.iconRequestId++;
    }
}
