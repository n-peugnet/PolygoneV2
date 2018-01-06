class Randomart {

	constructor(title = "RSA 2048", height = 9, width = 17, values = [' ', '.', 'o', '+', '=', '*', 'B', 'O', 'X', '@', '%', '&', '#', '/', '^', 'S', 'E']) {
		this.title = '[' + title + ']';
		this.height = height;
		this.width = width;
		this.values = values;
		this.map = Array.apply(null, Array(height)).map(function (params) {
			return Array.apply(null, Array(width)).fill(0);
		});
	}

	render(fp) {
		var self = this;
		var startX = Math.floor(this.width / 2);
		var startY = Math.floor(this.height / 2);
		var x = startX;
		var y = startY;
		var arr = fp.match(/.{2}/g); // Split fingerprint into 8-bit words
		arr.forEach(function (byte) { // Iterate through words
			var bin = reverse(Hex2Bin(byte).padStart(8, "0")); // Convert to binary
			for (var c = 0; c < 8; c = c + 2) { // Iterate through the bit-pairs in the words
				var move = reverse(bin.substring(c, c + 2)); // determine the move
				switch (move) {
					case "00":
						x--;
						y--;
						break;
					case "01":
						x++;
						y--;
						break;
					case "10":
						x--;
						y++;
						break;
					case "11":
						x++;
						y++;
						break;
					default:
						alert("WTF!");
				}

				// limit the range
				if (x < 0)
					x = 0;
				else if (x >= self.width)
					x = self.width - 1;
				if (y < 0)
					y = 0;
				else if (y >= self.height)
					y = self.height - 1;

				self.map[y][x]++; // increment the value at the new position
			}
		});
		this.map[y][x] = this.values.length - 1; // Set end position
		this.map[startY][startX] = this.values.length - 2; // Re-set start position

		// The following will render the visual fingerprint
		var lefLen = Math.floor((this.width - this.title.length) / 2);
		var rigLen = this.width - lefLen - this.title.length;
		var string = "+" + "-".repeat(lefLen) + this.title + "-".repeat(rigLen) + "+\n";
		this.map.forEach(function (line, i) {
			string += "|";
			line.forEach(function (num, j) {
				var char = ' ';
				if (num < self.values.length)
					char = self.values[num];
				string += char;
			});
			string += "|\n";
		});
		string += "+" + "-".repeat(this.width) + "+";
		return string;
	}
}