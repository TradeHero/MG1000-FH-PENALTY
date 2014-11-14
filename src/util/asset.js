var Asset;
Asset = (function () {
    // images dictionary
    this.images = {
        "background": "assets/img-bkg.png",
        "goal_post": "assets/img-goalpost.png",
        "goalkeeper": "assets/img-goalkeeper.png",
        "ball": "assets/img-ball.png"
    };

    var assetsLoaded = 0;                                // how many assets have been loaded
    this.totalAsset = Object.keys(this.images).length;  // total number of assets
    /**
     * Ensure all assets are loaded before using them
     * @param {number} dic  - Dictionary name ('images')
     * @param {number} name - Asset name in the dictionary
     */
    function assetLoaded(dic, name) {

        // don't count assets that have already loaded
        if (this[dic][name].status !== "loading") {
            return;
        }
        this[dic][name].status = "loaded";
        assetsLoaded++;
        // finished callback
        if (assetsLoaded === Asset.totalAsset && typeof Asset.finished === "function") {
            Asset.finished();
        }
    }

    /**
     * Create assets, set callback for asset loading, set asset source
     */
    this.downloadAll = function () {
        var _this = this;
        var src;
        // load images
        for (var img in this.images) {

            if (this.images.hasOwnProperty(img)) {
                src = this.images[img];
                // create a closure for event binding
                (function (_this, img) {
                    _this.images[img] = new Image();
                    _this.images[img].status = "loading";
                    _this.images[img].name = img;
                    _this.images[img].onload = function () {
                        assetLoaded.call(_this, "images", img);
                    };

                    _this.images[img].src = src;
                })(_this, img);
            }
        }
    };
    return {
        images: this.images,
        totalAsset: this.totalAsset,
        downloadAll: this.downloadAll
    };
})();
Asset.finished = function () {
    Game.loop();
};
