import { _decorator, Component, Node, assetManager, AssetManager, Prefab } from 'cc';
import { Field } from '../game/Field';
import { UIAssetsLoadingFrame } from '../ui/loading/UIAssetsLoadingFrame';
import { LevelData } from '../data/GameData';
const { ccclass, property } = _decorator;

@ccclass('AssetsLoader')
export class AssetsLoader extends Component {

    @property(Node)
    field: Node = null;

    @property(UIAssetsLoadingFrame)
    loadingFrame: UIAssetsLoadingFrame = null;

    public static instance: AssetsLoader = null;

    private gamplayAssetsCounter: number = 0;
    private maxGamplayAssets: number = 0;

    private loadedGameplayBundlesCount: number = 0;
    private gameplayBundlesCount: number = 4;

    private fieldComp: Field = null;

    private currentSpecs: string[] = [];


    onLoad() {
        AssetsLoader.instance = this;
    }

    start() {
        this.fieldComp = this.field.getComponent("Field");
    }


    initGameplay(level: LevelData) {
        this.currentSpecs = [];

        for(let i = 0; i < level.specialTiles.length; i++) {
            let spec = level.specialTiles[i].id;

            if(!this.currentSpecs.includes(spec)) {
                this.currentSpecs.push(spec);
            }
        }

        for(let i = 0; i < level.statuses.length; i++) {
            let spec = level.statuses[i].id;

            if(!this.currentSpecs.includes(spec)) {
                this.currentSpecs.push(spec);
            }
        }

        for(let i = 0; i < level.goals.length; i++) {
            let spec = level.goals[i].id;

            if(!this.currentSpecs.includes(spec)) {
                this.currentSpecs.push(spec);
            }
        }
    }
    
    loadGameplayAssets() {
        this.startLoading();

        this.maxGamplayAssets = 0;
        this.loadedGameplayBundlesCount = 0;

        this.loadBaseBundle();
        this.loadSpecBundle("spec_tiles", false);
        this.loadSpecBundle("big_spec_tiles", false);
        this.loadSpecBundle("statuses", true);
    }


    startLoading() {
        this.loadingFrame.show();
    }

    stopLoading() {
        this.loadingFrame.hide();
    }


    private checkLoadCompletion() {
        this.gamplayAssetsCounter++;

        if(this.gamplayAssetsCounter >= this.maxGamplayAssets && this.loadedGameplayBundlesCount >= this.gameplayBundlesCount) {
            this.fieldComp.setAssetsAsLoaded();

            this.stopLoading();
        }
    }


    private loadBaseBundle() {
        assetManager.loadBundle("base_tiles", (err, bundle) => {
            if (err) {
                console.error(`Failed to load bundle: base_tiles`, err);
                return;
            }

            console.log(`Successfully loaded Gameplay bundle: base_tiles`);

            const assets = bundle.getDirWithPath('/', Prefab);

            console.log(`Assets in bundle: ${assets.length}`);

            this.maxGamplayAssets += assets.length;
            this.loadedGameplayBundlesCount++;
            
            bundle.load("Tile", Prefab, (err, prefab) => {
                if (err) {
                    console.error(`Failed to load prefab: Tile`, err);
                    return;
                }

                this.fieldComp.setTilePrefab(prefab);
                this.checkLoadCompletion();
            });

            bundle.load("EmptyTile", Prefab, (err, prefab) => {
                if (err) {
                    console.error(`Failed to load prefab: EmptyTile`, err);
                    return;
                }

                this.fieldComp.setEmptyTilePrefab(prefab);
                this.checkLoadCompletion();
            });

            bundle.load("Bomb", Prefab, (err, prefab) => {
                if (err) {
                    console.error(`Failed to load prefab: Bomb`, err);
                    return;
                }

                this.fieldComp.setBombPrefab(prefab);
                this.checkLoadCompletion();
            });

            bundle.load("Rocket", Prefab, (err, prefab) => {
                if (err) {
                    console.error(`Failed to load prefab: Rocket`, err);
                    return;
                }

                this.fieldComp.setRocketPrefab(prefab);
                this.checkLoadCompletion();
            });

            bundle.load("Discoball", Prefab, (err, prefab) => {
                if (err) {
                    console.error(`Failed to load prefab: Discoball`, err);
                    return;
                }

                this.fieldComp.setDiscoballPrefab(prefab);
                this.checkLoadCompletion();
            });
        });
    }

    private loadSpecBundle(bundleName: string, isStatus: boolean) {
        assetManager.loadBundle(bundleName, (err, bundle) => {
            if (err) {
                console.error(`Failed to load bundle: spec_tiles`, err);
                return;
            }

            console.log(`Successfully loaded Gameplay bundle: spec_tiles`);
            
            const assets = bundle.getDirWithPath('/', Prefab);

            console.log(`Assets in bundle: ${assets.length}`);

            this.maxGamplayAssets += assets.length;
            this.loadedGameplayBundlesCount++;

            assets.forEach(assetInfo => {
                const prefabPath = assetInfo.path;
                const prefabName = prefabPath.toLowerCase();

                if(this.currentSpecs.includes(prefabName)) {
                    bundle!.load(prefabPath, Prefab, (err, prefab) => {
                        if (err) {
                            console.error(`Failed to load prefab: ${prefabPath}`, err);
                            return;
                        }
    
                        console.log(`Successfully loaded prefab: ${prefabPath}`);
    
                        if(isStatus) {
                            this.fieldComp.addStatusPrefab(prefab, prefabName);
                        }
                        else {
                            this.fieldComp.addSpecialPrefab(prefab, prefabName);
                        }
    
                        this.checkLoadCompletion();
                    });
                }
                else {
                    this.checkLoadCompletion();
                }
            });
        });
    }
}


