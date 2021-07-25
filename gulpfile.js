var gulp = require('gulp');

var dist='./client';

//js
function transjs(name,cover=90){
	var browserify = require('browserify'),
		buffer = require('vinyl-buffer'),
		source = require('vinyl-source-stream'),
		rename = require('gulp-rename'),
		// babel = require('gulp-babel'),
		sourcemaps = require('gulp-sourcemaps');
	console.log(`compiling ${name} covers ${cover}% browsers`);

	return browserify({
			entries: name,
			basedir:'./client/',
			debug: false,
			sourceType: 'module'
		})
		.transform(
			"babelify",{
				sourceMaps: true,
				presets: [
					["minify", {
						mangle:false,
					}],
					[
						"@babel/preset-env",{
							"targets":{ 
								"browsers":`cover ${cover}%`
							},
							"corejs":3,
							"bugfixes":true,
							"debug": true,
							"useBuiltIns": 'usage'
						}
					],
				],
				plugins:[
				"babel-plugin-remove-comments",
				'@babel/plugin-proposal-class-properties',
					"@babel/plugin-proposal-export-default-from",
				]
			}
		)
		.bundle()
		.pipe(source(name))
		.pipe(buffer())
		.pipe(sourcemaps.init({ loadMaps: true }))
		/* .pipe(babel({
			presets:[
				["minify", {
					mangle:false,
				}],
			],
			plugins:[
				"babel-plugin-remove-comments",
			]
		})) */
		.pipe(rename({extname:`.${cover}.js`}))
		.pipe(sourcemaps.write('./'))
		.pipe(gulp.dest(dist));
}
gulp.task('js-main',function(){
	return transjs('online.js',50);
});
gulp.task('js-old',function(){
	return transjs('online.js',90);
});

gulp.task('js',gulp.parallel(
	'js-main','js-old'
));


gulp.task('build',gulp.parallel('js'));
gulp.task('default',gulp.series('build'));