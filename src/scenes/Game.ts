import { Scene } from 'phaser';

export class Game extends Scene {

    private scaleSize: number = 5;
    private cursors: Phaser.Types.Input.Keyboard.CursorKeys;
    private frameRate: number = 10;
    private velocity: number = 2;

    private layerMountain: Phaser.Tilemaps.TilemapLayer | null | undefined;
    private player: Phaser.Physics.Arcade.Sprite;

    /*  private controls: Phaser.Cameras.Controls.FixedKeyControl; */

    constructor() {
        super('Game');
    }


    preload() {
        this.load.setPath('assets');

        this.load.image('tiles', 'mountain_landscape.png');

        this.load.spritesheet('player', 'the_knight.png', {
            frameWidth: 32,
            frameHeight: 32
        });



    }

    create() {
        const centerX = this.cameras.main.width / 2;
        const centerY = this.cameras.main.height / 2;

        const map = this.make.tilemap({
            tileWidth: 32,
            tileHeight: 32,
            width: 10,
            height: 10
        })

        const tileset = map.addTilesetImage('tiles');

        if (!tileset) {
            console.error('Error: No se pudo cargar el tileset.');
            return;
        }

        this.layerMountain = map.createBlankLayer('terrain', tileset, centerX - 160, centerY - 160)?.setScale(this.scaleSize);

        if (!this.layerMountain) {
            console.error('Error: No se pudo crear la capa.');
            return;
        }

        const roadLayer = [
            [11, 12, 12, 12, 12, 12, 12, 12, 12, 13],
            [27, 28, 28, 28, 28, 28, 28, 28, 28, 29],
            [27, 28, 28, 28, 28, 28, 28, 28, 28, 29],
            [27, 28, 28, 28, 28, 28, 28, 28, 28, 29],
            [27, 28, 28, 28, 28, 28, 28, 28, 28, 29],
            [27, 28, 28, 28, 28, 28, 28, 28, 28, 29],
            [27, 28, 28, 28, 28, 28, 28, 28, 28, 29],
            [43, 44, 44, 44, 44, 44, 44, 44, 44, 45],
        ];

        for (let y = 0; y < roadLayer.length; y++) {
            for (let x = 0; x < roadLayer[y].length; x++) {
                this.layerMountain.putTileAt(roadLayer[y][x], x, y)
            }
        }

        this.player = this.physics.add.sprite(centerX, centerY, 'player').setScale(this.scaleSize);

        /* this.cameras.main.startFollow(this.player, false, 0, 0); */
        /* this.cameras.main.setBounds(0, 0, map.widthInPixels, map.heightInPixels); */


        this.layerMountain.setCollision(5); // El tile 5 es un "camino bloqueado"
        /*  this.physics.add.collider(this.player, this.layerMountain); */

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
        /* this.controls.update(delta); */
    }

    moveMap(): void {
        if (this.cursors.left.isDown) {
            this.cameras.main.scrollX -= this.velocity;
        } else if (this.cursors.right.isDown) {
            this.cameras.main.scrollX += this.velocity;
        } else if (this.cursors.up.isDown) {
            this.cameras.main.scrollY -= this.velocity;
        } else if (this.cursors.down.isDown) {
            this.cameras.main.scrollY += this.velocity;
        }
    }


    moveCharacter(): void {
        if (this.cursors.left.isDown) {
            this.player.x -= this.velocity;
            this.player.play('walk-left', true);
        } else if (this.cursors.right.isDown) {
            this.player.x += this.velocity;
            this.player.play('walk-right', true);
        } else if (this.cursors.up.isDown) {
            this.player.y -= this.velocity;
            this.player.play('walk-up', true);
        } else if (this.cursors.down.isDown) {
            this.player.y += this.velocity;
            this.player.play('walk-down', true);
        } else {
            this.player.stop();
        }

        /* if (this.cursors.down.isDown) {
            this.player.setVelocityY(this.velocity);
            this.player.setVelocityX(0);
            this.player.play('walk-down', true);
        } else if (this.cursors.up.isDown) {
            this.player.setVelocityY(-this.velocity);
            this.player.setVelocityX(0);
            this.player.play('walk-up', true);
        } else if (this.cursors.right.isDown) {
            this.player.setVelocityX(this.velocity);
            this.player.setVelocityY(0);
            this.player.play('walk-right', true);
        } else if (this.cursors.left.isDown) {
            this.player.setVelocityX(-this.velocity);
            this.player.setVelocityY(0);
            this.player.play('walk-left', true);
        } else {
            this.player.setVelocityY(0);
            this.player.setVelocityX(0);
            this.player.stop();
        } */

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

}
