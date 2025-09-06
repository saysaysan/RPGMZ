/*:
 * @target MZ
 * @plugindesc へんしんスキルを実装するプラグイン
 * @help
 * このプラグインは、メタモンの「へんしん」のようなスキルを実装します。
 *
 * スキルのメモ欄に <TransformSkill> を記述すると、
 * へんしんスキルと判断され、対象に応じた変身を実行。
 *
 * 敵が変身すると、対象の職業IDに応じて姿とパラメータ、スキルを変更。
 * 味方が変身すると、対象の敵のIDに応じた職業に変身。
 * 変身中はピクチャ・顔グラを変更し、戦闘終了後に元の姿へ戻る。
 *
 * @param TransformMappings
 * @type struct<TransformMap>[]
 * @desc 変身後の対応を設定（敵ID→職業、職業→敵ID）
 */

/*~struct~TransformMap:
 * @param Original
 * @desc 変身前の対象（職業IDまたは敵キャラID）
 *
 * @param Transformed
 * @desc 変身後の対象（敵キャラIDまたは職業ID）
 */

(() => {
    const parameters = PluginManager.parameters("TransformSkill");
    const transformMappings = JSON.parse(parameters["TransformMappings"] || "[]").map(JSON.parse);
    const pictureX = Number(parameters['PictureX'] || 0);  // パラメータからX座標を取得
    const pictureY = Number(parameters['PictureY'] || 320);  // パラメータからY座標を取得

    function findTransformTarget(original) {
        return transformMappings.find(m => Number(m.Original) === Number(original))?.Transformed || null;
    }

    function copyParameters(from, to) {
        to._hp = from.hp;
        to._mp = from.mp;
        for (let i = 0; i < 8; i++) {
            to.addParam(i, from.param(i) - to.param(i));
        }
        
        // スキルのコピー処理を修正
        if (from.isActor()) {
            to._skills = [...from._skills];
        } else if (from.isEnemy()) {
            to._skills = from.enemy().actions.map(action => action.skillId);
        }
        
        to.refresh();
    }

    const _Game_Action_apply = Game_Action.prototype.apply;
    Game_Action.prototype.apply = function(target) {
        _Game_Action_apply.call(this, target);
        const item = this.item();
    
        if (item.meta["TransformSkill"]) {
            this.makeSuccess(target); // ★ 成功したことにする
            
            if (this.subject().isEnemy() && target.isActor()) {
                transformEnemy(this.subject(), target);
            } else if (this.subject().isActor() && target.isEnemy()) {
                transformActor(this.subject(), target);
            }
        }
    };
    

    function transformEnemy(enemy, actor) {
        const newEnemyId = findTransformTarget(actor._classId);
        if (newEnemyId) {
            enemy._originalEnemyId = enemy.enemyId();
            enemy._enemyId = Number(newEnemyId);
            copyParameters(actor, enemy);
            enemy.refresh();
        }
    }

    function transformActor(actor, enemy) {
        const newClassId = findTransformTarget(enemy.enemyId());
        if (newClassId) {
            actor._originalClassId = actor._classId;

            // 変身前のスキル使用回数を保存
            if (!actor._times_skill) {
                actor._times_skill = {};
            }

            let oldTimesSkill = JSON.parse(JSON.stringify(actor._times_skill));

            // 職業変更
            actor.changeClass(Number(newClassId), true);
            copyParameters(enemy, actor);
            actor.refresh();

            if (!actor._times_skill) {
                actor._times_skill = {};
            }

            // 変身前のスキル回数を復元
            for (let skillId in oldTimesSkill) {
                if (!actor._times_skill[skillId]) {
                    actor._times_skill[skillId] = [oldTimesSkill[skillId][0], oldTimesSkill[skillId][1]];
                } else {
                    actor._times_skill[skillId][0] = oldTimesSkill[skillId][0];
                }
            }

            // 変身メッセージを追加
            BattleManager._logWindow.push("addText", actor.name() + "は " + enemy.name() + " にへんしんした！");

            // 🔹 ピクチャ番号2を強制的に変更
            if (SceneManager._scene instanceof Scene_Battle) {
                // ピクチャの更新処理
                showActorPicture(); // ピクチャ更新用の関数を呼び出す
            }

            actor.refresh();

            // 🔹 戦闘画面でスプライトの更新
            if (SceneManager._scene instanceof Scene_Battle) {
                SceneManager._scene._statusWindow.refresh();
                SceneManager._scene._skillWindow.refresh();
            }
        }
    }

    function showActorPicture() {
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
    }

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
    
    

    const _BattleManager_endBattle = BattleManager.endBattle;
    BattleManager.endBattle = function(result) {
        $gameParty.members().forEach(actor => {
            if (actor._originalClassId) {
                actor.changeClass(actor._originalClassId, true); // 戦闘終了時に元の職業に戻す
                delete actor._originalClassId;
    
                // ★ 修正: スキルをリセット
                actor._skills = [];
    
                // ★ 修正: 初期スキルを習得
                const classSkills = $dataClasses[actor._classId].learnings.map(learning => learning.skillId);
                actor._skills = classSkills;
    
                actor.refresh();
            }
        });
        $gameTroop.members().forEach(enemy => {
            if (enemy._originalEnemyId) {
                enemy._enemyId = enemy._originalEnemyId;
                delete enemy._originalEnemyId;
                enemy.refresh();
            }
        });
        _BattleManager_endBattle.call(this, result);
    };
    
})();