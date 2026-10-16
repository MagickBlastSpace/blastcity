import {
    _decorator,
    Component,
    ProgressBar
} from 'cc';

import { Chest } from '../../game/Chest';

const { ccclass, property } = _decorator;


@ccclass('UILocationProgressBar')
export class UILocationProgressBar extends Component {

    @property(Chest)
    chest: Chest = null;

    @property(ProgressBar)
    progressBar: ProgressBar = null;


    onEnable() {

        const progressLabel =
            this.node.getChildByName("Progress");

        if(progressLabel) {
            progressLabel.active = false;
        }

        if(this.chest) {
            this.chest.node.on(
                'refresh',
                this.refresh,
                this
            );
        }

        this.refresh();
    }


    onDisable() {

        if(this.chest) {
            this.chest.node.off(
                'refresh',
                this.refresh,
                this
            );
        }
    }


    private refresh() {

        if(
            !this.chest ||
            !this.progressBar
        ) {
            return;
        }

        this.progressBar.progress =
            this.chest.getCurrentLocationProgress();
    }
}
