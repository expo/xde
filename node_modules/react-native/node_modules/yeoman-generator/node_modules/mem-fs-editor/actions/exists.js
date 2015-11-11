'use strict';

module.exports = function (path) {
	var file = this.store.get(path);

	return file.contents !== null && file.state !== 'deleted';
};