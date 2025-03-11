import { Scene } from 'phaser';

export class Game extends Scene {

    private readonly velocity: number = 300;
    private readonly spriteSize: number = 32;

    private velocityX: number = this.velocity;
    private velocityY: number = this.velocity;

    private scaleSize: number = 1;
    private cursors: Phaser.Types.Input.Keyboard.CursorKeys;
    private frameRate: number = 5;

    private layerBackground: Phaser.Tilemaps.TilemapLayer | null | undefined;
    private layerDecoratorUp: Phaser.Tilemaps.TilemapLayer | null | undefined;
    private layerDecoratorBack: Phaser.Tilemaps.TilemapLayer | null | undefined;

    private playerContainer!: Phaser.GameObjects.Container;
    private player: Phaser.Physics.Arcade.Sprite;
    private weapon!: Phaser.GameObjects.Sprite;

    constructor() {
        super('Game');
    }


    preload() {
        this.load.setPath('assets');
        this.load.tilemapTiledJSON('map', 'maps/castle/castle.json');
        this.load.image('Castle2', 'maps/castle/Castle2.png');
        this.load.spritesheet('player', 'the_knight.png', { frameWidth: this.spriteSize, frameHeight: this.spriteSize });
        this.load.spritesheet('weapon', 'weapon-sword.png', { frameWidth: this.spriteSize, frameHeight: this.spriteSize });
    }

    create() {
        const centerX = (this.cameras.main.width / 2);
        const centerY = (this.cameras.main.height / 2);

        const map = this.make.tilemap({ key: 'map' });

        const tilesetMountain = map.addTilesetImage('Castle2', 'Castle2');

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

        this.player = this.physics.add.sprite(this.spriteSize / 2, this.spriteSize / 2, 'player').setScale(this.scaleSize);
        this.weapon = this.physics.add.sprite(this.spriteSize / 2, this.spriteSize / 2 + 8, 'weapon').setScale(this.scaleSize);

        this.playerContainer = this.add.container(centerX - this.spriteSize / 2, centerY - this.spriteSize / 2, [this.player, this.weapon]);
        this.physics.world.enable(this.playerContainer);
        
        const container = this.playerContainer.body as Phaser.Physics.Arcade.Body;

        container.setSize(this.spriteSize, this.spriteSize);
        container.setCollideWorldBounds(true);

        this.cameras.main.startFollow(this.playerContainer);

        this.layerBackground.setDepth(0);
        this.layerDecoratorBack.setDepth(1);
        this.playerContainer.setDepth(2);
        this.layerDecoratorUp.setDepth(4);

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
            this.physics.add.collider(this.playerContainer, collisionGroup);
        }



        if (this.input.keyboard) {
            this.cursors = this.input.keyboard.createCursorKeys();
            this.animateCharacter(this.anims)
            this.animateWeapon(this.anims);
        }

    }

    animateWeapon(anims: Phaser.Animations.AnimationManager) {
        anims.create({
            key: 'weapon-down',
            frames: [
                { key: 'weapon', frame: 0 },
                { key: 'weapon', frame: 1 },
                { key: 'weapon', frame: 0 },
                { key: 'weapon', frame: 1 },
            ],
            frameRate: this.frameRate,
            repeat: -1,
        });

        anims.create({
            key: 'weapon-up',
            frames: [
                { key: 'weapon', frame: 2 },
                { key: 'weapon', frame: 3 },
                { key: 'weapon', frame: 2 },
                { key: 'weapon', frame: 3 },
            ],
            frameRate: this.frameRate,
            repeat: -1,
        });

        anims.create({
            key: 'weapon-right',
            frames: [
                { key: 'weapon', frame: 4 },
                { key: 'weapon', frame: 5 },
                { key: 'weapon', frame: 4 },
                { key: 'weapon', frame: 6 },
            ],
            frameRate: this.frameRate,
            repeat: -1,
        });

        anims.create({
            key: 'weapon-left',
            frames: [
                { key: 'weapon', frame: 4 },
                { key: 'weapon', frame: 5 },
                { key: 'weapon', frame: 4 },
                { key: 'weapon', frame: 6 },
            ],
            frameRate: this.frameRate,
            repeat: -1,
        });
    }

    animateCharacter(anims: Phaser.Animations.AnimationManager) {
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
            this.weapon.play('weapon-left', true);
        } else if (this.cursors.right.isDown || axisH > 0) {
            velocityX += this.velocityX + run;
            this.player.play('walk-right', true);
            this.weapon.play('weapon-right', true);
        } else if (this.cursors.up.isDown || axisV < 0) {
            velocityY += -this.velocityY - run;
            this.player.play('walk-up', true);
            this.weapon.play('weapon-up', true);
        } else if (this.cursors.down.isDown || axisV > 0) {
            velocityY += this.velocityY + run;
            this.player.play('walk-down', true);
            this.weapon.play('weapon-down', true);
        } else if ((velocityX === 0 && velocityY === 0) && (axisV == 0 && axisV == 0)) {
            this.player.stop();
            this.weapon.stop();
        }

        this.onMoveCharacter(velocityX, velocityY);
    }

    onMoveCharacter(velocityX: number, velocityY: number) {
        const container = this.playerContainer.body as Phaser.Physics.Arcade.Body;

        // Mueve el contenedor
        container.setVelocity(velocityX, velocityY);

        // Actualiza las animaciones según la dirección
        if (velocityX < 0) {
            this.player.play('walk-left', true);
            this.weapon.play('weapon-left', true);
        } else if (velocityX > 0) {
            this.player.play('walk-right', true);
            this.weapon.play('weapon-right', true);
        } else if (velocityY < 0) {
            this.player.play('walk-up', true);
            this.weapon.play('weapon-up', true);
        } else if (velocityY > 0) {
            this.player.play('walk-down', true);
            this.weapon.play('weapon-down', true);
        } else {
            this.player.stop();
            this.weapon.stop();
        }


        const currentFrame = this.player.anims.currentFrame?.index;
        const currentFrameWeapon = this.weapon.anims.currentFrame?.index;

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

        if (this.weapon.anims.currentAnim?.key === 'weapon-up' || this.weapon.anims.currentAnim?.key === 'weapon-down') {
            this.weapon.setFlipX(false);
            this.weapon.setPosition(this.player.x, this.player.y + 8);
        }

        if (this.weapon.anims.currentAnim?.key === 'weapon-right') {
            this.weapon.setFlipX(false);
            if (currentFrameWeapon === 1 || currentFrameWeapon === 3) {
                this.weapon.setPosition(this.player.x + 8, this.player.y);
            }
            if (currentFrameWeapon === 2) {
                this.weapon.setPosition(this.player.x + 12, this.player.y);
            }
            if (currentFrameWeapon === 4) {
                this.weapon.setPosition(this.player.x + 5, this.player.y);
            }
        }

        if (this.weapon.anims.currentAnim?.key === 'weapon-left') {
            this.weapon.setFlipX(true);
            if (currentFrameWeapon === 1 || currentFrameWeapon === 3) {
                this.weapon.setPosition(this.player.x - 8, this.player.y);
            }
            if (currentFrameWeapon === 2) {
                this.weapon.setPosition(this.player.x - 12, this.player.y);
            }
            if (currentFrameWeapon === 4) {
                this.weapon.setPosition(this.player.x - 5, this.player.y);
            }
        }


    }
}
