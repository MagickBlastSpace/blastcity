import {
    _decorator,
    Component,
    Node,
    Sprite,
    SpriteFrame,
    UITransform,
    Vec3,
    view,
    Widget,
} from 'cc';

const { ccclass, property } = _decorator;

@ccclass('UIPreloadAdaptivity')
export class UIPreloadAdaptivity extends Component {

    @property(Node)
    back: Node = null;

    @property(Node)
    frame: Node = null;

    @property(SpriteFrame)
    desktopBackground: SpriteFrame = null;

    @property(SpriteFrame)
    mobileBackground: SpriteFrame = null;

    start() {
        this.updateLayout();
        view.on('canvas-resize', this.updateLayout, this);
    }

    onDestroy() {
        view.off('canvas-resize', this.updateLayout, this);
    }

    private updateLayout() {
        const size = view.getVisibleSize();

        const width = size.width;
        const height = size.height;
        const aspect = width / height;

        const isPhonePortrait = aspect < 0.6;

        const backgroundSprite = this.back.getComponent(Sprite);
        const backgroundTransform = this.back.getComponent(UITransform);
        const backgroundWidget = this.back.getComponent(Widget);

        if (!backgroundSprite || !backgroundTransform) {
            return;
        }

        // PHONE
        if (isPhonePortrait) {
            if (this.mobileBackground) {
                backgroundSprite.spriteFrame = this.mobileBackground;
            }

            if (backgroundWidget) {
                backgroundWidget.enabled = false;
            }

            const spriteFrame = backgroundSprite.spriteFrame;

            if (spriteFrame) {
                const rect = spriteFrame.rect;

                const imageWidth = rect.width;
                const imageHeight = rect.height;

                const imageAspect = imageWidth / imageHeight;
                const screenAspect = width / height;

                if (screenAspect > imageAspect) {
                    backgroundTransform.width = width;
                    backgroundTransform.height = width / imageAspect;
                } else {
                    backgroundTransform.height = height;
                    backgroundTransform.width = height * imageAspect;
                }
            }

            this.back.setPosition(Vec3.ZERO);
            this.back.setScale(1, 1, 1);

            this.frame.setScale(0.72, 0.72, 1);
            this.frame.setPosition(new Vec3(0, -220, 0));

            return;
        }

        // TABLET + DESKTOP
        if (this.desktopBackground) {
            backgroundSprite.spriteFrame = this.desktopBackground;
        }

        if (backgroundWidget) {
            backgroundWidget.enabled = false;
        }

        const desktopWidth = 3648;
        const desktopHeight = 3000;

        const imageAspect = desktopWidth / desktopHeight;
        const screenAspect = width / height;

        if (screenAspect > imageAspect) {
            backgroundTransform.width = width;
            backgroundTransform.height = width / imageAspect;
        } else {
            backgroundTransform.height = height;
            backgroundTransform.width = height * imageAspect;
        }

        this.back.setPosition(Vec3.ZERO);
        this.back.setScale(1, 1, 1);

        this.frame.setScale(1, 1, 1);
        this.frame.setPosition(Vec3.ZERO);
    }
}