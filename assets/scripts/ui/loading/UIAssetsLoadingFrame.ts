import { _decorator, Component, Node } from 'cc';
import { AssetsLoader } from '../../utils/AssetsLoader';
import { UIFrameBase } from '../UIFrameBase';
const { ccclass, property } = _decorator;

@ccclass('UIAssetsLoadingFrame')
export class UIAssetsLoadingFrame extends UIFrameBase {
    start() {
        AssetsLoader.instance.on("start_loading", () => this.show());
        AssetsLoader.instance.on("stop_loading", () => this.hide());
    }
}


