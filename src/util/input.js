var Input = (function () {
    var _x = 0;
    var _y = 0;
    var _registeredControls = [];

    var _intersect = function (x, y) {
        for (var i in _registeredControls) {
            if (_registeredControls.hasOwnProperty(i)) {
                var view = _registeredControls[i];
                var largestX = view.x + view.width;
                var largestY = view.y + view.height;

                if ((x <= largestX && y <= largestY) && (x >= view.x && y >= view.y)) {
                    return view;
                }
            }
        }
        return undefined;
    };

    var _trigger = function (data) {
        this.x = (data.pageX - Application.getCanvas().offsetLeft);
        this.y = (data.pageY - Application.getCanvas().offsetTop);
        var control = _intersect(this.x, this.y);

        if (control !== undefined && control.enabled) {
            control.allTargets()["touch"](control);
        }
    };

    var _drag = function (startX, startY, endX, endY, duration) {
        //var control = _intersect(startX, startY);
        //
        //if (control !== undefined && control.enabled) {
        //
        //}

        if (GameObjects.getDragDuration() === undefined) {
            GameObjects.setDragDuration(duration);
            GameObjects.setDragStartX(startX);
            GameObjects.setDragStartY(startY);
            GameObjects.setDragEndX(endX);
            GameObjects.setDragEndY(endY);
        }
    };

    //public interface
    return {
        getRegistedControls: function () {
            return _registeredControls;
        },
        intersect: function (x, y) {
            _intersect(x, y);
        },
        trigger: function (data) {
            _trigger(data);
        },
        drag: function (startX, startY, endX, endY, duration) {
            _drag(startX, startY, endX, endY, duration)
        },
        resetRegisterControls: function () {
            _registeredControls = [];
        }
    }
})();