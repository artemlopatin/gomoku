;
'use strict';

var AppModel = function() {
    this.m; // Номер ячейки по горизонтали (номер столбца)
    this.n; // Номер ячейки по вертикали (номер строки)
    this.size = 15; // Размер поля (15х15 ячеек)
    this.who; // Логическая переменная - кто сейчас ходит: true - X, false - O
    this.matrix; // Матрица игрового поля 15х15. 0 - свободная клетка, 1 - крестик, 2 - нолик
    this.freeCells; // Количество свободных ячеек. В начале каждой игры = 225
    this.hashStep; // Хеш-массив потенциальных ходов
    this.playing; // True - игра в процессе игры (пользователь может кликать на поле и т.д.)
    this.winLine; // Координаты победной линии
    this.prePattern = [ // Шаблоны построения фигрур и их веса. Х в дальнейшем заменяется на крестик (1) или нолик (0), 0 - свободная ячейка
        {s: 'xxxxx', w: 99999}, // пять в ряд (финальная выигрышная линия)
        {s: '0xxxx0', w: 7000}, // Открытая четверка
        {s: '0xxxx', w: 4000}, // Закрытая четверка
        {s: 'xxxx0', w: 4000},
        {s: '0x0xxx', w: 2000},
        {s: '0xx0xx', w: 2000},
        {s: '0xxx0x', w: 2000},
        {s: 'xxx0x0', w: 2000},
        {s: 'xx0xx0', w: 2000},
        {s: 'x0xxx0', w: 2000},
        {s: '0xxx0', w: 3000},
        {s: '0xxx', w: 1500},
        {s: 'xxx0', w: 1500},
        {s: '0xx0x', w: 800},
        {s: '0x0xx', w: 800},
        {s: 'xx0x0', w: 800},
        {s: 'x0xx0', w: 800},
        {s: '0xx0', w: 200}
    ];
    this.pattern = [[], [], []]; // Массив шаблонов для Х и 0, генерируется из предыдущих шаблонов
    this.patternWin = [0, /(1){5}/, /(2){5}/, /[01]*7[01]*/, /[02]*7[02]*/]; // Массив выигрышных шаблонов [1] и [2] и шаблон определения возможности поставить 5 в ряд
    this.directions = []; // Направления расчета потенциальных ходов
    this.step = 0; // Счетчик ходов игры

    this.init = function() {
        var s;
        var a;
        var l;
        var target = 'x';
        var pos;
        for (var i in this.prePattern) // Заполнение массива шаблонов построений фигур для крестиков (1) и ноликов (2)
        {
            s = this.prePattern[i].s;
            pos = -1;
            a = [];
            while ((pos = s.indexOf(target, pos + 1)) !== -1) {
                a[a.length] = s.substr(0, pos) + '7' + s.substr(pos + 1);
            }
            s = a.join('|');

            l = this.pattern[0].length;
            this.pattern[0][l] = this.prePattern[i].w;              // Веса шаблонов
            this.pattern[1][l] = new RegExp(s.replace(/x/g, '1'));  // Шаблоны для Х, например 01110 - открытая четверка
            this.pattern[2][l] = new RegExp(s.replace(/x/g, '2'));  // Аналогично для 0 - 022220

        }
        for (var n = -2; n <= 2; n++) // Заполнение массива потенциальных ходов (в радиусе 2 клеток)
        {                             // и установка минимальных весов (используются для расчета первых ходов, пока не появятся шаблоны)
            for (var m = -2; m <= 2; m++)
            {
                if (n === 0 && m === 0)
                    continue;
                if (Math.abs(n) <= 1 && Math.abs(m) <= 1)
                    this.directions.push({n: n, m: m, w: 3});
                else if (Math.abs(n) === Math.abs(m) || n * m === 0)
                    this.directions.push({n: n, m: m, w: 2});
                else
                    this.directions.push({n: n, m: m, w: 1});
            }
        }
    };

    this.setStartData = function(a) { // Начальные установки для каждой новой игры
        this.who = true;
        this.matrix = [];
        this.winLine = [];
        this.hashStep = {7: {7: {sum: 0, attack: 1, defence: 0, attackPattern: 0, defencePattern: 0}}}; // первый шаг, если АИ играет за Х
        this.freeCells = this.size * this.size;
        for (var n = 0; n < this.size; n++) {
            this.matrix[n] = [];
            for (var m = 0; m < this.size; m++) {
                this.matrix[n][m] = 0;
            }
        }
        this.step = 0;
        this.playing = true;
        if (a === 2)
            console.log('New Game! X - AI, O - user');
        else
            console.log('New Game! X - user, O - AI');
    };

    this.setNM = function(a) { // Установка координат текущего хода
        this.n = a.n;
        this.m = a.m;
    };

    this.emptyCell = function() { // Проверка ячейки на доступность для хода
        return this.matrix[this.n][this.m] === 0;
    };

    this.moveUser = function() { // Ход пользователя
        this.playing = false;    // Запрещаем кликать, пока идет расчет
        return this.move(this.n, this.m, false);
    };

    this.moveAI = function() { // Ход АИ
        this.playing = false;
        var n, m;
        var max = 0;
        this.calculateHashMovePattern(); // Расчет весов по заданным шаблонам ходов
        for (n in this.hashStep)         // Поиск веса лучшего хода
            for (m in this.hashStep[n])
                if (this.hashStep[n][m].sum > max)
                    max = this.hashStep[n][m].sum;
        var goodmoves = [];
        for (n in this.hashStep)         // Поиск лучших ходов (если их несколько)
            for (m in this.hashStep[n])
                if (this.hashStep[n][m].sum === max) {
                    goodmoves[goodmoves.length] = {n: parseInt(n), m: parseInt(m)};
                }
        var movenow = goodmoves[getRandomInt(0, goodmoves.length - 1)]; // Выбор хода случайным образом, если несколько ходов на выбор
        this.n = movenow.n;
        this.m = movenow.m;
        return this.move(this.n, this.m, true);
    };

    this.move = function(n, m, aiStep) { // Ход (АИ или пользователя)
        if (this.hashStep[n] && this.hashStep[n][m])
            delete this.hashStep[n][m];  // Если поле хода было в массиве потенциальных ходов, то поле удаляется из него
        this.matrix[n][m] = 2 - this.who; // Сохранение хода в матрице полей игры
        this.who = !this.who; // Переход хода от Х к О, от О к Х
        this.freeCells--;
        var t = this.matrix[this.n][this.m]; // Далее идет проверка на выигрыш в результате этого хода: поиск 5 в ряд по 4 направлениям | — / \
        var s = ['', '', '', ''];
        var nT = Math.min(this.n, 4);
        var nR = Math.min(this.size - this.m - 1, 4);
        var nB = Math.min(this.size - this.n - 1, 4);
        var nL = Math.min(this.m, 4);
        for (var j = this.n - nT; j <= this.n + nB; j++)
            s[0] += this.matrix[j][this.m];
        for (var i = this.m - nL; i <= this.m + nR; i++)
            s[1] += this.matrix[this.n][i];
        for (var i = -Math.min(nT, nL); i <= Math.min(nR, nB); i++)
            s[2] += this.matrix[this.n + i][this.m + i];
        for (var i = -Math.min(nB, nL); i <= Math.min(nR, nT); i++)
            s[3] += this.matrix[this.n - i][this.m + i];
        var k;
        if ((k = s[0].search(this.patternWin[t])) >= 0)
            this.winLine = [this.m, this.n - nT + k, this.m, this.n - nT + k + 4];
        else if ((k = s[1].search(this.patternWin[t])) >= 0)
            this.winLine = [this.m - nL + k, this.n, this.m - nL + k + 4, this.n];
        else if ((k = s[2].search(this.patternWin[t])) >= 0)
            this.winLine = [this.m - Math.min(nT, nL) + k, this.n - Math.min(nT, nL) + k, this.m - Math.min(nT, nL) + k + 4, this.n - Math.min(nT, nL) + k + 4];
        else if ((k = s[3].search(this.patternWin[t])) >= 0)
            this.winLine = [this.m - Math.min(nB, nL) + k, this.n + Math.min(nB, nL) - k, this.m - Math.min(nB, nL) + k + 4, this.n + Math.min(nB, nL) - k - 4, -1];
        this.playing = (this.freeCells !== 0 && this.winLine.length === 0); // Проверка на окончание игры (победа или нет свободных ячеек)
        if (this.playing)
            this.calculateHashMove(aiStep); // Рассчитываем веса потенциальных ходов (без шаблонов)
        console.log(++this.step + ': ' + n + ', ' + m);
        return {n: n, m: m};
    };

    this.calculateHashMove = function(attack) { // Расчет весов потенциальных ходов (без шаблонов), просто по количеству Х и О рядом (акуально в начале игры)
        for (var key in this.directions) {
            var n = this.n + this.directions[key].n;
            var m = this.m + this.directions[key].m;
            if (n < 0 || m < 0 || n >= this.size || m >= this.size)
                continue;
            if (this.matrix[n][m] !== 0)
                continue;
            if (!(n in this.hashStep))
                this.hashStep[n] = {};
            if (!(m in this.hashStep[n]))
                this.hashStep[n][m] = {sum: 0, attack: 0, defence: 0, attackPattern: 0, defencePattern: 0};
            if (attack)
                this.hashStep[n][m].attack += this.directions[key].w;
            else
                this.hashStep[n][m].defence += this.directions[key].w;
        }
    };

    this.calculateHashMovePattern = function() { // Расчет весов потенциальных ходов по заданным шаблонам
        var s;
        var k = 0;
        var attack = 2 - this.who;
        var defence = 2 - !this.who;
        var res;
        for (n in this.hashStep)
            for (m in this.hashStep[n]) // Перебор всех потенциальных ходов (*1)
            {
                this.hashStep[n][m].sum = this.hashStep[n][m].attack + this.hashStep[n][m].defence;
                this.hashStep[n][m].attackPattern = 0; // Обнуляем значение атаки по шаблону
                this.hashStep[n][m].defencePattern = 0; // Обнуляем значение защиты по шаблону
                n = parseInt(n);
                m = parseInt(m);
                for (var q = 1; q <= 2; q++) // Первым проходом расчитываем веса атаки, вторым - веса защиты
                    for (var j = 1; j <= 4; j++)
                    {
                        s = '';
                        for (var i = -4; i <= 4; i++) // Циклы перебора в радиусе 4 клеток от рассматриваемого хода (выбраннного в *1)
                            switch (j) { // Создание строк с текущим состоянием клеток по 4 направлениям, такого вида 000172222
                                case 1:  // где 7 - это рассматриваемый ход, 0 - свободная ячейка, 1 - крестик, 2 - нолик
                                    if (n + i >= 0 && n + i < this.size)
                                        s += (i === 0) ? '7' : this.matrix[n + i][m];
                                    break;
                                case 2:
                                    if (m + i >= 0 && m + i < this.size)
                                        s += (i === 0) ? '7' : this.matrix[n][m + i];
                                    break;
                                case 3:
                                    if (n + i >= 0 && n + i < this.size)
                                        if (m + i >= 0 && m + i < this.size)
                                            s += (i === 0) ? '7' : this.matrix[n + i][m + i];
                                    break;
                                case 4:
                                    if (n - i >= 0 && n - i < this.size)
                                        if (m + i >= 0 && m + i < this.size)
                                            s += (i === 0) ? '7' : this.matrix[n - i][m + i];
                                    break;
                            }
                        res = (q === 1) ? this.patternWin[2 + attack].exec(s) : this.patternWin[2 + defence].exec(s);
                        if (res === null)
                            continue;
                        if (res[0].length < 5) // Если длина возможной линии <5, то построить 5 не удастся в принципе и расчет можно не производить
                            continue;          // например, при восходящей диагонали для ячейки (0, 0) или (0, 1) или если с 2х сторон зажал соперник
                        if (q === 1) // для крестиков, если играем крестиками и наоборот. Формируем вес атаки на этом поле
                            for (var i in this.pattern[attack]) { // перебор по всем шаблонам
                                if (this.pattern[attack][i].test(s)) // если нашли соответствие
                                    this.hashStep[n][m].attackPattern += this.pattern[0][i]; // увеличиваем значимость клетки на вес шаблона
                            }
                        else // для ноликов если играем крестиками
                            for (var i in this.pattern[defence])
                                if (this.pattern[defence][i].test(s))
                                    this.hashStep[n][m].defencePattern += this.pattern[0][i];
                    }
                this.hashStep[n][m].sum += 1.1 * this.hashStep[n][m].attackPattern + this.hashStep[n][m].defencePattern; // Атака на 10% важнее защиты
                k++;
            }
    };

    this.init();
};