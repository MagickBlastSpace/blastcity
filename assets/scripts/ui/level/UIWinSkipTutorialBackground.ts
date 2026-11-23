import {
    _decorator,
    Color,
    Component,
    Graphics,
    UITransform
} from 'cc';

const { ccclass } = _decorator;

@ccclass('UIWinSkipTutorialBackground')
export class UIWinSkipTutorialBackground extends Component {

    protected onEnable(): void {
        const graphics = this.getComponent(Graphics);
        const transform = this.getComponent(UITransform);

        if(!graphics || !transform) return;

        const width = transform.width;
        const height = transform.height;
        const radius = 28;

        graphics.clear();

        //Фон
        graphics.fillColor = new Color(19, 32, 65, 235);

        graphics.roundRect(
            -width / 2,
            -height / 2,
            width,
            height,
            radius
        );

        graphics.fill();

        //Рамка
        graphics.lineWidth = 3;
        graphics.strokeColor = new Color(133, 185, 255, 230);

        graphics.roundRect(
            -width / 2,
            -height / 2,
            width,
            height,
            radius
        );

        graphics.stroke();
    }
}
