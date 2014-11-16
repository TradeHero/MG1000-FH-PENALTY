/*
 * TradeHero FH-Penalty Javascript Plugin v@@version
 * http://www.tradehero.mobi/
 * Copyright 2014, TradeHero
 * Date: @@date
 *
 * Copyright (C) 2012 - 2014 by TradeHero
 */

// http://paulirish.com/2011/requestanimationframe-for-smart-animating
// shim layer with setTimeout fallback
window.requestAnimFrame = (function () {
    return window.requestAnimationFrame ||
    window.webkitRequestAnimationFrame ||
    window.mozRequestAnimationFrame ||
    window.oRequestAnimationFrame ||
    window.msRequestAnimationFrame ||

    function (callback) {
        window.setTimeout(callback, 1000 / 60);
    };
})();

var Application = (function () {
    var WIDTH = 800;
    var HEIGHT = 600;
    var GAME_RATIO = WIDTH / HEIGHT;

    var _Application = {
        canvas: undefined,
        ctx: undefined,
        init: function () {

            //var canvasWidth = window.innerWidth;
            var canvasWidth = 800;
            //var canvasHeight = canvasWidth * GAME_RATIO;
            var canvasHeight = 600;
            this.canvas = document.createElement("canvas");
            this.canvas.width = canvasWidth;
            this.canvas.height = canvasHeight;
            this.ctx = this.canvas.getContext("2d");

            var body = document.body;
            body.appendChild(this.canvas);

            var startTouchX = 0;
            var startTouchY = 0;
            var startTime = 0;

            // listen for clicks
            window.addEventListener('click', function (e) {
                e.preventDefault();
                //Input.trigger(e);
            }, false);

            // listen for touches
            window.addEventListener('touchstart', function (e) {
                e.preventDefault();
                // first touch from the event
                //INPUT.trigger(e.touches[0]);
                startTouchX = e.touches[0].pageX;
                startTouchY = e.touches[0].pageY;
                startTime = Date.now();
            }, false);
            window.addEventListener('touchmove', function (e) {
                // disable zoom and scroll
                e.preventDefault();
            }, false);
            window.addEventListener('touchend', function (e) {
                // as above
                e.preventDefault();
                if (startTouchX !== e.changedTouches[0].pageX || startTouchY !== e.changedTouches[0].pageY) {
                    var duration = Date.now() - startTime;
                    Input.drag(startTouchX, startTouchY, e.changedTouches[0].pageX, e.changedTouches[0].pageY, duration);
                }

            }, false);

            Asset.downloadAll();
        },

        getCanvasWidth: function () {
            //return window.innerWidth;
            return 800;
        },

        getCanvasHeight: function () {
            //return window.innerHeight * GAME_RATIO;
            return 600;
        },

        getCanvas: function () {
            return this.canvas;
        },

        getCanvasCtx: function () {
            return this.ctx;
        }
    };

    return {
        init: function () {
            return _Application.init();
        },
        getCanvasWidth: function () {
            return _Application.getCanvasWidth();
        },
        getCanvasHeight: function () {
            return _Application.getCanvasHeight();
        },
        getCanvasCtx: function () {
            return _Application.getCanvasCtx();
        },
        getCanvas: function () {
            return _Application.getCanvas();
        }
    };
})();

var Renderer = (function () {
    var _Renderer = {
        mainWindow: undefined,

        render: function () {
            this.mainWindow = new UI.View(0, 0, Application.getCanvasWidth(), Application.getCanvasHeight());
            this.mainWindow.drawView(Application.getCanvasCtx());
            GameObjects.setBallStartX(Application.getCanvasWidth() / 2 - Asset.images.ball.width / 2);

            var canvasWidth = Application.getCanvasWidth();
            var canvasHeight = Application.getCanvasHeight();
            var backgroundImageView = new UI.ImageView(0, 0, canvasWidth, canvasHeight, Asset.images.background);

            this.mainWindow.addSubview(backgroundImageView);
        },

        renderGoalPostAndKeeper: function () {
            var goalPostImage = Asset.images.goal_post;
            var goalkeeperImage = Asset.images.goalkeeper;

            if (GameObjects.getGoalPostX() === undefined) {
                GameObjects.setGoalPostX(Application.getCanvasWidth() / 2 - goalPostImage.width / 2);
                GameObjects.setGoalPostY(60);
                GameObjects.setGoalPostWidth(goalPostImage.width);
                GameObjects.setGoalPostHeight(goalPostImage.height);
                GameObjects.setKeeperWidth(goalkeeperImage.width);
                GameObjects.setKeeperHeight(goalkeeperImage.height);
                GameObjects.setKeeperY(80);
            }

            var goalPostImageView = new UI.ImageView(GameObjects.getGoalPostX(), GameObjects.getGoalPostY(),
                GameObjects.getGoalPostWidth(), GameObjects.getGoalPostHeight(), goalPostImage);
            var goalkeeperImageView = new UI.ImageView(GameObjects.getKeeperX(), GameObjects.getKeeperY(), GameObjects.getKeeperWidth(), GameObjects.getKeeperHeight(), goalkeeperImage);

            if (GameObjects.getGuardMaxX() === undefined) {
                GameObjects.setGuardMinX(GameObjects.getGoalPostX() + goalPostImage.width * 0.05);
                GameObjects.setGuardMaxX((GameObjects.getGuardMinX() + goalPostImage.width * 0.9) - goalkeeperImage.width);
            }
            this.mainWindow.addSubview(goalPostImageView);
            this.mainWindow.addSubview(goalkeeperImageView);
        },

        renderBall: function () {
            var ballImage = Asset.images.ball;

            if (GameObjects.getBallWidth() === undefined) {
                GameObjects.setBallWidth(ballImage.width);
                GameObjects.setBallHeight(ballImage.height);
                GameObjects.setBallCurrentX(GameObjects.getBallStartX());
                GameObjects.setBallCurrentY(GameObjects.getBallStartY());
            }

            var ball = new BallSprite(GameObjects.getBallCurrentX(), GameObjects.getBallCurrentY(), GameObjects.getBallWidth(), GameObjects.getBallHeight(), ballImage);
            ball.addTarget(function () {
                console.log("kick");
            }, "drag");

            this.mainWindow.addSubview(ball);
        },

        renderGoal: function () {
            var goalText = new UI.Label(Application.getCanvasWidth() /2, Application.getCanvasHeight()/2, Application.getCanvasWidth() /2, 30, "GOAL!!");
            goalText.font_size = "5";
            goalText.text_color = "red";
            this.mainWindow.addSubview(goalText);
        },

        renderMiss: function () {
            var missText = new UI.Label(Application.getCanvasWidth() /2, Application.getCanvasHeight()/2, Application.getCanvasWidth() /2, 30, "MISS!!");
            missText.font_size = "5";
            missText.text_color = "red";
            this.mainWindow.addSubview(missText);
        }
    };

    return {

        render: function () {
            return _Renderer.render();
        },
        renderGoalPostAndKeeper: function () {
            return _Renderer.renderGoalPostAndKeeper();
        },
        renderBall: function (x, y) {
            return _Renderer.renderBall(x, y);
        },
        renderGoal: function () {
            return _Renderer.renderGoal();
        },
        renderMiss: function () {
            return _Renderer.renderMiss();
        }
    }
})();

var GameObjects = (function () {
    var _Ball = {
        ballWidth: undefined,
        ballHeight: undefined,
        ballStartX: undefined,
        ballStartY: 480,
        dragStartX: undefined,
        dragStartY: undefined,
        dragEndX: undefined,
        dragEndY: undefined,
        ballCurrentX: undefined,
        ballCurrentY: undefined,
        ballVelocity: undefined,
        dragDuration: undefined,

        getBallWidth: function () {
            return this.ballWidth;
        },

        getBallHeight: function () {
            return this.ballHeight;
        },

        setBallWidth: function (width) {
            this.ballWidth = width;
        },

        setBallHeight: function (height) {
            this.ballHeight = height;
        },

        getDragStartX: function () {
            return this.dragStartX;
        },

        getDragStartY: function () {
            return this.dragStartY;
        },

        setDragStartX: function (x) {
            this.dragStartX = x;
        },

        setDragStartY: function (y) {
            this.dragStartY = y;
        },

        getDragEndX: function () {
            return this.dragEndX;
        },

        getDragEndY: function () {
            return this.dragEndY;
        },

        setDragEndX: function (x) {
            this.dragEndX = x;
        },

        setDragEndY: function (y) {
            this.dragEndY = y;
        },

        getBallStartX: function () {
            return this.ballStartX;
        },

        getBallStartY: function () {
            return this.ballStartY;
        },

        setBallStartX: function (x) {
            this.ballStartX = x;
        },

        setBallStartY: function (y) {
            this.ballStartY = y;
        },

        getBallCurrentX: function () {
            return this.ballCurrentX;
        },

        getBallCurrentY: function () {
            return this.ballCurrentY;
        },

        setBallCurrentX: function (x) {
            this.ballCurrentX = x;
        },

        setBallCurrentY: function (y) {
            this.ballCurrentY = y;
        },

        getAngle: function () {
            if (this.getDragEndX() === undefined) return undefined;

            var firstPointX = this.getDragStartX();
            var firstPointY = this.getDragEndY();

            var dx1 = firstPointX - this.getDragStartX();
            var dy1 = firstPointY - this.getDragStartY();
            var dx2 = this.getDragEndX() - this.getDragStartX();
            var dy2 = this.getDragEndY() - this.getDragStartY();
            var a1 = Math.atan2(dy1, dx1);
            var a2 = Math.atan2(dy2, dx2);

            return parseInt((a2 - a1) * 180 / Math.PI + 360) % 360;
        },

        getDragDuration: function () {
            return this.dragDuration;
        },

        setDragDuration: function (d) {
            this.dragDuration = d;
        },

        getVelocity: function () {
            if (this.getDragEndX() === undefined) return undefined;

            var dx = this.getDragEndX() - this.getDragStartX();
            var dy = this.getDragEndY() - this.getDragStartY();
            var distance = Math.sqrt(dx * dx + dy * dy);

            return distance / this.getDragDuration();
        },

        resetBall: function () {
            this.dragStartX = undefined;
            this.dragStartY = undefined;
            this.dragEndX = undefined;
            this.dragEndY = undefined;
            this.ballCurrentX = this.ballStartX;
            this.ballCurrentY = this.ballStartY;
            this.ballVelocity = undefined;
            this.dragDuration = undefined;
        }
    };

    var _Keeper = {
        guardMinX: undefined,
        guardMaxX: undefined,
        keeperX: undefined,
        keeperY: undefined,
        keeperWidth: undefined,
        keeperHeight: undefined,

        getKeeperWidth: function () {
            return this.keeperWidth;
        },

        getKeeperHeight: function () {
            return this.keeperHeight;
        },

        setKeeperWidth: function (width) {
            this.keeperWidth = width;
        },

        setKeeperHeight: function (height) {
            this.keeperHeight = height;
        },

        getGuardMinX: function () {
            return this.guardMinX;
        },

        getGuardMaxX: function () {
            return this.guardMaxX;
        },

        setGuardMinX: function (min) {
            this.guardMinX = min;
        },

        setGuardMaxX: function (max) {
            this.guardMaxX = max;
        },

        getKeeperX: function () {
            return this.keeperX;
        },

        getKeeperY: function () {
            return this.keeperY;
        },

        setKeeperX: function (x) {
            this.keeperX = x;
        },

        setKeeperY: function (y) {
            this.keeperY = y;
        },

        getNewKeeperPosition: function () {
            return Math.random() * (this.getGuardMaxX() - this.getGuardMinX()) + this.getGuardMinX();
        }
    };

    var _GoalPost = {
        goalPostX: undefined,
        goalPostY: undefined,
        goalPostWidth: undefined,
        goalPostHeight: undefined,

        getGoalPostX: function () {
            return this.goalPostX;
        },

        setGoalPostX: function (x) {
            this.goalPostX = x;
        },

        getGoalPostY: function () {
            return this.goalPostY;
        },

        setGoalPostY: function (y) {
            this.goalPostY = y;
        },

        getGoalPostWidth: function () {
            return this.goalPostWidth;
        },

        setGoalPostWidth: function (width) {
            this.goalPostWidth = width;
        },

        getGoalPostHeight: function () {
            return this.goalPostHeight;
        },

        setGoalPostHeight: function (height) {
            this.goalPostHeight = height;
        }
    };

    return {
        // BALL
        getBallWidth: function () {
            return _Ball.getBallWidth();
        },

        getBallHeight: function () {
            return _Ball.getBallHeight();
        },

        setBallWidth: function (width) {
            return _Ball.setBallWidth(width);
        },

        setBallHeight: function (height) {
            return _Ball.setBallHeight(height);
        },

        getDragStartX: function () {
            return _Ball.getDragStartX();
        },

        getDragStartY: function () {
            return _Ball.getDragStartY();
        },

        setDragStartX: function (x) {
            return _Ball.setDragStartX(x);
        },

        setDragStartY: function (y) {
            return _Ball.setDragStartY(y);
        },

        getDragEndX: function () {
            return _Ball.getDragEndX();
        },

        getDragEndY: function () {
            return _Ball.getDragEndY();
        },

        setDragEndX: function (x) {
            return _Ball.setDragEndX(x);
        },

        setDragEndY: function (y) {
            return _Ball.setDragEndY(y);
        },

        getBallStartX: function () {
            return _Ball.getBallStartX();
        },

        getBallStartY: function () {
            return _Ball.getBallStartY();
        },

        setBallStartX: function (x) {
            return _Ball.setBallStartX(x);
        },

        setBallStartY: function (y) {
            return _Ball.setBallStartY(y);
        },

        getBallCurrentX: function () {
            return _Ball.getBallCurrentX();
        },

        getBallCurrentY: function () {
            return _Ball.getBallCurrentY();
        },

        setBallCurrentX: function (x) {
            return _Ball.setBallCurrentX(x);
        },

        setBallCurrentY: function (y) {
            return _Ball.setBallCurrentY(y);
        },

        getAngle: function () {
            return _Ball.getAngle();
        },

        getDragDuration: function () {
            return _Ball.getDragDuration();
        },

        setDragDuration: function (d) {
            return _Ball.setDragDuration(d);
        },

        getVelocity: function () {
            return _Ball.getVelocity();
        },

        getGuardMinX: function () {
            return _Keeper.getGuardMinX();
        },

        // KEEPER
        getKeeperWidth: function () {
            return _Keeper.getKeeperWidth();
        },

        getKeeperHeight: function () {
            return _Keeper.getKeeperHeight();
        },

        setKeeperWidth: function (width) {
            return _Keeper.setKeeperWidth(width);
        },

        setKeeperHeight: function (height) {
            return _Keeper.setKeeperHeight(height);
        },

        getGuardMaxX: function () {
            return _Keeper.getGuardMaxX();
        },

        setGuardMinX: function (min) {
            return _Keeper.setGuardMinX(min);
        },

        setGuardMaxX: function (max) {
            return _Keeper.setGuardMaxX(max);
        },

        getKeeperX: function () {
            return _Keeper.getKeeperX();
        },

        getKeeperY: function () {
            return _Keeper.getKeeperY();
        },

        setKeeperX: function (x) {
            return _Keeper.setKeeperX(x);
        },

        setKeeperY: function (y) {
            return _Keeper.setKeeperY(y);
        },

        getNewKeeperPosition: function () {
            return _Keeper.getNewKeeperPosition();
        },

        resetBall: function () {
            return _Ball.resetBall();
        },

        // GOALPOST
        getGoalPostX: function () {
            return _GoalPost.getGoalPostX();
        },

        setGoalPostX: function (x) {
            return _GoalPost.setGoalPostX(x);
        },

        getGoalPostY: function () {
            return _GoalPost.getGoalPostY();
        },

        setGoalPostY: function (y) {
            return _GoalPost.setGoalPostY(y);
        },

        getGoalPostWidth: function () {
            return _GoalPost.getGoalPostWidth();
        },

        setGoalPostWidth: function (width) {
            return _GoalPost.setGoalPostWidth(width);
        },

        getGoalPostHeight: function () {
            return _GoalPost.getGoalPostHeight();
        },

        setGoalPostHeight: function (height) {
            return _GoalPost.setGoalPostHeight(height);
        }
    }
})();

var Game = (function () {
    var _Game = {
        // time for calculate fps, max on 60 due to rAF
        delta: 0,
        currentTime: 0,
        lastTime: 0,
        keeperDirection: 1,
        resultTimer: 0,
        showingResult: false,

        loop: function () {
            var self = this;

            window.requestAnimFrame(function () {
                self.loop();
            });

            //fps.update();
            this.currentTime = Date.now();
            this.delta = (this.currentTime - this.lastTime) / 1000;

            if (this.delta > 1) {
                this.delta = 0;
            }

            Renderer.render();

            if (GameObjects.getKeeperX() === undefined) {
                GameObjects.setKeeperX(Application.getCanvasWidth() / 2);
            }

            if (GameObjects.getKeeperX() >= GameObjects.getGuardMaxX()) {
                this.keeperDirection = 1;
            } else if (GameObjects.getKeeperX() <= GameObjects.getGuardMinX()) {
                this.keeperDirection = -1;
            }

            if (!this.showingResult) {
                GameObjects.setKeeperX(GameObjects.getKeeperX() - this.delta * 500 * this.keeperDirection);
            }


            Renderer.renderGoalPostAndKeeper();

            if (GameObjects.getDragEndX() !== undefined) {
                if (!this.showingResult) {
                    var angle = GameObjects.getAngle() + 270;

                    if (angle > 359) {
                        angle -= 360
                    }
                    var radians = angle * Math.PI / 180;
                    var xunits = Math.cos(radians) * this.delta * 500 * GameObjects.getVelocity();
                    var yunits = Math.sin(radians) * this.delta * 500 * GameObjects.getVelocity();
                    GameObjects.setBallCurrentX(GameObjects.getBallCurrentX() + xunits);
                    GameObjects.setBallCurrentY(GameObjects.getBallCurrentY() + yunits);
                }

                // keeper catch the ball.
                if (GameObjects.getBallCurrentX() > GameObjects.getKeeperX() - 20 && GameObjects.getBallCurrentX() + GameObjects.getBallWidth() < GameObjects.getKeeperX() + GameObjects.getKeeperWidth() + 20
                    && GameObjects.getBallCurrentY() < GameObjects.getKeeperY() + GameObjects.getKeeperHeight() && GameObjects.getBallCurrentY() > GameObjects.getKeeperY()) {
                    this.showMissShot();
                    console.log("1");
                }

                // out of bound - miss shot
                else if (GameObjects.getBallCurrentX() <= 0 || GameObjects.getBallCurrentX() >= Application.getCanvasWidth()) {
                    this.showMissShot();
                    console.log("3");
                }

                // win
                else if (GameObjects.getBallCurrentY() <= GameObjects.getGoalPostY() + GameObjects.getGoalPostHeight() * 0.7
                    && GameObjects.getBallCurrentX() > GameObjects.getGoalPostX() && GameObjects.getBallCurrentX() + GameObjects.getBallWidth() < GameObjects.getGoalPostX() + GameObjects.getGoalPostWidth()) {
                    this.showShotIn();
                    console.log("2");
                }
            }

            Renderer.renderBall();

            this.lastTime = this.currentTime;
        },

        newShot: function () {
            GameObjects.resetBall();
        },

        showShotIn: function () {
            Renderer.renderGoal();
            this.showingResult = true;
            this.resultTimer += this.delta;

            if (this.resultTimer > 1) {
                this.showingResult = false;
                this.resultTimer = 0;
                this.newShot();
            }
        },

        showMissShot: function () {
            Renderer.renderMiss();
            this.showingResult = true;
            this.resultTimer += this.delta;

            if (this.resultTimer > 1) {
                this.showingResult = false;
                this.resultTimer = 0;
                this.newShot();
            }
        }
    };

    return {
        loop: function () {
            return _Game.loop();
        }
    }
})();

window.addEventListener('load', Application.init, false);

function inherit(proto) {
    function F() {
    }

    F.prototype = proto;
    return new F
}
