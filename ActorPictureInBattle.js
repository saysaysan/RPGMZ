/*:
 * @target MZ
 * @plugindesc 戦闘中に先頭のアクターに対応するピクチャを表示するプラグイン
 * 
 * @param PictureX
 * @text ピクチャX座標
 * @type number
 * @default 0
 * @desc ピクチャのX座標（1280×720の左下に合わせるための位置）
 * 
 * @param PictureY
 * @text ピクチャY座標
 * @type number
 * @default 520
 * @desc ピクチャのY座標（1280×720の左下に合わせるための位置）
 * 
 * @help
 * このプラグインは、戦闘中にパーティーの先頭アクターに対応するピクチャを表示します。 
 * ピクチャはアクターのメモ欄に <ActorPicture: ファイル名> で設定します。
 * 例: <ActorPicture: Actor1.png>
 * 
 * 戦闘中にアクターが入れ替わった場合、ピクチャも自動で更新されます。
 */

(() => {
    const parameters = PluginManager.parameters("ActorPictureInBattle");
    const pictureX = Number(parameters['PictureX'] || 0);
    const pictureY = Number(parameters['PictureY'] || 520);

    window.showActorPicture = function() {
        const actor = $gameParty.leader();
        if (!actor) return;
    
        const pictureName = getClassPicture(actor);
        if (pictureName) {
            const pictureId = 2;
            console.log("ピクチャ表示:", pictureName, "位置:", pictureX, pictureY);
            $gameScreen.showPicture(pictureId, pictureName, 0, pictureX, pictureY, 100, 100, 255, 0);
        } else {
            console.log("職業にピクチャが設定されていません。");
        }
    };
    

    function getClassPicture(actor) {
        const note = actor.currentClass().note;
        const match = note.match(/<ActorPicture:\s*(.+?)\s*>/i);
        
        if (match) {
            console.log("ピクチャ名取得成功:", match[1]);
        } else {
            console.log("職業のメモ欄にピクチャ名が設定されていません。");
        }
        
        return match ? match[1] : null;
    }

    const _Scene_Battle_start = Scene_Battle.prototype.start;
    Scene_Battle.prototype.start = function() {
        _Scene_Battle_start.call(this);
        showActorPicture();
    };

    const _Game_Party_swapOrder = Game_Party.prototype.swapOrder;
    Game_Party.prototype.swapOrder = function(index1, index2) {
        _Game_Party_swapOrder.call(this, index1, index2);
        if (SceneManager._scene instanceof Scene_Battle) {
            showActorPicture();
        }
    };

    const _Scene_Battle_terminate = Scene_Battle.prototype.terminate;
    Scene_Battle.prototype.terminate = function() {
        $gameScreen.erasePicture(2);
        _Scene_Battle_terminate.call(this);
    };

    const _Scene_Map_start = Scene_Map.prototype.start;
    Scene_Map.prototype.start = function() {
        _Scene_Map_start.call(this);
        $gameScreen.erasePicture(2);
    };
})();