import { _decorator, Component, UITransform, Vec3, ProgressBar } from 'cc';
import { UIMainMenuButton } from './UIMainMenuButton';

const { ccclass, property } = _decorator;

@ccclass('UILocationProgressBarAdaptivity')
export class UILocationProgressBarAdaptivity extends Component {

    @property(UIMainMenuButton)
    button: UIMainMenuButton = null;

    @property
    widthRatio: number = 0.85;

    @property
    heightRatio: number = 0.12;

    @property
    bottomOffsetRatio: number = 0.10;

    private progressBar: ProgressBar = null;

    onLoad() {
        this.progressBar = this.getComponent(ProgressBar);
    }

    lateUpdate() {
        this.refreshAdaptivity();
    }

    private refreshAdaptivity() {
        if(!this.button?.icon?.node || !this.node.parent || !this.progressBar?.barSprite) return;

        const buttonTransform = this.button.icon.node.getComponent(UITransform);
        const parentTransform = this.node.parent.getComponent(UITransform);
        const progressTransform = this.node.getComponent(UITransform);
        const fillTransform = this.progressBar.barSprite.node.getComponent(UITransform);

        if(!buttonTransform || !parentTransform || !progressTransform || !fillTransform) return;

        const left = -buttonTransform.width * buttonTransform.anchorX;
        const right = buttonTransform.width * (1 - buttonTransform.anchorX);
        const bottom = -buttonTransform.height * buttonTransform.anchorY;
        const top = buttonTransform.height * (1 - buttonTransform.anchorY);

        const leftWorld = buttonTransform.convertToWorldSpaceAR( new Vec3(left, bottom, 0) );
        const rightWorld = buttonTransform.convertToWorldSpaceAR( new Vec3(right, bottom, 0) );
        const topWorld = buttonTransform.convertToWorldSpaceAR( new Vec3(left, top, 0) );

        const leftLocal = parentTransform.convertToNodeSpaceAR(leftWorld);
        const rightLocal = parentTransform.convertToNodeSpaceAR(rightWorld);
        const topLocal = parentTransform.convertToNodeSpaceAR(topWorld);

        const buttonWidth = Math.abs(rightLocal.x - leftLocal.x);
        const buttonHeight = Math.abs(topLocal.y - leftLocal.y);

        const width = buttonWidth * this.widthRatio;
        const height = buttonHeight * this.heightRatio;

        const centerX = (leftLocal.x + rightLocal.x) / 2;
        const centerY = leftLocal.y + buttonHeight * this.bottomOffsetRatio + height / 2;

        if(Math.abs(progressTransform.width - width) > 0.01 || Math.abs(progressTransform.height - height) > 0.01) {
            progressTransform.setContentSize( width, height );
        }

        if(Math.abs(this.progressBar.totalLength - width) > 0.01) {
            this.progressBar.totalLength = width;
        }

        if(Math.abs(fillTransform.height - height) > 0.01) {
            fillTransform.setContentSize( fillTransform.width, height );
        }

        const fillNode = this.progressBar.barSprite.node;

        if(Math.abs(fillNode.position.x + width / 2) > 0.01 || Math.abs(fillNode.position.y) > 0.01) {
            fillNode.setPosition( -width / 2, 0, fillNode.position.z );
        }

        if(Math.abs(this.node.position.x - centerX) > 0.01 || Math.abs(this.node.position.y - centerY) > 0.01) {
            this.node.setPosition( centerX, centerY, this.node.position.z );
        }
    }
}
