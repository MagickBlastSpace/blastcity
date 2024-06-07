import { _decorator, Component, Node, ProgressBar, director, SceneAsset } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('UILoadingFrame')
export class UILoadingFrame extends Component {

    @property(ProgressBar)
    loadingBar: ProgressBar = null;

    start() {
        director.preloadScene("scene", this.onProgressLoadScene, () => {
            director.loadScene("scene");
        })
    }


    private onProgressLoadScene = (completedCount: number, totalCount: number, item: any) => {
        this.loadingBar.progress = completedCount / totalCount;
    }
}
