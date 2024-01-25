import { _decorator, Component, Node } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('CameraController')
export class CameraController extends Component {
    @property
    fixedOrthoHeight: number = 420;

    onLoad() {
        const camera = this.getComponent(cc.Camera);

        if (camera) {
            camera.orthoHeight = this.fixedOrthoHeight;
        }
    }
}


