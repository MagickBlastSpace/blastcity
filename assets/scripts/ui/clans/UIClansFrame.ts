import { _decorator, Component, Node, Prefab, instantiate, Button } from 'cc';
import { Clans } from '../../game/Clans';
import { UIFrameBase } from '../UIFrameBase';
import { ClanData } from '../../data/ClanData';
import { UIClanInfoPopup } from './UIClanInfoPopup';
import { UIClansObserveFrame } from './UIClansObserveFrame';
import { UITab } from '../main/UITab';
import { UIClansSearchFrame } from './UIClansSearchFrame';
import { UIClansCreateFrame } from './UIClansCreateFrame';
import { UIMyClanFrame } from './UIMyClanFrame';
const { ccclass, property } = _decorator;

@ccclass('UIClansFrame')
export class UIClansFrame extends UIFrameBase {

    @property(UIClanInfoPopup)
    clanInfoPopup: UIClanInfoPopup = null;

    @property(UIClansObserveFrame)
    clansObserveFrame: UIClansObserveFrame = null;
    @property(UIClansSearchFrame)
    clansSearchFrame: UIClansSearchFrame = null;
    @property(UIClansCreateFrame)
    clansCreateFrame: UIClansCreateFrame = null;
    @property(UIMyClanFrame)
    myClanFrame: UIMyClanFrame = null;

    @property(Node)
    joinedState: Node = null;
    @property(Node)
    notJoinedState: Node = null;

    @property([UITab])
    tabs: UITab = [];

    @property([UIFrameBase])
    frames: UIFrameBase = [];

    @property(Clans)
    clans: Clans = null;


    start() {
        this.clans.node.on("refresh", (clansData) => this.refresh(clansData));

        this.clanInfoPopup.node.on("join", (id) => this.join(id));
        this.clanInfoPopup.node.on("leave", (id) => this.leave(id));

        this.clansObserveFrame.node.on("show_info", (data) => this.showClanInfo(data));
        this.clansSearchFrame.node.on("show_info", (data) => this.showClanInfo(data));
        this.myClanFrame.node.on("show_info", (data) => this.showClanInfo(data));
        this.clansCreateFrame.node.on("create", (data, isPrivate) => this.onCreateBtnClick(data, isPrivate));

        for(let i = 0; i < this.tabs.length; i++) {
            this.tabs[i].node.on("tab", (index) => this.showFrame(index));
        }
    }


    refresh(data: ClanData[]) {
        this.clansObserveFrame.refresh(data);
        this.clansSearchFrame.refresh(data);

        let isJoined = this.clans.isJoined();

        this.joinedState.active = isJoined;
        this.notJoinedState.active = !isJoined;

        if(isJoined) {
            this.myClanFrame.refresh(this.clans.getMyClan());
            this.myClanFrame.hideClean();
            this.myClanFrame.show();
        }

        this.clanInfoPopup.refresh();
    }

    show() {
        super.show();

        this.joinedState.active = false;
        this.notJoinedState.active = false;

        this.clans.refresh();

        this.showFrame(0);
    }

    hide() {
        super.hide();

        this.clanInfoPopup.hideClean();

        this.hideAllFrames();
    }


    join(id: number) {
        this.clans.joinClan(id);
    }

    leave(id: number) {
        this.clans.leaveClan(id);
    }


    onCreateBtnClick(data: string, isPrivate: boolean) {
        this.clans.createClan(data, isPrivate);
    }


    showClanInfo(data: ClanData) {
        if(this.clanInfoPopup.node.active) {
            return;
        }

        this.clanInfoPopup.init(data);

        this.clanInfoPopup.show();
    }


    showFrame(index: number) {
        this.setAllBtnsPassive();
        this.hideAllFrames();

        this.tabs[index].setActiveIcon(true);

        this.frames[index].show();
    }


    setAllBtnsPassive() {
        for(let i = 0; i < this.tabs.length; i++) {
            this.tabs[i].setActiveIcon(false);
        }
    }

    hideAllFrames() {
        for(let i = 0; i < this.frames.length; i++) {
            this.frames[i].hideClean();
        }
    }
}


