define([
    "Underscore",
    "jQuery",
    "yapp/yapp",
    "utils/updates"
], function(_, $, yapp, Updates) {
    var logging = yapp.Logger.addNamespace("player");

    var toHHMMSS = function (sec_num) {
        sec_num = Math.floor(sec_num);
        var hours   = Math.floor(sec_num / 3600);
        var minutes = Math.floor((sec_num - (hours * 3600)) / 60);
        var seconds = sec_num - (hours * 3600) - (minutes * 60);

        if (hours   < 10) {hours   = "0"+hours;}
        if (minutes < 10) {minutes = "0"+minutes;}
        if (seconds < 10) {seconds = "0"+seconds;}
        var time    = hours+':'+minutes+':'+seconds;
        return time;
    };


    // List Item View
    var Player = yapp.View.extend({
        className: "player",
        template: "player.html",
        events: {
            
        },
        initialize: function() {
            Player.__super__.initialize.apply(this, arguments);
            this.toolbarTimeout = null;
            this.playing = false;
            this.duration = 0;
            this.position = 0;

            Updates.on("streaming:stats", this.setStats, this);
            return this;
        },

        finish: function() {
            var $video = $(this.video());

            $video.on("loadedmetadata", _.bind(function () {
                this.duration = this.video().duration;
            }, this));

            $video.on("timeupdate", _.bind(function () {
                this.setPlayCurrentTime(this.video().currentTime);
            }, this));

            return Player.__super__.finish.apply(this, arguments);
        },

        /* Set play progress */
        setPlayCurrentTime: function(p) {
            var percent;
            this.position = p;
            percent = Math.floor((this.position*100)/this.duration);
            this.$(".bar .play").css("width", percent+"%");
            this.$(".toolbar .duration").text(toHHMMSS(this.position)+" / "+toHHMMSS(this.duration));
        },

        /* Set stat */
        setStats: function(stats) {
            if (stats.progress != null) {
                this.$(".bar .download").css("width", Math.floor(stats.progress*100)+"%");
            }
            if (stats.download_speed != null) {
                this.$(".toolbar .speed").text(stats.download_speed+" KB/s");
            }
            return this;
        },

        /* Get video element */
        video: function() {
            return this.$("video")[0];
        },

        /* Play the video */
        play: function() {
            this.playing = true;
            this.toolbarHide(4000);
            this.video().play();
        },

        /* Pause the video */
        pause: function() {
            this.playing = false;
            this.toolbarShow();
            this.video().pause();
        },

        /* Play/Pause the video */
        togglePlay: function() {
            if (this.playing) {
                this.pause();
            } else {
                this.play();
            }
        },

        /* Show player toolbar */
        toolbarShow: function() {
            if (this.toolbarTimeout != null) clearTimeout(this.toolbarTimeout);
            this.toolbarTimeout = null;
            this.$(".toolbar").removeClass("hide");
            return this;
        },

        /* Hide player toolbar */
        toolbarHide: function(t) {
            if (this.toolbarTimeout != null) clearTimeout(this.toolbarTimeout);
            this.toolbarTimeout = setTimeout(_.bind(function() {
                this.$(".toolbar").addClass("hide");
            }, this), t || 0);
            return this;
        },

        /* Show player */
        show: function() {
            this.$el.addClass("active");
        },

        /* Hide player */
        hide: function() {
            this.$el.removeClass("active");
        }
    });

    yapp.View.Template.registerComponent("player", Player);

    return Player;
});