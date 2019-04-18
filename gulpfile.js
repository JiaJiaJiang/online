var gulp = require('gulp');

var dist='./client';

//js
function transjs(name,cover=90){
	var browserify = require('browserify'),
		source = require('vinyl-source-stream'),
		rename = require('gulp-rename');

	console.log(`compiling ${name} covers ${cover}% browsers`);

	return browserify({
			entries: name,
			basedir:'./client/',
			debug: true,
			sourceType: 'module'
		})
		.transform(
			"babelify",{
				presets: [
					[
						"@babel/preset-env",{
							"targets":{ 
								"browsers":`cover ${cover}%`
							},
							"corejs":3,
							"debug": true,
							"useBuiltIns": 'usage'
						}
					],
				],
			}
		)
		.bundle()
		.pipe(source(`./${name}`))
		.pipe(rename({extname:`.${cover}.js`}))
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