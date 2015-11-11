var VML = require('./vml');
var Canvas = require('./canvas');
//var Flash = require('./flash');

var hasCanvas = function(){

	var canvas = document.createElement('canvas');
	return canvas && !!canvas.getContext;

};

/*
var hasFlash = function(){

	var flash = navigator.plugins && navigator.plugins['Shockwave Flash'];
	try {
		flash = flash ? flash.description :
			new ActiveXObject('ShockwaveFlash.ShockwaveFlash')
			.GetVariable('$version');
	} catch (x){ }
	return flash && flash.match(/\d+/) >= 9;

};
*/

var MODE = hasCanvas() ? Canvas : /*hasFlash() ? Flash :*/ VML;

exports.Surface = MODE.Surface;
exports.Path = MODE.Path;
exports.Shape = MODE.Shape;
exports.Group = MODE.Group;
exports.ClippingRectangle = MODE.ClippingRectangle;
exports.Text = MODE.Text;

require('./current').setCurrent(exports);
