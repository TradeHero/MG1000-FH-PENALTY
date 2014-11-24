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

var Config = (function () {

    var _contextName = null;
    var _hostURI = null;

    // public interface
    return {
        setContextName: function (name) {
            _contextName = name;
        },
        getContextName: function () {
            return _contextName;
        },
        setHostURI: function(URI){
            _hostURI = URI
        },
        isMobile: function () {
            return Utility.isMobile.any();
        },
        getHostURI: function(){
            return _hostURI;
        }
    }

})();

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
        mobileScale: 1.7,
        canvas: undefined,
        ctx: undefined,
        isGameStart: false,

        init: function () {
            this.width = window.innerWidth;

            if (!Utility.isMobile.any()) {
                this.width = 760;
            }

            this.height = this.width / this.ratio;
            this.scale = this.width / 800;
            this.canvas = document.createElement("canvas");
            this.canvas.width = this.width;
            this.canvas.height = this.height;
            this.canvas.id = "mainCanvas";
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

                if (Application.getIsGameStart()) {
                    startTouchX = e.touches[0].pageX;
                    startTouchY = e.touches[0].pageY;
                    startTime = Date.now();
                }
            }, false);
            window.addEventListener('touchmove', function (e) {
                // disable zoom and scroll
                e.preventDefault();
            }, false);
            window.addEventListener('touchend', function (e) {
                // as above
                e.preventDefault();
                if (startTouchX !== e.changedTouches[0].pageX || startTouchY !== e.changedTouches[0].pageY) {
                    if (Application.getIsGameStart()) {
                        var duration = Date.now() - startTime;
                        Input.drag(startTouchX, startTouchY, e.changedTouches[0].pageX, e.changedTouches[0].pageY, duration);
                    }
                }

            }, false);

            window.addEventListener('mousedown', function (e) {
                e.preventDefault();
                // first touch from the event
                //INPUT.trigger(e.touches[0]);

                if (Application.getIsGameStart()) {
                    startTouchX = e.pageX;
                    startTouchY = e.pageY;
                    startTime = Date.now();
                }
            }, false);

            window.addEventListener('mouseup', function (e) {
                // as above
                e.preventDefault();
                if (startTouchX !== e.pageX || startTouchY !== e.pageY) {
                    if (Application.getIsGameStart()) {
                        var duration = Date.now() - startTime;
                        Input.drag(startTouchX, startTouchY, e.pageX, e.pageY, duration);
                    }
                }

            }, false);

            Assets.beginLoad();
        },

        getCanvasWidth: function () {
            //return window.innerWidth;
            return this.width;
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
        },

        getMobileScale: function () {
            return this.mobileScale;
        },

        getIsGameStart: function () {
            return this.isGameStart;
        },

        setIsGameStart: function (isGameStart) {
            this.isGameStart = isGameStart;
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
        },
        getMobileScale: function () {
            return _Application.getMobileScale();
        },
        getIsGameStart: function () {
            return _Application.getIsGameStart();
        },
        setIsGameStart: function (isGameStart) {
            return _Application.setIsGameStart(isGameStart);
        }
    };
})();

var ScoreCanvas = (function () {
    var width = window.innerWidth;
    var height = 118;
    var mobileScale = 1.7;

    if (!Utility.isMobile.any()) {
        width = 760;
    } else {
        height *= mobileScale;
    }

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
            //this.canvas.alpha = 0;
            //this.canvas.style.visibility = "hidden";
            this.canvas.style.display = "none";
            //ctx.fillColor = 'rgb(29, 173, 241)';
            //ctx.fillRect(0, 0, canvasWidth, canvasHeight);


            var bluediv = document.createElement('div');
            bluediv.id = 'bluediv';
            bluediv.style.backgroundColor = 'rgb(29, 173, 241)';
            bluediv.style.width = canvasWidth + "px";
            bluediv.style.height = (canvasHeight + 1) + "px";
            bluediv.style.borderColor = 'transparent';

            //add action to blue div



            var body = document.body;
            body.appendChild(this.canvas);
            body.appendChild(bluediv);

            //$('bluediv').addEvent()
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
                GameObjects.setBallWidth(ballImage.width * Application.getScale() * 1.2);
                GameObjects.setBallHeight(ballImage.height * Application.getScale() * 1.2);
                GameObjects.setBallCurrentX(GameObjects.getBallStartX());
                GameObjects.setBallCurrentY(GameObjects.getBallStartY());
            }

            if (GameObjects.getCurrentKick() === 0) {
                var tutorialLabel = new UI.Label(Application.getCanvasWidth() / 2, GameObjects.getBallStartY() - GameObjects.getBallHeight(), Application.getCanvasWidth(), 80, "Swipe the ball to shoot!");
                tutorialLabel.text_color = "white";
                tutorialLabel.font_weight = '700';
                tutorialLabel.y = tutorialLabel.y +10;
                tutorialLabel.font_size = Config.isMobile() ? '4.5' : '3';
                this.mainWindow.addSubview(tutorialLabel);

            }

            var ball = new UI.Button(GameObjects.getBallCurrentX(), GameObjects.getBallCurrentY(), GameObjects.getBallWidth(), GameObjects.getBallHeight());
            ball.image = ballImage;
            ball.label.text = "";
            this.mainWindow.addSubview(ball);
        },

        renderGoal: function () {
            var goalText = new UI.Label(Application.getCanvasWidth() / 2, Application.getCanvasHeight() / 2, Application.getCanvasWidth() / 2, 30, "GOAL!!");
            goalText.font_size = "5";
            goalText.text_color = "green";
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
            mainWindow.background_color = "gray";
            var scoreLabel = new UI.Label(ScoreCanvas.getCanvasWidth() * 0.1, ScoreCanvas.getCanvasHeight() / 2, 200, 30, "Scores");
            scoreLabel.text_allign = "left";
            scoreLabel.text_color = "white";
            scoreLabel.font_size = 4;

            var scores = GameObjects.getScores();
            var ballImage = Assets.images().ball;
            var ballImageWidth = ballImage.width * 2;
            var ballImageHeight = ballImage.height * 2;
            var startX = scoreLabel.x + scoreLabel.width * 1.5;

            if (!Utility.isMobile.any()) {
                ballImageWidth /= Application.getMobileScale();
                ballImageHeight /= Application.getMobileScale();
                scoreLabel.font_size /= Application.getMobileScale();
                startX = scoreLabel.x + scoreLabel.width;
            }

            var mark = new UI.ImageView(startX, ScoreCanvas.getCanvasHeight() / 2 - ballImageHeight / 2, ballImageWidth, ballImageHeight, ballImage);

            mainWindow.drawView(ScoreCanvas.getCanvasCtx());
            scoreLabel.drawView(ScoreCanvas.getCanvasCtx());

            for (var i in scores) {
                if (scores.hasOwnProperty(i)) {
                    if (scores[i] === 1) {
                        mark.alpha = 1.0;
                    } else if (scores[i] === 0) {
                        mark.alpha = 0.3;
                    }

                    mark.drawView(ScoreCanvas.getCanvasCtx());
                    mark.x += ballImageWidth + 50;

                }
            }
        },

        renderKickLabel: function () {
            var kickText = new UI.Label(Application.getCanvasWidth() / 2, Application.getCanvasHeight() / 2, Application.getCanvasWidth() / 2, 30, "KICK " + (GameObjects.getCurrentKick() + 1).toString());
            kickText.alpha = Game.getKickLabelAlpha();
            kickText.font_size = "5";
            kickText.text_color = "White";
            this.mainWindow.addSubview(kickText);
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
        },
        renderKickLabel: function () {
            return _Renderer.renderKickLabel();
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
        startButton: undefined,

        init: function () {
            Renderer.renderScore();
            this.mainWindow = new UI.View(0, 0, Application.getCanvasWidth(), Application.getCanvasHeight());
            this.mainWindow.drawView(Application.getCanvasCtx());

            var canvasWidth = Application.getCanvasWidth();
            var canvasHeight = Application.getCanvasHeight();
            var backgroundImageView = new UI.ImageView(0, 0, canvasWidth, canvasHeight, Assets.images().full_background);

            var buttonBackground = Assets.images().play_now_button;
            var buttonRatio = buttonBackground.width / buttonBackground.height;
            var startButtonWidth = Application.getCanvasWidth() * 0.7;
            var startButtonHeight = startButtonWidth / buttonRatio;
            var startButtonX = Application.getCanvasWidth() / 2 - startButtonWidth / 2;
            var startButtonY = Application.getCanvasHeight() * 0.3;

            var labelsX = startButtonX + startButtonWidth * 0.25;
            var labelsY = startButtonY + 30 * 1.7;
            var playNowLabel = new UI.Label(labelsX, labelsY, 300, 50, "");
            playNowLabel.text = "Play Now!";
            playNowLabel.font_size = Config.isMobile() ? '3' : '2';
            playNowLabel.text_color = 'white';
            playNowLabel.font_weight = '700';
            playNowLabel.text_allign = 'left';

            var helpTextLabel = new UI.Label(labelsX, labelsY + 10 + 50, 500, 50, "");
            helpTextLabel.text = "Help " + Config.getContextName() + " win his iPhone 6...";
            helpTextLabel.font_size = Config.isMobile() ? '2' : '1.5';
            helpTextLabel.text_color = 'white';
            helpTextLabel.text_allign = 'left';
            //helpTextLabel.x = startButtonX + startButtonWidth * 0.58;

            this.startButton = new UI.Button(startButtonX, startButtonY, startButtonWidth, startButtonHeight);
            this.startButton.cornerRadius = 35;
            //this.startButton.label.x = startButtonX + startButtonWidth * 0.58;
            //this.startButton.label.y = startButtonY + startButtonHeight * 0.6;
            //this.startButton.label.text = "Help " + Config.getContextName() + " win his iPhone 6...";
            this.startButton.label.text = "";
            //this.startButton.label.font_size = "2";
            //this.startButton.label.lineHeight = "35px";
            //this.startButton.label.text_color = "white";
            this.startButton.image = Assets.images().play_now_button;

            if (Utility.isMobile.any()) {
                //goLabel.x = startButtonX + startButtonWidth * 0.25;
            }

            this.startButton.addTarget(function () {
                document.body.removeChild(document.getElementById("bluediv"));
                ScoreCanvas.getCanvas().style.display = "block";

                if (shareSection.getIsChecked()) {
                    //TODO: hardcoded url need to change
                    atomic.get(Config.getHostURI() + 'api/games/fhpenalty/FacebookShare?access_token='+getURLParameter("access_token"))
                        .success(function (data, xhr) {
                            console.log("success");
                        })
                        .error(function (data, xhr) {
                            console.log("error?");
                        });
                }

                Application.setIsGameStart(true);
                Input.resetRegisterControls();
                Game.loop();
            }, "touch");

            this.mainWindow.addSubview(backgroundImageView);
            this.mainWindow.addSubview(this.startButton);
            this.mainWindow.addSubview(playNowLabel);
            this.mainWindow.addSubview(helpTextLabel);
            shareSection.init(this.mainWindow);
        },
        getStartButton: function () {
            return this.startButton;
        }
    };

    return {
        init: function () {
            return _Start.init();
        },
        getStartButton: function () {
            return _Start.getStartButton();
        }
    }
})();

var ResultScene = (function () {
    var _Result = {
        init: function () {
            Renderer.renderScore();
            this.mainWindow = new UI.View(0, 0, Application.getCanvasWidth(), Application.getCanvasHeight());
            this.mainWindow.drawView(Application.getCanvasCtx());

            var canvasWidth = Application.getCanvasWidth();
            var canvasHeight = Application.getCanvasHeight();
            var backgroundImageView = new UI.ImageView(0, 0, canvasWidth, canvasHeight, Assets.images().background);

            var resultLabelX = canvasWidth / 2;
            var resultLabelY = canvasHeight * 0.1;
            // TODO: post owner username
            var score = GameObjects.getScores()[0] + GameObjects.getScores()[1] + GameObjects.getScores()[2];
            var resultLabel = new UI.Label(resultLabelX, resultLabelY, canvasWidth * 0.9, 60, "You have earned " + score.toString() + " goals for Ryne!");
            resultLabel.font_size = "2";
            resultLabel.text_color = "white";

            switch (score) {
                case 0:
                    resultLabel.text = "Oops! You have scored no goals for Ryne.";
                    resultLabel.text_color = "#efefef";
                    break;

                case 1:
                    resultLabel.text = "You have scored a goal for Ryne!";
                    break;

                default:
                    break;
            }

            var shareButtonRatio = Assets.images().share_fb.width / Assets.images().share_fb.height;
            var shareButtonWidth = canvasWidth * 0.8;
            var shareButtonHeight = shareButtonWidth / shareButtonRatio;
            var shareButtonX = canvasWidth / 2 - shareButtonWidth / 2;
            var shareButtonY = canvasHeight * 0.7 - shareButtonHeight / 2;
            var shareButton = new UI.Button(shareButtonX, shareButtonY, shareButtonWidth, shareButtonHeight);
            shareButton.image = Assets.images().share_fb;
            shareButton.label.text = "";

            if (!shareSection.getIsChecked()) {
                shareButton.addTarget(function (sender) {
                    sender.enabled = false;
                    sender.enabled = false;
                    sender.image = Assets.images().share_fb_succeed;
                    sender.drawView(Application.getCanvasCtx());

                    //TODO: hardcoded url need to change
                    atomic.get(Config.getHostURI() + 'api/games/fhpenalty/FacebookShare?access_token=' + getURLParameter("access_token"))
                        .success(function (data, xhr) {
                            sender.enabled = false;
                            sender.image = Assets.images().share_fb_succeed;
                            sender.drawView(Application.getCanvasCtx());
                        })
                        .error(function (data, xhr) {
                            console.log("error?");
                        });
                }, "touch");
            }


            if (Utility.isMobile.any()) {
                resultLabel.font_size *= Application.getMobileScale();
                resultLabel.lineHeight *= Application.getMobileScale();
                shareButton.label.font_size *= Application.getMobileScale();
            } else {
                if (score > 0) {
                    resultLabel.y = canvasHeight * 0.2;
                }
            }

            //TODO: hardcoded url need to change
            atomic.get(Config.getHostURI() + 'api/games/fhpenalty/RecordEggPoints?access_token=' + getURLParameter("access_token") + '&eggId=' + getURLParameter("eggId") + '&points=' + score.toString())
                .success(function (data, xhr) {
                })
                .error(function (data, xhr) {
                });

            this.mainWindow.addSubview(backgroundImageView);
            this.mainWindow.addSubview(resultLabel);

            if (!shareSection.getIsChecked()) {
                this.mainWindow.addSubview(shareButton);
            }

        }
    };

    return {
        init: function () {
            return _Result.init();
        }
    };
})();

var Game = (function () {
    var _Game = {
        // time for calculate fps, max on 60 due to rAF
        delta: 0,
        currentTime: 0,
        lastTime: 0,
        keeperDirection: 1,
        resultTimer: 0,
        kickLabelTimer: 0,
        kickLabelAlpha: 0,
        showingResult: false,

        loop: function () {
            var self = this;

            if (GameObjects.getCurrentKick() < 3) {
                window.requestAnimFrame(function () {
                    self.loop();
                });
            }

            //fps.update();
            this.currentTime = Date.now();
            this.delta = (this.currentTime - this.lastTime) / 1000;

            if (this.delta > 1) {
                this.delta = 0;
            }

            Renderer.render();
            //Renderer.renderKickLabel();

            this.kickLabelTimer += this.delta;
            UI.View.animate(1.5, 1, this.kickLabelTimer, function () {
                Game.setKickLabelAlpha(Game.getKickLabelAlpha() + Game.getDelta() / 1.5);
            }, function () {
            });

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
                ResultScene.init();
            } else {
                Renderer.renderBall();
                Renderer.renderScore();
            }

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
        },

        getKickLabelAlpha: function () {
            return this.kickLabelAlpha;
        },

        setKickLabelAlpha: function (x) {
            this.kickLabelAlpha = x;
        },

        getDelta: function () {
            return this.delta;
        }
    };

    return {
        loop: function () {
            return _Game.loop();
        },
        getKickLabelAlpha: function () {
            return _Game.getKickLabelAlpha();
        },
        setKickLabelAlpha: function (x) {
            return _Game.setKickLabelAlpha(x);
        },
        getDelta: function () {
            return _Game.getDelta();
        }
    }
})();

var Banner = (function () {
    var _Banner = {
        init: function () {
            var banner = document.createElement("div");
            banner.id = "banner";
            banner.style.width = "760px";
            banner.style.height = "100px";
            banner.style.backgroundColor = "rgb(64,64,64)";

            document.body.appendChild(banner);
        },

        setUpContent: function (banner) {

            banner.style.background = Utility.isMobile.Android()
                ? 'url(\'http://portalvhdskgrrf4wksb8vq.blob.core.windows.net/fh-penalty/top-banner-google.png\')'
                : 'url(\'http://portalvhdskgrrf4wksb8vq.blob.core.windows.net/fh-penalty/top-banner-apple.png\')';


            $(banner).on('click', function () {
                window.location.href = "https://itunes.apple.com/sg/app/footballhero-sports-prediction/id859894802?mt=8&uo=4";
            });

            $(banner).on('touchstart', function () {
                window.location.href = "https://itunes.apple.com/sg/app/footballhero-sports-prediction/id859894802?mt=8&uo=4";
            });

            if (Utility.isMobile.any()) {
                var ratio = 760 / 100;

                banner.style.width = window.innerWidth + "px";
                banner.style.height = window.innerWidth / ratio + "px";
                banner.style.backgroundSize = 'cover'
            }
        }
    };

    return {
        init: function () {
            return _Banner.init();
        },

        setUpContent: function (banner) {
            return _Banner.setUpContent(banner)
        }
    };
})();

var BannerTwo = (function () {
    var _BannerTwo = {
        init: function () {
            var banner = document.createElement("div");
            banner.id = "bannerTwo";
            banner.style.width = "760px";
            banner.style.height = "100px";
            banner.style.backgroundColor = "rgb(64,64,64)";

            document.body.appendChild(banner);
        },

        setUpContent: function (banner) {
            banner.style.background = Utility.isMobile.Android()
                ? 'url(\'http://portalvhdskgrrf4wksb8vq.blob.core.windows.net/fh-penalty/bottom-banner-google.png\')'
                : 'url(\'http://portalvhdskgrrf4wksb8vq.blob.core.windows.net/fh-penalty/bottom-banner-apple.png\')';

            $(banner).on('click', function () {
                window.location.href = "https://itunes.apple.com/sg/app/footballhero-sports-prediction/id859894802?mt=8&uo=4";
            });

            $(banner).on('touchstart', function () {
                window.location.href = "https://itunes.apple.com/sg/app/footballhero-sports-prediction/id859894802?mt=8&uo=4";
            });

            if (Utility.isMobile.any()) {
                var ratio = 760 / 100;

                banner.style.width = window.innerWidth + "px";
                banner.style.height = window.innerWidth / ratio + "px";
                banner.style.backgroundSize = 'cover'
            }
        }
    };

    return {
        init: function () {
            return _BannerTwo.init();
        },

        setUpContent: function (banner) {
            return _BannerTwo.setUpContent(banner)
        }
    };
})();

var shareSection = (function () {
    var _shareSection = {
        shareBanner: undefined,
        isChecked: true,

        init: function (mainWindow) {
            var canvasWidth = Application.getCanvasWidth();
            var canvasHeight = Application.getCanvasHeight();
            var shareBannerRatio = Assets.images().uncheck.width / Assets.images().uncheck.height;
            var shareBannerWidth = Application.getCanvasWidth() * 0.8;
            var shareBannerHeight = shareBannerWidth / shareBannerRatio;
            var shareBannerX = canvasWidth / 2 - shareBannerWidth / 2;
            var shareBannerY = canvasHeight * 0.7;

            this.shareBanner = new UI.Button(shareBannerX, shareBannerY, shareBannerWidth, shareBannerHeight);
            this.shareBanner.image = Assets.images().check;
            this.shareBanner.label.text = "";
            this.shareBanner.addTarget(function (sender) {
                if (shareSection.getIsChecked()) {
                    $('.cd-popup').addClass('is-visible');
                    StartScene.getStartButton().enabled = false;
                } else {
                    shareSection.setIsChecked(true);
                    shareSection.getShareBanner().image = Assets.images().check;
                    shareSection.getShareBanner().drawView(Application.getCanvasCtx());
                }
            }, "touch");
            //this.shareBanner = document.createElement("div");
            //this.shareBanner.id = "shareBanner";
            //this.shareBanner.style.width = (760 * 0.9) + "px";
            //this.shareBanner.style.height = "130px";
            //this.shareBanner.style.backgroundColor = "rgba(0,0,0,0)";
            //this.shareBanner.style.backgroundImage = "url('http://portalvhdskgrrf4wksb8vq.blob.core.windows.net/fh-penalty/Checked.png')";
            //this.shareBanner.style.backgroundSize = (760 * 0.9) +"px 130px";
            //this.shareBanner.style.marginTop = "30%";

            //var tickButton = document.createElement("button");
            //tickButton.id = "tickButton";
            //tickButton.style.width = "60px";
            //tickButton.style.height = "60px";
            //tickButton.style.marginTop = "38px";
            //tickButton.style.marginLeft = "32px";
            ////tickButton.setAttribute('href', '#0');
            //tickButton.className = "cd-popup-trigger";
            //tickButton.style.backgroundColor = "rgba(0,0,0,0)";
            //tickButton.style.border = "0";

            var popUp = document.createElement("div");
            popUp.className = "cd-popup";
            popUp.setAttribute("role", "alert");
            popUp.style.zIndex = "5";
            var popCon = document.createElement("div");
            popCon.className = "cd-popup-container";
            //var containerWidth =
            popCon.style.width = Config.isMobile() ? '90%' : '40%';
            var msg = document.createElement("p");
            msg.innerHTML = "Are you sure you don't want to win an iPhone 6?!";
            var ul = document.createElement("ul");
            ul.className = "cd-buttons";
            var yesButton = document.createElement("li");
            var noButton = document.createElement("li");
            var yesContent = document.createElement("a");
            var noContent = document.createElement("a");
            var yestemporaryDiv = document.createElement('div');
            yestemporaryDiv.innerHTML = "Yes";
            var notemporaryDiv = document.createElement('div');
            notemporaryDiv.innerHTML = "No";
            yesContent.setAttribute('href', '#0');
            yesContent.appendChild(yestemporaryDiv);
            noContent.setAttribute('href', '#0');
            noContent.appendChild(notemporaryDiv);

            yesButton.appendChild(yesContent);
            noButton.appendChild(noContent);
            ul.appendChild(noButton);
            ul.appendChild(yesButton);
            popCon.appendChild(msg);
            popCon.appendChild(ul);
            popUp.appendChild(popCon);


            //if (Utility.isMobile.any()) {
            //    this.shareBanner.style.width = window.innerWidth * 0.9 + "px";
            //    this.shareBanner.style.height = "170px";
            //    this.shareBanner.style.backgroundSize = window.innerWidth * 0.9 +"px 170px";
            //    this.shareBanner.style.marginTop = "52%";
            //    //tickButton.style.marginTop = "65px";
            //    //tickButton.style.marginLeft = "55px";
            //}

            //document.body.appendChild(this.shareBanner);
            document.body.appendChild(popUp);
            //this.shareBanner.appendChild(tickButton);
            mainWindow.addSubview(this.shareBanner);

            jQuery(document).ready(function ($) {
                //open popup
                //$('.cd-popup-trigger').on('click', function (event) {
                //    event.preventDefault();
                //    if (shareSection.getIsChecked()) {
                //        $('.cd-popup').addClass('is-visible');
                //        StartScene.getStartButton().enabled = false;
                //        console.log(StartScene.getStartButton());
                //    } else {
                //        shareSection.setIsChecked(true);
                //        shareSection.getShareBanner().style.backgroundImage = "url('http://portalvhdskgrrf4wksb8vq.blob.core.windows.net/fh-penalty/Checked.png')";
                //    }
                //});
                //
                //$('.cd-popup-trigger').on('touchstart', function (event) {
                //    event.preventDefault();
                //    if (shareSection.getIsChecked()) {
                //        $('.cd-popup').addClass('is-visible');
                //        StartScene.getStartButton().enabled = false;
                //        console.log(StartScene.getStartButton());
                //    } else {
                //        shareSection.setIsChecked(true);
                //        shareSection.getShareBanner().style.backgroundImage = "url('http://portalvhdskgrrf4wksb8vq.blob.core.windows.net/fh-penalty/Checked.png')";
                //    }
                //});

                //close popup
                $('.cd-popup').on('click', function (event) {
                    if ($(event.target).is('.cd-popup-close') || $(event.target).is('.cd-popup')) {
                        event.preventDefault();
                        $(this).removeClass('is-visible');
                        setTimeout(function () {
                            StartScene.getStartButton().enabled = true;
                        }, 100);
                    }
                });

                $('.cd-popup').on('touchstart', function (event) {
                    if ($(event.target).is('.cd-popup-close') || $(event.target).is('.cd-popup')) {
                        event.preventDefault();
                        $(this).removeClass('is-visible');
                        setTimeout(function () {
                            StartScene.getStartButton().enabled = true;
                        }, 100);
                    }
                });

                $(yestemporaryDiv).on('click', function (event) {
                    event.preventDefault();
                    $('.cd-popup').removeClass('is-visible');
                    setTimeout(function () {
                        StartScene.getStartButton().enabled = true;
                    }, 100);
                });

                $(notemporaryDiv).on('touchstart', function (event) {
                    event.preventDefault();
                    $('.cd-popup').removeClass('is-visible');
                    setTimeout(function () {
                        StartScene.getStartButton().enabled = true;
                    }, 100);
                });

                $(yesContent).on('click', function (event) {
                    //shareSection.getShareBanner().style.backgroundImage = "url('http://portalvhdskgrrf4wksb8vq.blob.core.windows.net/fh-penalty/Uncheck.png')";
                    shareSection.getShareBanner().image = Assets.images().uncheck;
                    shareSection.getShareBanner().drawView(Application.getCanvasCtx());
                    shareSection.setIsChecked(false);
                    event.preventDefault();
                    $('.cd-popup').removeClass('is-visible');
                    setTimeout(function () {
                        StartScene.getStartButton().enabled = true;
                    }, 100);
                });

                $(yesContent).on('touchstart', function (event) {
                    //shareSection.getShareBanner().style.backgroundImage = "url('http://portalvhdskgrrf4wksb8vq.blob.core.windows.net/fh-penalty/Uncheck.png')";
                    shareSection.getShareBanner().image = Assets.images().uncheck;
                    shareSection.getShareBanner().drawView(Application.getCanvasCtx());
                    shareSection.setIsChecked(false);
                    event.preventDefault();
                    $('.cd-popup').removeClass('is-visible');
                    setTimeout(function () {
                        StartScene.getStartButton().enabled = true;
                    }, 100);
                });


                //close popup when clicking the esc keyboard button
                $(document).keyup(function (event) {
                    if (event.which == '27') {
                        $('.cd-popup').removeClass('is-visible');
                        StartScene.getStartButton().enabled = true;
                    }
                });
            });

        },

        getIsChecked: function () {
            return this.isChecked;
        },
        setIsChecked: function (check) {
            this.isChecked = check;
        },
        getShareBanner: function () {
            return this.shareBanner;
        }
    };

    return {
        init: function (mainWindow) {
            return _shareSection.init(mainWindow);
        },
        getIsChecked: function () {
            return _shareSection.getIsChecked();
        },
        setIsChecked: function (check) {
            return _shareSection.setIsChecked(check);
        },
        getShareBanner: function () {
            return _shareSection.getShareBanner();
        }
    }
})();

function getURLParameter(name) {
    return decodeURIComponent((new RegExp('[?|&]' + name + '=' + '([^&;]+?)(&|#|;|$)').exec(location.search) || [, ""])[1].replace(/\+/g, '%20')) || null
}

window.addEventListener('load', Banner.init, false);
window.addEventListener('load', ScoreCanvas.init, false);
//window.addEventListener('load', shareSection.init, false);
window.addEventListener('load', Application.init, false);
window.addEventListener('load', BannerTwo.init, false);
