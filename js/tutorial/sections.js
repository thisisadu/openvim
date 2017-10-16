function register_VIM_TUTORIAL_SECTIONS(interpreter, messager, createSection, registerSection, showCommandOneByOne, doc) {
  var G = VIM_GENERIC;

  var pressEnterToContinue = "Press enter to continue.";

  function showInfo(text) { $('.info').text(text); } //.show(); }

  function sendMessageAsync(message) { setTimeout(function() { messager.sendMessage(message); }, 0); }
  
  function requireEnterToContinue() { showCommandOneByOne(["Enter"], accepterCreator); }

  function defaultPre() { interpreter.environment.setInsertMode(); }

  function defaultPost() {
    interpreter.environment.setCommandMode();
    showInfo(pressEnterToContinue);
    requireEnterToContinue();
  }

  function wait_for_abort() {
    messager.listenTo('abort_section', function() { // XXX: this will linger if no abort_section is done
      sendMessageAsync('tutorial_next_section');
      return messager.REMOVE_THIS_LISTENER;
    });
  }

  /** FIXME: should reuse existing code/key functionality */
  var accepterCreator = function(command) {
    var accepter = function(key) {
      if(command === 'ctrl-v') return key === 22 || ($.browser.mozilla && key === 118); //XXX: ugly and don't even work properly
      if(command === "Esc") return key === 27;
      if(command === "Enter") return key === 13;

      var keyAsCode = G.intToChar(key);
      var neededCode = command;
      
      return keyAsCode === neededCode;
    };

    return accepter;
  };

  function cmd(code, postFun) {
      return {
        'code': code,
        'postFun': postFun
      };
    }

    /** TEMPORARY duplication */
    function writeChar(code) {
      var $ch = $(doc.getChar(code));
      $ch.insertBefore($('.cursor'));
    }

    function insertText(text, newline) {
      var mode = interpreter.environment.getMode();

      interpreter.environment.setInsertMode();
      
      newline = newline !== undefined ? newline : true;

      if(newline) {
        interpreter.interpretSequence(["Esc", "o"]);
      }

      var words = text.split(" ");

      G.for_each(words, function(word) {
        //interpreter.interpretSequence(word);
        G.for_each(word, writeChar);
        interpreter.interpretOneCommand("Space");
      });

      interpreter.environment.setMode(mode);
    }

  var introduction_section = createSection("介绍",
        defaultPre,
    [
        "你好",
        "我是交互式 |Vim| 教程.",
        "我将轻松的教会你 Vim 是什么. 如果你很着急可以按任意键快进.",
        "想要练习你学到的东西, 可以切换到 |practice| 页面.",
        "现在开始学习 Vim 的基础东西."
    ], defaultPost);

    var two_modes_section = createSection("Vim的两个模式-insert和normal",
        defaultPre,
    [
        "Vim 有两个基础模式. 一个是 |insert| 模式,在这个模式你可以像普通文本编辑器一样输入任何东西.",
        "另一个是 |normal| 模式， 在这个模式可以高效的在字里行间游走或者操作文本.",
        "任何时候你都能在状态栏看到你所处的模式.",
        "按 |Esc| 可以切换到 normal 模式，按 |i| 键可以切换到 insert 模式",
        "试一试吧，首先，切换到 insert 模式."
    ],
    function() {
        interpreter.environment.setCommandMode();
        showCommandOneByOne(
            [
             cmd("i", function() {
               $('.screen_view').addClass('active_context');
               insertText("很好，现在你在 insert 模式了，随便写一些东西，然后切换到 normal 模式.");
             }),
             cmd("Esc", function() {
               $('.screen_view').removeClass('active_context');
               interpreter.environment.interpretOneCommand("G");
               insertText("很好，现在进入下一小节.");
             }),
             "Enter"
            ],
            accepterCreator);
    }
    );

    var basic_movement = createSection("基本移动: h, j, k, 和 l",
        defaultPre,
    [
        "和普通的编辑器不同, 在 Vim 中你可以用 |h|, |j|, |k|, 以及 |l| 四个键移动光标.",
        "实际操作一下看看咋用的吧!"
    ], function() {
        interpreter.environment.setCommandMode();
        showCommandOneByOne([
          "h", "h", "h", "l", "l", "l", "k", "j","k","j",
          cmd("Enter", function() {
            insertText("继续下一节.");
          }), "Enter"],
          accepterCreator);
    });

    var word_movement = createSection("单词间跳转: w, e, b",
        defaultPre,
      [
        "在单词间跳转, 你可以用 |w|, |b|, 和 |e|.",
        "|w| 移到下一个单词的开头; |e| 移到单词的结尾;  |b| 移到单词的开头. -->请在英文单词上测试 oh,today is a good day"
      ], function() {
        interpreter.environment.setCommandMode();
        showCommandOneByOne([
          "b", "b", "w", "b", "e", "w",
          cmd("Enter", function() {
            insertText("继续下一节.");
          }), "Enter"],
          accepterCreator);
    });

    var times_movement = createSection("一次多动, e.g. 5w",
      defaultPre,
      [
          "移动并不限于一次移动一个位置; 你可以把按键前面加一个数字. 比如, |3w| 相当于按 |w| 键三次."
      ],
      function() {
        interpreter.environment.setCommandMode();
        interpreter.interpretSequence("0");
        showCommandOneByOne(["3", "w", "5", "l", "2", "b",
            cmd("Enter", function() { insertText("要尽量多用数字.") }),
            "Enter"
        ],
        accepterCreator)
      });

    var times_inserting = createSection("重复输入文本, 比如. 3iYes",
        defaultPre,
        [
            "你可以多次插入一个文本.",
            "比如一个分割线可能包含30个 |-| ，如下.",
            "------------------------------",
            "输入 |30i-| |Esc|, 就没有必要输入 |-| 30 次了.",
            "试一试: 输入 |go| 3次."
        ],
        function() {
            interpreter.environment.setCommandMode();
            showCommandOneByOne(
                ["3", "i", "g", "o", "Esc",
                cmdWithText("Enter", "看到了么，魔法必须要按了 Esc 后才生效."),
                "Enter"
                ], accepterCreator)
        });

    var find_occurrence = createSection("查找一个字符, f 和 F",
        defaultPre,
        [
            "向前或者向后查找一个字符, 用 |f| 或者 |F|, 比如. |fo| 查找下一个出现的 o.",
            "你可以和数字组合. 如你可以用 |3fq| 找到光标后第三次出现的 'q'，hello,aq bq cq"
        ],
        function() {
          interpreter.environment.setCommandMode();
          interpreter.interpretSequence("0");
          showCommandOneByOne(["f", "o", "3", "f", "q",
              cmd("Enter", function() { insertText("继续!") }),
              "Enter"
          ], accepterCreator)
        });

    var matching_parentheses = createSection("括号匹配, %",
      defaultPre,
      [
        "对于用括号括起来的文本, |(| or |{| or |[|, 可以用 |%| 匹配成对的括号.",
        "这个样例 (a sample) 你可以做个测试."
      ],
      function() {
        interpreter.environment.setCommandMode();
        interpreter.interpretSequence(["F", "("]);
        showCommandOneByOne(["%", "%", "Enter"], accepterCreator)
      });

    var start_and_end_of_line = createSection("跳到行首或者行尾, 0 and $",
      defaultPre,
      [
        "跳到行首，请按 |0|.",
        "跳到行尾，请按 |$|"
      ],
      function() {
        interpreter.environment.setCommandMode();
        showCommandOneByOne(["0", "$", "0", "Enter"], accepterCreator)
      });

    var word_under_cursor = createSection("查找光标下的单词, * and #",
      defaultPre,
        [
         "向后查找单词用 |*|, 向前单词查找用 |#|.",
 	 "hello,nihao,hello,nihao,hello,nihao.（如果查找不工作，那这个教程有bug）"
        ],
        function() {
          interpreter.environment.setCommandMode();
          interpreter.interpretSequence(["0"]);
          showCommandOneByOne(["*", "*", "#",
              cmd("#", function() {
                insertText("没有了.")
              }), "Enter"], accepterCreator)
        });

    var goto_line = createSection("Goto line, g and G",
        defaultPre,
        [
         "|gg| takes you to the beginning of the file; |G| to the end.",
         "To jump directly to a specific line, give its |line number| along with |G|.",
         "Now go to the beginning of this screen with |gg| and then back to end with |G|."
        ],
        function() {
          interpreter.environment.setCommandMode();
          showCommandOneByOne(["g", "g", "G",
             cmd("Enter", function() {
                 insertText("Go to line 2 with 2G.");
             }),
             "2", "G",
             cmd("Enter", function() {
                insertText("gg! G majorly rocks.")
             }), "Enter"
          ], accepterCreator)
        });

    var search_match = createSection("Search, /text with n and N",
      defaultPre,
      [
        "Searching text is a vital part of any text editor. In Vim, you press |/|, and give the text you are looking for.",
        "You can repeat the search for next and previous occurrences with |n| and |N|, respectively.",
        "For advanced use cases, it's possible to use regexps that help to find text of particular form (In real Vim).",
        "Let's try a simple text search.",
        "Search for |text| and find the subsequent matches with |n|."
      ],
      function() {
        interpreter.environment.setCommandMode();
        interpreter.interpretSequence("1G");
        showCommandOneByOne(
          ["/", "t", "e", "x", "t", "Enter", "n", "n", "N", "N",
          cmd("Enter",
            function() {
              interpreter.interpretSequence(["/", "Esc"]);
              insertText("Slash through the needles with /n/e/e/d/l/e/s");
            }),
          "Enter"], accepterCreator
        )
      });

    var removing = createSection("Removing a character, x and X",
        defaultPre,
      [
      "|x| and |X| delete the character under the cursor and to the left of the cursor, respectively",
      "Try pressing |x| to remove the last word."
      ], function() {
        interpreter.environment.setCommandMode();
        showCommandOneByOne([
          "x", "x", "x", "x", "x",
          cmd("x", function() {
             insertText("Sometimes the treasure is the indicator (x).");
          }),
            /*
          "X", "X", "X", "X", "X",
          cmd("X", function() {
            //insertText("You removed yourself from this section. Next!");
          }),
          */
          "Enter"],
          accepterCreator);
    });

    var replacing = createSection("Replacing letter under cursor, r",
        defaultPre,
      [
      "When you need to replace only one character under your cursor, without changing to insert mode, use |r|.",
      "Replace my"
      ], function() {
        interpreter.environment.setCommandMode();
        interpreter.interpretSequence("Fy");
        showCommandOneByOne([
          "r", "e", "Enter"],
          accepterCreator);
    });

    function cmdWithText(command, text) {
        return cmd(command, function() {
                 insertText(text);
               });
    }

    function setActiveContext() { $('.screen_view').addClass('active_context'); }
    function unsetActiveContext() { $('.screen_view').removeClass('active_context'); }

    var adding_line = createSection("Insert new line, o and O",
      defaultPre,
        [
            "To insert text into a new line, press |o| or |O|",
            "After new line is created, the editor is set to |insert| mode.",
            "Write a bit and get back to |normal| mode."
        ], function() {
            interpreter.environment.setCommandMode();
            interpreter.interpretSequence(["2", "G"]);
            showCommandOneByOne([
                cmd("o", function() {
                    setActiveContext();
                }),
                cmd("Esc", function() {
                    unsetActiveContext();
                    insertText("Yep! Now big O to insert new line above the current line.");
                    interpreter.environment.setCommandMode();
                }),
                cmd("O", setActiveContext),
                cmd("Esc",
                    function() {
                        insertText("I bet you feel like O___o");
                        unsetActiveContext();
                    }), "Enter"
            ], accepterCreator)
        });

    var deleting = createSection("Deleting, d",
        defaultPre,
      [
      "|d| is the delete command",
      "You can combine it with movement, e.g. |dw| deletes the first word on the right side of the cursor",
      "It also copies the content, so that you can paste it with |p| to another location (on real Vim)."
      ], function() {
        interpreter.environment.setCommandMode();
        interpreter.environment.interpretOneCommand("0");
        showCommandOneByOne([
          "d", "w",
          cmd("Enter", function() {
            insertText("The word is gone. Now let's remove two words with d2e.");
            interpreter.environment.interpretSequence(["0"]);
          }),
          "d", "2", "e",
          cmd("Enter", function() {
            insertText("To 'de' or not to 'de', is not the question, anymore.");
          }), "Enter"],
          accepterCreator);
    });

  var repetition = createSection("Repetition with .",
    defaultPre,
    [
        "To repeat the previous command, just press |.|",
        "First, remove two words with |d2w|.",
        "After that, remove the rest of the words in this line with |.|"
    ],
      function() {
        interpreter.environment.setCommandMode();
        interpreter.interpretOneCommand("0");
        showCommandOneByOne([
            "d", "2",
            "w", ".", ".", ".", ".", ".",
          cmd("Enter", function() {
            insertText("Repetition is the root of all periods.")
          }),
            "Enter"
        ], accepterCreator)
      });

  var visual_mode = createSection("Visual mode, v",
    defaultPre,
    [
      "Besides insert and normal mode, Vim has also |visual| mode.",
      "In visual mode, you select text using movement keys before you decide what to do with it.",
      "Let's see how. Goto visual mode with |v|. Then select a word with |e|. After you've selected the text, you can delete it with |d|.",
      "This sentence has not seen the light."
    ],
    function() {
      interpreter.environment.setCommandMode();
      interpreter.interpretSequence("4b");
      showCommandOneByOne(
        ["v", "e", "l", "d",
          cmdWithText("Enter", "(Visually gifted, I lost my words.)"), "Enter"
        ], accepterCreator)
    });

  var visual_block_mode = createSection("Visual block mode, ctrl-v",
    defaultPre,
    [
      "There is yet another mode: |visual block|. This makes it possible to insert text on many lines at once. Let's see how with an example list.",
      "<> A smart girl",
      "<> Ulysses",
      "<> Learn and teach",
      "First, move cursor to insert position. Then press |ctrl-v| to go into visual block mode. Move cursor vertically to select lines. Now press |I|, and prepend text to the selected area. |Esc| completes the insertion."
    ],
    function() {
      interpreter.environment.setCommandMode();
      interpreter.interpretSequence("2G");
      showCommandOneByOne(["l", "ctrl-v", "j", "j", "I", "o", "Esc",
        cmdWithText("Enter", "Blocks are obstacles for making progress."), "Enter"],
        accepterCreator);
    });

  var last_commands = createSection("Real Vim awaits",
        defaultPre,
    [
        "Now you should be quite confident to enter the real Vim.",
        "Most important commands to remember are |:w| (save), |:q| (quit), and |:q!| (quit without saving).",
        "Also don't |PANIC!| If you make a mistake, press |u| for undo and |ctrl+R| for redo",
        "If you have a problem, or want to learn more about what Vim offers, type |:help|"
    ],
        defaultPost
    );

  var the_end = createSection("The end", defaultPre,
      [
        "Thank you for your time.",
        "This tutorial is still in progress; minor changes might occur daily. I am also developing other features/concepts.",
        "Feel encouraged to send greetings or feedback to: henrik|.|huttunen|@|gmail|.|com"
      ], wait_for_abort);

  // append a and A
  // J join lines

  /**********************************************
   * Later
   **********************************************/

  // undo
  // change inside parentheses
  // macro

  /**********************************************
   * Register sections
   **********************************************/

    registerSections([
      introduction_section,
      two_modes_section,
      basic_movement,
      word_movement,
      times_movement,
      times_inserting,
      find_occurrence,
      matching_parentheses,
      start_and_end_of_line,
      word_under_cursor,
      goto_line,
      search_match,
      adding_line,
      removing,
      replacing,
      deleting,
      repetition,
      visual_mode,
      //visual_block_mode, // TODO enable when ctrl-v works with most browsers
      last_commands,
      the_end
    ]);

  function registerSections(sections) {
    G.for_each(sections, function(section) {
      registerSection(section);
    });
  }
}
