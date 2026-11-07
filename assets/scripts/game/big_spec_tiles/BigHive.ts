import { _decorator, sp, Sprite, SpriteFrame } from 'cc';
import { UITile } from '../../ui/UITile';
import { BigTileBase } from './BigTileBase';

const { ccclass, property } = _decorator;

@ccclass('BigHive')
export class BigHive extends BigTileBase {

    @property(Sprite)
    picture: Sprite = null;

    @property(SpriteFrame)
    hp3: SpriteFrame | null = null;

    @property(SpriteFrame)
    hp2: SpriteFrame | null = null;

    @property(SpriteFrame)
    hp1: SpriteFrame | null = null;


    private getHiveSpine(): sp.Skeleton | null {
        return this.node.getComponent(UITile)?.spine ?? null;
    }


    private getSkinByStrength(strength: number): string {
        switch (strength) {
            case 3: return 'julius_1';
            case 2: return 'julius_2';
            case 1: return 'julius_3';
            default: return 'julius_3';
        }
    }


    private setHiveSkin(strength: number): void {
        const skeleton = this.getHiveSpine();

        if (!skeleton?.skeletonData) return;

        skeleton.setSkin(this.getSkinByStrength(strength));
        skeleton.setSlotsToSetupPose();
    }


    private playHiveIdle(): void {
        const skeleton = this.getHiveSpine();

        if (!skeleton?.skeletonData) return;

        skeleton.node.active = true;
        skeleton.clearTracks();

        this.setHiveSkin(this.strength);

        skeleton.setAnimation(0, 'idle', true);
    }


    private playHiveHit(): void {
        const skeleton = this.getHiveSpine();

        if (!skeleton?.skeletonData) return;

        skeleton.node.active = true;

        const targetStrength = this.strength;

        skeleton.clearTracks();

        const entry = skeleton.setAnimation(0, 'hit', false);

        if (!entry) return;

        skeleton.setTrackCompleteListener(entry, () => {
            if (!skeleton.isValid || this.strength <= 0) return;

            this.setHiveSkin(this.strength);
            skeleton.setAnimation(0, 'idle', true);

            console.log('[BIG HIVE] HIT COMPLETE', {
                strength: this.strength,
                skin: this.getSkinByStrength(this.strength)
            });
        });

        console.log('[BIG HIVE] HIT START', {
            strength: targetStrength
        });
    }


    private playHiveDestroy(): void {
        const skeleton = this.getHiveSpine();

        if (!skeleton?.skeletonData) return;

        skeleton.node.active = true;
        skeleton.clearTracks();

        skeleton.setAnimation(0, 'destroy', false);

        console.log('[BIG HIVE] DESTROY START');
    }


    init(row: number, col: number, tileType: string) {
        super.init(row, col, tileType);

        this.isShifts = false;
        this.isDoubleX = true;
        this.isDoubleY = true;

        this.strength = 3;
        this.refresh();

        const uiTile = this.node.getComponent(UITile);

        if (uiTile) {
            uiTile.keepSpineVisible = true;
            uiTile.useSpineDestroyOnly = true;
        }

        if (this.picture) {
            this.picture.enabled = false;
        }

        const skeleton = this.getHiveSpine();

        if (skeleton?.skeletonData) {
            skeleton.node.active = true;
            this.setHiveSkin(3);
        }
    }


    start() {
        this.playHiveIdle();
    }


    getDamage(damageType: string) {
        if (damageType !== 'bonus' || this.isDamaged || this.strength <= 0) {
            return;
        }

        this.strength--;
        this.setAsDamaged();

        console.log('[BIG HIVE] DAMAGE', {
            strength: this.strength,
            damageType
        });

        if (this.strength > 0) {
            this.playHiveHit();

            if (this.strength === 2) {
                this.playDamageSound_2();
            } else {
                this.playDamageSound();
            }
        } else {
            this.playHiveDestroy();
        }

        this.refresh();
    }


    isReadyToDestroy(): boolean {
        return this.strength <= 0;
    }


    refresh() {
        if (this.picture) {
            this.picture.enabled = false;
        }
    }


    startDestroyConsequences() {
        this.node.emit('goal', 'big_hive');
    }


    clearExtra() {
        this.isDamaged = false;
    }


    playDamageSound() {
        this.playSound(0);
    }


    playDamageSound_2() {
        this.playSound(1);
    }
}
