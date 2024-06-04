import { _decorator, Component, Node, Button } from 'cc';
import { UIMainMenuButton } from './UIMainMenuButton';
import { UIMainMenuFrame } from './UIMainMenuFrame';
const { ccclass, property } = _decorator;

@ccclass('UIMainMenu')
export class UIMainMenu extends Component {

    @property(Button)
    shopBtn: Button = null;
    @property(Button)
    clanBtn: Button = null;
    @property(Button)
    playBtn: Button = null;
    @property(Button)
    tbdBtn: Button = null;
    @property(Button)
    tbd2Btn: Button = null;

    @property([UIMainMenuButton])
    buttonsUi: UIMainMenuButton[] = [];

    @property([UIMainMenuFrame])
    framesUi: UIMainMenuFrame[] = [];


    start() {
        this.shopBtn.node.on(Button.EventType.CLICK, this.onBtnShopClick, this);
        this.clanBtn.node.on(Button.EventType.CLICK, this.onBtnClanClick, this);
        this.playBtn.node.on(Button.EventType.CLICK, this.onBtnPlayClick, this);
        this.tbdBtn.node.on(Button.EventType.CLICK, this.onBtnTbdClick, this);
        this.tbd2Btn.node.on(Button.EventType.CLICK, this.onBtnTbd2Click, this);

        this.setAllBtnsPassive();
        this.onBtnPlayClick();
    }


    onBtnShopClick() {
        this.onMainMenuBtnClick(0);
    }
    
    onBtnClanClick() {
        this.onMainMenuBtnClick(1);
    }

    onBtnPlayClick() {
        this.onMainMenuBtnClick(2);
    }

    onBtnTbdClick() {
        this.onMainMenuBtnClick(3);
    }

    onBtnTbd2Click() {
        this.onMainMenuBtnClick(4);
    }

    
    onMainMenuBtnClick(index: number) {
        this.setAllBtnsPassive();
        this.hideAllFrames();

        this.buttonsUi[index].setActiveIcon(true);

        this.framesUi[index].show();
    }


    setAllBtnsPassive() {
        for(let i = 0; i < this.buttonsUi.length; i++) {
            this.buttonsUi[i].setActiveIcon(false);
        }
    }

    hideAllFrames() {
        for(let i = 0; i < this.framesUi.length; i++) {
            this.framesUi[i].hide();
        }
    }
}


