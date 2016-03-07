;
'use strict';

var AppController = function(model, view) {
    var AppController = this;
    this.model = model;
    this.view = view;

    this.init = function() {
        AppController.mouse = new MouseController(view.canvas, AppController.move, AppController.click);
        AppController.newGame(2);
    };

    this.newGame = function(a) {
        this.view.renderBoard();
        this.model.setStartData();
        if (a === 2)
            this.moveAI();
    };

    this.moveAI = function() {
        var nm = model.moveAI();
        //model.move(nm.n, nm.m);
        view.renderMove(nm);
    };
    /*
     this.GameMove = function(n, m) {
     model.move(n, m);
     view.renderMove(n, m);
     this.IsGameOver();
     };*/

    this.move = function(x, y) {
        if (!AppController.model.gameinprocess)
            return;
        AppController.nm = AppController.view.setStyleCursor(x, y);
        AppController.model.setNM(AppController.nm);
    };

    this.click = function(x, y) {
        if (!AppController.model.gameinprocess)
            return;
        var nm = AppController.model.moveUser();
        if (nm !== false) {
            AppController.view.renderMove(nm);
            AppController.view.setStyleCursor(x, y);
            AppController.moveAI();
            if (!AppController.model.gameinprocess)
                AppController.view.renderWinLine();
            //if (AppController.gameinprocess)
            //    AppController.GameMoveAI();
        }
        if (!AppController.model.gameinprocess)
            AppController.view.renderWinLine();
    };

    this.init();
};