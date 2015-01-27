/**
 * Created by LiHao on 12/29/14.
 */
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