/*:
 * @target MZ
 * @plugindesc 進化アイテムを使用して特定の職業のアクターを進化させるプラグイン
 * @author あなたの名前
 *
 * @help EvolutionItemSystem.js
 *
 * 進化アイテムを使用することで、特定の職業のアクターを進化させます。
 * 各アイテムごとに進化対象の職業を設定できます。
 *
 * 使い方：
 * 1. アイテムデータベースで「使用効果」を「なし」に設定
 * 2. 「範囲」を「1人」に設定
 * 3. 進化させたいアイテムを登録（アイテムIDに対応）
 * 4. アクターが該当の職業なら進化する
 *
 */

(() => {
    const evolutionItems = {
        51: { // ほのおのいし
            37: { newJob: 38, commonEvent: 33, newName: "キュウコン", faceName: "06", faceIndex: 6 },
            58: { newJob: 59, commonEvent: 44, newName: "ウインディ", faceName: "03", faceIndex: 6 },
            133: { newJob: 136, commonEvent: 78, newName: "ブースター", faceName: "16", faceIndex: 1 },
        },
        52: { // みずのいし
            61: { newJob: 62, commonEvent: 46, newName: "ニョロボン", faceName: "14", faceIndex: 0 },
            90: { newJob: 91, commonEvent: 62, newName: "パルシェン", faceName: "15", faceIndex: 0 },
            120: { newJob: 121, commonEvent: 74, newName: "スターミー", faceName: "10", faceIndex: 6 },
            133: { newJob: 134, commonEvent: 76, newName: "シャワーズ", faceName: "10", faceIndex: 4 },
        },
        53: { // リーフのいし
            44: { newJob: 45, commonEvent: 37, newName: "ラフレシア", faceName: "20", faceIndex: 1 },
            70: { newJob: 71, commonEvent: 52, newName: "ウツボット", faceName: "04", faceIndex: 0 },
            102: { newJob: 103, commonEvent: 68, newName: "ナッシー", faceName: "12", faceIndex: 7 },
        },
        54: { // かみなりのいし
            25: { newJob: 26, commonEvent: 26, newName: "ライチュウ", faceName: "19", faceIndex: 5 },
            133: { newJob: 135, commonEvent: 77, newName: "サンダース", faceName: "09", faceIndex: 7 },
        },
        55: { // つきのいし
            30: { newJob: 31, commonEvent: 29, newName: "ニドクイン", faceName: "13", faceIndex: 1 },
            33: { newJob: 34, commonEvent: 31, newName: "ニドキング", faceName: "13", faceIndex: 0 },
            35: { newJob: 36, commonEvent: 32, newName: "ピクシー", faceName: "15", faceIndex: 2 },
            39: { newJob: 40, commonEvent: 34, newName: "プクリン", faceName: "16", faceIndex: 4 },
        },
        56: { // つながりのヒモ
            64: { newJob: 65, commonEvent: 48, newName: "フーディン", faceName: "16", faceIndex: 2 },
            67: { newJob: 68, commonEvent: 50, newName: "カイリキー", faceName: "05", faceIndex: 1 },
            75: { newJob: 76, commonEvent: 55, newName: "ゴローニャ", faceName: "09", faceIndex: 0 },
            93: { newJob: 94, commonEvent: 64, newName: "ゲンガー", faceName: "07", faceIndex: 3 },
        }
    };

    const _Game_Action_apply = Game_Action.prototype.apply;
    Game_Action.prototype.apply = function(target) {
        _Game_Action_apply.call(this, target);
        const item = this.item();
        if (!item || !target.isActor()) return;

        const actor = target;
        const currentJobId = actor._classId;
        const itemData = evolutionItems[item.id];
        if (!itemData || !itemData[currentJobId]) return;

        const evolution = itemData[currentJobId];
        actor.changeClass(evolution.newJob, false);
        if (evolution.newName) actor.setName(evolution.newName);
        if (evolution.faceName !== undefined && evolution.faceIndex !== undefined) {
            actor.setFaceImage(evolution.faceName, evolution.faceIndex);
        }
        if (!isNaN(evolution.commonEvent) && $dataCommonEvents[evolution.commonEvent]) {
            $gameTemp.reserveCommonEvent(evolution.commonEvent);
        }
    };
})();
