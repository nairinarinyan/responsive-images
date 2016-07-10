#!/usr/bin/env node 

'use strict';

const program = require('commander');
const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

console.log('foo');

let formats = ['.jpg', '.png', '.webp', '.gif', '.svg', '.tiff'];
let sizes = [400, 800, 1600];
let imageName, imageDir, defaultDir;

program
    .version('0.0.1')
    .option('-i, --image <path>', 'image to resize') 
    .option('-d, --dir <path>', 'directory of images') 
    .option('-s, --sizes [sizes]', 'desired sizes. Defaults are 400, 800, 1600') 
    .option('-o, --out [path]', 'output directory') 
    .parse(process.argv);


if (!program.image && !program.dir) {
    process.exit(1);
}

if (program.image && program.dir) {
    console.error('(As of now) You can\'t provide both image and dir paths');
    process.exit(1);
}

if (program.image) {
	let parsedFile = path.parse(path.resolve(program.image));
    imageName = parsedFile.base;
    imageDir = parsedFile.dir; 
}

if ((program.dir || program.image) && !program.out) {
    let dir = program.dir || path.dirname(program.image);

    let exists = fs.readdirSync(path.resolve(dir));
    if (!exists)
        fs.mkdir(path.resolve(dir, 'resized'));
    defaultDir = path.resolve(dir, 'resized');
}

if (program.sizes) {
	sizes = program.sizes.split(',').map(s => parseInt(s));
}

function processImage(image, dir, out) {
	let input = path.resolve(dir, image);
	let parsedFile = path.parse(image);

	sizes.forEach((s, i) => {
		let suffix = i >= 1 ? '@' + Math.pow(2, i) + 'x' : '';
		let name = parsedFile.name + suffix + parsedFile.ext;
		let output = path.resolve(out, name);

		sharp(input)
			.resize(s)
			.toFile(output, e => {
				if (e) {
					console.error(e);
					process.exit(1);
				}
                console.log('Successfully converted %s', output);
			});
	});
}

function processDir(dir, out) {
    let dirContent = fs.readdirSync(dir);
    dirContent
        .filter(fileName => includes(formats, fileName))
        .forEach(image => processImage(image, dir, out));
}

function includes(array, fileName) {
    let extName = path.extname(fileName).toLowerCase();
    return array.includes ? array.includes(extName) : ~a.indexOf(extName);
}

program.image && processImage(program.image, imageDir, defaultDir);
program.dir && processDir(program.dir, program.out || defaultDir);

