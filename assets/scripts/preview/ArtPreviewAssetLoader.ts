import {
    assetManager,
    ImageAsset,
    native,
    SpriteFrame,
    Texture2D,
} from 'cc';

import { NATIVE } from 'cc/env';


export class ArtPreviewAssetLoader {

    private static cache =
        new Map<string, Promise<SpriteFrame | null>>();


    private static isArtPreview(): boolean {
        return (
            NATIVE &&
            (globalThis as any).gamepush?.__artPreview === true
        );
    }


    private static findFile(
        relativePath: string,
    ): string | null {

        if (!NATIVE) {
            return null;
        }

        const normalizedPath =
            relativePath
                .replace(/\\/g, '/')
                .replace(/^\/+/, '');

        const searchPaths =
            native.fileUtils.getSearchPaths();

        for (const searchPath of searchPaths) {

            const root =
                searchPath
                    .replace(/\\/g, '/')
                    .replace(/\/?$/, '/');

            const fullPath =
                root + normalizedPath;

            if (
                native.fileUtils.isFileExist(fullPath)
            ) {
                return fullPath;
            }
        }

        return null;
    }


    static loadTile(
        category: string,
        id: string,
    ): Promise<SpriteFrame | null> {

        if (!this.isArtPreview()) {
            return Promise.resolve(null);
        }

        const relativePath =
            `art/tiles/${category}/${id}.png`;

        const absolutePath =
            this.findFile(relativePath);

        if (!absolutePath) {
            return Promise.resolve(null);
        }

        const cached =
            this.cache.get(absolutePath);

        if (cached) {
            return cached;
        }

        console.log(
            `[Art Preview Art] loading: ${absolutePath}`,
        );

        const request =
            new Promise<SpriteFrame | null>(
                (resolve) => {

                    assetManager.loadRemote<ImageAsset>(
                        absolutePath,
                        (error, imageAsset) => {

                            if (
                                error ||
                                !imageAsset
                            ) {
                                console.error(
                                    `[Art Preview Art] failed: ${relativePath}`,
                                    error,
                                );

                                resolve(null);

                                return;
                            }

                            const texture =
                                new Texture2D();

                            texture.image =
                                imageAsset;

                            const spriteFrame =
                                new SpriteFrame();

                            spriteFrame.texture =
                                texture;

                            console.log(
                                `[Art Preview Art] loaded: ${relativePath}`,
                            );

                            resolve(spriteFrame);
                        },
                    );
                },
            );

        this.cache.set(
            absolutePath,
            request,
        );

        return request;
    }
}