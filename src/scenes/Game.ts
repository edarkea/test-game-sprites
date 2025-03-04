import { Scene } from 'phaser';

export class Game extends Scene {

    private readonly velocity: number = 200;
    private velocityX: number = this.velocity;
    private velocityY: number = this.velocity;


    private scaleSize: number = 1;
    private cursors: Phaser.Types.Input.Keyboard.CursorKeys;
    private frameRate: number = 10;

    private layerBackground: Phaser.Tilemaps.TilemapLayer | null | undefined;
    private layerDecorator: Phaser.Tilemaps.TilemapLayer | null | undefined;

    private player: Phaser.Physics.Arcade.Sprite;

    constructor() {
        super('Game');
    }


    preload() {
        this.load.setPath('assets');
        // Cargar la hoja de sprites (tileset)
        this.load.tilemapTiledJSON('map', 'maps/desert.json');
        this.load.image('mountain', 'maps/mountain_landscape.png');
        this.load.spritesheet('player', 'the_knight.png', { frameWidth: 32, frameHeight: 32 });
    }

    create() {
        const centerX = this.cameras.main.width / 2;
        const centerY = this.cameras.main.height / 2;

        const map = this.make.tilemap({ key: 'map' });
        const tilesetMountain = map.addTilesetImage('mountain_landscape', 'mountain');

        if (!tilesetMountain) {
            return;
        }

        this.layerBackground = map.createLayer('background', tilesetMountain, centerX - 160, centerY - 160)?.setScale(this.scaleSize);
        this.layerDecorator = map.createLayer('decoration', tilesetMountain, centerX - 160, centerY - 160)?.setScale(this.scaleSize);
        if (!this.layerBackground || !this.layerDecorator) {
            return;
        }

        this.layerDecorator.setCollisionByProperty({ collides: true });
        /* this.showDebugCollisions(); */

        this.player = this.physics.add.sprite(centerX, centerY, 'player').setScale(this.scaleSize);
        /* this.cameras.main.setBounds(0, 0, map.widthInPixels, map.heightInPixels); */
        this.player.setCollideWorldBounds(true);

        this.physics.add.collider(this.player, this.layerDecorator);

        this.cameras.main.startFollow(this.player);



        if (this.input.keyboard) {
            this.cursors = this.input.keyboard.createCursorKeys();
            this.makeCharacter(this.anims)
        }

    }

    makeCharacter(anims: Phaser.Animations.AnimationManager) {
        anims.create({
            key: 'walk-down',
            frames: [
                { key: 'player', frame: 0 },
                { key: 'player', frame: 1 },
                { key: 'player', frame: 0 },
                { key: 'player', frame: 1 },
            ],
            frameRate: this.frameRate,
            repeat: -1,
        });

        anims.create({
            key: 'walk-up',
            frames: [
                { key: 'player', frame: 2 },
                { key: 'player', frame: 3 },
                { key: 'player', frame: 2 },
                { key: 'player', frame: 3 },
            ],
            frameRate: this.frameRate,
            repeat: -1,
        });

        anims.create({
            key: 'walk-right',
            frames: [
                { key: 'player', frame: 4 },
                { key: 'player', frame: 5 },
                { key: 'player', frame: 4 },
                { key: 'player', frame: 6 },
            ],
            frameRate: this.frameRate,
            repeat: -1,
        });

        anims.create({
            key: 'walk-left',
            frames: [
                { key: 'player', frame: 4 },
                { key: 'player', frame: 5 },
                { key: 'player', frame: 4 },
                { key: 'player', frame: 6 },
            ],
            frameRate: this.frameRate,
            repeat: -1,
        });
    }


    update(): void {
        this.moveCharacter();
        this.moveMap();
    }

    moveMap(): void {
        if (this.cursors.left.isDown) {
            this.cameras.main.scrollX -= this.velocityX;
        } else if (this.cursors.right.isDown) {
            this.cameras.main.scrollX += this.velocityX;
        } else if (this.cursors.up.isDown) {
            this.cameras.main.scrollY -= this.velocityY;
        } else if (this.cursors.down.isDown) {
            this.cameras.main.scrollY += this.velocityY;
        }
    }


    moveCharacter(): void {

        let velocityX = 0;
        let velocityY = 0;

        if (this.cursors.left.isDown) {
            velocityX = -this.velocityX;
            this.player.play('walk-left', true);
        } else if (this.cursors.right.isDown) {
            velocityX = this.velocityX;
            this.player.play('walk-right', true);
        } else if (this.cursors.up.isDown) {
            velocityY = -this.velocityY;
            this.player.play('walk-up', true);
        } else if (this.cursors.down.isDown) {
            velocityY = this.velocityY;
            this.player.play('walk-down', true);
        } else if (velocityX === 0 && velocityY === 0) {
            this.player.stop();
        }

        // Aquí aplicamos la velocidad al jugador
        this.player.setVelocity(velocityX, velocityY);

        const currentFrame = this.player.anims.currentFrame?.index;

        if (this.player.anims.currentAnim?.key === 'walk-down' || this.player.anims.currentAnim?.key === 'walk-up') {
            if (currentFrame === 2) {
                this.player.setFlipX(true);
            } else {
                this.player.setFlipX(false);
            }
        }

        if (this.player.anims.currentAnim?.key === 'walk-right') {
            this.player.setFlipX(false);
        }

        if (this.player.anims.currentAnim?.key === 'walk-left') {
            this.player.setFlipX(true);
        }
    }

    /* private showDebugCollisions(): void {
        const debugGraphics = this.add.graphics().setAlpha(0.7);
        this.layerDecorator?.renderDebug(debugGraphics, {
            tileColor: null,
            collidingTileColor: new Phaser.Display.Color(243, 234, 48, 255),
        });
    } */

}
