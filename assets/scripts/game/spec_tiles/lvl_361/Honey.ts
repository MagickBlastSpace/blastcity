import { _decorator, EventTouch, Node, sp, tween, Tween, Vec2, Vec3 } from 'cc';
import { UITile } from '../../../ui/UITile';
import { Box } from '../lvl_21/Box';

const { ccclass } = _decorator;

type HoneyTransition = {
    id: number;
    tile: Honey | null;
};

@ccclass('Honey')
export class Honey extends Box {

    private readonly destroyAnimationSpeed: number = 2.5;

    private static nextTransitionId: number = 0;
    private static transitions = new Map<string, HoneyTransition>();

    private isWaitingForJar: boolean = false;


    private static getTransitionKey(row: number, col: number): string {
        return `${row}:${col}`;
    }


    static beginJarTransition(row: number, col: number): number {
        const id = ++Honey.nextTransitionId;

        Honey.transitions.set(Honey.getTransitionKey(row, col), {
            id,
            tile: null
        });

        return id;
    }

    static finishJarTransition(
        row: number,
        col: number,
        id: number,
        effectWorldPosition?: Vec3
    ): void {
        const key = Honey.getTransitionKey(row, col);
        const transition = Honey.transitions.get(key);

        if(!transition || transition.id !== id) return;

        Honey.transitions.delete(key);

        const tile = transition.tile;

        if(!tile?.isValid || !tile.node?.isValid) {
            console.log('[HONEY TRANSITION SKIPPED]', {
                row,
                col,
                reason: 'Tile already destroyed'
            });
            return;
        }

        tile.showAfterJarBreak(effectWorldPosition);
    }


    private getHoneySpine(): sp.Skeleton | null {
        return this.node.getComponent(UITile)?.spine ?? null;
    }


    init(row: number, col: number, tileType: string) {
        const uiTile = this.node.getComponent(UITile);

        if(uiTile) uiTile.keepSpineVisible = true;

        super.init(row, col, tileType);

        const transition = Honey.transitions.get(
            Honey.getTransitionKey(row, col)
        );

        this.isWaitingForJar = !!transition;

        if(transition) {
            transition.tile = this;

            const skeleton = this.getHoneySpine();

            if(skeleton) {
                skeleton.clearTracks();
                skeleton.node.active = false;
            }
        } else {
            this.refresh();
        }

        this.node.off(Node.EventType.TOUCH_END, this.onHoneyTouched, this);
        this.node.on(Node.EventType.TOUCH_END, this.onHoneyTouched, this);
    }


    private showAfterJarBreak(effectWorldPosition?: Vec3): void {
        if(!this.isValid || !this.node?.isValid || this.strength <= 0) return;

        const skeleton = this.getHoneySpine();

        this.isWaitingForJar = false;

        if(!skeleton?.node?.isValid) {
            this.refresh();
            return;
        }

        const targetPosition = skeleton.node.position.clone();
        const targetWorldPosition = skeleton.node.worldPosition.clone();

        this.refresh();

        Tween.stopAllByTarget(skeleton.node);

        if(effectWorldPosition) {
            const deltaX = targetWorldPosition.x - effectWorldPosition.x;
            const deltaY = targetWorldPosition.y - effectWorldPosition.y;
            const distance = Vec3.distance(targetWorldPosition, effectWorldPosition);

            console.log('[HONEY HANDOFF]', {
                row: this.row,
                col: this.col,
                deltaX,
                deltaY,
                distance
            });

            if(distance > 0.5) {
                skeleton.node.setWorldPosition(effectWorldPosition);

                tween(skeleton.node)
                    .to(0.12, {
                        position: targetPosition
                    }, {
                        easing: 'sineOut'
                    })
                    .start();

                return;
            }
        }

        skeleton.node.setPosition(targetPosition);
    }


    private onHoneyTouched(event: EventTouch): void {
        if(Vec2.distance(event.getUIStartLocation(), event.getUILocation()) > 12) return;

        this.playHoneyTouch();
    }


    private playHoneyTouch(): void {
        if(this.isWaitingForJar || this.strength <= 0) return;

        const skeleton = this.getHoneySpine();

        if(!skeleton?.skeletonData || !skeleton.findAnimation('touch_honey')) return;

        const currentAnimation = skeleton.getCurrent(0)?.animation?.name;

        if(currentAnimation && currentAnimation !== 'idle_honey') return;

        skeleton.node.active = true;
        skeleton.enabled = true;
        skeleton.timeScale = 1;

        skeleton.setAnimation(0, 'touch_honey', false);
        skeleton.addAnimation(0, 'idle_honey', true, 0);
    }


    refresh() {
        if(this.strength <= 0 || this.isWaitingForJar) return;

        const skeleton = this.getHoneySpine();

        if(!skeleton?.skeletonData) return;

        skeleton.node.active = true;
        skeleton.enabled = true;
        skeleton.timeScale = 1;
        skeleton.clearTracks();
        skeleton.setToSetupPose();
        skeleton.setAnimation(0, 'idle_honey', true);
    }


    startDestroyConsequences() {
        this.isWaitingForJar = false;

        const skeleton = this.getHoneySpine();

        if(skeleton?.skeletonData && skeleton.findAnimation('destroy')) {
            skeleton.node.active = true;
            skeleton.enabled = true;
            skeleton.timeScale = 1;
            skeleton.clearTracks();

            this.playAnimation('destroy', false, this.destroyAnimationSpeed);
        }

        this.node.emit('goal', 'honey');
    }


    destroyTile(delay: number) {
        this.node.off(Node.EventType.TOUCH_END, this.onHoneyTouched, this);
        super.destroyTile(delay);
    }


    destroyClear() {
        this.node.off(Node.EventType.TOUCH_END, this.onHoneyTouched, this);
        super.destroyClear();
    }
}
