class Randomart {

	constructor(height = 9, width = 17, trail = false, values = [' ', '.', 'o', '+', '=', '*', 'B', 'O', 'X', '@', '%', '&', '#', '/', '^'], title = "RSA 2048") {
		this.height = height;
		this.width = width;
		this.trail = trail;
		this.values = values;
		this.title = '[' + title + ']';
		this.map = Array.apply(null , Array(height)).map(function(params) {
			return Array.apply(null, Array(width)).fill(0);
		});
	}

	isValidMove(x, y) {
		return (0 <= x && x < this.width && 0 <= y && y < this.height);
	}

	render(fp) {
		var startX = Math.floor(this.width / 2);
		var startY = Math.floor(this.height / 2);
		var x = startX;
		var y = startY;
		var arr = fp.match(/.{2}/g); // Split fingerprint into 8-bit words
		for (var i = 0; i < 16; i++) { // Iterate through words
			var bin = reverse(Hex2Bin(arr[i]).padStart(8, "0")); // Convert to binary
			for (var c = 0; c < 8; c = c + 2) { // Iterate through the bit-pairs in the words
				var move = reverse(bin.substring(c, c + 2)); // determine the move
				switch (move) {
					case "00":
						if (this.isValidMove(x - 1, y - 1)) {
							x--;
							y--;
						} else if (this.isValidMove(x - 1, y)) {
							x--;
						} else if (this.isValidMove(x, y - 1)) {
							y--;
						}
						break;
					case "01":
						if (this.isValidMove(x + 1, y - 1)) {
							x++;
							y--;
						} else if (this.isValidMove(x + 1, y)) {
							x++;
						} else if (this.isValidMove(x, y - 1)) {
							y--;
						}
						break;
					case "10":
						if (this.isValidMove(x - 1, y + 1)) {
							x--;
							y++;
						} else if (this.isValidMove(x - 1, y)) {
							x--;
						} else if (this.isValidMove(x, y + 1)) {
							y++;
						}
						break;
					case "11":
						if (this.isValidMove(x + 1, y + 1)) {
							x++;
							y++;
						} else if (this.isValidMove(x + 1, y)) {
							x++;
						} else if (this.isValidMove(x, y + 1)) {
							y++;
						}
						break;
					default:
						alert("WTF!");
				}
				this.map[y][x]++; // increment the value at the new position
			}
		}
		this.map[y][x] = -1; // Set end position
		this.map[startY][startX] = 255; // Re-set start position

		// The following will render the visual fingerprint
		var lefLen = Math.floor( (this.width - this.title.length)/2 );
		var rigLen = this.width - lefLen - this.title.length;
		var string = "+" + "-".repeat(lefLen) + this.title + "-".repeat(rigLen) + "+\n";
		var self = this;
		this.map.forEach(function (line, i) {
			string += "|";
			line.forEach(function (num, j) {
				var char = "S";
				if (num < 0)
					char = "E";
				else if (num < self.values.length)
					char = self.values[num];
				string += char;
			});
			string += "|\n";
		});
		string += "+" + "-".repeat(this.width) + "+";
		return string;
	}
}