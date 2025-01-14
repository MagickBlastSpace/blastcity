import { _decorator, Component, Node, SpriteFrame, Sprite, assetManager } from 'cc';
import { AssetsLoader } from '../../utils/AssetsLoader';
import { UIFrameBase } from '../UIFrameBase';
const { ccclass, property } = _decorator;

@ccclass('UIAssetsLoadingFrame')
export class UIAssetsLoadingFrame extends UIFrameBase {

    @property([SpriteFrame])
    screens: SpriteFrame[] = [];

    @property(Sprite)
    screen: Sprite = null;

    private isInited: boolean = false;


    onLoad() {
        //this.loadAsstets();
    }

    show() {
        super.show();

        this.setRandomLoadingScreen();
    }


    setRandomLoadingScreen() {
        if (this.screens.length > 0) {
            const randomIndex = Math.floor(Math.random() * this.screens.length);
    
            this.screen.spriteFrame = this.screens[randomIndex];
        } else {
            console.log("Screens array is empty. Cannot set random loading screen.");
        }
    }


    loadAssets() {
        if(this.isInited) {
            return;
        }

        this.isInited = true;
        
        this.screens = [];

        assetManager.loadBundle("loading", (err, bundle) => {
            if (err) {
                console.error(`Failed to load bundle: loading`, err);
                return;
            }

            console.log(`Successfully loaded bundle: loading"`);


            bundle.load("loading_bomb/spriteFrame", SpriteFrame, (err, spriteFrame) => {
                if (err) {
                    console.error(`Failed to load prefab: loading_bomb`, err);
                    return;
                }

                console.log(`Successfully loaded prefab: loading_bomb`);

                this.screens.push(spriteFrame);
            });

            bundle.load("loading_rocket/spriteFrame", SpriteFrame, (err, spriteFrame) => {
                if (err) {
                    console.error(`Failed to load prefab: loading_rocket`, err);
                    return;
                }

                console.log(`Successfully loaded prefab: loading_rocket`);

                this.screens.push(spriteFrame);
            });

            bundle.load("loading_discoball/spriteFrame", SpriteFrame, (err, spriteFrame) => {
                if (err) {
                    console.error(`Failed to load prefab: loading_discoball`, err);
                    return;
                }

                console.log(`Successfully loaded prefab: loading_discoball`);

                this.screens.push(spriteFrame);
            });

            bundle.load("loading_bomb_bomb/spriteFrame", SpriteFrame, (err, spriteFrame) => {
                if (err) {
                    console.error(`Failed to load prefab: loading_bomb_bomb`, err);
                    return;
                }

                console.log(`Successfully loaded prefab: loading_bomb_bomb`);

                this.screens.push(spriteFrame);
            });

            bundle.load("loading_bomb_rocket/spriteFrame", SpriteFrame, (err, spriteFrame) => {
                if (err) {
                    console.error(`Failed to load prefab: loading_bomb_rocket`, err);
                    return;
                }

                console.log(`Successfully loaded prefab: loading_bomb_rocket`);

                this.screens.push(spriteFrame);
            });

            bundle.load("loading_rocket_rocket/spriteFrame", SpriteFrame, (err, spriteFrame) => {
                if (err) {
                    console.error(`Failed to load prefab: loading_rocket_rocket`, err);
                    return;
                }

                console.log(`Successfully loaded prefab: loading_rocket_rocket`);

                this.screens.push(spriteFrame);

                this.setRandomLoadingScreen();
            });
        });
    }
}


