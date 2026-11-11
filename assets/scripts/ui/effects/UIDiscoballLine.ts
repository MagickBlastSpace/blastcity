
import { _decorator, Component, sp, Vec3 } from 'cc';

const { ccclass, property } = _decorator;

@ccclass('UIDiscoballLine')
export class UIDiscoballLine extends Component {

    @property(sp.Skeleton)
    lineSpine: sp.Skeleton = null;

    @property
    referenceLength: number = 720;

    @property
    lineThicknessScale: number = 0.7;

    setLinePositions(
        startPos: Vec3,
        endPos: Vec3,
        skinName: string = 'blue',
        animationName: 'line_color_1' | 'line_color_2' = 'line_color_1'
    ): void {

        if(!this.lineSpine || !this.lineSpine.skeletonData) {
            console.warn('[DISCO SPINE LINE] SkeletonData missing');
            this.node.destroy();
            return;
        }

        const direction = new Vec3();
        Vec3.subtract(direction, endPos, startPos);

        const distance = direction.length();

        if(distance < 0.001) {
            this.node.destroy();
            return;
        }

        const angle = Math.atan2(direction.y, direction.x) * 180 / Math.PI;

        this.node.setPosition(startPos);
        this.node.angle = angle;

        const visualNode = this.lineSpine.node;

        visualNode.setPosition(0, 0, 0);
        visualNode.setRotationFromEuler(0, 0, 0);

        visualNode.setScale(
            distance / this.referenceLength,
            this.lineThicknessScale,
            1
        );

        visualNode.active = true;
        this.lineSpine.enabled = true;

        try {
            this.lineSpine.setSkin(skinName);
            this.lineSpine.setSlotsToSetupPose();

            if(!this.lineSpine.findAnimation(animationName)) {
                throw new Error(`Animation ${animationName} not found`);
            }

            this.lineSpine.clearTracks();
            this.lineSpine.setToSetupPose();

            const track = this.lineSpine.setAnimation(
                0,
                animationName,
                false
            );

            if(!track) {
                throw new Error('Failed to start Spine line');
            }

            this.lineSpine.setTrackCompleteListener(track, () => {
                if(this.node.isValid) {
                    this.node.destroy();
                }
            });

            console.log('[DISCO SPINE LINE]', {
                skin: skinName,
                animation: animationName,
                distance,
                angle,
                duration: track.animation?.duration
            });

        } catch(error) {
            console.error('[DISCO SPINE LINE] Playback failed:', error);

            if(this.node.isValid) {
                this.node.destroy();
            }
        }
    }
}
