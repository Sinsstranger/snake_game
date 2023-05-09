//Глобальные переменные
let FIELD_SIZE_X = 16;
let FIELD_SIZE_Y = 16;
let SNAKE_SPEED = 200; //300мс
let snake = []; //Сама змейка
let direction = 'y+'; //Направление движения змейки
let oldDirection = 'y+'; //Старое направление движения змейки
let gameIsRunning = false; //Запущена ли игра
let snakeTimer; //Таймер змейки
let score = 0; //Результат
let oldScore = 0;
let pause = false;

//Генерация поля
prepareGameField();

// let wrap = document.getElementsByClassName('wrap')[0];
// //Подгоняем размер контейнера под игровое поле
// if(16 * (FIELD_SIZE_X + 1) < 200){
//     wrap.style.width = '200px';
// } else {
//     wrap.style.width = (16 * (FIELD_SIZE_X + 1)).toString() + 'px';
// 	wrap.style.height = (16 * (FIELD_SIZE_X + 1)).toString() + 'px';
// }

//Если нажата кнопка новая игра
document.getElementById('snake-new-game').addEventListener('click', startGame);
addEventListener('keydown', changeDirection);
document.querySelectorAll('.star')[0].addEventListener('click', starOneEasy);
document.querySelectorAll('.star')[1].addEventListener('click', starTwoMedium);
document.querySelectorAll('.star')[2].addEventListener('click', starThreeHard);

function prepareGameField() {
    //Создаем таблицу
    let gameTable = document.createElement('table');
    gameTable.classList.add('game-table');
    //Генерация ячеек для игровой таблицы
    for (let i = 0; i < FIELD_SIZE_Y; i++){
        let row = document.createElement('tr');
        row.classList.add('game-table-row');

        for (let j = 0; j < FIELD_SIZE_X; j++)
        {
            let cell = document.createElement('td');
            cell.classList.add('game-table-cell');
            cell.classList.add('cell-' + i + '-' + j);
            row.appendChild(cell);

            if (i%2 == 0 && j%2 == 0) { cell.classList.add('game-table-cell-color-1'); }
					  if (i%2 == 1 && j%2 == 1) { cell.classList.add('game-table-cell-color-1'); }
					  if (i%2 == 0 && j%2 == 1) { cell.classList.add('game-table-cell-color-2'); }
					  if (i%2 == 1 && j%2 == 0) { cell.classList.add('game-table-cell-color-2'); }
        }
        gameTable.appendChild(row);
    }
    document.getElementById('snake-field').appendChild(gameTable);
}

function starOneEasy() {
	document.querySelectorAll('.star')[2].classList.remove('star-fill');
	document.querySelectorAll('.star')[1].classList.remove('star-fill');
	document.querySelectorAll('.star')[2].classList.add('star-free');
	document.querySelectorAll('.star')[1].classList.add('star-free');
	SNAKE_SPEED = 300;
}
function starTwoMedium() {
	document.querySelectorAll('.star')[2].classList.remove('star-fill');
	document.querySelectorAll('.star')[1].classList.remove('star-free');
	document.querySelectorAll('.star')[1].classList.add('star-fill');
	document.querySelectorAll('.star')[2].classList.add('star-free');
	SNAKE_SPEED = 200;
}
function starThreeHard() {
	document.querySelectorAll('.star')[2].classList.remove('star-free');
	document.querySelectorAll('.star')[1].classList.remove('star-free');
	document.querySelectorAll('.star')[2].classList.add('star-fill');
	document.querySelectorAll('.star')[1].classList.add('star-fill');
	SNAKE_SPEED = 100;
}

//Старт игры
function startGame() {
	// document.body.addEventListener('touchmove', function(event) {
	// 	event.preventDefault();
	// }, false);
	// document.body.addEventListener('touchmove', function(e) {e.preventDefault();}, true);
	document.getElementById('snake-new-game').style.visibility = 'hidden';
	document.querySelector('.difficulty').style.visibility = 'hidden';
	document.getElementsByTagName('fieldset')[0].style.visibility = 'hidden';
	document.querySelector('.your-score').innerHTML = '';
    document.querySelector('.main-menu').style.width = 0;
    document.querySelector('.main-menu').style.height = 0;
    gameIsRunning = true;
    //Сброс предыдущей игры
	  document.getElementById('score').innerHTML = '&nbsp;0';
    direction = 'y+';
    oldDirection = 'y+';
    score = 0;
    for (let i = 0; i < snake.length; i++) {
        snake[i].classList.remove('snake-head');
			snake[i].classList.remove('snake-body');
			snake[i].classList.remove('snake-turn');
			snake[i].classList.remove('snake-tale');
			snake[i].style.transform = '';
    }
    snake = [];
    let units = document.getElementsByClassName('food-unit');
    for (i = 0; i < units.length; i++) {
        units[i].classList.remove('food-unit');
    }
    let walls = document.getElementsByClassName('wall-unit');
    for (i = 0; i < walls.length; i++) {
			walls[i].classList.remove('wall-unit');
		}

    //Начало новой игры
    clearInterval(snakeTimer);
    respawn();
    snakeTimer = setInterval(move, SNAKE_SPEED);
	setTimeout(createFood, 2000);
	setTimeout(createFood, 5000);
}

//Метод отвечает за расположение змейки в игровом поле
function respawn() {
    let startCoordsX = Math.floor(FIELD_SIZE_X / 2);
    let startCoordsY = Math.floor(FIELD_SIZE_Y / 2);
    //Голова змейки
    let snakeHead = document.getElementsByClassName('cell-' + startCoordsY + '-' + startCoordsX)[0];
	  snakeHead.classList.add('snake-head');
	snakeHead.style.transform = 'scale(1.6)';
    snakeHead.setAttribute('data_y', startCoordsY.toString());
    snakeHead.setAttribute('data_x', startCoordsX.toString());
    //Тело змейки
    let snakeBody = document.getElementsByClassName('cell-' + (startCoordsY + 1) + '-' + startCoordsX)[0];

	  let snakeTale = document.getElementsByClassName('cell-' + (startCoordsY + 2) + '-' + startCoordsX)[0];
	  snakeBody.classList.add('snake-body');
	snakeBody.classList.add('up');
	  snakeTale.classList.add('snake-tale');
    // snakeBody.classList.add('snake-unit');
    snake.unshift(snakeBody);
	  snake.unshift(snakeTale);
    snake.push(snakeHead);
}

//Движение змейки
function move() {
    let newUnit; //Новый элемент
	  let oldUnit; //Старый элемент(голова)
    let coordY = parseInt(snake[snake.length - 1].getAttribute('data_y'));
    let coordX = parseInt(snake[snake.length - 1].getAttribute('data_x'));

	oldUnit = document.querySelector('.cell-' + (coordY) + '-' + (coordX));

    //Определяем новую точку
    switch (direction)
    {
        case 'x-':
        	if (coordX > 0) {
						newUnit = document.querySelector('.cell-' + (coordY) + '-' + (coordX -= 1)); }
					else { newUnit = document.querySelector('.cell-' + (coordY) + '-' + (coordX = 15)); }
            if (snake.indexOf(newUnit) === -1 && newUnit !== null) {
							// newUnit.classList.add('snake-head');
							// newUnit.style.transform = 'scale(1.6) rotate(90deg)';
							// oldUnit.style.transform = '';
        	}
            break;
        case 'x+':
        	if (coordX < 15) {
            newUnit = document.querySelector('.cell-' + (coordY) + '-' + (coordX += 1)); }
            else {newUnit = document.querySelector('.cell-' + (coordY) + '-' + (coordX = 0));}
					if (snake.indexOf(newUnit) === -1 && newUnit !== null) {
						// newUnit.classList.add('snake-head');
						// newUnit.style.transform = 'scale(1.6) rotate(270deg)';
						// oldUnit.style.transform = '';
        	}
            break;
        case 'y-':
        	if (coordY < 15) {
            newUnit = document.querySelector('.cell-' + (coordY += 1) + '-' + (coordX)); }
            else { newUnit = document.querySelector('.cell-' + (coordY = 0) + '-' + (coordX)); }
					if (snake.indexOf(newUnit) === -1 && newUnit !== null) {
						// newUnit.classList.add('snake-head');
						// newUnit.style.transform = 'scale(1.6)';
						// oldUnit.style.transform = '';
        	}
            break;
        case 'y+':
        	if (coordY > 0) {
            newUnit = document.querySelector('.cell-' + (coordY -= 1) + '-' + (coordX)); }
            else {  newUnit = document.querySelector('.cell-' + (coordY = 15) + '-' + (coordX)); }
					if (snake.indexOf(newUnit) === -1 && newUnit !== null) {
						// newUnit.classList.add('snake-head');
						// newUnit.style.transform = 'scale(1.6) rotate(180deg)';
						// oldUnit.style.transform = '';
        	}
            break;
    }

    //Проверка. Не является ли новая часть частью змейки и не выходит ли за границы

			if(snake.indexOf(newUnit) === -1 && newUnit !== null  && !newUnit.classList.contains('wall-unit')) {
        snake[snake.length - 1].removeAttribute('data_y');
        snake[snake.length - 1].removeAttribute('data_x');

        // newUnit.classList.add('snake-unit');

				//Вставка головы змейки в следующую клетку (в т.ч. поворота)
				//вправо-вверх
				if ( (direction !== oldDirection) && (oldDirection === 'x+') && (direction === 'y+') ) {
					newUnit.classList.add('snake-head');
					newUnit.style.transform = 'scale(1.6)';
					oldUnit.classList.remove('snake-head');
					oldUnit.classList.add('snake-turn');
					oldUnit.style.transform = 'rotate(180deg)';
					snake[snake.length - 1].classList.add('up');
				}
				//вправо-вниз
				if ( (direction !== oldDirection) && (oldDirection === 'x+') && (direction === 'y-') ) {
					newUnit.classList.add('snake-head');
					newUnit.style.transform = 'scale(1.6) rotate(180deg)';
					oldUnit.classList.remove('snake-head');
					oldUnit.classList.add('snake-turn');
					oldUnit.style.transform = 'rotate(90deg)';
					snake[snake.length - 1].classList.add('down');
				}
				//влево-вверх
				if ( (direction !== oldDirection) && (oldDirection === 'x-') && (direction === 'y+') ) {
					newUnit.classList.add('snake-head');
					newUnit.style.transform = 'scale(1.6)';
					oldUnit.classList.remove('snake-head');
					oldUnit.classList.add('snake-turn');
					oldUnit.style.transform = 'rotate(270deg)';
					snake[snake.length - 1].classList.add('up');
				}
				//влево-вниз
				if ( (direction !== oldDirection) && (oldDirection === 'x-') && (direction === 'y-') ) {
					newUnit.classList.add('snake-head');
					newUnit.style.transform = 'scale(1.6) rotate(180deg)';
					oldUnit.classList.remove('snake-head');
					oldUnit.classList.add('snake-turn');
					oldUnit.style.transform = '';
					snake[snake.length - 1].classList.add('down');
				}
				//вверх-вправо
				if ( (direction !== oldDirection) && (oldDirection === 'y+') && (direction === 'x+') ) {
					newUnit.classList.add('snake-head');
					newUnit.style.transform = 'scale(1.6) rotate(90deg)';
					oldUnit.classList.remove('snake-head');
					oldUnit.classList.add('snake-turn');
					oldUnit.style.transform = '';
					snake[snake.length - 1].classList.add('right');
				}
				//вверх-влево
				if ( (direction !== oldDirection) && (oldDirection === 'y+') && (direction === 'x-') ) {
					newUnit.classList.add('snake-head');
					newUnit.style.transform = 'scale(1.6) rotate(270deg)';
					oldUnit.classList.remove('snake-head');
					oldUnit.classList.add('snake-turn');
					oldUnit.style.transform = 'rotate(90deg)';
					snake[snake.length - 1].classList.add('left');
				}
				//вниз-вправо
				if ( (direction !== oldDirection) && (oldDirection === 'y-') && (direction === 'x+') ) {
					newUnit.classList.add('snake-head');
					newUnit.style.transform = 'scale(1.6) rotate(90deg)';
					oldUnit.classList.remove('snake-head');
					oldUnit.classList.add('snake-turn');
					oldUnit.style.transform = 'rotate(270deg)';
					snake[snake.length - 1].classList.add('right');
				}
				//вниз-влево
				if ( (direction !== oldDirection) && (oldDirection === 'y-') && (direction === 'x-') ) {
					newUnit.classList.add('snake-head');
					newUnit.style.transform = 'scale(1.6) rotate(270deg)';
					oldUnit.classList.remove('snake-head');
					oldUnit.classList.add('snake-turn');
					oldUnit.style.transform = 'rotate(180deg)';
					snake[snake.length - 1].classList.add('left');
				}
				//движение вверх
				if ( (direction === oldDirection) && (direction === 'y+') ) {
					newUnit.classList.add('snake-head');
					newUnit.style.transform = 'scale(1.6)';
					oldUnit.classList.remove('snake-head');
					oldUnit.classList.add('snake-body');
					oldUnit.style.transform = '';
					snake[snake.length - 1].classList.add('up');
				}
				//движение вправо
				if ( (direction === oldDirection) && (direction === 'x+') ) {
					newUnit.classList.add('snake-head');
					newUnit.style.transform = 'scale(1.6) rotate(90deg)';
					oldUnit.classList.remove('snake-head');
					oldUnit.classList.add('snake-body');
					oldUnit.style.transform = 'rotate(90deg)';
					snake[snake.length - 1].classList.add('right');
				}
				//движение влево
				if ( (direction === oldDirection) && (direction === 'x-') ) {
					newUnit.classList.add('snake-head');
					newUnit.style.transform = 'scale(1.6) rotate(270deg)';
					oldUnit.classList.remove('snake-head');
					oldUnit.classList.add('snake-body');
					oldUnit.style.transform = 'rotate(90deg)';
					snake[snake.length - 1].classList.add('left');
				}
				//движение вниз
				if ( (direction === oldDirection) && (direction === 'y-') ) {
					newUnit.classList.add('snake-head');
					newUnit.style.transform = 'scale(1.6) rotate(180deg)';
					oldUnit.classList.remove('snake-head');
					oldUnit.classList.add('snake-body');
					oldUnit.style.transform = '';
					snake[snake.length - 1].classList.add('down');
				}

        snake.push(newUnit);
        snake[snake.length - 1].setAttribute('data_y', coordY.toString());
        snake[snake.length - 1].setAttribute('data_x', coordX.toString());

        //Хвост. Проверка
        if (!haveFood(newUnit)) {
            //Уменьшаем хвост и передвигает хвост на следующий юнит
					   removeSnakeClasses();
					   if (snake[0].classList.contains('up')) {
							 snake[0].classList.add('snake-tale');
							 snake[0].classList.remove('up');
							 snake[0].style.transform = '';
						 }
					if (snake[0].classList.contains('right')) {
						snake[0].classList.add('snake-tale');
						snake[0].classList.remove('right');
						snake[0].style.transform = 'rotate(90deg)';
					}
					if (snake[0].classList.contains('left')) {
						snake[0].classList.add('snake-tale');
						snake[0].classList.remove('left');
						snake[0].style.transform = 'rotate(270deg)';
					}
					if (snake[0].classList.contains('down')) {
						snake[0].classList.add('snake-tale');
						snake[0].classList.remove('down');
						snake[0].style.transform = 'rotate(180deg)';
					}

        }
    } else {
        //Заканчиваем игру
        finishGame();
    }
    oldDirection = direction;
}

//Создание еды
function createFood() {
    let foodCreated = false;
    // for (let i = 0; i < 2; i++)
	    while (!foodCreated) {
			let foodX = Math.floor(Math.random() * FIELD_SIZE_X);
			let foodY = Math.floor(Math.random() * FIELD_SIZE_Y);

			//Проверка на змейку
			let foodCell = document.querySelector('.cell-' + foodY + '-' + foodX);
			if (!foodCell.classList.contains('snake-unit') && !foodCell.classList.contains('food-unit')) {
				foodCell.classList.add('food-unit');
				foodCreated = true;
			}
		}
}

//Создание барьеров(wall)
function createWallLevel2() {
	let wallCreated = false;
	while (!wallCreated)
	{
		let wallX = Math.floor(Math.random() * FIELD_SIZE_X);
		let wallY = Math.floor(Math.random() * FIELD_SIZE_Y);

		//Проверка на змейку и еду
		let wallCell = document.querySelector('.cell-' + wallY + '-' + wallX);
		if(!wallCell.classList.contains('snake-unit') && !wallCell.classList.contains('food-unit') && !wallCell.classList.contains('wall-unit')) {
			// if(!wallCell.classList.contains('snake-unit') && !wallCell.classList.contains('food-unit')) {
			wallCell.classList.add('wall-unit');
			wallCreated = true;
		}
	}
}

//Проверка на еду
function haveFood(unit) {
    if(unit.classList.contains('food-unit')){
        unit.classList.remove('food-unit');
        createFood();
        score++;
        //Уровни сложности
			  //Уровень 2 (5 очков). Далее 3 бомбы, 3 яблока. Каждые 5 очков пересоздается бомба
			  if (score == 5) {
			  	document.querySelector('.next-level-score').innerHTML = '30';
					document.querySelector('.level').innerHTML = 'Уровень 2';
			  	createFood();
					createWallLevel2();
					setTimeout(createWallLevel2, 5000);
					setTimeout(createWallLevel2, 10000);
				}
			  if (score < 30 && score%5 == 0) reCreateWall();

			  //Уровень 3 (30 очков). Далее 5 бомб, 3 яблока. Каждые 5 очков пересоздаётся бомба
			  if (score == 30) {
					document.querySelector('.next-level-score').innerHTML = '70';
					document.querySelector('.level').innerHTML = 'Уровень 3';
			  	createWallLevel2();
					setTimeout(createWallLevel2, 5000);
			  }
			  if ( score >= 30 && score < 70 && score%5 == 0) {
			  	reCreateWall();
					reCreateWall();
				}

			  //Уровень 4 (70 очков). Далее 5 бомб, 3 яблока. Каждые 5 очков пересоздаётся 2 бомбы
			if (score == 70) {
			document.querySelector('.next-level-score').innerHTML = '128';
				document.querySelector('.level').innerHTML = 'Уровень 4';}
			if (score > 70) {
				reCreateWall();
				reCreateWall();
			}
			  //Победа (128 очков).
        let scoreDiv = document.getElementById('score');
			  scoreDiv.innerHTML = '&nbsp;' + score;
        return true;
    }
    return false;
}

//Завершение игры
function finishGame() {


    gameIsRunning = false;
	// document.querySelector('.main-menu').style.width = '350px';
	// document.querySelector('.main-menu').style.height = '350px';
    clearInterval(snakeTimer);
	document.getElementById('snake-new-game').style.visibility = 'visible';
	document.querySelector('.difficulty').style.visibility = 'visible';
	document.getElementsByTagName('fieldset')[0].style.visibility = 'visible';
	document.querySelector('.main-menu').style.width = '270px';
	document.querySelector('.main-menu').style.height = '230px';
	document.querySelector('.your-score').innerHTML = 'Игра окончена!';

    //Чтобы победить, необходимо заполнить змейкой половину клеток
    if(score < FIELD_SIZE_X * FIELD_SIZE_Y - Math.floor(FIELD_SIZE_X * FIELD_SIZE_Y / 2)){
        // alert('Игра окончена!\nВаш результат ' + score.toString());
    } else {
        alert('Поздравляем! Вы победили!\nВаш результат ' + score.toString())
    }
    let bestScore = document.getElementById('best-score');
    if (score > oldScore) { bestScore.innerHTML = '&nbsp;' + score; }
}

function changeDirection(event) {
	switch (event.keyCode) {
		case 27: //Esc-pause
			if (pause == false) {
				clearInterval(snakeTimer);
				pause = true;
				document.querySelector('.main-menu').style.width = '120px';
				document.querySelector('.main-menu').style.height = '50px';
				document.querySelector('.pause').style.visibility = 'visible';
				break;
			}
			if (pause == true) {
				snakeTimer = setInterval(move, SNAKE_SPEED);
				pause = false;
				document.querySelector('.main-menu').style.width = '0';
				document.querySelector('.main-menu').style.height = '0';
				document.querySelector('.pause').style.visibility = 'hidden';
			}
			break;
		case 32: //Клавиша пробел - Пауза
			event.preventDefault ? event.preventDefault() : (event.returnValue=false);
			if (pause == false) {
				clearInterval(snakeTimer);
				pause = true;
				document.querySelector('.main-menu').style.width = '120px';
				document.querySelector('.main-menu').style.height = '50px';
				document.querySelector('.pause').style.visibility = 'visible';
				break;
			}
			if (pause == true) {
				snakeTimer = setInterval(move, SNAKE_SPEED);
				pause = false;
				document.querySelector('.main-menu').style.width = '0';
				document.querySelector('.main-menu').style.height = '0';
				document.querySelector('.pause').style.visibility = 'hidden';
			}
			break;
		case 37: //Клавиша влево
			event.preventDefault ? event.preventDefault() : (event.returnValue=false);
			if (oldDirection !== 'x+') {
				direction = 'x-'
			}
			break;
		case 38: //Клавиша вверх
			event.preventDefault ? event.preventDefault() : (event.returnValue=false);
			if (oldDirection !== 'y-') {
				direction = 'y+';
			}
			break;
		case 39: //Клавиша вправо
			event.preventDefault ? event.preventDefault() : (event.returnValue=false);
			if (oldDirection !== 'x-') {
				direction = 'x+';
			}
			break;
		case 40: //Клавиша вниз
			event.preventDefault ? event.preventDefault() : (event.returnValue=false);
			if (oldDirection !== 'y+') {
				direction = 'y-';
			}
			break;
	}
}

//Удаление классов у змейки
function removeSnakeClasses() {
    snake[0].classList.contains('snake-tale');
		snake[0].style.transform = '';
		snake.splice(0, 1)[0].classList.remove('snake-tale');
		if (snake[0].classList.contains('snake-body')) {
		  snake[0].classList.remove('snake-body'); }
	if (snake[0].classList.contains('snake-turn')) {
		snake[0].classList.remove('snake-turn'); }
}

function reCreateWall() {
	let bombs = document.querySelectorAll('.wall-unit');
	let random = Math.floor(Math.random() * (bombs.length));
	bombs[random].classList.remove('wall-unit');
	createWallLevel2();
}

