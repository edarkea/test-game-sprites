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
    /* private weapon!: Phaser.GameObjects.Sprite; */
    private weaponAtack!: Phaser.GameObjects.Sprite;

    private isAtack: boolean = false;

    // 1 down, 2 up, 3 left, 4 right
    private direction: number = 1;


    constructor() {
        super('Game');
    }


    preload() {
        this.load.setPath('assets');
        this.load.tilemapTiledJSON('map', 'maps/castle/castle.json');
        this.load.image('Castle2', 'maps/castle/Castle2.png');
        this.load.spritesheet('player', 'the_knight.png', { frameWidth: this.spriteSize, frameHeight: this.spriteSize });
        this.load.spritesheet('weapon', 'weapon-sword.png', { frameWidth: this.spriteSize, frameHeight: this.spriteSize });
        this.load.spritesheet('weapon-atack-1', 'weapons/weapon-1/weapon-1-atack-1.png', { frameWidth: this.spriteSize, frameHeight: this.spriteSize });
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
        /* this.weapon = this.physics.add.sprite(this.spriteSize / 2, this.spriteSize / 2 + 8, 'weapon').setScale(this.scaleSize); */
        this.weaponAtack = this.physics.add.sprite(this.spriteSize / 2, this.spriteSize / 2 + 6, 'weapon-atack-1').setScale(this.scaleSize);

        this.playerContainer = this.add.container(centerX - this.spriteSize / 2, centerY - this.spriteSize / 2, [this.player, this.weaponAtack]);
        this.physics.world.enable(this.playerContainer);

        const container = this.playerContainer.body as Phaser.Physics.Arcade.Body;

        container.setSize(this.spriteSize, this.spriteSize);
        container.setCollideWorldBounds(true);

        this.cameras.main.startFollow(this.playerContainer);

        this.layerBackground.setDepth(0);
        this.layerDecoratorBack.setDepth(1);
        this.playerContainer.setDepth(2);
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
            this.physics.add.collider(this.playerContainer, collisionGroup);
        }



        if (this.input.keyboard) {
            this.cursors = this.input.keyboard.createCursorKeys();
            this.animateCharacter(this.anims)
            this.animateWeapon(this.anims);
            this.animateAtack(this.anims);
        }

    }

    animateWeapon(anims: Phaser.Animations.AnimationManager) {
        anims.create({
            key: 'weapon-down',
            frames: [
                { key: 'weapon-atack-1', frame: 0 },
                { key: 'weapon-atack-1', frame: 1 },
            ],
            frameRate: this.frameRate,
            repeat: -1,
        });

        anims.create({
            key: 'weapon-up',
            frames: [
                { key: 'weapon-atack-1', frame: 8 },
                { key: 'weapon-atack-1', frame: 9 },
            ],
            frameRate: this.frameRate,
            repeat: -1,
        });

        anims.create({
            key: 'weapon-right',
            frames: [
                { key: 'weapon-atack-1', frame: 4 },
                { key: 'weapon-atack-1', frame: 5 },
            ],
            frameRate: this.frameRate,
            repeat: -1,
        });

        anims.create({
            key: 'weapon-left',
            frames: [
                { key: 'weapon-atack-1', frame: 4 },
                { key: 'weapon-atack-1', frame: 5 },
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

        anims.create({
            key: 'walk-atack-down',
            frames: [
                { key: 'player', frame: 0 },
                { key: 'player', frame: 1 },
                { key: 'player', frame: 0 },
                { key: 'player', frame: 1 },
            ],
            frameRate: this.frameRate * 2.5,
            repeat: 0,
        });
        anims.create({
            key: 'walk-atack-right',
            frames: [
                { key: 'player', frame: 4 },
                { key: 'player', frame: 5 },
                { key: 'player', frame: 4 },
                { key: 'player', frame: 6 },
            ],
            frameRate: this.frameRate * 2.5,
            repeat: 0,
        });

        anims.create({
            key: 'walk-atack-up',
            frames: [
                { key: 'player', frame: 2 },
                { key: 'player', frame: 3 },
                { key: 'player', frame: 2 },
                { key: 'player', frame: 3 },
            ],
            frameRate: this.frameRate * 2.5,
            repeat: 0,
        });

        anims.create({
            key: 'walk-atack-left',
            frames: [
                { key: 'player', frame: 4 },
                { key: 'player', frame: 5 },
                { key: 'player', frame: 4 },
                { key: 'player', frame: 6 },
            ],
            frameRate: this.frameRate * 2.5,
            repeat: 0,
        });

    }


    animateAtack(anims: Phaser.Animations.AnimationManager) {
        anims.create({
            key: 'weapon-atack-down',
            frames: [
                { key: 'weapon-atack-1', frame: 0 },
                { key: 'weapon-atack-1', frame: 1 },
                { key: 'weapon-atack-1', frame: 2 },
                { key: 'weapon-atack-1', frame: 3 },
                { key: 'weapon-atack-1', frame: 2 },
                { key: 'weapon-atack-1', frame: 1 },
                { key: 'weapon-atack-1', frame: 0 },
            ],
            frameRate: this.frameRate * 7,
            repeat: 0,
        });

        anims.create({
            key: 'weapon-atack-right',
            frames: [
                { key: 'weapon-atack-1', frame: 4 },
                { key: 'weapon-atack-1', frame: 5 },
                { key: 'weapon-atack-1', frame: 6 },
                { key: 'weapon-atack-1', frame: 7 },
                { key: 'weapon-atack-1', frame: 6 },
                { key: 'weapon-atack-1', frame: 5 },
                { key: 'weapon-atack-1', frame: 4 },
            ],
            frameRate: this.frameRate * 7,
            repeat: 0,
        });

        anims.create({
            key: 'weapon-atack-up',
            frames: [
                { key: 'weapon-atack-1', frame: 8 },
                { key: 'weapon-atack-1', frame: 9 },
                { key: 'weapon-atack-1', frame: 10 },
                { key: 'weapon-atack-1', frame: 9 },
                { key: 'weapon-atack-1', frame: 8 },
            ],
            frameRate: this.frameRate * 4,
            repeat: 0,
        });
        anims.create({
            key: 'weapon-atack-left',
            frames: [
                { key: 'weapon-atack-1', frame: 4 },
                { key: 'weapon-atack-1', frame: 5 },
                { key: 'weapon-atack-1', frame: 6 },
                { key: 'weapon-atack-1', frame: 7 },
                { key: 'weapon-atack-1', frame: 6 },
                { key: 'weapon-atack-1', frame: 5 },
                { key: 'weapon-atack-1', frame: 4 },
            ],
            frameRate: this.frameRate * 7,
            repeat: 0,
        });
    }

    update(): void {
        this.moveCharacter();
        this.onAtack();
    }

    onAtack(): void {
        if (this.cursors.space.isDown) {
            this.isAtack = true;
            if (this.direction == 1) {
                this.weaponAtack.play('weapon-atack-down', true);
                this.player.play('walk-atack-down', true);
            } else if (this.direction == 4) {
                this.weaponAtack.play('weapon-atack-right', true);
                this.player.play('walk-atack-right', true);
            } else if (this.direction == 2) {
                this.weaponAtack.play('weapon-atack-up', true);
                this.player.play('walk-atack-up', true);
            } else if (this.direction == 3) {
                this.weaponAtack.play('weapon-atack-left', true);
                this.player.play('walk-atack-left', true);
            }
        } else {
            this.isAtack = false;
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
            this.direction = 3;
            velocityX += -this.velocityX - run;
        } else if (this.cursors.right.isDown || axisH > 0) {
            this.direction = 4;
            velocityX += this.velocityX + run;
        } else if (this.cursors.up.isDown || axisV < 0) {
            this.direction = 2;
            velocityY += -this.velocityY - run;
        } else if (this.cursors.down.isDown || axisV > 0) {
            this.direction = 1;
            velocityY += this.velocityY + run;
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
            this.weaponAtack.play('weapon-left', true);
        } else if (velocityX > 0) {
            this.player.play('walk-right', true);
            this.weaponAtack.play('weapon-right', true);
        } else if (velocityY < 0) {
            this.player.play('walk-up', true);
            this.weaponAtack.play('weapon-up', true);
        } else if (velocityY > 0) {
            this.player.play('walk-down', true);
            this.weaponAtack.play('weapon-down', true);
        } else if ((velocityX === 0 && velocityY === 0) && !this.isAtack) {
            this.player.stop();
            this.weaponAtack.stop();
        }


        const currentFrame = this.player.anims.currentFrame?.index;
        const currentFrameWeapon = this.weaponAtack.anims.currentFrame?.index;

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

        if (this.weaponAtack.anims.currentAnim?.key === 'weapon-atack-up' || this.weaponAtack.anims.currentAnim?.key === 'weapon-up') {
            this.weaponAtack.setFlipX(false);
            this.weaponAtack.setPosition(this.player.x, this.player.y + 5);
        }

        if (this.weaponAtack.anims.currentAnim?.key === 'weapon-atack-down' || this.weaponAtack.anims.currentAnim?.key === 'weapon-down') {
            this.weaponAtack.setFlipX(false);
            this.weaponAtack.setPosition(this.player.x, this.player.y + 5);
        }

        if (this.weaponAtack.anims.currentAnim?.key === 'weapon-atack-right' || this.weaponAtack.anims.currentAnim?.key === 'weapon-right') {
            this.weaponAtack.setFlipX(false);
            this.weaponAtack.setPosition(this.player.x + 5, this.player.y);
        }

        if (this.weaponAtack.anims.currentAnim?.key === 'weapon-left' || this.weaponAtack.anims.currentAnim?.key === 'weapon-atack-left') {
            this.weaponAtack.setFlipX(true);
            this.weaponAtack.setPosition(this.player.x - 5, this.player.y);
        }
    }
}
