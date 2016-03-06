'use strict';

(new function() {
    var App = this;
    this.files = ['js/AppModel.js', 'js/MouseController.js'];
    this.loadedFiles = 0;
    this.model;
    this.init = function() {
        var head = document.getElementsByTagName('head')[0];
        for (var i in App.files)
        {
            var script = document.createElement('script');
            script.src = App.files[i];
            script.onload = App.start;
            head.appendChild(script);
        }
    };
    this.start = function() {
        App.loadedFiles++;
        if (App.loadedFiles === App.files.length)
        {
            App.model = new AppModel();
            App.model.init();
        }
    };
    return function() {
        window.onload = App.init;
    };
})();