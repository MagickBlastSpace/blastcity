import { _decorator, Component, view, screen, ResolutionPolicy } from 'cc';
const { ccclass, property } = _decorator;

const DESIGN_WIDTH = 3654;
const DESIGN_HEIGHT = 2008;

@ccclass('UIAdaptivity')
export class UIAdaptivity extends Component {
    
    onLoad() {
        this.adjustUI();

        screen.on('window-resize', this.adjustUI, this);
        screen.on('orientation-change', this.adjustUI, this);
        screen.on('fullscreen-change', this.adjustUI, this);
      }
    
    onDestroy() {
        screen.off('window-resize', this.adjustUI, this);
        screen.off('orientation-change', this.adjustUI, this);
        screen.off('fullscreen-change', this.adjustUI, this);
    }


    adjustUI() {
        const designResolution = view.getDesignResolutionSize();
        const canvasSize = view.getVisibleSizeInPixel();;

        let fitMode = 'FitWidth';
        if (designResolution.height / designResolution.width > canvasSize.height / canvasSize.width) {
            fitMode = 'FitHeight';
        }

        if (fitMode === 'FitWidth') {
            view.setDesignResolutionSize(DESIGN_WIDTH, DESIGN_HEIGHT, ResolutionPolicy.FIXED_WIDTH);
        } else {
            view.setDesignResolutionSize(DESIGN_WIDTH, DESIGN_HEIGHT, ResolutionPolicy.FIXED_HEIGHT);
        }
    }
}



