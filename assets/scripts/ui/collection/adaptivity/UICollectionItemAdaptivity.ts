import { _decorator, Component, Node, Layout, Widget, view, UITransform, Vec3, Size, Mask } from 'cc';
import { UIAdaptivityBase } from '../../UIAdaptivityBase';
const { ccclass, property } = _decorator;

@ccclass('UICollectionItemAdaptivity')
export class UICollectionItemAdaptivity extends UIAdaptivityBase {

    @property(Node)
    container: Node = null;

    private basic_container_size: number = 653;

    private mobileScaleMul: number = 0.5;


    refresh() {
        const visibleSize = view.getVisibleSize();
    
        let w = visibleSize.width;
        let h = visibleSize.height;

        if (w > h) {
            const ratio = w / h;
            if(ratio > 1.5) {
                this.makeDesktopVariation(w, h);
            }
            else {
                this.makeTabletVariation(w, h);
            }
        } else {
            this.makeMobileVariation(w, h);
        }
    }

    makeDesktopVariation(w: number, h: number) {
        const x = 0.1294 * h;

        const container_Size = 1.2692 * x;
        const container_Scale = container_Size / this.basic_container_size;

        this.container.setScale(new Vec3(container_Scale, container_Scale, 1));
    }

    makeTabletVariation(w: number, h: number) {
        this.makeDesktopVariation(w, h);
    }

    makeMobileVariation(w: number, h: number) {
        const x = 0.30626 * w * this.mobileScaleMul;

        const container_Size = x;
        const container_Scale = container_Size / this.basic_container_size;

        this.container.setScale(new Vec3(container_Scale, container_Scale, 1));
    }
}


