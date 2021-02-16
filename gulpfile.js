let preprocessor = 'scss';
let bootstrapOn = 'on';

const { src, dest, parallel, series, watch } = require('gulp');
const browserSync = require('browser-sync').create(); //Подключем browser-sync
const concat = require('gulp-concat'); //Подключем concat к проекту
const uglify = require('gulp-uglify-es').default; //Подключем gulp-uglify-es к проекту
const sass = require('gulp-sass');
const scss = require('gulp-sass');
const less = require('gulp-less');
const css = require('gulp-css');
const autoprefixer = require('gulp-autoprefixer');
const cleancss = require('gulp-clean-css');
const imagemin = require('gulp-imagemin');
const newer = require('gulp-newer');
const del = require('del');
const pug = require('gulp-pug');

function browsersync() {
  //Инициализируем функцию
  browserSync.init({
    server: { baseDir: 'app/' }, // указываем папку откда сервер берет файлы сайта
    notify: true, // отключение уведомлений
    online: true, // включаем работу без сети wi-fi
  });
}

if (bootstrapOn === 'on') {
  function scripts() {
    return src([
      'node_modules/jquery/dist/jquery.min.js', // подключение файла jquery
      'node_modules/bootstrap/dist/js/bootstrap.min.js', // подключение bootstrap
      'app/js/app.js', // подключение файла для пользовательских скриптов
    ])
      .pipe(concat('app.min.js')) // конкатинация файлов src в один файл
      .pipe(uglify()) // функция которая сжимает скрипты
      .pipe(dest('app/js/')) // выгружаем скрипты во внешний файл
      .pipe(browserSync.stream());
  }

  function styles() {
    return src([
      'node_modules/bootstrap/dist/css/bootstrap.min.css', // подключение bootstrap
      'node_modules/bootstrap/dist/css/bootstrap-reboot.min.css', // подключение bootstrap
      'app/' + preprocessor + '/main.' + preprocessor + '', // подключение препроцессоров
    ])
      .pipe(eval(preprocessor)()) // конвертация файлов css
      .pipe(concat('app.min.css')) // конкатинация файлов src в один файл
      .pipe(
        autoprefixer({ overrideBrowserslist: ['last 10 versions'], grid: true })
      ) // включение autoprefixer
      .pipe(
        cleancss({
          level: { 1: { specialComments: 0 } } /*format: 'beautify'*/,
        })
      ) // включение и настройка очистки css
      .pipe(dest('app/styles/')) // Папка выгрузки
      .pipe(browserSync.stream()); // нужно мониторить стили;
  }
} else {
  function scripts() {
    return src([
      'node_modules/jquery/dist/jquery.min.js', // подключение файла jquery
      'app/js/app.js', // подключение файла для пользовательских скриптов
    ])
      .pipe(concat('app.min.js')) // конкатинация файлов src в один файл
      .pipe(uglify()) // функция которая сжимает скрипты
      .pipe(dest('app/js/')) // выгружаем скрипты во внешний файл
      .pipe(browserSync.stream());
  }

  function styles() {
    return src('app/' + preprocessor + '/main.' + preprocessor + '')
      .pipe(eval(preprocessor)()) // конвертация файлов css
      .pipe(concat('app.min.css')) // конкатинация файлов src в один файл
      .pipe(
        autoprefixer({ overrideBrowserslist: ['last 10 versions'], grid: true })
      ) // включение autoprefixer
      .pipe(
        cleancss({
          level: { 1: { specialComments: 0 } } /*format: 'beautify'*/,
        })
      ) // включение и настройка очистки css
      .pipe(dest('app/styles/')) // Папка выгрузки
      .pipe(browserSync.stream()); // нужно мониторить стили;
  }
}

function images() {
  return src('app/img/src/**/*') // папка откуда барть несжатые картинки
    .pipe(newer('app/img/dest/')) // поиск не сжатых изображений сверка папок
    .pipe(imagemin()) // активация сжатия
    .pipe(dest('app/img/dest/')); // папка куда выгружать сжатые картинки
}

function cleanimg() {
  return del('app/img/dest/**/*', { force: true }); // очистка содержимого папки dest с изображениямм
}

function cleanimgsrc() {
  return del('app/img/src/**/*', { force: true }); // очистка содержимого папки dest с изображениямм
}

function cleandist() {
  return del('dist/**/*', { force: true }); // очистка собранного проекта из папки dist
}

function pugConvert() {
  return src('app/**/*.pug') // путь ко всем файлам pug
    .pipe(
      pug({
        pretty: true,
      })
    ) // конвертация
    .pipe(dest('app')); // путь в папку выгрузки сконвертированного файла
}

function buildcopy() {
  return src(
    [
      'app/styles/**/*.min.css',
      'app/js/**/*.min.js',
      'app/img/dest/**/*',
      'app/**/*.html',
    ],
    { base: 'app' }
  ).pipe(dest('dist'));
}

function startWatch() {
  // Функция следит за обновлениями файлов
  watch('app/**/' + preprocessor + '/**/*', styles); // настройка отслеживания стилей в любых файлах
  watch(['app/**/*.js', '!app/**/*.min.js'], scripts); // выбираем все js файлы нашего проекта кроме файлов min.js
  watch('app/**/*.pug').on('change', pugConvert); // мониторинг html разметки
  watch('app/**/*.html').on('change', browserSync.reload); // мониторинг html разметки
  watch('app/img/src/**/*', images); // мониторинг изображений
}

exports.browsersync = browsersync; // экспорт для функции browsersync в task
exports.scripts = scripts; // экспорт для функции scripts в task
exports.styles = styles; // экспорт для функции styles в task
exports.images = images; // экспорт для функции images в task
exports.cleanimg = cleanimg; // экспорт для функции cleanimg в task
exports.cleanimgsrc = cleanimgsrc; // экспорт для функции cleanimg в task
exports.cleandist = cleandist; // экспорт для функции cleandist в task
exports.pugConvert = pugConvert; // экспорт для функции pugConvert в task
exports.build = series(
  cleandist,
  pugConvert,
  styles,
  scripts,
  images,
  buildcopy
); // экспорт для функции cleanimg в task

exports.default = parallel(styles, scripts, browsersync, startWatch);
