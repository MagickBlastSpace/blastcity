import { _decorator, EventTouch, Node, sp, Sprite, SpriteFrame, Vec2 } from 'cc';
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

    private isPumpkinDamageInProgress: boolean = false;
    private isPumpkinAnimationPlaying: boolean = false;


    private isPumpkinTile(): boolean {
        return this.tileType?.toLowerCase() === 'pumpkin';
    }


    private getPumpkinSpine(): sp.Skeleton | null {
        return this.node.getComponent(UITile)?.spine ?? null;
    }


    private restorePumpkinState(): void {
        if(!this.isPumpkinTile()) return;

        const strength = this.getStrength();
        if(strength <= 0 || strength > 3) return;

        const skeleton = this.getPumpkinSpine();
        if(!skeleton?.skeletonData) return;

        const stateAnimation = strength === 3
            ? 'touch_1'
            : strength === 2
                ? 'hit_1'
                : 'hit_2';

        const animationData = skeleton.findAnimation(stateAnimation);

        if(!animationData) {
            console.warn('[PUMPKIN STATE] Animation missing:', stateAnimation);
            return;
        }

        skeleton.node.active = true;
        skeleton.enabled = true;
        skeleton.timeScale = 1;

        skeleton.clearTrack(0);
        skeleton.setToSetupPose();

        const track = skeleton.setAnimation(0, stateAnimation, false);
        if(!track) return;

        track.trackTime = strength === 3 ? 0 : animationData.duration;
        track.timeScale = 0;

        skeleton.updateAnimation(0);

        this.isPumpkinAnimationPlaying = false;

        console.log('[PUMPKIN STATE RESTORED]', {
            row: this.row,
            col: this.col,
            strength,
            animation: stateAnimation
        });
    }


    private playPumpkinAnimation(
        animation: string,
        restoreAfter: boolean = false
    ): void {
        if(!this.isPumpkinTile()) return;

        const skeleton = this.getPumpkinSpine();

        if(!skeleton?.skeletonData) {
            console.warn('[PUMPKIN] Spine missing:', animation);
            return;
        }

        if(!skeleton.findAnimation(animation)) {
            console.warn('[PUMPKIN] Animation not found:', animation);
            return;
        }

        skeleton.node.active = true;
        skeleton.enabled = true;
        skeleton.timeScale = 1;

        const strength = this.getStrength();

        const track = skeleton.setAnimation(0, animation, false);
        if(!track) return;

        this.isPumpkinAnimationPlaying = restoreAfter;

        if(restoreAfter) {
            skeleton.setTrackCompleteListener(track, () => {
                if(!this.node.isValid || !skeleton.isValid) return;
                if(this.getStrength() !== strength) return;
                if(skeleton.getCurrent(0) !== track) return;

                this.restorePumpkinState();
            });
        }

        console.log('[PUMPKIN ANIMATION]', {
            row: this.row,
            col: this.col,
            strength,
            animation
        });
    }


    private onPumpkinTouched(event: EventTouch): void {
        if(Vec2.distance(event.getUIStartLocation(), event.getUILocation()) > 12) return;

        this.playPumpkinTouch();
    }


    private playPumpkinTouch(): void {
        if(!this.node.isValid || !this.isPumpkinTile()) return;

        const strength = this.getStrength();
        if(strength <= 0 || strength > 3) return;

        const skeleton = this.getPumpkinSpine();

        if(!skeleton?.skeletonData || !skeleton.node.activeInHierarchy) return;

        const currentTrack = skeleton.getCurrent(0);

        if(this.isPumpkinAnimationPlaying) {
            if(currentTrack && currentTrack.timeScale !== 0 && !currentTrack.isComplete()) {
                return;
            }

            this.restorePumpkinState();
        }

        const touchAnimation = `touch_${4 - strength}`;

        if(!skeleton.findAnimation(touchAnimation)) {
            console.warn('[PUMPKIN TOUCH] Animation missing:', touchAnimation);
            return;
        }

        this.playPumpkinAnimation(touchAnimation, true);
    }


    init(row: number, col: number, tileType: string) {
        super.init(row, col, tileType);

        this.isPumpkinDamageInProgress = false;
        this.isPumpkinAnimationPlaying = false;

        this.strength = 3;
        this.refresh();

        if(!this.isPumpkinTile()) return;

        // Убираем обработчики фонарика у тыковки.
        this.node.off('lamp_touch', this.playLampTouch, this);
        this.node.off('touch_feedback', this.playLampTouch, this);

        const uiTile = this.node.getComponent(UITile);

        if(uiTile) {
            uiTile.keepSpineVisible = true;
            uiTile.useSpineDestroyOnly = true;
        }

        const rootSprite = this.node.getComponent(Sprite);

        if(rootSprite) rootSprite.enabled = false;
        if(this.picture) this.picture.enabled = false;

        const skeleton = this.getPumpkinSpine();

        if(skeleton?.skeletonData) {
            skeleton.node.active = true;
            skeleton.enabled = true;
            skeleton.timeScale = 1;

            skeleton.clearTracks();
            skeleton.setToSetupPose();

            this.restorePumpkinState();
        }

        this.node.off(Node.EventType.TOUCH_END, this.onPumpkinTouched, this);
        this.node.on(Node.EventType.TOUCH_END, this.onPumpkinTouched, this);

        this.node.off('touch_feedback', this.playPumpkinTouch, this);
        this.node.on('touch_feedback', this.playPumpkinTouch, this);
    }


    getDamage(damageType: string) {
        if(!this.isPumpkinTile()) {
            super.getDamage(damageType);
            return;
        }

        const previousStrength = this.getStrength();

        this.isPumpkinDamageInProgress = true;

        try {
            super.getDamage(damageType);
        }
        finally {
            this.isPumpkinDamageInProgress = false;
        }

        const strength = this.getStrength();

        if(strength === previousStrength) return;

        this.isPumpkinAnimationPlaying = false;

        switch(strength) {
            case 2:
                this.playPumpkinAnimation('hit_1', true);
                break;

            case 1:
                this.playPumpkinAnimation('hit_2', true);
                break;

            case 0:
                this.playPumpkinAnimation('destroy');
                break;
        }
    }


    refresh() {
        if(this.isPumpkinTile()) {
            const rootSprite = this.node.getComponent(Sprite);

            if(rootSprite) rootSprite.enabled = false;
            if(this.picture) this.picture.enabled = false;

            if(!this.isPumpkinDamageInProgress) {
                this.restorePumpkinState();
            }

            return;
        }

        if(!this.picture) return;

        switch(this.strength) {
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


    destroyTile(delay: number) {
        this.node.off(Node.EventType.TOUCH_END, this.onPumpkinTouched, this);
        this.node.off('touch_feedback', this.playPumpkinTouch, this);

        super.destroyTile(delay);
    }


    destroyClear() {
        this.node.off(Node.EventType.TOUCH_END, this.onPumpkinTouched, this);
        this.node.off('touch_feedback', this.playPumpkinTouch, this);

        super.destroyClear();
    }


    playDamageSound_2() {
        this.playSound(1);
    }
}
