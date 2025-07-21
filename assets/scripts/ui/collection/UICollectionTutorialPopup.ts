import { _decorator, Component, Node, Sprite, Label } from 'cc';
import { UIEventTutorialPopup } from '../tutorial/UIEventTutorialPopup';
import { Profile } from '../../game/Profile';
import { UserData } from '../../data/UserData';
const { ccclass, property } = _decorator;

@ccclass('UICollectionTutorialPopup')
export class UICollectionTutorialPopup extends UIEventTutorialPopup {

    @property(Sprite)
    avatar: Sprite = null;
    /*@property(Sprite)
    frame: Sprite = null;*/

    @property(Label)
    playerName: Label = null;
    @property(Label)
    clanName: Label = null;


    show() {
        super.show();

        this.avatar.spriteFrame = Profile.instance.getCurrentAvatar();
        //this.frame.spriteFrame = Profile.instance.getCurrentFrame();

        this.playerName.string = UserData.instance.getPlayerName();
        this.clanName.string = UserData.instance.getClanName();
    }
}


