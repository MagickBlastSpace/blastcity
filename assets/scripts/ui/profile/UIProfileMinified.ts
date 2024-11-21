import { _decorator, Component, Node, Sprite } from 'cc';
import { Profile } from '../../game/Profile';
const { ccclass, property } = _decorator;

@ccclass('UIProfileMinified')
export class UIProfileMinified extends Component {

    @property(Sprite)
    avatar: Sprite = null;
    @property(Sprite)
    frame: Sprite = null;

    @property(Profile)
    profile: Profile;


    start() {
        this.profile.node.on("refresh", () => {
            this.refresh();
        });

        this.refresh();
    }

    
    refresh() {
        this.avatar.spriteFrame = this.profile.getCurrentAvatar();
        this.frame.spriteFrame = this.profile.getCurrentFrame();
    }
}


