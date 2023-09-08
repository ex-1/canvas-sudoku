const appThemes = {
	// from style.css :root 
	"light": {
		"name": "light",
		"color": "#f0f0f0",
		"assist-color": "#ffffff80"
	},

	"green": {
		"name": "green",
		"color": "#10d910",
		"assist-color": "#10d91080",
	},

	"yellow": {
		"name": "yellow",
		"color": "#fafa10",
		"assist-color": "#fafa1080",
	},

	"red": {
		"name": "red",
		"color": "#ff1515",
		"assist-color": "#ff151580",
	},

	"blue": {
		"name": "blue",
		"color": "#3030ff",
		"assist-color": "#3030ff80",
	},

	"pink": {
		"name": "pink",
		"color": "#ff00ff",
		"assist-color": "#ff00ff80",
	},

	"purple": {
		"name": "purple",
		"color": "#af10ff",
		"assist-color": "#af10ff80",
	},
}

let mainThemeColor = appThemes.light.color

const CONFIG = {
	//	- Sudoku Styling -

	// Cells fill color
	cellNotFocusColor : mainThemeColor == "#f0f0f0" ? mainThemeColor : "#151515",
	cellFocusColor    : mainThemeColor == "#f0f0f0" ? "#a0a0a0" : "#2f2f2f",

	// Cells stroke color & bold lines color
	frameColor              : mainThemeColor == "#f0f0f0" ? "#000" : mainThemeColor,
	cellNotFocusStrokeColor : mainThemeColor == "#f0f0f0" ? "#000" : mainThemeColor,
	cellFocusStrokeColor    : mainThemeColor == "#f0f0f0" ? "#000" : mainThemeColor,

	// Numbers fill color 
	givenNumberColor : mainThemeColor == "#f0f0f0" ? "#000" : mainThemeColor,
	userNumberColor  : mainThemeColor != "#f0f0f0" ? "#f0f0f0" : "#2f2f2f",

	// Numbers Stroke color
	givenNumberStrokeColor : mainThemeColor == "#f0f0f0" ? "#000" : mainThemeColor,
	userNumberStrokeColor  : mainThemeColor == "#f0f0f0" ? "#2f2f2f" : mainThemeColor,

	// Bottom bar colors 
	infoBarStrokeColor : mainThemeColor != "#f0f0f0" ? "#f0f0f0" : "#000",
	infoBarColorWin    : mainThemeColor != "#f0f0f0" ? "#2f2f2f" : "#0f0",
	infoBarColor       : mainThemeColor != "#f0f0f0" ? "#151515" : "#f0f0f0",

	//	- Sudoku important params -

	// Text fill or stroke style
	userTextFill  : true,
	givenTextFill : true,

	userTextStroke  : true,
	givenTextStroke : false,

	// Cell and text size params
	textSize  : 50,
	cellWidth : 100,

	// Numbers in cells rate (50 = normal difficult)
	prop : 50,

	// Fonts (first font applies to numbers in cells)
	fonts : ["monobloco"]
}

let theme__settings = document.querySelector(".theme__settings")
let colors_box      = document.querySelector(".colors_box")
let colors_list     = colors_box.querySelector("ul")

theme__settings.onclick = () => {
	if (colors_box.classList.contains("opened")) {
		colors_box.classList.remove("opened")
		colors_box.classList.add("closed")
	} else {
		colors_box.classList.remove("closed")
		colors_box.classList.add("opened")
	}
}

colors_list.onclick = (e) => {
	document.querySelector(":root").style.setProperty("--mainAppTheme", `var(--${e.target.dataset.col})`)
	document.querySelector(":root").style.setProperty("--assistAppTheme", `var(--assist_${e.target.dataset.col}`)
	mainThemeColor = appThemes[e.target.dataset.col].color
}

let utility = {
	// Calculating percent of value
	getPercent: function(value, percent) { return percent * value / 100 },

	// Random number generator 
	getRandomNumber: function(min, max) {
		min = Math.ceil(min)
		max = Math.floor(max)
		return Math.floor(Math.random() * (max - min + 1) + min)
	},

	getUnique: (vs) => vs.filter((v,i) => vs.indexOf(v) === i),	

	toTime: function(duration) {
		var seconds = Math.floor((duration / 1000) % 60),
			minutes = Math.floor((duration / (1000 * 60)) % 60),
			hours 	= Math.floor((duration / (1000 * 60 * 60)) % 24);

		hours   = (hours < 10)   ? "0" + hours   : hours
		minutes = (minutes < 10) ? "0" + minutes : minutes
		seconds = (seconds < 10) ? "0" + seconds : seconds
		
		return `${hours}:${minutes}:${seconds}`
	},

	createFont: function(fontName) {

		let fontURL  = `url(./font/${fontName}.ttf)`,
			fontFace = new FontFace(fontName, fontURL)

        return fontFace.load().then((fontFace) => {
        	return {
        		label : "font",
        		name  : fontName,
        		dom   : fontFace
        	}
        }, () => {
        	throw {
        		label : "font",
        		name  : fontName,
        		dom   : null
        	}
        })
	},

	loadFonts: function() {
		let allPromises = []
		CONFIG.fonts.forEach((fontName) => {
			console.log(fontName)
			allPromises.push(utility.createFont(fontName))
		})
		return Promise.all(allPromises)
	}
}

class Cell {
	constructor(canvas, x, y, w) {
		// Important params
		this.canvas  = canvas
		this.ctx     = this.canvas.getContext("2d")
		this.focused = false
		this.given   = false

		// Cell Value
		this.userValue = -1
		this.value     = -1
		
		// Cell Position & Size
		this.x = x
		this.y = y
		this.w = w
		
		// Cell Style
		this.cellNotFocusColor       = CONFIG.cellNotFocusColor
		this.cellFocusColor          = CONFIG.cellFocusColor
		
		this.cellNotFocusStrokeColor = CONFIG.cellNotFocusStrokeColor
		this.cellFocusStrokeColor    = CONFIG.cellFocusStrokeColor

		this.givenNumberColor = CONFIG.givenNumberColor
		this.userNumberColor  = CONFIG.userNumberColor

		this.givenNumberStrokeColor = CONFIG.givenNumberStrokeColor
		this.userNumberStrokeColor  = CONFIG.userNumberStrokeColor

		this.fontSize = utility.getPercent(this.w, CONFIG.textSize)
	}

	draw() {
		// Drawing cell on canvas 
		this.ctx.font = `${this.fontSize}px ${CONFIG.fonts[0]}`
		
		if(this.focused) {
			this.ctx.fillStyle   = this.cellFocusColor
			this.ctx.strokeStyle = this.cellFocusStrokeColor
		} else {
			this.ctx.fillStyle   = this.cellNotFocusColor
			this.ctx.strokeStyle = this.cellNotFocusStrokeColor
		}

		this.ctx.fillRect(this.x, this.y, this.w, this.w)
		this.ctx.strokeRect(this.x, this.y, this.w, this.w)

		if(this.given) {
			if(CONFIG.givenTextFill) {
				this.ctx.fillStyle = this.givenNumberColor
				this.ctx.fillText(this.value, this.x + (this.w / 2) - (this.fontSize / 2), this.y + (this.w / 2) + (this.fontSize / 2))
			} if(CONFIG.givenTextStroke) {
				this.ctx.strokeStyle = this.givenNumberStrokeColor
				this.ctx.strokeText(this.value, this.x + (this.w / 2) - (this.fontSize / 2), this.y + (this.w / 2) + (this.fontSize / 2))
			} else if(!(CONFIG.givenTextFill || CONFIG.givenTextFill)){
				console.error(`Error! givenTextFill: ${CONFIG.givenTextFill} && givenTextStroke: ${CONFIG.givenTextStroke}`)
			}

		} else if(this.userValue !== -1) {
			if(CONFIG.userTextFill) {
				this.ctx.fillStyle = this.userNumberColor
				this.ctx.fillText(this.userValue, this.x + (this.w / 2) - (this.fontSize / 2), this.y + (this.w / 2) + (this.fontSize / 2))
			} if(CONFIG.userTextStroke) {
				this.ctx.strokeStyle = this.userNumberStrokeColor
				this.ctx.strokeText(this.userValue, this.x + (this.w / 2) - (this.fontSize / 2), this.y + (this.w / 2) + (this.fontSize / 2))
			} else if(!(CONFIG.userTextFill || CONFIG.userTextStroke)){
				console.error(`Error! userTextFill: ${CONFIG.userTextFill} && userTextStroke: ${CONFIG.userTextStroke}`)
			}
		}
	}
}

class Solver {
	constructor(grid) {
		this.grid = grid
	}

	getShuffleIndeces() {
		let result = [[]],
			i = 0

		for(let j = 0; j < 9; j++) {
			if(j % 3 === 0 && j !== 0) {
				i += 3
				result.push([])
			}
			result[result.length - 1].push({i: i + 0, j : j})
			result[result.length - 1].push({i: i + 1, j : j})
			result[result.length - 1].push({i: i + 2, j : j})
		}
		return result
	}

	shuffle() {
		this.getShuffleIndeces().forEach((block) => {
			let numbers = [1,2,3,4,5,6,7,8,9]

			block.forEach((cellPosition) => {
				let index = utility.getRandomNumber(0, numbers.length - 1)
				this.grid[cellPosition.i][cellPosition.j].value = numbers[index]
				numbers.splice(index, 1)
			})
		})
	}

	checkRow(row) {
		let gridRow = this.grid[row],
			numbers = []

		gridRow.forEach((cell) => {
			if(cell.value === -1) return
			numbers.push(cell.value)
		})

		if(utility.getUnique(numbers).length === numbers.length) return true
		else return false
	}

	checkCol(col) {
		let gridCol = [],
			numbers = []

		this.grid.forEach((row) => {
			gridCol.push(row[col])
		})

		gridCol.forEach((cell) => {
			if(cell.value === -1) return;
			numbers.push(cell.value)
		})

		if(utility.getUnique(numbers).length === numbers.length) return true
		else return false
	}

	checkBlock(row, col) {
		let startRowIndex = Math.floor(row / 3) * 3,
			startColIndex = Math.floor(col / 3) * 3
		
		let numbers = []

		let gridBlock = [
			this.grid[startRowIndex][startColIndex],
			this.grid[startRowIndex][startColIndex + 1],
			this.grid[startRowIndex][startColIndex + 2],

			this.grid[startRowIndex + 1][startColIndex],
			this.grid[startRowIndex + 1][startColIndex + 1],
			this.grid[startRowIndex + 1][startColIndex + 2],

			this.grid[startRowIndex + 2][startColIndex],
			this.grid[startRowIndex + 2][startColIndex + 1],
			this.grid[startRowIndex + 2][startColIndex + 2],
			]

		gridBlock.forEach((cell) => {
			if(cell.value === -1) return
			numbers.push(cell.value)
		})

		if(utility.getUnique(numbers).length === numbers.length) return true
		else return false
	}

	nextPosition({i, j}) {
		if(i === 8 && j === 8) return {i: null,  j: null}
		if(j !== 8)            return {i: i,     j: j + 1}
		if(j === 8)            return {i: i + 1, j: 0}
	}

	pervPosition({i, j}) {
		if(i === 0 && j === 0) return {i: null,  j: null}
		if(j !== 0)            return {i: i,     j: j - 1}
		if(j === 0)            return {i: i - 1, j: 8}
	}

	solve() {
		let cell = null
		let i = 0,
			j = 0,
			s = 0

		while (i !== null && j !== null) {
			cell = this.grid[i][j]
			
			if(s === 0 && cell.value !== -1) {
				({i,j} = this.nextPosition({i, j}))
				continue
			}

			if(s === 0 && cell.value === -1) {
				cell.value = 1
				if(this.checkRow(i) && this.checkCol(j) && this.checkBlock(i, j)) {
					({i,j} = this.nextPosition({i, j}))
					s = 0
					continue		
				} else {
					s = 1
					continue
				}
			}

			if(s === 1) {
				if(cell.value !== 9) {
					cell.value++
					if(this.checkRow(i) && this.checkCol(j) && this.checkBlock(i, j)) {
						({i,j} = this.nextPosition({i, j}))
						s = 0
						continue		
					} else {
						continue
					}
				} else {
					({i, j} = this.pervPosition({i, j}))
					cell.value = -1
				}
			}
		}
	}
}

class Game {
	constructor(canvasID, {cellWidth = CONFIG.cellWidth, prop = CONFIG.prop} = {}) {
		this.canvas = document.querySelector(`#${canvasID}`)
		this.ctx    = this.canvas.getContext("2d")

		this.gameEnded = false
		
		this.time   = 0
		this.timer  = null

		this.cellWidth = cellWidth
		this.prop      = prop 
		this.gapPixels = 3

		this.grid   = []
		this.solver = new Solver(this.grid)

		this.focusedCell   = null
		this.infoBarColor  = CONFIG.infoBarColor
		this.infoBarHeight = 0
		
		this.adjustDimension()
		this.generateGrid()
		this.clickEvent()
		this.keyEvent()
	}

	adjustDimension() {
		this.canvas.width  = this.cellWidth * 9 + this.gapPixels * 2
		this.canvas.height = this.cellWidth * 9 + this.gapPixels * 2
		this.infoBarHeight = utility.getPercent(this.canvas.height, 12)
		this.canvas.height += this.infoBarHeight
	}

	keyEvent() {
		document.onkeyup = (event) => {
			if(this.focusedCell === null) return
			
			let key = event.key
			switch (key) {
				case "1" : this.focusedCell.userValue = 1; break;
				case "2" : this.focusedCell.userValue = 2; break;
				case "3" : this.focusedCell.userValue = 3; break;
				case "4" : this.focusedCell.userValue = 4; break;
				case "5" : this.focusedCell.userValue = 5; break;
				case "6" : this.focusedCell.userValue = 6; break;
				case "7" : this.focusedCell.userValue = 7; break;
				case "8" : this.focusedCell.userValue = 8; break;
				case "9" : this.focusedCell.userValue = 9; break;
			}

			if(this.checkWin()) {
				this.gameEnded = true
				this.infoBarColor = CONFIG.infoBarColorWin
			}
		}
	}

	clickEvent() {
		let coefX = this.canvas.width / this.canvas.clientWidth,
			coefY = this.canvas.height / this.canvas.clientHeight

		function getMousePosition(canvas, event) {
			let gameWindow = canvas.getBoundingClientRect()
			return {
				x: (event.clientX - gameWindow.left) * coefX,
				y: (event.clientY - gameWindow.top) * coefY
			}
		}

		this.canvas.onclick = ((event) => {
			if(this.gameEnded) return
			let mousePosition = getMousePosition(this.canvas, event)
			console.info(mousePosition)
			if(mousePosition.y < 9 * this.cellWidth + 2 * this.gapPixels) {
				let clickedCell = this.getCellFromCoor(mousePosition.x, mousePosition.y)
				if(!clickedCell.given && !clickedCell.focused) {
					if(this.focusedCell !== null) this.focusedCell.focused = false
					clickedCell.focused = true
					this.focusedCell = clickedCell
					console.log(this.focusedCell)
				}
			}
		})
	}

	getCellFromCoor(x, y) {
		let offsetX = Math.floor(x / (3 * this.cellWidth) * this.gapPixels),
			offsetY = Math.floor(y / (3 * this.cellWidth) * this.gapPixels)
		let col = Math.floor((x - offsetX) / this.cellWidth),
			row = Math.floor((y - offsetX) / this.cellWidth)
		return this.grid[row][col]
	}

	generateGrid() {
		let offsetX = 0, 
			offsetY = 0
		for(let i = 0; i < 9; i++) {
			offsetX = 0
			this.grid.push([])
			if(i % 3 === 0 && i !== 0) offsetY += this.gapPixels
			
			for(let j = 0;j < 9;j++) {
				let locationX = j * this.cellWidth, 
					locationY = i * this.cellWidth
				if(j % 3 === 0 && j !== 0) offsetX += this.gapPixels

				let newCell = new Cell(this.canvas, locationX + offsetX, locationY + offsetY, this.cellWidth, -1)
				if(utility.getRandomNumber(1 , 100) <= this.prop) newCell.given = true
				this.grid[this.grid.length - 1].push(newCell)
			}
		}
		this.solver.shuffle()
		this.solver.solve()
	}

	checkWin() {
		let win = true
		this.grid.forEach((row) => {
			row.forEach((cell) => {
				if(cell.given) return
				if (cell.value !== cell.userValue) win = false
			})
		})
		return win
	}

	clearFrame() {
		this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)
	}

	drawGameInfo() {
		this.ctx.fillStyle = this.infoBarColor
		this.ctx.fillRect(0, this.canvas.height - this.infoBarHeight, this.canvas.width, this.infoBarHeight)

		this.ctx.strokeStyle = CONFIG.infoBarStrokeColor
		this.ctx.strokeRect(0, this.canvas.height - this.infoBarHeight, this.canvas.width, this.infoBarHeight)
		
		let fontSize  = utility.getPercent(this.infoBarHeight, CONFIG.textSize - 10);
		this.ctx.font = `${fontSize}px ${CONFIG.fonts[0]}`

		this.ctx.fillStyle = CONFIG.userNumberColor
		this.ctx.strokeStyle = CONFIG.userNumberStrokeColor
		this.ctx.fillText(`Time: ${utility.toTime(this.time)}`, 10, (this.canvas.height - this.infoBarHeight) + (this.infoBarHeight - fontSize) / 2 + fontSize)
		this.ctx.strokeText(`Time: ${utility.toTime(this.time)}`, 10, (this.canvas.height - this.infoBarHeight) + (this.infoBarHeight - fontSize) / 2 + fontSize)
	}

	drawFrame() {
		this.ctx.fillStyle = CONFIG.frameColor
		this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height)
		this.grid.forEach((row) => {
			row.forEach((cell) => {
				cell.draw()
			})
		})
		this.drawGameInfo()
	}

	start() {
		return utility.loadFonts().then((results) => {
			results.forEach(({label, name, dom}) => {
				document.fonts.add(dom)
			})

			this.timer = setInterval(() => {
	            if(this.gameEnded) {
	            	clearInterval(this.timer)
	            	this.timer = null
	            }

	            this.clearFrame()
	            this.drawFrame()
	            this.time += 40

	        }, 40)
	        return results
		}, (results) => {
			throw results
		})
	}
}

var sudoku = new Game("canvAss");
sudoku.start().then((results) => {
	console.log("Sudoku Loaded")
}, (results) => {
	console.error("Error", results)
})