/*:
 * @target MZ
 * @plugindesc パーティー内のアクターを選択し、名前入力処理を実行するプラグイン
 * @help このプラグインを使うと、プラグインコマンドでパーティー内のアクターを選択し、名前入力ウィンドウを表示することができます。
 *
 * @command inputPartyMemberName
 * @text パーティーメンバーの名前入力
 * @desc パーティー内のアクターを選択し、名前入力ウィンドウを表示します。
 *
 * @arg maxCharacters
 * @type number
 * @text 最大文字数
 * @desc 名前入力ウィンドウで入力できる文字数の最大値
 * @default 8
 */

(() => {
    const pluginName = "InputPartyMemberName";

    PluginManager.registerCommand(pluginName, "inputPartyMemberName", args => {
        const maxCharacters = Number(args.maxCharacters) || 8;
        
        // パーティー内のアクターリストを作成
        const partyMembers = $gameParty.members();

        // 選択肢としてパーティー内のアクターの名前をリスト化
        const choices = partyMembers.map(actor => actor.name());
        
        // 選択肢ウィンドウを表示
        $gameMessage.setChoices(choices, 0, -1);
        
        // 選択されたアクターに対して名前入力処理を実行
        $gameMessage.setChoiceCallback(choiceIndex => {
            const selectedActor = partyMembers[choiceIndex];
            if (selectedActor) {
                SceneManager.push(Scene_Name); // 名前入力シーンを呼び出す
                SceneManager.prepareNextScene(selectedActor.actorId(), maxCharacters); // アクターIDと最大文字数を設定
                console.log(`選択されたアクターの名前入力処理が開始されました。`);
            } else {
                console.warn("選択されたアクターが存在しません。");
            }
        });
    });
})();
