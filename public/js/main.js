var userLoggedIn;

function getCurrentUser(URLRequest, callback){
    var returnedJSON;

    $.ajax({
        url: URLRequest,
        type: "GET",
        success: function(data){
            returnedJSON = true;
            callback(data);
        },
        error: function(err){
            returnedJSON = false;
            callback(returnedJSON);
        }
    });
}

function loadDashboard(){
    $('#pinBoot').pinterest_grid({
        no_columns: 4,
        padding_x: 10,
        padding_y: 10,
        margin_bottom: 50,
        single_column_breakpoint: 700
    });

    (function(){
        $('body').load('templates/template.html', function(){
            var template = Handlebars.compile( $('#template').html());

            var data = getCurrentUser('/API/user/me', function(userData){
                var templateData = userData[0];

                Handlebars.registerHelper('fullName', function() {
                    return templateData.first_name + " " + templateData.last_name;
                });

                Handlebars.registerHelper('user_image', function() {
                    var image;

                    if((!templateData.user_image) || (templateData.user_image != "null")) {
                        image = templateData.user_image;
                    } else {
                        image = "imgs/Globe.png";
                    }
                    return image;
                });

                $('body').append( template(templateData) );
            });
        });
    })();
}

function login(callBack){
    var username = $("#txtUsername").val(),
        password = $("#txtPassword").val();

    $.ajax({
        url: "/API/user/login",
        type: "POST",
        data: {
            username : username,
            password : password
        },
        success: function(data){
            callBack(data);
        },
        error: function(err){
            console.log("Error : " +err);
            callBack(err);
        }
    });
}

function indexFunction(){
    $(function(){
        $('button[type="submit"]').click(function(e) {
            var textfield = $("#txtUsername").val(),
                passfield = $("#txtPassword").val();
            e.preventDefault();
            //little validation just to check username
            if ((textfield != "") && (passfield != "")) {
                login(function(data){
                    if (data.status == "failed") {
                        $("#output").removeClass(' alert alert-success');
                        $("#output").addClass("alert alert-danger animated fadeInUp").html(data.error);
                    } else if (data.status == "success") {
                        //$("body").scrollTo("#output");
                        $("#output").addClass("alert alert-success animated fadeInUp").html("Welcome back " + "<b>" + textfield + "</b>");
                        $("#output").removeClass(' alert-danger');
                        $("input").css({
                            "height":"0",
                            "padding":"0",
                            "margin":"0",
                            "opacity":"0"
                        });
                        //change button text
                        $('button[type="submit"]').html("Continue")
                            .removeClass("btn-info")
                            .addClass("btn-default").click(function(){
                                $("input").css({
                                    "height":"auto",
                                    "padding":"10px",
                                    "opacity":"1"
                                }).val("");
                            })
                            .addClass("continueLogin");

                        $(".continueLogin").click(function (){
                            document.location.href='/dashboard';
                            return false;
                        });

                        $("#AvatarIMG").removeClass('avatar');
                        $("#AvatarIMG").addClass("PushDownCSS");
                        $("#AvatarIMG").addClass("avatarbig");
                        $("#btnSignUp").hide();

                        //show avatar
                        $("#AvatarIMG").html("");

                        var userimage = data.items[0].user_image;


                        if ((!userimage) || (userimage == "null")) {
                            userimage = "imgs/Globe.png";
                        }


                        $("#AvatarIMG").css({
                            "background-image": "url("+userimage+")"
                        });
                    }
                });
            } else {
                //remove success mesage replaced with error message
                $("#output").removeClass(' alert alert-success');
                $("#output").addClass("alert alert-danger animated fadeInUp").html("Please complete both username and password.");
            }
            //console.log(textfield.val());

        });
    });
}

(function ($, window, document, undefined) {
    var pluginName = 'pinterest_grid',
        defaults = {
            padding_x: 10,
            padding_y: 10,
            no_columns: 3,
            margin_bottom: 50,
            single_column_breakpoint: 700
        },
        columns,
        $article,
        article_width;

    function Plugin(element, options) {
        this.element = element;
        this.options = $.extend({}, defaults, options) ;
        this._defaults = defaults;
        this._name = pluginName;
        this.init();
    }

    Plugin.prototype.init = function () {
        var self = this,
            resize_finish;

        $(window).resize(function() {
            clearTimeout(resize_finish);
            resize_finish = setTimeout( function () {
                self.make_layout_change(self);
            }, 11);
        });

        self.make_layout_change(self);

        setTimeout(function() {
            $(window).resize();
        }, 500);
    };

    Plugin.prototype.calculate = function (single_column_mode) {
        var self = this,
            tallest = 0,
            row = 0,
            $container = $(this.element),
            container_width = $container.width();
        $article = $(this.element).children();

        if(single_column_mode === true) {
            article_width = $container.width() - self.options.padding_x;
        } else {
            article_width = ($container.width() - self.options.padding_x * self.options.no_columns) / self.options.no_columns;
        }

        $article.each(function() {
            $(this).css('width', article_width);
        });

        columns = self.options.no_columns;

        $article.each(function(index) {
            var current_column,
                left_out = 0,
                top = 0,
                $this = $(this),
                prevAll = $this.prevAll(),
                tallest = 0;

            if(single_column_mode === false) {
                current_column = (index % columns);
            } else {
                current_column = 0;
            }

            for(var t = 0; t < columns; t++) {
                $this.removeClass('c'+t);
            }

            if(index % columns === 0) {
                row++;
            }

            $this.addClass('c' + current_column);
            $this.addClass('r' + row);

            prevAll.each(function(index) {
                if($(this).hasClass('c' + current_column)) {
                    top += $(this).outerHeight() + self.options.padding_y;
                }
            });

            if(single_column_mode === true) {
                left_out = 0;
            } else {
                left_out = (index % columns) * (article_width + self.options.padding_x);
            }

            $this.css({
                'left': left_out,
                'top' : top
            });
        });

        this.tallest($container);
        $(window).resize();
    };

    Plugin.prototype.tallest = function (_container) {
        var column_heights = [],
            largest = 0;

        for(var z = 0; z < columns; z++) {
            var temp_height = 0;
            _container.find('.c'+z).each(function() {
                temp_height += $(this).outerHeight();
            });
            column_heights[z] = temp_height;
        }

        largest = Math.max.apply(Math, column_heights);
        _container.css('height', largest + (this.options.padding_y + this.options.margin_bottom));
    };

    Plugin.prototype.make_layout_change = function (_self) {
        if($(window).width() < _self.options.single_column_breakpoint) {
            _self.calculate(true);
        } else {
            _self.calculate(false);
        }
    };

    $.fn[pluginName] = function (options) {
        return this.each(function () {
            if (!$.data(this, 'plugin_' + pluginName)) {
                $.data(this, 'plugin_' + pluginName,
                    new Plugin(this, options));
            }
        });
    }

})(jQuery, window, document);