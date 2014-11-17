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

Assets.initialise({
    full_background: "assets/full_background.png",
    background: "assets/img-bkg.png",
    goal_post: "assets/img-goalpost.png",
    goalkeeper: "assets/img-goalkeeper.png",
    ball: "assets/img-ball.png"
}, function () {
    //completion callback
    StartScene.init();
});

function inherit(proto) {
    function F() {
    }

    F.prototype = proto;
    return new F
}


var Application = (function () {

    var _Application = {
        ratio: 800 / 600,
        width: undefined,
        height: undefined,
        scale: undefined,
        canvas: undefined,
        ctx: undefined,
        init: function () {
            this.width = window.innerWidth;
            this.height = this.width / this.ratio;
            this.scale = this.width / 800;
            this.canvas = document.createElement("canvas");
            this.canvas.width = this.width;
            this.canvas.height = this.height;
            this.ctx = this.canvas.getContext("2d");

            var body = document.body;
            body.appendChild(this.canvas);

            var startTouchX = 0;
            var startTouchY = 0;
            var startTime = 0;

            // listen for clicks
            window.addEventListener('click', function (e) {
                e.preventDefault();
                Input.trigger(e);
            }, false);

            // listen for touches
            window.addEventListener('touchstart', function (e) {
                e.preventDefault();
                // first touch from the event
                Input.trigger(e.touches[0]);
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

            window.addEventListener('mousedown', function (e) {
                e.preventDefault();
                // first touch from the event
                //INPUT.trigger(e.touches[0]);
                startTouchX = e.pageX;
                startTouchY = e.pageY;
                startTime = Date.now();
            }, false);

            window.addEventListener('mouseup', function (e) {
                // as above
                e.preventDefault();
                if (startTouchX !== e.pageX || startTouchY !== e.pageY) {
                    var duration = Date.now() - startTime;
                    Input.drag(startTouchX, startTouchY, e.pageX, e.pageY, duration);
                }

            }, false);

            Assets.beginLoad();
        },

        getCanvasWidth: function () {
            //return window.innerWidth;
            return window.innerWidth;
        },

        getCanvasHeight: function () {
            //return window.innerHeight * GAME_RATIO;
            return this.height;
        },

        getScale: function () {
            return this.scale;
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
        getScale: function () {
            return _Application.getScale();
        },
        getCanvas: function () {
            return _Application.getCanvas();
        }
    };
})();

var ScoreCanvas = (function () {
    var width = window.innerWidth;
    var height = 200;

    var _ScoreCanvas = {
        canvas: undefined,
        ctx: undefined,
        init: function () {

            //var canvasWidth = window.innerWidth;
            var canvasWidth = width;
            //var canvasHeight = canvasWidth * GAME_RATIO;
            var canvasHeight = height;
            this.canvas = document.createElement("canvas");
            this.canvas.width = canvasWidth;
            this.canvas.height = canvasHeight;
            this.ctx = this.canvas.getContext("2d");

            var body = document.body;
            body.appendChild(this.canvas);
        },

        getCanvasWidth: function () {
            //return window.innerWidth;
            return width;
        },

        getCanvasHeight: function () {
            //return window.innerHeight * GAME_RATIO;
            return height;
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
            return _ScoreCanvas.init();
        },
        getCanvasWidth: function () {
            return _ScoreCanvas.getCanvasWidth();
        },
        getCanvasHeight: function () {
            return _ScoreCanvas.getCanvasHeight();
        },
        getCanvasCtx: function () {
            return _ScoreCanvas.getCanvasCtx();
        },
        getCanvas: function () {
            return _ScoreCanvas.getCanvas();
        }
    };
})();

var Renderer = (function () {
    var _Renderer = {
        mainWindow: undefined,

        render: function () {
            this.mainWindow = new UI.View(0, 0, Application.getCanvasWidth(), Application.getCanvasHeight());
            this.mainWindow.drawView(Application.getCanvasCtx());
            GameObjects.setBallStartX(Application.getCanvasWidth() / 2 - Assets.images().ball.width / 2);
            GameObjects.setBallStartY(480 * Application.getScale());

            var canvasWidth = Application.getCanvasWidth();
            var canvasHeight = Application.getCanvasHeight();
            var backgroundImageView = new UI.ImageView(0, 0, canvasWidth, canvasHeight, Assets.images().background);

            this.mainWindow.addSubview(backgroundImageView);
        },

        renderGoalPostAndKeeper: function () {
            var goalPostImage = Assets.images().goal_post;
            var goalkeeperImage = Assets.images().goalkeeper;

            if (GameObjects.getGoalPostX() === undefined) {
                GameObjects.setGoalPostWidth(goalPostImage.width * Application.getScale());
                GameObjects.setGoalPostHeight(goalPostImage.height * Application.getScale());
                GameObjects.setGoalPostX(Application.getCanvasWidth() / 2 - GameObjects.getGoalPostWidth() / 2);
                GameObjects.setGoalPostY(60 * Application.getScale());
                GameObjects.setKeeperWidth(goalkeeperImage.width * Application.getScale());
                GameObjects.setKeeperHeight(goalkeeperImage.height * Application.getScale());
                GameObjects.setKeeperY(80 * Application.getScale());
            }

            var goalPostImageView = new UI.ImageView(GameObjects.getGoalPostX(), GameObjects.getGoalPostY(),
                GameObjects.getGoalPostWidth(), GameObjects.getGoalPostHeight(), goalPostImage);
            var goalkeeperImageView = new UI.ImageView(GameObjects.getKeeperX(), GameObjects.getKeeperY(), GameObjects.getKeeperWidth(), GameObjects.getKeeperHeight(), goalkeeperImage);

            if (GameObjects.getGuardMaxX() === undefined) {
                GameObjects.setGuardMinX(GameObjects.getGoalPostX() + GameObjects.getGoalPostWidth() * 0.05);
                GameObjects.setGuardMaxX((GameObjects.getGuardMinX() + GameObjects.getGoalPostWidth() * 0.9) - GameObjects.getKeeperWidth());
            }
            this.mainWindow.addSubview(goalPostImageView);
            this.mainWindow.addSubview(goalkeeperImageView);
        },

        renderBall: function () {
            var ballImage = Assets.images().ball;

            if (GameObjects.getBallWidth() === undefined) {
                GameObjects.setBallWidth(ballImage.width * Application.getScale());
                GameObjects.setBallHeight(ballImage.height * Application.getScale());
                GameObjects.setBallCurrentX(GameObjects.getBallStartX());
                GameObjects.setBallCurrentY(GameObjects.getBallStartY());
            }

            var ball = new BallSprite(GameObjects.getBallCurrentX(), GameObjects.getBallCurrentY(), GameObjects.getBallWidth(), GameObjects.getBallHeight(), ballImage);
            this.mainWindow.addSubview(ball);
        },

        renderGoal: function () {
            var goalText = new UI.Label(Application.getCanvasWidth() / 2, Application.getCanvasHeight() / 2, Application.getCanvasWidth() / 2, 30, "GOAL!!");
            goalText.font_size = "5";
            goalText.text_color = "red";
            this.mainWindow.addSubview(goalText);
        },

        renderMiss: function () {
            var missText = new UI.Label(Application.getCanvasWidth() / 2, Application.getCanvasHeight() / 2, Application.getCanvasWidth() / 2, 30, "MISS!!");
            missText.font_size = "5";
            missText.text_color = "red";
            this.mainWindow.addSubview(missText);
        },

        renderGameOver: function () {
            var gameOverText = new UI.Label(Application.getCanvasWidth() / 2, Application.getCanvasHeight() / 2, Application.getCanvasWidth() / 2, 50, "Need to show share dialog");
            gameOverText.font_size = "5";
            gameOverText.text_color = "red";
            this.mainWindow.addSubview(gameOverText);
        },

        renderScore: function () {
            var mainWindow = new UI.View(0, 0, ScoreCanvas.getCanvasWidth(), ScoreCanvas.getCanvasHeight());
            mainWindow.background_color = "black";
            var scoreLabel = new UI.Label(200, ScoreCanvas.getCanvasHeight() / 2, 200, 30, "Scores");
            scoreLabel.text_color = "white";
            scoreLabel.font_size = 4;
            mainWindow.drawView(ScoreCanvas.getCanvasCtx());
            scoreLabel.drawView(ScoreCanvas.getCanvasCtx());

            var scores = GameObjects.getScores();
            var ballImage = Assets.images().ball;
            var startX = 400;
            var mark = new UI.ImageView(startX, ScoreCanvas.getCanvasHeight() / 2 - ballImage.height, ballImage.width * 2, ballImage.height * 2, ballImage);

            for (var i in scores) {
                if (scores.hasOwnProperty(i)) {
                    if (scores[i] === 1) {
                        mark.alpha = 1.0;
                    } else if (scores[i] === 0) {
                        mark.alpha = 0.3;
                    }

                    mark.drawView(ScoreCanvas.getCanvasCtx());
                    mark.x += ballImage.width * 2 + 50;

                }
            }
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
        },
        renderGameOver: function () {
            return _Renderer.renderGameOver();
        },
        renderScore: function () {
            return _Renderer.renderScore();
        }
    }
})();

var GameObjects = (function () {
    var _Ball = {
        ballWidth: undefined,
        ballHeight: undefined,
        ballStartX: undefined,
        ballStartY: undefined,
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

    var _Score = {
        chance: 3,
        currentKick: 0,
        scores: [],

        getChance: function () {
            return this.chance;
        },

        getCurrentKick: function () {
            return this.currentKick;
        },

        setCurrentKick: function (k) {
            this.currentKick = k;
        },

        getScores: function () {
            return this.scores;
        },

        setScores: function (score) {
            this.scores[this.currentKick] = score;
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
        },

        // Score
        getChance: function () {
            return _Score.getChance();
        },

        getCurrentKick: function () {
            return _Score.getCurrentKick();
        },

        setCurrentKick: function (k) {
            return _Score.setCurrentKick(k);
        },

        getScores: function () {
            return _Score.getScores();
        },

        setScores: function (score) {
            return _Score.setScores(score);
        }
    }
})();

var StartScene = (function () {
    var _Start = {
        mainWindow: undefined,

        init: function () {
            Renderer.renderScore();
            this.mainWindow = new UI.View(0, 0, Application.getCanvasWidth(), Application.getCanvasHeight());
            this.mainWindow.drawView(Application.getCanvasCtx());

            var canvasWidth = Application.getCanvasWidth();
            var canvasHeight = Application.getCanvasHeight();
            var backgroundImageView = new UI.ImageView(0, 0, canvasWidth, canvasHeight, Assets.images().full_background);

            var startButtonWidth = Application.getCanvasWidth() * 0.6;
            var startButtonHeight = startButtonWidth / 4;
            var startButtonX = Application.getCanvasWidth() / 2 - startButtonWidth / 2;
            var startButtonY = Application.getCanvasHeight() * 0.6;
            var startButton = new UI.Button(startButtonX, startButtonY, startButtonWidth, startButtonHeight);
            startButton.cornerRadius = 35;
            startButton.label.text = "Start";
            startButton.label.font_size = "4";
            startButton.addTarget(function () {
                Game.loop();
            }, "touch");

            this.mainWindow.addSubview(backgroundImageView);
            this.mainWindow.addSubview(startButton);
        }
    };

    return {
        init: function () {
            return _Start.init();
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

            if (GameObjects.getKeeperX() === undefined) {
                GameObjects.setKeeperX(Application.getCanvasWidth() / 2);
            }

            if (GameObjects.getKeeperX() >= GameObjects.getGuardMaxX()) {
                this.keeperDirection = 1;
            } else if (GameObjects.getKeeperX() <= GameObjects.getGuardMinX()) {
                this.keeperDirection = -1;
            }

            if (!this.showingResult && GameObjects.getCurrentKick() < 3) {
                GameObjects.setKeeperX(GameObjects.getKeeperX() - this.delta * 500 * Application.getScale() * this.keeperDirection);
            }

            Renderer.render();
            Renderer.renderGoalPostAndKeeper();

            if (GameObjects.getDragEndX() !== undefined) {
                if (!this.showingResult && GameObjects.getCurrentKick() < 3) {
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
            }

            if (GameObjects.getCurrentKick() === 3) {
                Renderer.renderGameOver();
            }

            Renderer.renderBall();
            Renderer.renderScore();

            // keeper catch the ball.
            if (GameObjects.getBallCurrentX() > GameObjects.getKeeperX() - 20 && GameObjects.getBallCurrentX() + GameObjects.getBallWidth() < GameObjects.getKeeperX() + GameObjects.getKeeperWidth() + 20
                && GameObjects.getBallCurrentY() < GameObjects.getKeeperY() + GameObjects.getKeeperHeight() && GameObjects.getBallCurrentY() > GameObjects.getKeeperY()) {
                this.showMissShot();
            }

            // out of bound - miss shot
            else if (GameObjects.getBallCurrentX() <= 0 || GameObjects.getBallCurrentX() >= Application.getCanvasWidth()) {
                this.showMissShot();
            }

            // win
            else if (GameObjects.getBallCurrentY() <= GameObjects.getGoalPostY() + GameObjects.getGoalPostHeight() * 0.7
                && GameObjects.getBallCurrentX() > GameObjects.getGoalPostX() && GameObjects.getBallCurrentX() + GameObjects.getBallWidth() < GameObjects.getGoalPostX() + GameObjects.getGoalPostWidth()) {
                this.showShotIn();
            }

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
                var kick = GameObjects.getCurrentKick() + 1;
                GameObjects.setScores(1);
                GameObjects.setCurrentKick(kick);
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
                var kick = GameObjects.getCurrentKick() + 1;
                GameObjects.setScores(0);
                GameObjects.setCurrentKick(kick);

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

window.addEventListener('load', ScoreCanvas.init, false);
window.addEventListener('load', Application.init, false);

