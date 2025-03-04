import { Scene } from 'phaser';

export class Game extends Scene {

    private readonly velocity: number = 300;
    private readonly spriteSize: number = 32;

    private velocityX: number = this.velocity;
    private velocityY: number = this.velocity;

    private scaleSize: number = 1;
    private cursors: Phaser.Types.Input.Keyboard.CursorKeys;
    private frameRate: number = 10;

    private layerBackground: Phaser.Tilemaps.TilemapLayer | null | undefined;
    private layerDecoratorUp: Phaser.Tilemaps.TilemapLayer | null | undefined;
    private layerDecoratorBack: Phaser.Tilemaps.TilemapLayer | null | undefined;
    private player: Phaser.Physics.Arcade.Sprite;

    constructor() {
        super('Game');
    }


    preload() {
        this.load.setPath('assets');
        // Cargar la hoja de sprites (tileset)
        this.load.tilemapTiledJSON('map', 'maps/desert/desert.json');
        this.load.image('mountain', 'maps/desert/mountain_landscape.png');
        this.load.spritesheet('player', 'the_knight.png', { frameWidth: this.spriteSize, frameHeight: this.spriteSize });
    }

    create() {
        const centerX = (this.cameras.main.width / 2);
        const centerY = (this.cameras.main.height / 2);

        const map = this.make.tilemap({ key: 'map' });

        const tilesetMountain = map.addTilesetImage('mountain_landscape', 'mountain');

        if (!tilesetMountain) {
            return;
        }

        const positionXLayer = centerX - (map.widthInPixels / 2);
        const positionYLayer = centerY - (map.heightInPixels / 2);

        this.layerBackground = map.createLayer('background', tilesetMountain, positionXLayer, positionYLayer)?.setScale(this.scaleSize);
        this.layerDecoratorBack = map.createLayer('decoration-back', tilesetMountain, positionXLayer, positionYLayer)?.setScale(this.scaleSize);
        this.layerDecoratorUp = map.createLayer('decoration-up', tilesetMountain, positionXLayer, positionYLayer)?.setScale(this.scaleSize);

        if (!this.layerBackground || !this.layerDecoratorBack || !this.layerDecoratorUp) {
            return;
        }

        this.player = this.physics.add.sprite(centerX, centerY, 'player').setScale(this.scaleSize);

        this.player.setCollideWorldBounds(true);
        this.cameras.main.startFollow(this.player);

        this.layerBackground.setDepth(0);
        this.layerDecoratorBack.setDepth(1);
        this.player.setDepth(2);
        this.layerDecoratorUp.setDepth(3);

        const collisionObjects = map.getObjectLayer('collisions');

        if (collisionObjects) {
            // Crear un grupo de colisiones estáticas
            const collisionGroup = this.physics.add.staticGroup();

            collisionObjects.objects.forEach(obj => {
                const collidesProp = obj.properties.find((p: any) => p.name === 'collides' && p.value);
                if (collidesProp) {
                    const positionX = positionXLayer + (obj.x || 0) + (obj.width || 0) / 2;
                    const positionY = positionYLayer + (obj.y || 0) + (obj.height || 0) / 2;

                    const collisionRect = collisionGroup.create(positionX * this.scaleSize, positionY * this.scaleSize, undefined);
                    collisionRect.setSize((obj.width || 32) * this.scaleSize, (obj.height || 32) * this.scaleSize);
                    collisionRect.setVisible(false); // Oculta las colisiones
                }
            });

            // Detectar colisiones entre el jugador y las áreas
            this.physics.add.collider(this.player, collisionGroup);
        }



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

        let axisH = 0;
        let axisV = 0;

        let run = 0;
        let isPressedR1 = 0;

        if (this.input.gamepad && this.input.gamepad.total > 0) {
            const pad = this.input.gamepad.getPad(0);
            if (pad.axes.length) {
                axisH = pad.axes[0].getValue();
                axisV = pad.axes[1].getValue();
            }
            isPressedR1 = pad.R1;
        }
        
        if (this.cursors.shift.isDown || isPressedR1 === 1) {
            run = 100;
        } else {
            run = 0;
        }


        if (this.cursors.left.isDown || axisH < 0) {
            velocityX += -this.velocityX - run;
            this.player.play('walk-left', true);
        } else if (this.cursors.right.isDown || axisH > 0) {
            velocityX += this.velocityX + run;
            this.player.play('walk-right', true);
        } else if (this.cursors.up.isDown || axisV < 0) {
            velocityY += -this.velocityY - run;
            this.player.play('walk-up', true);
        } else if (this.cursors.down.isDown || axisV > 0) {
            velocityY += this.velocityY + run;
            this.player.play('walk-down', true);
        } else if ((velocityX === 0 && velocityY === 0) && (axisV == 0 && axisV == 0)) {
            this.player.stop();
        }

        this.onMoveCharacter(velocityX, velocityY);
    }

    onMoveCharacter(velocityX: number, velocityY: number) {

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

}
