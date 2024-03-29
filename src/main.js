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
    var _maxAllowableGoals = null;
    var _grandPrize = null;
    var _targetPoints = null;

    // public interface
    return {
        setContextName: function (name) {
            _contextName = name;
        },
        getContextName: function () {
            return _contextName;
        },
        setHostURI: function (URI) {
            _hostURI = URI
        },
        getHostURI: function () {
            return _hostURI;
        },
        prepareGameResult: function (max) {
            _maxAllowableGoals = max;
        },
        getPrepareGameResult: function () {
            return _maxAllowableGoals;
        },
        isMobile: function () {
            return Utility.isMobile.any();
        },
        setGrandPrize: function (p) {
            _grandPrize = p;
        },
        getGrandPrize: function () {
            return _grandPrize;
        },
        setTargetPoints: function (t) {
            _targetPoints = t;
        },
        getTargetPoints:function () {
            return _targetPoints;
        }
    }

})();

var URLConfig = (function () {
    var _shareToFB = "api/PenaltyKick/fhpenalty/FacebookShare?access_token=";
    var _recordPoints = "api/PenaltyKick/fhpenalty/RecordEggPoints?access_token=";
    var _recordDownload = "api/PenaltyKick/fhpenalty/RecordEggAppDownload?egg=";
    var _postEggResultToFB = "api/PenaltyKick/fhpenalty/PostEggResultToFB?access_token=";
    return {
        getShareToFBApi: function () {
            return Config.getHostURI() + _shareToFB;
        },
        getRecordPointsApi: function () {
            return Config.getHostURI() + _recordPoints;
        },
        getRecordDownload: function () {
            return Config.getHostURI() + _recordDownload+getURLParameter("egg")+"&access_token=";
        },
        getPostEggResultToFB: function () {
            return Config.getHostURI() + _postEggResultToFB;
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
            this.canvas.style.cursor = "pointer";
            this.ctx = this.canvas.getContext("2d");

            var body = document.getElementById('absolcenter');
            body.style.height = Config.isMobile() ? '1200px' : '900px';
            body.appendChild(this.canvas);

            var startTouchX = 0;
            var startTouchY = 0;
            var startTime = 0;
            var go = GameObjects;
            var isClickForStart = true;

            // listen for clicks
            this.canvas.addEventListener('click', function (e) {
                e.preventDefault();
                Input.trigger(e);

                if (!isClickForStart) {
                    var duration = Math.floor(Math.random() * (800 - 100)) + 100;
                    if (Application.getIsGameStart() && !Utility.isMobile.any()) {
                        Input.drag(go.getBallStartX(), go.getBallStartY(),
                            (e.pageX - Application.getCanvas().offsetLeft), (e.pageY - Application.getCanvas().offsetTop), duration);
                    }
                }

                if (Application.getIsGameStart()) {
                    isClickForStart = false;
                }
            }, false);

            // listen for touches
            this.canvas.addEventListener('touchstart', function (e) {
                e.preventDefault();
                // first touch from the event
                Input.trigger(e.touches[0]);

                if (Application.getIsGameStart()) {
                    startTouchX = e.touches[0].pageX;
                    startTouchY = e.touches[0].pageY;
                    startTime = Date.now();
                }
            }, false);
            this.canvas.addEventListener('touchmove', function (e) {
                // disable zoom and scroll
                e.preventDefault();
            }, false);
            this.canvas.addEventListener('touchend', function (e) {
                // as above
                e.preventDefault();
                if (startTouchX !== e.changedTouches[0].pageX || startTouchY !== e.changedTouches[0].pageY) {
                    if (Application.getIsGameStart()) {
                        var duration = Date.now() - startTime;
                        Input.drag(startTouchX, startTouchY, e.changedTouches[0].pageX, e.changedTouches[0].pageY, duration);
                    }
                }

            }, false);

            //this.canvas.addEventListener('mousedown', function (e) {
            //    e.preventDefault();
            //    // first touch from the event
            //    //INPUT.trigger(e.touches[0]);
            //
            //    if (Application.getIsGameStart()) {
            //        startTouchX = e.pageX;
            //        startTouchY = e.pageY;
            //        startTime = Date.now();
            //    }
            //}, false);
            //
            //this.canvas.addEventListener('mouseup', function (e) {
            //    // as above
            //    e.preventDefault();
            //    if (startTouchX !== e.pageX || startTouchY !== e.pageY) {
            //        if (Application.getIsGameStart()) {
            //            var duration = Date.now() - startTime;
            //            Input.drag(startTouchX, startTouchY, e.pageX, e.pageY, duration);
            //        }
            //    }
            //
            //}, false);

            Assets.beginLoad();
        },

        getCanvasWidth: function () {
            return this.width;
        },

        getCanvasHeight: function () {
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
            var canvasWidth = width;
            var canvasHeight = height;
            this.canvas = document.createElement("canvas");
            this.canvas.width = canvasWidth;
            this.canvas.height = canvasHeight;
            this.ctx = this.canvas.getContext("2d");
            this.canvas.style.display = "none";

            var engagingText = document.createElement('p');
            engagingText.id = "engaging";
            engagingText.innerHTML = "Score <b style='font-size: 1em; font-weight: 700'>"+ Config.getTargetPoints() +" goals</b> to win a "+ Config.getGrandPrize() +"!";
            engagingText.style.fontSize = Config.isMobile() ? '2.5em' : '2em';
            engagingText.style.lineHeight = Config.isMobile() ? '3em' : '2em';
            engagingText.style.color = 'white';
            engagingText.style.fontWeight = '400';
            var engagingSuppText = document.createElement('p');
            engagingSuppText.id = "engagingSupp";
            engagingSuppText.innerHTML = "Play from now to <b style='font-size: 1em; font-weight: 700'>December 31st!</b>";
            engagingSuppText.style.fontSize = Config.isMobile() ? '2em' : '1.5em';
            //engagingSuppText.style.lineHeight = Config.isMobile() ? '1.5em' : '1.5em';
            engagingSuppText.style.color = 'white';
            engagingSuppText.style.fontWeight = '400';

            var bluediv = document.createElement('div');
            bluediv.id = 'bluediv';
            bluediv.style.backgroundImage = !Config.isMobile()
                ? 'url(\'http://portalvhdskgrrf4wksb8vq.blob.core.windows.net/fh-penalty/img-score-760x119.png\')'
                : 'url(\'http://portalvhdskgrrf4wksb8vq.blob.core.windows.net/fh-penalty/img-score-980x202.png\')';
            bluediv.style.backgroundSize = 'cover';
            bluediv.style.width = canvasWidth + "px";
            bluediv.style.height = (canvasHeight + 1) + "px";
            bluediv.style.borderColor = 'transparent';

            bluediv.appendChild(engagingText);
            bluediv.appendChild(engagingSuppText);

            var body = document.getElementById('absolcenter');
            body.appendChild(this.canvas);
            body.appendChild(bluediv);
        },

        getCanvasWidth: function () {
            return width;
        },

        getCanvasHeight: function () {
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
                GameObjects.setKeeperY(80 * Application.getScale());
                GameObjects.setKeeperPost(Assets.images().goalkeeper);
            }

            //var keeperRatio = GameObjects.getKeeperPost().width / GameObjects.getKeeperPost().height;
            //GameObjects.getKeeperPost().height = goalkeeperImage.height;
            //GameObjects.getKeeperPost().width = keeperRatio * GameObjects.getKeeperPost().height;
            //GameObjects.setKeeperWidth(GameObjects.getKeeperPost().width * Application.getScale());
            //GameObjects.setKeeperHeight(GameObjects.getKeeperPost().height * Application.getScale());

            var goalPostImageView = new UI.ImageView(GameObjects.getGoalPostX(), GameObjects.getGoalPostY(),
                GameObjects.getGoalPostWidth(), GameObjects.getGoalPostHeight(), goalPostImage);
            var goalkeeperImageView = new UI.ImageView(GameObjects.getKeeperX(), GameObjects.getKeeperY(), GameObjects.getKeeperWidth(), GameObjects.getKeeperHeight(), GameObjects.getKeeperPost());

            if (GameObjects.getGuardMaxX() === undefined) {
                GameObjects.setGuardMinX(GameObjects.getGoalPostX() + GameObjects.getGoalPostWidth() * 0.3);
                GameObjects.setGuardMaxX((GameObjects.getGuardMinX() + GameObjects.getGoalPostWidth() * 0.4) - GameObjects.getKeeperWidth());
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
                GameObjects.setBallAlpha(1.0);
            }

            if (GameObjects.getCurrentKick() === 0) {
                var tutorialLabel = new UI.Label(Application.getCanvasWidth() / 2, GameObjects.getBallStartY() - GameObjects.getBallHeight(), Application.getCanvasWidth(), 80, "Swipe the ball to shoot!");
                tutorialLabel.text_color = "white";
                tutorialLabel.font_weight = '700';
                tutorialLabel.y = tutorialLabel.y + 10;
                tutorialLabel.font_size = Config.isMobile() ? '4.5' : '3';
                this.mainWindow.addSubview(tutorialLabel);

            }

            var ball = new UI.Button(GameObjects.getBallCurrentX(), GameObjects.getBallCurrentY(), GameObjects.getBallWidth(), GameObjects.getBallHeight());
            ball.image = ballImage;
            ball.label.text = "";
            ball.alpha = GameObjects.getBallAlpha();

            this.mainWindow.addSubview(ball);
        },

        renderGoal: function () {
            var goalText = new UI.Label(Application.getCanvasWidth() / 2, Application.getCanvasHeight() / 2, Application.getCanvasWidth() / 2, 30, "GOAL!!");
            goalText.font_size = "5";
            goalText.text_color = "rgb(0, 255, 22)";
            goalText.font_weight = "700";
            this.mainWindow.addSubview(goalText);
        },

        renderMiss: function () {
            var missText = new UI.Label(Application.getCanvasWidth() / 2, Application.getCanvasHeight() / 2, Application.getCanvasWidth() / 2, 30, "MISS!!");
            missText.font_size = "5";
            missText.text_color = "red";
            missText.font_weight = "700";
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
        ballAlpha: undefined,

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
        getBallAlpha : function () {
            return this.ballAlpha;
        },
        setBallAlpha : function (alpha) {
            this.ballAlpha = alpha
        },
        getVelocity: function () {
            if (this.getDragEndX() === undefined) return undefined;

            var dx = this.getDragEndX() - this.getDragStartX();
            var dy = this.getDragEndY() - this.getDragStartY();
            var distance = Math.sqrt(dx * dx + dy * dy);

            console.log(this.getDragDuration());
            var velocity = distance / this.getDragDuration();

            if (velocity < 0.8) {
                velocity = 0.8;
            }

            return velocity;
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
            this.ballAlpha = 1.0;
        }
    };

    var _Keeper = {
        guardMinX: undefined,
        guardMaxX: undefined,
        keeperX: undefined,
        keeperY: undefined,
        keeperWidth: undefined,
        keeperHeight: undefined,
        keeperPost: undefined,

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
        getKeeperPost: function () {
            return this.keeperPost;
        },
        setKeeperPost: function (keeperPost) {
            this.keeperPost = keeperPost;
            this.setKeeperWidth(keeperPost.width * Application.getScale());
            this.setKeeperHeight(keeperPost.height * Application.getScale());
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

    var _FinalMatch = {
        getMatchFinalResults: function () {
            var results = [0, 0, 0];

            // get the fixed probability from client and constant 3 goals to calculate possible goals.
            var fixedProbability = Config.getPrepareGameResult();
            var maxGoals = Math.round(3 * fixedProbability);

            // config tampered, set max goals to zero
            maxGoals = maxGoals > 3 || maxGoals < 0 ? 0 : maxGoals;
            if (maxGoals === 0){
                return results;
            } else if (maxGoals === 3) {
                return [1, 1, 1];
            }

            var count = 0;
            while (count < maxGoals) {
                var randIndex = this.getRandomNumber(0, 3);
                if (results[randIndex] === 1) {
                    continue
                }
                results[randIndex] = 1;
                count++;
            }

            return results;
        },
        getRandomNumber: function (min, max) {
            return Math.floor(Math.random() * (max - min) + min);
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
        getBallAlpha: function () {
            return _Ball.getBallAlpha();
        },
        setBallAlpha: function (alpha) {
            return _Ball.setBallAlpha(alpha);
        },
        // KEEPER
        getGuardMinX: function () {
            return _Keeper.getGuardMinX();
        },
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
        getKeeperPost: function () {
            return _Keeper.getKeeperPost();
        },
        setKeeperPost: function (keeperPost) {
            return _Keeper.setKeeperPost(keeperPost);
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
        },
        // Get Final Results
        getFinalResults: function () {
            return _FinalMatch.getMatchFinalResults();
        }
    }
})();

var StartScene = (function () {
    var _Start = {
        mainWindow: undefined,
        startActionButton: undefined,

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
            helpTextLabel.text = "Help " + Config.getContextName() + " win the prize!";
            helpTextLabel.font_size = Config.isMobile() ? '2' : '1.25';
            helpTextLabel.text_color = 'white';
            helpTextLabel.text_allign = 'left';

            // visual start button for UI only
            var visualStartButton = new UI.Button(startButtonX, startButtonY, startButtonWidth, startButtonHeight);
            visualStartButton.cornerRadius = 35;
            visualStartButton.label.text = "";
            visualStartButton.image = Assets.images().play_now_button;

            // the real start button which able for user click anywhere above the share button to start
            this.startActionButton = new UI.Button(0, 0, canvasWidth, canvasHeight * 0.7);
            this.startActionButton.alpha = 0;
            this.startActionButton.label.text = "";
            this.startActionButton.addTarget(function () {
                document.getElementById('absolcenter').removeChild(document.getElementById("bluediv"));
                ScoreCanvas.getCanvas().style.display = "block";

                if (shareSection.getIsChecked()) {
                    Network.get(URLConfig.getShareToFBApi() + getURLParameter("access_token") + "&egg=" + getURLParameter("egg"))
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
            this.mainWindow.addSubview(visualStartButton);
            this.mainWindow.addSubview(this.startActionButton);
            this.mainWindow.addSubview(playNowLabel);
            this.mainWindow.addSubview(helpTextLabel);
            shareSection.init(this.mainWindow);
        },
        getStartButton: function () {
            return this.startActionButton;
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
            var resultLabelY = canvasHeight * 0.75;

            var score = GameObjects.getScores()[0] + GameObjects.getScores()[1] + GameObjects.getScores()[2];
            var resultLabel = new UI.Label(resultLabelX, resultLabelY, canvasWidth * 0.9, 60, "You just scored " + score.toString() + " goals for " + Config.getContextName() + "!");
            resultLabel.font_size = "1.5";
            resultLabel.text_color = "white";
            resultLabel.font_weight = "700";

            switch (score) {
                case 0:
                    resultLabel.text = "Oops! You just scored no goals for " + Config.getContextName() + ".";
                    resultLabel.text_color = "#efefef";
                    break;

                case 1:
                    resultLabel.text = "You just scored a goal for " + Config.getContextName() + "!";
                    break;

                default:
                    break;
            }

            var appStoreImageRatio = Assets.images().appStore.width / Assets.images().appStore.height;
            var appStoreImageHeight = canvasHeight * 0.15;
            var appStoreImageWidth = appStoreImageHeight * appStoreImageRatio;
            var appStoreImageX = canvasWidth * 0.1;
            var appStoreImageY = canvasHeight * 0.04;
            var appStoreButton = new UI.Button(appStoreImageX, appStoreImageY, appStoreImageWidth, appStoreImageHeight);
            appStoreButton.image = Assets.images().appStore;
            appStoreButton.label.text = "";

            var playStoreImageRatio = Assets.images().googlePlay.width / Assets.images().googlePlay.height;
            var playStoreImageWidth = appStoreImageHeight * playStoreImageRatio;
            var playStoreImageX = canvasWidth * 0.2 + appStoreImageWidth;
            var playStoreButton = new UI.Button(playStoreImageX, appStoreImageY, playStoreImageWidth, appStoreImageHeight);
            playStoreButton.image = Assets.images().googlePlay;
            playStoreButton.label.text = "";

            var dlSectionButtonRatio = Assets.images().download_section.width / Assets.images().download_section.height;
            var dlSectionButtonWidth = canvasWidth * 0.9;
            var dlSectionButtonHeight = dlSectionButtonWidth / dlSectionButtonRatio;
            var dlSectionButtonX = canvasWidth / 2 - dlSectionButtonWidth / 2;
            var dlSectionButtonY = canvasHeight * 0.5 - dlSectionButtonHeight / 2;
            var dlSectionButton = new UI.Button(dlSectionButtonX, dlSectionButtonY, dlSectionButtonWidth, dlSectionButtonHeight);
            dlSectionButton.image = Assets.images().download_section;
            dlSectionButton.label.text = "";

            var shareButtonRatio = Assets.images().share_fb.width / Assets.images().share_fb.height;
            var shareButtonWidth = canvasWidth * 0.7;
            var shareButtonHeight = shareButtonWidth / shareButtonRatio;
            var shareButtonX = canvasWidth / 2 - shareButtonWidth / 2;
            var shareButtonY = canvasHeight * 0.75 - shareButtonHeight / 2;
            var shareButton = new UI.Button(shareButtonX, shareButtonY, shareButtonWidth, shareButtonHeight);
            shareButton.image = Assets.images().share_fb;
            shareButton.label.text = "";

            if (Utility.isMobile.any()) {
                resultLabel.font_size *= Application.getMobileScale();
                resultLabel.lineHeight *= Application.getMobileScale();
                shareButton.label.font_size *= Application.getMobileScale();
            } //else {
            //    if (score > 0) {
            //        resultLabel.y = canvasHeight * 0.6;
            //    }
            //}

            //Network.get(URLConfig.getPostEggResultToFB() + getURLParameter("access_token") + '&egg=' + getURLParameter("egg") + '&points=' + score.toString())
            //    .success(function (data, xhr) {
            //
            //    })
            //    .error(function (data, xhr) {
            //    });

            Network.get(URLConfig.getRecordPointsApi() + getURLParameter("access_token") + '&egg=' + getURLParameter("egg") + '&points=' + score.toString())
                .success(function (data, xhr) {

                    var d = JSON.parse(data);
                    var currentPoints = d.currentPoints || 0;
                    var remainingPoints = (Config.getTargetPoints() - currentPoints).toString();
                    var name = Config.getContextName();
                    if (name === "your friend") {
                        name = "Your friend";
                    }
                    var resultLabelTwo = new UI.Label(resultLabelX, resultLabelY + canvasHeight * 0.1, canvasWidth * 0.9, 60, name + " still needs " + remainingPoints + " goals!");
                    resultLabelTwo.font_size = "1.5";
                    resultLabelTwo.text_color = "white";
                    resultLabelTwo.font_weight = "700";

                    if (Utility.isMobile.any()) {
                        resultLabelTwo.font_size *= Application.getMobileScale();
                        resultLabelTwo.lineHeight *= Application.getMobileScale();
                    }

                    resultLabelTwo.drawView(Application.getCanvasCtx());
                })
                .error(function (data, xhr) {
                });

            this.mainWindow.addSubview(backgroundImageView);
            this.mainWindow.addSubview(resultLabel);

            //var resultLabelTwo = new UI.Label(resultLabelX, resultLabelY + canvasHeight * 0.1, canvasWidth * 0.9, 60, Config.getContextName() + " still needs 98 goals!");
            //resultLabelTwo.font_size = "2";
            //resultLabelTwo.text_color = "white";
            //resultLabelTwo.font_weight = "700";

            if (Utility.isMobile.any()) {
                var x = (canvasWidth - appStoreImageWidth) / 2;
                var buttonAction;
                if (!shareSection.getIsChecked()) {
                    buttonAction = new UI.Button(x, appStoreButton.y, appStoreButton.width, appStoreButton.height);
                } else {
                    buttonAction= new UI.Button(0,0, canvasWidth, canvasHeight);
                }

                buttonAction.label.text = "";
                buttonAction.alpha = 0;

                if (Utility.isMobile.iOS()) {
                    appStoreButton.x = x;

                    buttonAction.addTarget(function (sender) {
                        Network.get(URLConfig.getRecordDownload() + getURLParameter("access_token"))
                            .success(function (data, xhr) {
                                console.log("success");
                            })
                            .error(function (data, xhr) {
                                console.log("error?");
                            });
                        window.open("https://itunes.apple.com/sg/app/footballhero-sports-prediction/id859894802?mt=8&uo=4");
                    }, "touch");

                    this.mainWindow.addSubview(appStoreButton);
                } else {
                    playStoreButton.x = x;

                    buttonAction.addTarget(function (sender) {
                        Network.get(URLConfig.getRecordDownload() + getURLParameter("access_token"))
                            .success(function (data, xhr) {
                                console.log("success");
                            })
                            .error(function (data, xhr) {
                                console.log("error?");
                            });
                        window.open("https://play.google.com/store/apps/details?id=com.myhero.fh");
                    }, "touch");

                    this.mainWindow.addSubview(playStoreButton);
                }
                this.mainWindow.addSubview(buttonAction);
            } else {
                this.mainWindow.addSubview(appStoreButton);
                this.mainWindow.addSubview(playStoreButton);
            }

            //resultLabelTwo.drawView(Application.getCanvasCtx());

            if (!shareSection.getIsChecked()) {
                shareButton.y = dlSectionButtonY;
                shareButton.addTarget(function (sender) {
                    sender.enabled = false;
                    sender.image = Assets.images().share_fb_succeed;
                    sender.drawView(Application.getCanvasCtx());

                    if (!shareSection.getIsChecked()) {
                        Network.get(URLConfig.getShareToFBApi() + getURLParameter("access_token") + "&egg=" + getURLParameter("egg"))
                            .success(function (data, xhr) {
                                sender.enabled = false;
                                sender.image = Assets.images().share_fb_succeed;
                                sender.drawView(Application.getCanvasCtx());
                            })
                            .error(function (data, xhr) {
                                console.log("error?");
                            });
                    }
                }, "touch");

                this.mainWindow.addSubview(shareButton);
            } else {
                this.mainWindow.addSubview(dlSectionButton);
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
    var results = 0;
    var _Game = {
        // time for calculate fps, max on 60 due to rAF
        delta: 0,
        currentTime: 0,
        lastTime: 0,
        keeperDirection: 1,
        keeperTimer: 0,
        resultTimer: 0,
        kickLabelTimer: 0,
        kickLabelAlpha: 0,
        showingResult: false,
        randomNum: (Math.random() > 0.3) ? 1 : 0,

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
                results = GameObjects.getFinalResults();
                GameObjects.setKeeperX(Application.getCanvasWidth() / 2);
            }

            //if (GameObjects.getKeeperX() >= GameObjects.getGuardMaxX()) {
            //    this.keeperDirection = 1;
            //} else if (GameObjects.getKeeperX() <= GameObjects.getGuardMinX()) {
            //    this.keeperDirection = -1;
            //}

            this.keeperTimer += this.delta;
            if (!this.showingResult && GameObjects.getCurrentKick() < 3) {
                //GameObjects.setKeeperX(GameObjects.getKeeperX() - this.delta * 500 * Application.getScale() * this.keeperDirection);
                var keeperSpeed = Config.getPrepareGameResult();

                if (keeperSpeed > 0.2) {
                    keeperSpeed = 0.2;
                }

                if (this.keeperTimer > keeperSpeed) {
                    GameObjects.setKeeperX(GameObjects.getNewKeeperPosition());
                    this.keeperTimer = 0;
                }
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
            else if (GameObjects.getBallCurrentX() <= 0 || GameObjects.getBallCurrentX() >= Application.getCanvasWidth() || GameObjects.getBallCurrentY() >= Application.getCanvasHeight()) {
                this.showMissShot();
            }

            // win
            else if (GameObjects.getBallCurrentY() <= GameObjects.getGoalPostY() + GameObjects.getGoalPostHeight() * 0.7
                && GameObjects.getBallCurrentX() > GameObjects.getGoalPostX() && GameObjects.getBallCurrentX() + GameObjects.getBallWidth() < GameObjects.getGoalPostX() + GameObjects.getGoalPostWidth()) {

                var middlePoint = (GameObjects.getGuardMaxX() + GameObjects.getGuardMinX()) / 2;
                if (results[GameObjects.getCurrentKick()] === 1) {
                    if (this.randomNum === 0) {
                        this.keeperBlockTheBall();
                        this.showMissShot();
                    } else {
                        if (GameObjects.getBallCurrentX() > middlePoint) {
                            GameObjects.setKeeperX(GameObjects.getGuardMinX() - GameObjects.getGoalPostWidth() * 0.15);
                            GameObjects.setKeeperPost(Assets.images().img_goalkeeper_noball_left);
                        } else {
                            GameObjects.setKeeperX(GameObjects.getGuardMaxX());
                            GameObjects.setKeeperPost(Assets.images().img_goalkeeper_noball_right);
                        }
                        this.showShotIn();
                    }
                } else {
                    this.keeperBlockTheBall();
                    this.showMissShot();
                }
            }

            this.lastTime = this.currentTime;
        },

        keeperBlockTheBall: function () {
            if (GameObjects.getBallCurrentX() > GameObjects.getGuardMaxX()) {
                GameObjects.setKeeperPost(Assets.images().img_goalkeeper_dash_right);
                GameObjects.setBallAlpha(0);
                GameObjects.setKeeperX(GameObjects.getBallCurrentX() - GameObjects.getKeeperWidth() * 0.7);
            } else if (GameObjects.getBallCurrentX() < GameObjects.getGuardMinX()) {
                GameObjects.setKeeperPost(Assets.images().img_goalkeeper_dash_left);
                GameObjects.setBallAlpha(0);
                GameObjects.setKeeperX(GameObjects.getBallCurrentX());
            }
        },

        newShot: function () {
            this.randomNum = (Math.random() > 0.3) ? 1 : 0;
            GameObjects.resetBall();
            GameObjects.setKeeperPost(Assets.images().goalkeeper);
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

            document.getElementById('absolcenter').appendChild(banner);
        },

        setUpContent: function (banner) {

            banner.style.background = Utility.isMobile.Android()
                ? 'url(\'http://portalvhdskgrrf4wksb8vq.blob.core.windows.net/fh-penalty/top-banner-google.png\')'
                : 'url(\'http://portalvhdskgrrf4wksb8vq.blob.core.windows.net/fh-penalty/top-banner-apple.png\')';
            //

            $(banner).on('click', function () {
                Network.get(URLConfig.getRecordDownload() + getURLParameter("access_token"))
                    .success(function (data, xhr) {
                        console.log("success");
                    })
                    .error(function (data, xhr) {
                        console.log("error?");
                    });

                Network.get(URLConfig.getShareToFBApi() + getURLParameter("access_token") + "&egg=" + getURLParameter("egg"))
                    .success(function (data, xhr) {
                        console.log("success");
                    })
                    .error(function (data, xhr) {
                        console.log("error?");
                    });

                window.open(!Utility.isMobile.Android()
                    ? "https://itunes.apple.com/sg/app/footballhero-sports-prediction/id859894802?mt=8&uo=4"
                    : "https://play.google.com/store/apps/details?id=com.myhero.fh");
            });

            $(banner).on('touchstart', function () {
                Network.get(URLConfig.getRecordDownload() + getURLParameter("access_token"))
                    .success(function (data, xhr) {
                        console.log("success");
                    })
                    .error(function (data, xhr) {
                        console.log("error?");
                    });

                Network.get(URLConfig.getShareToFBApi() + getURLParameter("access_token") + "&egg=" + getURLParameter("egg"))
                    .success(function (data, xhr) {
                        console.log("success");
                    })
                    .error(function (data, xhr) {
                        console.log("error?");
                    });

                window.open(!Utility.isMobile.Android()
                    ? "https://itunes.apple.com/sg/app/footballhero-sports-prediction/id859894802?mt=8&uo=4"
                    : "https://play.google.com/store/apps/details?id=com.myhero.fh");
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

            document.getElementById('absolcenter').appendChild(banner);
        },

        setUpContent: function (banner) {
            banner.style.background = Utility.isMobile.iOS()
                ? 'url(\'http://portalvhdskgrrf4wksb8vq.blob.core.windows.net/fh-penalty/bottom-banner-apple.png\')'
                : 'url(\'http://portalvhdskgrrf4wksb8vq.blob.core.windows.net/fh-penalty/bottom-banner-google.png\')';

            $(banner).on('click', function () {
                Network.get(URLConfig.getRecordDownload() + getURLParameter("access_token"))
                    .success(function (data, xhr) {
                        console.log("success");
                    })
                    .error(function (data, xhr) {
                        console.log("error?");
                    });

                Network.get(URLConfig.getShareToFBApi() + getURLParameter("access_token") + "&egg=" + getURLParameter("egg"))
                    .success(function (data, xhr) {
                        console.log("success");
                    })
                    .error(function (data, xhr) {
                        console.log("error?");
                    });

                window.open(Utility.isMobile.iOS()
                    ? "https://itunes.apple.com/sg/app/footballhero-sports-prediction/id859894802?mt=8&uo=4"
                    : "https://play.google.com/store/apps/details?id=com.myhero.fh");
            });

            $(banner).on('touchstart', function () {
                Network.get(URLConfig.getRecordDownload() + getURLParameter("access_token"))
                    .success(function (data, xhr) {
                        console.log("success");
                    })
                    .error(function (data, xhr) {
                        console.log("error?");
                    });

                Network.get(URLConfig.getShareToFBApi() + getURLParameter("access_token") + "&egg=" + getURLParameter("egg"))
                    .success(function (data, xhr) {
                        console.log("success");
                    })
                    .error(function (data, xhr) {
                        console.log("error?");
                    });

                window.open(Utility.isMobile.iOS()
                    ? "https://itunes.apple.com/sg/app/footballhero-sports-prediction/id859894802?mt=8&uo=4"
                    : "https://play.google.com/store/apps/details?id=com.myhero.fh");
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

            var shareBannerImage = new UI.Button(shareBannerX + shareBannerWidth * 0.03, shareBannerY + shareBannerHeight / 2 - shareBannerWidth / 16, shareBannerWidth / 8, shareBannerWidth / 8);
            shareBannerImage.label.text = "";
            shareBannerImage.alpha = 0;
            this.shareBanner = new UI.Button(shareBannerX, shareBannerY, shareBannerWidth, shareBannerHeight);
            this.shareBanner.image = Assets.images().check;
            this.shareBanner.label.text = "";
            shareBannerImage.addTarget(function (sender) {
                if (shareSection.getIsChecked()) {
                    $('.cd-popup').addClass('is-visible');
                    StartScene.getStartButton().enabled = false;
                } else {
                    shareSection.setIsChecked(true);
                    shareSection.getShareBanner().image = Assets.images().check;
                    shareSection.getShareBanner().drawView(Application.getCanvasCtx());
                }
            }, "touch");

            var popUp = document.createElement("div");
            popUp.className = "cd-popup";
            popUp.setAttribute("role", "alert");
            popUp.style.zIndex = "5";
            var popCon = document.createElement("div");
            popCon.className = "cd-popup-container";
            popCon.style.width = Config.isMobile() ? '90%' : '40%';
            var msg = document.createElement("p");
            msg.innerHTML = "Are you sure you don't want to win a "+ Config.getGrandPrize() +"?!";
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

            document.getElementById('absolcenter').appendChild(popUp);
            mainWindow.addSubview(this.shareBanner);
            mainWindow.addSubview(shareBannerImage);

            jQuery(document).ready(function ($) {
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

                $(notemporaryDiv).on('click', function (event) {
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

                $(yestemporaryDiv).on('click', function (event) {
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

                $(yestemporaryDiv).on('touchstart', function (event) {
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
window.addEventListener('load', Application.init, false);
window.addEventListener('load', BannerTwo.init, false);
