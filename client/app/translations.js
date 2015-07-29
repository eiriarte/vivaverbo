angular.module('vivaverboApp').run(['gettextCatalog', function (gettextCatalog) {
/* jshint -W100 */
    gettextCatalog.setStrings('eo', {"Hello {{ getCurrentUser().name }}":"Saluton {{ getCurrentUser().name }}","Logout":"Elsaluti","Main DIV":"Ĉefa DIV"});
/* jshint +W100 */
}]);