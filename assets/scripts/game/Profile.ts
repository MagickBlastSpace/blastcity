declare const gamepush: any;

import { _decorator, Component, Node, SpriteFrame, Color } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('Profile')
export class Profile extends Component {

    @property([SpriteFrame])
    avatars: SpriteFrame[] = [];
    @property([SpriteFrame])
    frames: SpriteFrame[] = [];
    @property([Color])
    colors: Color[] = [];
    @property([SpriteFrame])
    badges: SpriteFrame[] = [];
    @property([Color])
    nickNameColors: Color[] = [];
    @property([Color])
    nickNameOutlinesColors: Color[] = [];

    private avatarId: number = 0;
    private frameId: number = 0;
    private colorId: number = 0;
    private badgeId: number = 0;
    private nameId: number = 0;

    private badgeNames: string[] = ["", "badge_greek_1", "badge_greek_2"];

    public static instance: Profile = null;


    onLoad() {
        Profile.instance = this;
    }


    start() {
        this.setAvatarId(gamepush.player.get('avatar_id'));
        this.setFrameId(gamepush.player.get('frame_id'));
        this.setColorId(gamepush.player.get('color_id'));
        this.setBadgeId(gamepush.player.get('badge_id'));
        this.setNameId(gamepush.player.get('name_color_id'));
    }

    getAvatars(): SpriteFrame[] {
        return this.avatars;
    }

    getFrames(): SpriteFrame[] {
        return this.frames;
    }

    getColors(): Color[] {
        return this.colors;
    }

    getBadges(): SpriteFrame[] {
        return this.badges;
    }

    getNicknames(): Color[] {
        return this.nickNameColors;
    }

    getOutlines(): Color[] {
        return this.nickNameOutlinesColors;
    }


    getAvatarId(): number {
        return this.avatarId;
    }

    getFrameId(): number {
        return this.frameId;
    }

    getColorId(): number {
        return this.colorId;
    }

    getBadgeId(): number {
        return this.badgeId;
    }

    getNameId(): number {
        return this.nameId;
    }


    setAvatarId(id: number) {
        this.avatarId = id;

        gamepush.player.set('avatar_id', this.avatarId);
        gamepush.player.sync();

        this.node.emit("refresh");
    }

    setFrameId(id: number) {
        this.frameId = id;

        gamepush.player.set('frame_id', this.frameId);
        gamepush.player.sync();

        this.node.emit("refresh");
    }

    setColorId(id: number) {
        this.colorId = id;

        gamepush.player.set('color_id', this.colorId);
        gamepush.player.sync();

        this.node.emit("refresh");
    }

    setBadgeId(id: number) {
        if(!this.isBadgeAvailable(id)) {
            return;
        }

        this.badgeId = id;

        gamepush.player.set('badge_id', this.badgeId);
        gamepush.player.sync();

        this.node.emit("refresh");
    }

    setNameId(id: number) {
        this.nameId = id;

        gamepush.player.set('name_color_id', this.nameId);
        gamepush.player.sync();

        this.node.emit("refresh");
    }


    getCurrentAvatar(): SpriteFrame {
        return this.avatars[this.avatarId];
    }

    getCurrentFrame(): SpriteFrame {
        return this.frames[this.frameId];
    }

    getCurrentColor(): Color {
        return this.colors[this.colorId];
    }

    getCurrentBadge(): SpriteFrame {
        return this.badges[this.badgeId];
    }

    getCurrentName(): Color {
        return this.nickNameColors[this.nameId];
    }

    getCurrentOutline(): Color {
        return this.nickNameOutlinesColors[this.nameId];
    }


    getAvatarById(id: number): SpriteFrame {
        if(id < this.avatars.length) {
            return this.avatars[id];
        }
        return this.avatars[0];
    }

    getFrameById(id: number): SpriteFrame {
        if(id < this.frames.length) {
            return this.frames[id];
        }
        return this.frames[0];
    }

    getColorById(id: number): Color {
        if(id < this.colors.length) {
            return this.colors[id];
        }
        return this.colors[0];
    }

    getBadgeById(id: number): SpriteFrame {
        if(id < this.badges.length) {
            return this.badges[id];
        }
        return this.badges[0];
    }

    getNameById(id: number): Color {
        if(id < this.nickNameColors.length) {
            return this.nickNameColors[id];
        }
        return this.nickNameColors[0];
    }

    getOutlineById(id: number): Color {
        if(id < this.nickNameOutlinesColors.length) {
            return this.nickNameOutlinesColors[id];
        }
        return this.nickNameOutlinesColors[0];
    }


    isBadgeAvailable(id: number): boolean {
        if(id === 0 || this.badgeNames[id] === "") {
            return true;
        }
        
        const hasReward = gamepush.rewards.has(this.badgeNames[id]);

        return hasReward;
    }
}


