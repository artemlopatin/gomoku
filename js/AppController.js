;
'use strict';

var AppController = function(model, view) {
    var AppController = this;
    this.model = model;
    this.view = view;

    this.init = function() {
        AppController.mouse = new MouseController(view.canvas, AppController.move, AppController.click);
        AppController.newGame(2);
        AppController.view.inputNewGameX.onclick = function() {
            AppController.newGame(1);
        };
        AppController.view.inputNewGameO.onclick = function() {
            AppController.newGame(2);
        };
    };

    this.newGame = function(a) {
        this.view.renderBoard();
        this.model.setStartData(a);
        if (a === 2)
            this.moveAI();
    };

    this.moveAI = function() {
        var nm = model.moveAI();
        this.view.renderMove(nm);
        if (!this.model.playing)
            this.view.renderWinLine();
    };

    this.moveUser = function() {
        if (!this.model.emptyCell())
            return;
        var nm = this.model.moveUser();
        this.view.renderMove(nm);
        this.view.setStyleCursorDefault();
        if (!this.model.playing)
            this.view.renderWinLine();
        else
            this.moveAI();
    };

    this.move = function(x, y) {
        if (!AppController.model.playing)
            return;
        AppController.nm = AppController.view.setStyleCursor(x, y);
        AppController.model.setNM(AppController.nm);
    };

    this.click = function() {
        if (!AppController.model.playing)
            return;
        AppController.moveUser();
    };

    this.init();
};