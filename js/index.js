function define(options){
    var func = options.init;
    if(options.prototype) func.prototype = new options.prototype();
    for(var name in options.property){
        func.prototype[name] = options.property[name];
    }
    return func;
}

function saveData(name, data){
    var string = JSON.stringify(data);
    localStorage.setItem(name, string);
}
function restoreData(name){
    var string = localStorage.getItem(name);
    if(string){
        try{
            return JSON.parse(string);
        } catch(e){
        }
    }
}

var util = {
    codeToChar:function(code){
        return String.fromCharCode(code).toLowerCase();
    }
}
var KeyCode = {
    delete:8,
    enter:13,
    tab:9,
    space:32
}

var TypingKey = define({
    init:function(char){
        if(typeof char != 'string'){
            char = util.codeToChar(char);
        }
        this.char = char;
    },
    property:{
        is:function(key){
            if(typeof key != 'string'){
                key = util.codeToChar(key);
            }
            return this.char == key;
        },
        toString:function(){
            return this.char;
        }

    }
});

var settings = {
    speed:1000,
    speedUp:function(rate){
        this.speed *= rate?(1 + rate /100):1.05;
    },
    speedDown:function(rate){
        this.speed /= rate?(1 + rate /100):1.05;
    }
}
;(function($){
    var plugin = (function($){
        $.extend(String.prototype, {
            toCharArray:function(){
                var array = [];
                for(var i=0;i<this.length;i++){
                    array.push(this.substr(i,1));
                }
                return array;
            }
        });
        $.extend(Array.prototype, {
            contains:function(val){
                for(var i=0;i<this.length;i++){
                    if(this[i] == val) return val;
                }
            }
        });
        function fingerForChar(val){
            var finger = $('#ttt-root .finger');
            for(var i=0; i<finger.size(); i++){
                var keys = finger.eq(i).data('keys');
                for(var j=0; j<keys.length; j++){
                    if(keys[j].is(val)){
                        return finger.eq(i);
                    }
                }

            };
        }
        $.fn.extend({
            button:function(name){
                var button = $(this)
                    .addClass('button')
                    .text(name)
                    .addClass(name + '-button');
                return button;
            },
            selectableList:function(command, options){
                if(typeof command != 'string'){
                    options = command;
                    command = 'init';
                }
                var list = $(this);
                switch(command){
                    case 'init':
                        list.addClass('selectable-list');
                        if(options.data){
                            $.each(options.data, function(name, val){
                                list.selectableList('addItem', {
                                    label:name,
                                    value:val,
                                    select:options.select
                                });
                            });
                        }
                        return list;
                    case 'addItem':
                        var index = $('li', list).size();
                        var li = $('<li/>').appendTo(list)
                            .click(function(){
                                if(list.is('.disabled')) return;
                                var li = $(this);
                                var a = $('a', li);
                                if(a.is('selected')) return;
                                a.addClass('selected')
                                li.siblings('li').each(function(){
                                    $('a', this).removeClass('selected');
                                });
                                if(options.select)options.select.apply(this,[index, options.value])
                            });
                        $('<a/>').text(options.label)
                            .addClass('button')
                            .appendTo(li);
                        return list;
                    case 'enable':
                        return list.removeClass('disabled');
                    case 'disable':
                        return list.addClass('disabled');
                }

                return list;
            },
            addHeight:function(height){
                return $(this).each(function(){
                    var elm = $(this);
                    elm.height(elm.height() + height);
                });
            },
            move:function(options){
                return $(this).each(function(){
                    var elm = $(this);
                    var css = {};
                    if(options.x){
                        css.left = options.x + elm.position().left;
                    }
                    if(options.y){
                        css.top = options.y + elm.position().top;
                    }

                    elm.css(css);
                });
            }
        });
        return {
            finger:function(command, options){
                if(typeof command != 'string'){
                    options = command;
                    command = 'init';
                }
                var finger = $(this);
                switch(command){
                    case 'init':
                        var index = options.index;
                        finger.addClass('finger')
                            .addClass('finger-' + index)
                            .data('index', index)
                            .data('keys', []);
                    case 'refresh':

                        return finger;
                    case 'addKey':
                        finger.data('keys')
                            .push(options.key);
                        return finger;
                    case 'activate':
                        finger.parents('.hand-panel')
                            .find('.finger.active')
                            .removeClass('active');
                        finger.addClass('active')
                            .addClass('pre-active');
                        setTimeout(function(){
                            finger.removeClass('pre-active');
                        }, 200);
                        return finger;
                    case 'press':
                        var bottom = finger.css('bottom').replace('px','');
                        finger.css({bottom:bottom - 3})
                            .addClass('press');
                        setTimeout(function(){
                            finger.css('bottom',"")
                                .removeClass('press');
                        }, 120);
                        return finger;
                  }
            },
            hand:function(command, options){
                if(typeof command != 'string'){
                    options = command;
                    command = 'init';
                }
                var hand = $(this);
                switch(command){
                    case 'init':
                        hand.addClass('hand')
                            .addClass('hand-' + options.dir);
                        $('<div/>').addClass('finger-container')
                            .appendTo(hand);
                        $('<div/>').addClass('wrist')
                            .appendTo(hand);
                    case 'refresh':
                        return hand;
                    case 'loadFinger':
                        var fingerContainer = $('.finger-container', hand);
                        var finger = $('<div/>').appendTo(fingerContainer)
                            .finger({index:options.index});
                        $.each(options.char, function(i, char){
                            finger.finger('addKey',{
                                key:new TypingKey(char)
                            });
                        });
                }
                return hand;
            },
            handPanel:function(command, options){
                if(typeof command != 'string'){
                    options = command;
                    command = 'init';
                }
                var panel = $(this);
                switch(command){
                    case 'init':
                        panel.addClass('hand-panel');
                        var index = 0;
                        $.each({
                            left:[
                                ['1','q','a','z'],
                                ['2','w','s','x'],
                                ['3','e','d','c'],
                                ['4','r','f','v','5','t','g','b'],
                                []
                            ],
                            right:[
                                [],
                                ['6','y','h','n','7','u','j','m'],
                                ['8','i','k',','],
                                ['9','o','l','.'],
                                ['0','p',';','/']
                            ]
                        }, function(dir, data){
                            var hand = $('<div/>').appendTo(panel).hand({dir:dir});
                            $.each(data, function(i, data){
                                hand.hand('loadFinger', {
                                    index:index++,
                                    char:data
                                });
                            });
                        });
                    case 'refresh':
                        return panel;
                }
                return panel;
            },
            block:function(command, options){
                if(typeof command != 'string'){
                    options = command;
                    command = 'init';
                }
                var block = $(this);
                switch(command){
                    case 'init':
                        block.addClass('block');
                        $('<span/>').addClass('block-text')
                            .appendTo(block);
                    case 'refresh':
                        var char = options.char;
                        $('.block-text', block).text(char);
                        block.data('char', char);
                        return block;
                    case 'hit':
                        block.addClass('hit')
                            .removeClass('active')
                            .removeClass('error')
                            .stop()
                            .remove();
                        return block;
                    case 'activate':
                        block.addClass('active')
                            .addClass('pre-active');
                        setTimeout(function(){
                            block.removeClass('pre-active');
                        }, 200);
                        return block;
                    case 'error':
                        block.addClass('error');
                        return block;
                    case 'stack':
                        block.addClass('stack');
                        return block;
                    case 'start':
                        block.animate({
                            top:"100%"
                        }, settings.speed, 'linear', function(){
                            var block = $(this);
                            block.block('stack');
                            if(options.stack)options.stack.apply(this, [block]);
                        });
                        return block;
                }
                return block;
            },
            line:function(command, options){
                if(typeof command != 'string'){
                    options = command;
                    command = 'init';
                }
                var line = $(this);
                switch(command){
                    case 'init':
                        line.addClass('line')
                            .addClass('line-' + options.index)
                            .data('index', options.index);
                        var inner = $('<div/>').addClass('line-inner')
                            .appendTo(line);
                        $('<div/>').addClass('line-display')
                            .appendTo(line);
                        line.data('z-index', 5000);
                    case 'refresh':
                        return line;
                    case 'loadChar':
                        var zIndex = line.data('z-index');
                        var inner = $('.line-inner', line);
                        $('<div/>').appendTo(inner)
                            .block({char:options.char})
                            .block('start', {stack:options.stack})
                            .css({zIndex:zIndex});
                        line.data('z-index', --zIndex);
                        return line;
                    case 'activate':
                        line.siblings('.line.active').removeClass('active');
                        var block = $('.block', line).not('.hit');
                        var stacked = block.filter('.stack');
                        if(stacked.size() > 0) block = stacked;
                        block.eq(0).block('activate');
                        line.addClass('active')
                            .addClass('pre-active');
                        setTimeout(function(){
                            line.removeClass('pre-active');
                        }, 200);
                }
                return line;

            },
            linePanel:function(command, options){
                if(typeof command != 'string'){
                    options = command;
                    command = 'init';
                }
                var panel = $(this);
                switch(command){
                    case 'init':
                        panel.addClass('line-panel');
                        var inner = $('<div/>').addClass('line-panel-inner')
                            .appendTo(panel);
                        $('<div/>').addClass('line-padding')
                            .appendTo(inner);
                        for(var i=0; i<options.lineCount; i++){
                            $('<div/>').appendTo(inner)
                                .line({
                                    index:i
                                });
                            if(i==4){
                                $('<div/>').addClass('line-padding')
                                    .addClass('center')
                                    .appendTo(inner);
                            }
                        }
                        panel.data('indexQueue', []);//queue for active line indexes
                    case 'refresh':
                        return panel;
                    case 'loadChar':
                        var char = options.char;
                        var finger = fingerForChar(char);
                        var index = finger.data('index');
                        var queue = panel.data('indexQueue');
                        var line = $('.line', panel).eq(index).line('loadChar',{
                            char:char,
                            stack:function(block){
                                var blockHeight = block.height();
                                block.data('height', blockHeight);
                                block.css({
                                    top:block.position().top
                                }).appendTo(line);
                                var lineInner = $('.line-inner', panel).addHeight(- blockHeight);
                                if(lineInner.height() < 100){
                                    $('#ttt-root').trigger('gameover');
                                }
                            }
                        });
                        if(queue.length == 0){
                            line.line('activate');
                            finger.finger('activate');
                        }
                        queue.push(index);
                        return panel;
                    case 'loadWord':
                        if(options.abort){
                            var timer = panel.data('word-load-timer');
                            clearTimeout(timer);
                            panel.data('loadNextChar', null);
                            return panel;
                        }

                        var chars = options.word.toCharArray();
                        var loadNextChar = function(){
                            if(chars.length > 0){
                                panel.linePanel('loadChar', {
                                    char:chars.shift()
                                })
                            } else {
                                clearTimeout(timer);
                                panel.data('loadNextChar', null);
                                if(options.complete){
                                    options.complete.apply(this);
                                }
                            }
                        };
                        var timer = setInterval(loadNextChar, 500);
                        panel.data('loadNextChar', loadNextChar);
                        panel.data('word-load-timer', timer);
                        return panel;
                    case 'press':
                        var line = $('.line.active', panel);
                        var char = new TypingKey(options.key).toString();
                        var block = $('.block.active', line);
                        var finger = fingerForChar(char);
                        if(finger){
                            finger.finger('press');

                            if(finger.data('index') == line.data('index')){
                                if(block.data('char') == char){
                                    if(block.is('.stack')){
                                        var height = block.data('height');
                                        $('.line-inner', panel).addHeight(height);
                                        $('.block.stack').not(block)
                                            .move({y:height});
                                    }
                                    block.block('hit');
                                    var queue = panel.data('indexQueue');
                                    queue.shift();
                                    var index = queue[0];
                                    $('.line', panel).eq(index).line('activate');
                                    if(options.hit)options.hit.apply(this, [char, index]);
                                    if($('.block').not('.hit').size() == 0){
                                        $('.line.active', panel).removeClass('active');
                                        var loadNextChar = panel.data('loadNextChar');
                                        if(loadNextChar) loadNextChar.call();
                                        if(options.wordComplete)options.wordComplete.apply(this);
                                    }

                                    return panel;
                                }
                            }
                            block.block('error');
                            if(options.error)options.error.apply(this, [char]);
                        }

                        return panel;
                }
                return panel;
            },
            wordPanel:function(command, options){
                if(typeof command != 'string'){
                    options = command;
                    command = 'init';
                }
                var panel = $(this);
                switch(command){
                    case 'init':
                        panel.addClass('word-panel')
                            .html('&nbsp;&nbsp;&nbsp;&nbsp;');
                        for(var i=0;i<3;i++){
                            $('<span/>').addClass('square')
                                .appendTo(panel);
                        }
                        $('<div/>').addClass('remain-count')
                            .appendTo(panel);
                        panel.data('wordQueue', []);
                        panel.data('remainWord', 30);
                    case 'refresh':
                        var char = $('span.char', panel);
                        char.filter('.error').removeClass('error');
                        var remain = char.not('.hit');
                        if(remain.size() > 0){
                            remain.eq(0).addClass('active');
                        } else {
                            panel.wordPanel('loadWord');
                        }
                        return panel;
                    case 'loadWord':
                        var char = $('span.char', panel);
                        var word = options?options.word:null;
                        if(word){
                            if(char.not('.hit').size() > 0){
                                panel.data('wordQueue').push(word);
                                return panel;
                            }
                        } else {
                            word = panel.data('wordQueue').shift();
                            if(!word) return panel;
                        }
                        var remainWord = panel.data('remainWord');
                        panel.data('remainWord', --remainWord);
                        $('.remain-count', panel).text('remain: ' + remainWord + ' ');
                        if(remainWord <= 0){
                            $('#ttt-root').trigger('gameClear');
                            $('span.char,span.square', panel).remove();
                            panel.data('wordQueue', []);
                            return panel;
                        }

                        $('span.char,span.square', panel).remove();
                        var chars = word.toCharArray();
                        for(var i=0; i<chars.length; i++){
                            var char = chars[i];
                            $('<span/>').addClass('char')
                                .text(char)
                                .appendTo(panel);
                        }
                        return panel.wordPanel('refresh');
                    case 'hit':
                        $('.char.active', panel).addClass('hit')
                            .removeClass('active');
                        return panel.wordPanel('refresh');
                    case 'error':
                        $('.char.active', panel).addClass('error')
                        return panel;

                }
                return panel;
            },
            playBox:function(command, options){
                if(typeof command != 'string'){
                    options = command;
                    command = 'init';
                }
                var box = $(this);
                switch(command){
                    case 'init':
                        box.addClass('play-box')
                            .data('data', options.data);

                        var wordPanel = $('<div/>').appendTo(box)
                            .wordPanel();

                        var inner = $('<div/>').addClass('play-box-inner')
                            .appendTo(box);
                        var linePanel = $('<div/>').appendTo(inner)
                            .linePanel({lineCount:10});

                        var pressedBox = $('<div/>')
                            .appendTo(linePanel)
                            .pressedBox();
                        $('<div/>').appendTo(box)
                            .handPanel();
                        var cover = $('<div/>').addClass('play-box-cover')
                            .appendTo(box).addClass('to-start');
                        $('<div/>').addClass('message')
                            .text('press start!')
                            .appendTo(cover);
                        $(window)
                            .keydown(function(e){
                                if(!box.is('.playing')) {
                                    switch(e.keyCode){
                                        case KeyCode.enter:
                                        case KeyCode.space:
                                            $('.start-button:visible').trigger('click');
                                            e.preventDefault();
                                            return;
                                    }

                                    return;
                                }
                                switch(e.keyCode){
                                    case KeyCode.tab:
                                    case KeyCode.delete:
                                    case KeyCode.enter:
                                        e.preventDefault();
                                        return;
                                }
                                linePanel.linePanel('press', {
                                    key:e.keyCode,
                                    hit:function(char, index){
                                        wordPanel.wordPanel('hit', {key:char});
                                        $('.finger.active', box).removeClass('active');
                                        pressedBox.pressedBox('hit');
                                        $('.finger', box).eq(index).finger('activate');
                                        if(options.hit)options.hit.apply(this, [char]);
                                    },
                                    error:function(char){
                                        wordPanel.wordPanel('error', {key:char});
                                        pressedBox.pressedBox('error');
                                        if(options.error)options.error.apply(this, [char]);
                                    },
                                    wordComplete:function(){

                                    }
                                });
                                pressedBox.pressedBox('press', {
                                    key:e.keyCode
                                });
                            })
                            .keyup(function(){

                            })
                            .resize(function(){
                                var height = box.height() - 330;
                                $('.play-box-inner', box).height(height);
                            }).trigger('resize');

                    case 'refresh':
                        return box;
                    case 'start':
                        $('.line-inner', box).removeAttr('style');
                        $('.block').remove();
                        var load = function(){
                            var word = (function(){
                                while(true){
                                    var word = box.data('data').next();
                                    if(word.match(/\s/)) continue;
                                    if(!word.match(/-/)) return word.toLowerCase();
                                }
                            })();
                            var wordPanel = $('.word-panel', box).wordPanel('loadWord', {
                                word:word
                            });
                            var linePanel = $('.line-panel', box).linePanel('loadWord', {
                                word:word,
                                complete:function(){
                                    if(box.is('.playing')) setTimeout(load, settings.speed * 0.1);
                                }
                            });
                        }
                        load();
                        $('.play-box-cover', box).hide();
                        return box.addClass('playing');
                    case 'stop':
                        $('.block').stop();
                        $('.line-panel', box).linePanel('loadWord', {abort:true})

                        var cover = $('.play-box-cover', box).empty().show()
                            .removeClass('to-start');
                        $('<div/>').addClass('message').text('game over')
                            .addClass('gameover-message')
                            .appendTo(cover);
                        return box.removeClass('playing');
                }
                return box;
            },
            pressedBox:function(command, options){
                if(typeof command != 'string'){
                    options = command;
                    command = 'init';
                }
                var box = $(this);
                switch(command){
                    case 'init':
                        box.addClass('pressed-box');
                        $('<span/>')
                            .addClass('pressed-box-text')
                            .appendTo(box);
                    case 'refresh':
                        return box;
                    case 'press':
                        var timer = box.data('timer');
                        if(timer){
                            clearTimeout(timer);
                        }
                        var char = util.codeToChar(options.key);
                        var boxText = $('.pressed-box-text', box).text(char)
                            .show();
                        timer = setTimeout(function(){
                            boxText.hide();
                        }, 200);
                        box.data('timer', timer);
                        return box;
                    case 'hit':
                        return box.removeClass('error');
                    case 'error':
                        return box.addClass('error');
                }
                return box;
            },
            resultBox:function(command, options){
                if(typeof command != 'string'){
                    options = command;
                    command = 'init';
                }
                var box = $(this);
                switch(command){
                    case 'init':
                        box.addClass('result-box');
                        $('<legend/>').text('accuracy')
                            .appendTo(box);

                        var countArea = $('<div/>').addClass('count-area')
                            .appendTo(box);
                        $.each({hit:'hit&nbsp;', error:'miss'}, function(name, label){
                            var countItem = $('<span/>').addClass('count-area-item')
                                .addClass(name)
                                .appendTo(countArea);
                            $('<span/>').addClass('value')
                                .appendTo(countItem)
                            $('<span/>').addClass('label')
                                .html(label).appendTo(countItem);
                        });

                        var rateArea = $('<div/>').addClass('rate-area')
                            .appendTo(box);
                        $('<span/>').addClass('value')
                            .appendTo(rateArea);
                        $('<span/>').addClass('unit')
                            .text('%')
                            .appendTo(rateArea);

                        box.data('data', {
                            hit:0,
                            error:0,
                            rate:function(){
                                var count = this.hit + this.error;
                                if(count == 0) return 1;
                                return this.hit / count;
                            }
                        });
                    case 'refresh':
                        var data = box.data('data');
                        var rate = data.rate();
                        var countArea = $('.count-area', box);
                        $('.hit .value', countArea).text(data.hit);
                        $('.error .value', countArea).text(data.error);
                        var rateArea = $('.rate-area', box);
                        $('.value', rateArea).text(parseInt(rate * 100));
                        return box;
                    case 'hit':
                        var data = box.data('data');
                        data.hit++;
                        return box.resultBox('refresh');
                    case 'error':
                        var data = box.data('data');
                        data.error++;
                        return box.resultBox('refresh');
                }
                return box;

            },
            controlPanel:function(command, options){
                if(typeof command != 'string'){
                    options = command;
                    command = 'init';
                }
                var panel = $(this);
                switch(command){
                    case 'init':
                        var header = $('<header/>').appendTo(panel);
                        $.each(['Touch','Type','Training'], function(i, text){
                            $('<span/>').addClass('initial')
                                .text(text.substr(0,1))
                                .appendTo(header);
                            $('<span/>').text(text.substr(1))
                                .appendTo(header);
                        });

                        $('<fieldset/>').resultBox()
                            .appendTo(panel);

                        var levelSelect = $('<ui/>').appendTo(panel)
                            .selectableList({
                                data:{
                                    easy:10000,
                                    normal:6000,
                                    hard:800
                                },
                                select:function(index, val){
                                    settings.speed = val;
                                    saveData('level', index);
                                }
                            })
                            .addClass('level-select');
                        var index = restoreData('level');
                        if(index == undefined) index = 1;
                        $('li', levelSelect).eq(index).trigger('click');


                        $('<br/>').addClass('clear').appendTo(panel);
                        $('<a/>').appendTo(panel)
                            .button('start')
                            .click(function(){
                                levelSelect.selectableList('disable');
                            });
                        $('<a/>').appendTo(panel)
                            .button('stop')
                            .click(function(){
                                levelSelect.selectableList('enable');
                            });
                        $('<a/>').appendTo(panel)
                            .button('retry')
                            .click(function(){
                                location.href = "";
                            }).hide();


                        var ad = "<iframe src='http://rcm.amazon.com/e/cm?t=touchtypetraining-20&o=1&p=9&l=ez&f=ifr&f=ifr' width='180' height='150' scrolling='no' marginwidth='0' marginheight='0' border='0' frameborder='0' style='border:none;'></iframe>";
                        var adArea = $('<fieldset/>').attr('id', 'ad-area')
                            .appendTo(panel)
                            .html(ad);
                        $('<legend/>').text('ad').prependTo(adArea);
                        var footer = $('<footer/>').appendTo(panel);
                        $('<span/>').addClass('me')
                            .html("Created By <a href='http://jp.linkedin.com/pub/taka-okunishi/4b/258/691'>Taka Okunishi</a>")
                            .appendTo(footer);
                        setTimeout(function(){
                            footer.animate({
                                bottom:- footer.height()
                            }, 3000)
                        }, 2000);
                    case 'refresh':
                        return panel;
                }
                return panel;
            },
            clearMessage:function(){
                var message = $(this).addClass('clear-message');
                $('<span/>').text('clear!')
                    .addClass('clear-message-text')
                    .appendTo(message);
                $('<br/>').appendTo(message);
                $('<a/>').button('again')
                    .appendTo(message)
                    .click(function(){
                        $('#ttt-root a.retry-button').trigger('click');
                    });
                return message;
            }
        }

    })($.sub());
    $.fn.extend(plugin);
})(jQuery);

$(function(){
    var root = $('div#ttt-root').live('gameover', function(){
        stopButton.trigger('click');
    })
        .one('gameClear', function(){
            $('.block').stop().remove();
            $('.line-panel').removeClass('playing')
                .linePanel('loadWord', {abort:true})
            setTimeout(function(){
                $('<div/>').appendTo(root)
                    .clearMessage();
            }, 800);
            $('.stop-button:visible').trigger('click');
            $('.gameover-message').hide();
        });
    var controlPanel = $('div#control-panel', root).controlPanel();
    var resultBox = $('.result-box', controlPanel);
    var playBox = $('#play-box', root).playBox({
        data:Word,
        hit:function(){
            resultBox.resultBox('hit');
        },
        error:function(){
            resultBox.resultBox('error');
        }
    });
    $('.play-box-cover', playBox).click(function(){
        var cover = $(this);
        if(cover.is('.to-start')) {
            startButton.trigger('click');
            cover.removeClass('to-start');
        }
    })

    var startButton = $('.start-button', controlPanel).click(function(){
        playBox.playBox('start');
        startButton.hide();
        stopButton.show();
    });
    var stopButton = $('.stop-button', controlPanel).click(function(){
        playBox.playBox('stop');
        startButton.hide();
        stopButton.hide();
        retryButton.show();
    }).hide();
    var retryButton = $('.retry-button', controlPanel).click(function(){
        saveData('retry', true);
        saveData('settings', settings);
    });

    if(restoreData('retry')){
        saveData('retry', false);
    }

});