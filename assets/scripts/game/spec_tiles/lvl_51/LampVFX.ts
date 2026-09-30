import {
    _decorator,
    Component,
    Node,
    tween,
    Tween,
    UIOpacity,
    Vec3,
} from 'cc';
import { Lamp } from './Lamp';
import { UITile } from '../../../ui/UITile';

const { ccclass, property } = _decorator;

@ccclass('LampVFX')
export class LampVFX extends Component {

    @property(Node)
    glow: Node = null;

    @property(Node)
    starRays: Node = null;

    @property(Node)
    breakFlash: Node = null;

    @property(Node)
    breakFragmentsRays: Node = null;

    @property(Node)
    breakSparks: Node = null;

    @property(Node)
    breakStarGlow: Node = null;

    @property(Node)
    breakStar: Node = null;

    private lamp: Lamp = null;
    private currentStrength: number = -1;
    private isBreaking: boolean = false;

    private glowOpacity: UIOpacity = null;
    private starRaysOpacity: UIOpacity = null;

    private breakFlashOpacity: UIOpacity = null;
    private breakFragmentsRaysOpacity: UIOpacity = null;
    private breakSparksOpacity: UIOpacity = null;
    private breakStarGlowOpacity: UIOpacity = null;
    private breakStarOpacity: UIOpacity = null;

    private readonly glowMinOpacity = 80;
    private readonly glowMaxOpacity = 135;

    private readonly starMinOpacity = 155;
    private readonly starMaxOpacity = 255;

    onLoad() {
        this.lamp = this.getComponent(Lamp);

        const uiTile = this.getComponent(UITile);

        if (uiTile) {
            uiTile.spine = null;

            uiTile.particles_1 = null;
            uiTile.particles_2 = null;
            uiTile.particles_3 = null;
            uiTile.particles_4 = null;
            uiTile.particles_5 = null;
            uiTile.particlesParent = null;
        }

        this.node.once("lamp_break_vfx", this.playBreakVFX, this);
        console.log('[LAMP VFX] listener registered');

        this.glowOpacity = this.ensureOpacity(this.glow);
        this.starRaysOpacity = this.ensureOpacity(this.starRays);

        this.breakFlashOpacity = this.ensureOpacity(this.breakFlash);
        this.breakFragmentsRaysOpacity = this.ensureOpacity(this.breakFragmentsRays);
        this.breakSparksOpacity = this.ensureOpacity(this.breakSparks);
        this.breakStarGlowOpacity = this.ensureOpacity(this.breakStarGlow);
        this.breakStarOpacity = this.ensureOpacity(this.breakStar);

        this.hideBreakVFX();
        this.setOffState();
    }

    update() {
        if (!this.lamp || this.isBreaking) {
            return;
        }

        const strength = this.lamp.getStrength();

        if (strength === this.currentStrength) {
            return;
        }

        this.currentStrength = strength;

        if (strength === 1) {
            this.setOnState();
            return;
        }

        if (strength > 1) {
            this.setOffState();
        }
    }

    private setOffState() {
        this.stopOnVFX();

        this.glow.active = false;
        this.starRays.active = false;

        this.hideBreakVFX();
    }

    private setOnState() {
        this.stopOnVFX();

        this.glow.active = true;
        this.starRays.active = true;

        this.startGlowPulse();
        this.startStarPulse();
    }

    private startGlowPulse() {
        this.glow.setScale(new Vec3(0.97, 0.97, 1));
        this.glowOpacity.opacity = this.glowMinOpacity;

        tween(this.glow)
            .to(0.75, {
                scale: new Vec3(1.03, 1.03, 1),
            }, {
                easing: 'sineInOut',
            })
            .to(0.75, {
                scale: new Vec3(0.97, 0.97, 1),
            }, {
                easing: 'sineInOut',
            })
            .union()
            .repeatForever()
            .start();

        tween(this.glowOpacity)
            .to(0.75, {
                opacity: this.glowMaxOpacity,
            }, {
                easing: 'sineInOut',
            })
            .to(0.75, {
                opacity: this.glowMinOpacity,
            }, {
                easing: 'sineInOut',
            })
            .union()
            .repeatForever()
            .start();
    }

    private startStarPulse() {
        this.starRays.setScale(new Vec3(0.99, 0.99, 1));
        this.starRaysOpacity.opacity = this.starMinOpacity;

        tween(this.starRays)
            .to(0.9, {
                scale: new Vec3(1.015, 1.015, 1),
            }, {
                easing: 'sineInOut',
            })
            .to(0.9, {
                scale: new Vec3(0.99, 0.99, 1),
            }, {
                easing: 'sineInOut',
            })
            .union()
            .repeatForever()
            .start();

        tween(this.starRaysOpacity)
            .to(0.9, {
                opacity: this.starMaxOpacity,
            }, {
                easing: 'sineInOut',
            })
            .to(0.9, {
                opacity: this.starMinOpacity,
            }, {
                easing: 'sineInOut',
            })
            .union()
            .repeatForever()
            .start();
    }

   private playBreakVFX() {
        if (this.isBreaking) {
            return;
        }

        this.isBreaking = true;

        this.stopOnVFX();
        this.stopBreakVFX();

        this.glow.active = false;
        this.starRays.active = false;

        if (this.lamp?.icon?.node) {
            this.lamp.icon.node.active = false;
        }

        this.prepareBreakVFX();

        tween(this.breakFlash)
            .to(0.08, {
                scale: new Vec3(1.08, 1.08, 1),
            }, {
                easing: 'sineOut',
            })
            .to(0.16, {
                scale: new Vec3(1.35, 1.35, 1),
            }, {
                easing: 'sineOut',
            })
            .start();

        tween(this.breakFlashOpacity)
            .to(0.06, {
                opacity: 220,
            }, {
                easing: 'sineOut',
            })
            .delay(0.04)
            .to(0.14, {
                opacity: 0,
            }, {
                easing: 'sineIn',
            })
            .start();

        tween(this.breakFragmentsRays)
            .to(0.55, {
                scale: new Vec3(1.20, 1.20, 1),
                angle: 5,
            }, {
                easing: 'sineOut',
            })
            .start();

        tween(this.breakFragmentsRaysOpacity)
            .delay(0.20)
            .to(0.42, {
                opacity: 0,
            }, {
                easing: 'sineIn',
            })
            .start();

        tween(this.breakSparks)
            .delay(0.05)
            .to(0.55, {
                scale: new Vec3(1.35, 1.35, 1),
                angle: -7,
            }, {
                easing: 'sineOut',
            })
            .start();

        tween(this.breakSparksOpacity)
            .delay(0.05)
            .to(0.10, {
                opacity: 220,
            }, {
                easing: 'sineOut',
            })
            .delay(0.15)
            .to(0.32, {
                opacity: 0,
            }, {
                easing: 'sineIn',
            })
            .start();

        tween(this.breakStarGlow)
            .to(0.18, {
                scale: new Vec3(1.10, 1.10, 1),
            }, {
                easing: 'sineOut',
            })
            .to(0.38, {
                scale: new Vec3(1.28, 1.28, 1),
            }, {
                easing: 'sineOut',
            })
            .start();

        tween(this.breakStarGlowOpacity)
            .to(0.10, {
                opacity: 190,
            }, {
                easing: 'sineOut',
            })
            .delay(0.12)
            .to(0.36, {
                opacity: 0,
            }, {
                easing: 'sineIn',
            })
            .start();

        tween(this.breakStar)
            .to(0.12, {
                scale: new Vec3(1.12, 1.12, 1),
            }, {
                easing: 'sineOut',
            })
            .to(0.38, {
                scale: new Vec3(0.92, 0.92, 1),
            }, {
                easing: 'sineInOut',
            })
            .start();

        tween(this.breakStarOpacity)
            .delay(0.20)
            .to(0.38, {
                opacity: 0,
            }, {
                easing: 'sineIn',
            })
            .start();
    }

    private prepareBreakVFX() {
        this.breakFlash.active = true;
        this.breakFragmentsRays.active = true;
        this.breakSparks.active = true;
        this.breakStarGlow.active = true;
        this.breakStar.active = true;

        this.breakFlash.setScale(new Vec3(0.72, 0.72, 1));
        this.breakFragmentsRays.setScale(new Vec3(0.86, 0.86, 1));
        this.breakSparks.setScale(new Vec3(0.78, 0.78, 1));
        this.breakStarGlow.setScale(new Vec3(0.78, 0.78, 1));
        this.breakStar.setScale(new Vec3(0.82, 0.82, 1));

        this.breakFlash.angle = 0;
        this.breakFragmentsRays.angle = 0;
        this.breakSparks.angle = 0;
        this.breakStarGlow.angle = 0;
        this.breakStar.angle = 0;

        this.breakFlashOpacity.opacity = 0;
        this.breakFragmentsRaysOpacity.opacity = 255;
        this.breakSparksOpacity.opacity = 0;
        this.breakStarGlowOpacity.opacity = 0;
        this.breakStarOpacity.opacity = 255;
    }

    private hideBreakVFX() {
        this.breakFlash.active = false;
        this.breakFragmentsRays.active = false;
        this.breakSparks.active = false;
        this.breakStarGlow.active = false;
        this.breakStar.active = false;
    }

    private stopOnVFX(resetTransform: boolean = true) {
        Tween.stopAllByTarget(this.glow);
        Tween.stopAllByTarget(this.starRays);

        if (this.glowOpacity) {
            Tween.stopAllByTarget(this.glowOpacity);
        }

        if (this.starRaysOpacity) {
            Tween.stopAllByTarget(this.starRaysOpacity);
        }

        if (resetTransform) {
            this.glow.setScale(Vec3.ONE);
            this.starRays.setScale(Vec3.ONE);
        }
    }

    private stopBreakVFX() {
        Tween.stopAllByTarget(this.breakFlash);
        Tween.stopAllByTarget(this.breakFragmentsRays);
        Tween.stopAllByTarget(this.breakSparks);
        Tween.stopAllByTarget(this.breakStarGlow);
        Tween.stopAllByTarget(this.breakStar);

        if (this.breakFlashOpacity) {
            Tween.stopAllByTarget(this.breakFlashOpacity);
        }

        if (this.breakFragmentsRaysOpacity) {
            Tween.stopAllByTarget(this.breakFragmentsRaysOpacity);
        }

        if (this.breakSparksOpacity) {
            Tween.stopAllByTarget(this.breakSparksOpacity);
        }

        if (this.breakStarGlowOpacity) {
            Tween.stopAllByTarget(this.breakStarGlowOpacity);
        }

        if (this.breakStarOpacity) {
            Tween.stopAllByTarget(this.breakStarOpacity);
        }
    }

    private ensureOpacity(node: Node): UIOpacity {
        let opacity = node.getComponent(UIOpacity);

        if (!opacity) {
            opacity = node.addComponent(UIOpacity);
        }

        return opacity;
    }

    onDestroy() {
        this.stopOnVFX(false);
        this.stopBreakVFX();
    }
}