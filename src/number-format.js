/**
 * format number 
 * @param  {String|Number} number to format
 * @param  {Number} fixed ,default 2
 * @param  {String} currency symbol
 * @return {String} formated number      
 */

function format(num, fixed, symbol) {
	num = (num + "").replace(/,/g, "");
	var parts = (num * 1 || 0).toFixed(fixed || 2).toString().split(".");

	parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");

	if (symbol) {
		parts[0] = parts[0].replace(/^([+-])?/, "$1" + symbol);
	}

	return parts.join(".");
}