import { _decorator, Component, Label, Sprite, SpriteFrame } from 'cc';
import { Localization } from '../../utils/Localization';

const { ccclass, property } = _decorator;

@ccclass('UILocationCard')
export class UILocationCard extends Component {

    @property(Sprite)
    locationImage: Sprite = null;

    @property(Label)
    chapterLabel: Label = null;

    @property(Label)
    levelsLabel: Label = null;


    setup(
        chapterNumber: number,
        startLevel: number,
        endLevel: number,
        spriteFrame: SpriteFrame
    ) {
        if(this.locationImage) {
            this.locationImage.spriteFrame = spriteFrame;
        }

        if(this.chapterLabel) {
            this.chapterLabel.string =
                `${Localization.instance.getLabelByKey("locations.chapter")} ${chapterNumber}`;
        }

        if(this.levelsLabel) {
            this.levelsLabel.string =
                `${Localization.instance.getLabelByKey("locations.levels")} ${startLevel}-${endLevel}`;
        }
    }
}
