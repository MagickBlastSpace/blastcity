import { _decorator, Node, sp, Sprite, SpriteFrame } from 'cc';
import { UITile } from '../../../ui/UITile';
import { SpecTileBase } from '../SpecTileBase';

const { ccclass, property } = _decorator;

@ccclass('Shell')
export class Shell extends SpecTileBase {

    @property(SpriteFrame)
    open: SpriteFrame = null;

    @property(SpriteFrame)
    closed: SpriteFrame = null;

    @property(Sprite)
    icon: Sprite = null;

    private extraDamageAvailable: boolean = false;
    private isShellDestroying: boolean = false;


    private getShellSpine(): sp.Skeleton | null {
        const uiTile = this.node.getComponent(UITile);
        return uiTile?.spine ?? null;
    }


    private playShellAnimation(animation: string, loop: boolean = true): void {
        const skeleton = this.getShellSpine();

        if (!skeleton?.skeletonData) {
            console.warn(`[SHELL] Spine unavailable: ${animation}`);
            return;
        }

        skeleton.node.active = true;
        skeleton.clearTracks();
        skeleton.setAnimation(0, animation, loop);
    }


    private playShellTransition(animation: string, nextIdle: string): void {
        const skeleton = this.getShellSpine();

        if (!skeleton?.skeletonData) {
            console.warn(`[SHELL] Spine unavailable: ${animation}`);
            return;
        }

        skeleton.node.active = true;
        skeleton.clearTracks();

        skeleton.setAnimation(0, animation, false);
        skeleton.addAnimation(0, nextIdle, true, 0);
    }


    private playPearlAnimation(): void {
        const uiTile = this.node.getComponent(UITile);

        if (!uiTile?.spine?.skeletonData) {
            console.warn('[SHELL] Cannot play pearl animation');
            return;
        }

        uiTile.playAdditionalAnimation(
            uiTile.spine,
            'pearl',
            null,
            'shell'
        );

        console.log('[SHELL] PEARL ANIMATION START', {
            row: this.row,
            col: this.col
        });
    }


    init(row: number, col: number, tileType: string) {
        super.init(row, col, tileType);

        this.isShifts = true;

        this.strength = 2;
        this.extraDamageAvailable = false;
        this.isShellDestroying = false;

        this.refresh();

        const uiTile = this.node.getComponent(UITile);

        if (uiTile) {
            uiTile.keepSpineVisible = true;
            uiTile.useSpineDestroyOnly = true;
        }
    }


    start() {
        this.playShellAnimation('idle_closed', true);
    }


    getDamage(damageType: string) {
        if (this.isShellDestroying) return;

        if (!this.isDamaged || (this.extraDamageAvailable && damageType === 'bonus')) {

            this.strength--;
            this.setAsDamaged();

            if (this.strength === 1) {

                this.playShellTransition('open', 'idle_open');
                this.playSwitchSound();

            } else if (this.strength <= 0) {

                this.isShellDestroying = true;

                this.playShellAnimation('destroy', false);

                this.playPearlAnimation();
            }
        }

        this.refresh();
    }


    isReadyToDestroy(): boolean {
        return this.strength <= 0;
    }


    refresh() {
        const rootSprite = this.node.getComponent(Sprite);
        if (rootSprite) rootSprite.enabled = false;

        const splashSprite = this.node.getChildByName('SpriteSplash')?.getComponent(Sprite);
        if (splashSprite) splashSprite.enabled = false;

        if (this.icon) this.icon.enabled = false;
    }


    startDestroyConsequences() {
        this.node.emit('goal', 'shell');
    }


    startInActionEffect(
        field?: Node[][],
        statuses?: Node[][],
        isBlockingAction: boolean = false
    ): boolean {

        if (isBlockingAction || this.isShellDestroying) {
            return false;
        }

        if (!this.isDamaged && this.strength < 2) {
            this.strength = 2;
            this.refresh();

            this.playShellTransition('close', 'idle_closed');
            this.playSwitchSound();
        }

        return false;
    }


    clearExtra() {
        this.extraDamageAvailable = true;
    }


    playSwitchSound() {
        this.playSound(0);
    }
}
