/*:
 * @target MZ
 * @plugindesc メンバー入れ替え時に同じアクターを新しいIDにコピーして仲間に加える
 * @help 
 * 同じアクターがパーティに追加された場合、
 * 自動で新しいIDにコピーし、そのアクターも仲間に加えるようにします。
 * 
 * パラメータ
 * ・処理結果スイッチ
 * プラグインコマンドの加入処理の実行後、加入処理が正常に行われていれば指定したスイッチがオン
 * 異常終了した場合は指定したスイッチがオフになります。
 * プラグインコマンドの加入処理のあとにこのスイッチで条件分岐を設けることで、エラーハンドリングができます。
 * 
 * @param resultSw
 * @text 処理結果スイッチ
 * @desc 複製体の加入処理が正常終了したかの判定結果を反映するスイッチのIDです（0を設定で機能を使わない）
 * @type switch
 * @default 0
 * 
 * @command duplicate
 * @text 複製体を加入させる（直接指定）
 * @desc アクターIDを指定して、そのアクターのデータベース上のパラメータを持った新しいアクターを加入させます
 *
 * @arg orgActor
 * @text 加入アクターID
 * @desc 加入させるアクターの複製元のIDを指定してください
 * @type actor
 * @default
 * 
 * 
 * @command duplicateVariable
 * @text 複製体を加入させる（変数で指定）
 * @desc アクターIDを指定して、そのアクターのデータベース上のパラメータを持った新しいアクターを加入させます
 *
 * @arg orgActorVal
 * @text 変数ID
 * @desc 加入させるアクターの複製元のIDが入った変数IDを指定してください
 * @type variable
 * @default 
 * 
 * @command releaseActor
 * @text アクターを逃がす（直接指定）
 * @desc アクターIDを指定して、そのアクターを完全にデータから消し去ります。
 *
 * @arg actorId
 * @text 消去アクターID
 * @desc 消去するアクターのIDを指定してください（複製先のIDです）
 * @type actor
 * @default
 * 
 * @command releaseActorVariable
 * @text アクターを逃がす（変数で指定）
 * @desc アクターIDを指定して、そのアクターを完全にデータから消し去ります。
 *
 * @arg actorId
 * @text 変数ID
 * @desc 消去するアクターのIDが入った変数IDを指定してください（複製先のIDです）
 * @type variable
 * @default
 * 
 */

(() => {
    const pluginName = decodeURIComponent(document.currentScript.src.split("/").pop().replace(/\.js$/, ""));
    const parameters = PluginManager.parameters(pluginName);
    const resultSwitchId = parameters.resultSw;

    PluginManager.registerCommand(pluginName, "duplicate", args => {
        const original = args.orgActor;
        dupulicateActor(original);
    });

    PluginManager.registerCommand(pluginName, "duplicateVariable", args => {
        const original = $gameVariables.value(args.orgActorVal);
        dupulicateActor(original);
    });

    PluginManager.registerCommand(pluginName, "releaseActor", args => {
        const actorId = args.actorId;
        initializeActorData(actorId);
    });

    PluginManager.registerCommand(pluginName, "releaseActorVariable", args => {
        const actorId = $gameVariables.value(args.actorId);
        initializeActorData(actorId);
    });

    function dupulicateActor(originalActorId) {
        const newActorId = findNextAvailableActorId();
        if (newActorId) {
            $gameActors._data[newActorId] = new Game_Actor(1);
            $gameActors._data[newActorId].setup(originalActorId);
            $gameActors._data[newActorId]._actorId = newActorId;
            $gameParty.addActor(newActorId);
            $gameSwitches.setValue(resultSwitchId, true);
        } else {
            $gameSwitches.setValue(resultSwitchId, false);
        }
    }

    function initializeActorData(actorId) {
        if ($gameParty._actors.includes(actorId)) {
            $gameParty.removeActor(actorId);
        }
        $gameActors._data[actorId] = undefined;
    }

    function findNextAvailableActorId() {
        let newId = 1; // 最初のコピー先のIDは1から開始
        while ($gameActors._data[newId]) {  // $gameActors._data でゲーム内のアクターを確認
            newId++;
        }

        // 利用可能なアクターIDが見つかった場合
        if (newId < $dataActors.length) {
            return newId;
        } else {
            console.error("利用可能なアクターIDがありません。");
            return null;
        }
    }
})();
