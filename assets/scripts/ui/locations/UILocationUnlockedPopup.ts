import {
    _decorator,
    Button,
    Label,
    Node,
    Sprite,
    SpriteFrame,
    UITransform,
    view
} from 'cc';

import { Localization } from '../../utils/Localization';
import { UIFrameBase } from '../UIFrameBase';

const { ccclass, property } = _decorator;


@ccclass('UILocationUnlockedPopup')
export class UILocationUnlockedPopup extends UIFrameBase {

    @property(Sprite)
    locationImage: Sprite = null;

    @property(Button)
    continueBtn: Button = null;

    @property(Node)
    cardScaleRoot: Node = null;

    @property(Label)
    titleLabel: Label = null;

    private titleKey: string =
        "locations.unlocked";


    onLoad() {

        this.continueBtn.node.on(
            Button.EventType.CLICK,
            this.onContinueClick,
            this
        );
    }


    init(
        spriteFrame: SpriteFrame,
        titleKey: string = "locations.unlocked"
    ) {
        this.titleKey = titleKey;

        if(this.locationImage) {
            this.locationImage.spriteFrame =
                spriteFrame;
        }
    }

    show() {
        super.show();

        if(this.titleLabel) {
            this.titleLabel.string =
                Localization.instance
                    .getLabelByKey(
                        this.titleKey
                    );
        }
    }


    private onContinueClick() {
        this.hide();

        this.node.emit('continue');
    }

    private updateLayout() {
        if(!this.cardScaleRoot) {
            return;
        }

        const cardTransform =
            this.cardScaleRoot.getComponent(UITransform);

        if(!cardTransform) {
            return;
        }

        const visibleSize =
            view.getVisibleSize();

        const cardWidth =
            cardTransform.width;

        const cardHeight =
            cardTransform.height;

        if(
            cardWidth <= 0 ||
            cardHeight <= 0
        ) {
            return;
        }

        const maxWidth =
            visibleSize.width * 0.72;

        const maxHeight =
            visibleSize.height * 0.82;

        const scale =
            Math.min(
                maxWidth / cardWidth,
                maxHeight / cardHeight,
                1
            );

        this.cardScaleRoot.setScale(
            scale,
            scale,
            1
        );
    }
}
