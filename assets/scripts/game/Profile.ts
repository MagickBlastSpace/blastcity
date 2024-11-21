declare const gamepush: any;

import { _decorator, Component, Node, SpriteFrame } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('Profile')
export class Profile extends Component {

    @property([SpriteFrame])
    avatars: SpriteFrame[] = [];
    @property([SpriteFrame])
    frames: SpriteFrame[] = [];
    @property([SpriteFrame])
    colors: SpriteFrame[] = [];
    @property([SpriteFrame])
    badges: SpriteFrame[] = [];

    private avatarId: number = 0;
    private frameId: number = 0;
    private colorId: number = 0;
    private badgeId: number = 0;


    start() {
        this.setAvatarId(gamepush.player.get('avatar_id'));
        this.setFrameId(gamepush.player.get('frame_id'));
    }

    getAvatars(): SpriteFrame[] {
        return this.avatars;
    }

    getFrames(): SpriteFrame[] {
        return this.frames;
    }

    getColors(): SpriteFrame[] {
        return this.colors;
    }

    getBadges(): SpriteFrame[] {
        return this.badges;
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

        this.node.emit("refresh");
    }

    setBadgeId(id: number) {
        this.badgeId = id;

        this.node.emit("refresh");
    }


    getCurrentAvatar(): SpriteFrame {
        return this.avatars[this.avatarId];
    }

    getCurrentFrame(): SpriteFrame {
        return this.frames[this.frameId];
    }

    getCurrentColor(): SpriteFrame {
        return this.colors[this.colorId];
    }

    getCurrentBadge(): SpriteFrame {
        return this.badges[this.badgeId];
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

    getColorById(id: number): SpriteFrame {
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
}


