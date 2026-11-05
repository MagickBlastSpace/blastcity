import { _decorator, sp, Sprite, SpriteFrame } from 'cc';
import { UITile } from '../../../ui/UITile';
import { Lamp } from '../lvl_51/Lamp';

const { ccclass, property } = _decorator;

@ccclass('Pumpkin')
export class Pumpkin extends Lamp {

    @property(Sprite)
    picture: Sprite = null;

    @property(SpriteFrame)
    hp3: SpriteFrame | null = null;

    @property(SpriteFrame)
    hp2: SpriteFrame | null = null;

    @property(SpriteFrame)
    hp1: SpriteFrame | null = null;


    private isPumpkinTile(): boolean {
        return this.tileType?.toLowerCase() === 'pumpkin';
    }


    private getPumpkinSpine(): sp.Skeleton | null {
        return this.node.getComponent(UITile)?.spine ?? null;
    }


    private playPumpkinAnimation(animation: string): void {
        if (!this.isPumpkinTile()) return;

        const skeleton = this.getPumpkinSpine();

        if (!skeleton?.skeletonData) {
            console.warn(`[PUMPKIN] Missing Spine: ${animation}`);
            return;
        }

        skeleton.node.active = true;
        skeleton.setAnimation(0, animation, false);

        console.log('[PUMPKIN ANIMATION]', {
            animation,
            strength: this.getStrength(),
            active: skeleton.node.active,
            activeInHierarchy: skeleton.node.activeInHierarchy
        });
    }


    init(row: number, col: number, tileType: string) {
        super.init(row, col, tileType);

        this.strength = 3;
        this.refresh();

        if (!this.isPumpkinTile()) return;

        const uiTile = this.node.getComponent(UITile);

        if (uiTile) {
            uiTile.keepSpineVisible = true;
            uiTile.useSpineDestroyOnly = true;
        }

        const rootSprite = this.node.getComponent(Sprite);

        if (rootSprite) {
            rootSprite.enabled = false;
        }

        if (this.picture) {
            this.picture.enabled = false;
        }

        const skeleton = this.getPumpkinSpine();

        if (skeleton?.skeletonData) {
            skeleton.node.active = true;
            skeleton.clearTracks();
            skeleton.setToSetupPose();
        }

        console.log('[PUMPKIN INIT]', {
            tileType: this.tileType,
            row,
            col,
            hasSpine: !!skeleton,
            hasSkeletonData: !!skeleton?.skeletonData,
            active: skeleton?.node.active,
            activeInHierarchy: skeleton?.node.activeInHierarchy,
            keepSpineVisible: uiTile?.keepSpineVisible,
            useSpineDestroyOnly: uiTile?.useSpineDestroyOnly
        });
    }


    getDamage(damageType: string) {
        const previousStrength = this.getStrength();

        super.getDamage(damageType);

        if (!this.isPumpkinTile()) return;

        if (this.getStrength() === previousStrength) return;

        switch (this.getStrength()) {
            case 2:
                this.playPumpkinAnimation('hit_1');
                break;

            case 1:
                this.playPumpkinAnimation('hit_2');
                break;

            case 0:
                this.playPumpkinAnimation('destroy');
                break;
        }
    }


    refresh() {
        if (this.isPumpkinTile()) {
            const rootSprite = this.node.getComponent(Sprite);

            if (rootSprite) {
                rootSprite.enabled = false;
            }

            if (this.picture) {
                this.picture.enabled = false;
            }

            return;
        }

        if (!this.picture) return;

        switch (this.strength) {
            case 1:
                this.picture.spriteFrame = this.hp1;
                this.playDamageSound_2();
                break;

            case 2:
                this.picture.spriteFrame = this.hp2;
                this.playDamageSound();
                break;

            case 3:
                this.picture.spriteFrame = this.hp3;
                break;
        }
    }


    startDestroyConsequences() {
        this.node.emit('goal', 'pumpkin');
    }


    playDamageSound_2() {
        this.playSound(1);
    }
}
