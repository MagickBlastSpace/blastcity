import { _decorator, Component, Node, Label, ProgressBar } from 'cc';
import { UserData } from '../../data/UserData';
const { ccclass, property } = _decorator;

@ccclass('UIStartSuperDiscoballItem')
export class UIStartSuperDiscoballItem extends Component {

    @property(Label)
    progressLabel: Label = null;

    @property(ProgressBar)
    progressBar: ProgressBar = null;


    refresh() {
        this.progressBar.progress = UserData.instance.getSuperDiscoballProgress();

        this.progressLabel.string = UserData.instance.getSuperDiscoballProgress_Value() + "/" + UserData.instance.getSuperDiscoballProgress_Max();
    }
}


