/*:
 * @target MZ
 * @plugindesc 特定の職業レベルで進化するシステム（レベル保持＆名前・顔変更対応）
 * @author あなたの名前
 *
 * @help EvolutionSystem.js
 *
 * 特定の職業レベルに達すると、指定した職業に進化します。
 * 進化時にコモンイベントも実行できます。
 *
 * == 使用方法 ==
 * プラグインコマンドで進化条件をチェックしてください。
 *
 * == プラグインコマンド ==
 * Evolution Check
 * → 全アクターの職業レベルをチェックし、条件を満たしていれば進化
 *
 * @command Check
 * @text 進化チェック
 * @desc 全アクターの職業をチェックし、条件を満たしていれば進化
 */

(() => {
    const evolutionRules = {
        1: { level: 16, newJob: 2, commonEvent: 11, newName: "フシギソウ", faceName: "02", faceIndex: 0 },
        2: { level: 32, newJob: 3, commonEvent: 12, newName: "フシギバナ", faceName: "02", faceIndex: 1 },
        4: { level: 16, newJob: 5, commonEvent: 13, newName: "リザード", faceName: "02", faceIndex: 2 },
        5: { level: 36, newJob: 6, commonEvent: 14, newName: "リザードン", faceName: "02", faceIndex: 3 },
        7: { level: 16, newJob: 8, commonEvent: 15, newName: "カメール", faceName: "02", faceIndex: 4 },
        8: { level: 36, newJob: 9, commonEvent: 16, newName: "カメックス", faceName: "02", faceIndex: 5 },
        10: { level: 7, newJob: 11, commonEvent: 17, newName: "トランセル", faceName: "12", faceIndex: 5 },
        11: { level: 10, newJob: 12, commonEvent: 18, newName: "バタフリー", faceName: "06", faceIndex: 3 },
        13: { level: 7, newJob: 14, commonEvent: 19, newName: "コクーン", faceName: "08", faceIndex: 2 },
        14: { level: 10, newJob: 15, commonEvent: 20, newName: "スピアー", faceName: "11", faceIndex: 1 },
        16: { level: 18, newJob: 17, commonEvent: 21, newName: "ピジョン", faceName: "15", faceIndex: 4 },
        17: { level: 36, newJob: 18, commonEvent: 22, newName: "ピジョット", faceName: "15", faceIndex: 3 },
        19: { level: 20, newJob: 20, commonEvent: 23, newName: "ラッタ", faceName: "19", faceIndex: 7 },
        21: { level: 20, newJob: 22, commonEvent: 24, newName: "オニドリル", faceName: "04", faceIndex: 5 },
        23: { level: 22, newJob: 24, commonEvent: 25, newName: "アーボック", faceName: "03", faceIndex: 1 },
        27: { level: 22, newJob: 28, commonEvent: 27, newName: "サンドパン", faceName: "10", faceIndex: 1 },
        29: { level: 16, newJob: 30, commonEvent: 28, newName: "ニドリーナ", faceName: "13", faceIndex: 4 },
        32: { level: 16, newJob: 33, commonEvent: 30, newName: "ニドリーノ", faceName: "13", faceIndex: 5 },
        41: { level: 22, newJob: 42, commonEvent: 35, newName: "ゴルバット", faceName: "08", faceIndex: 7 },
        43: { level: 21, newJob: 44, commonEvent: 36, newName: "クサイハナ", faceName: "07", faceIndex: 0 },
        46: { level: 24, newJob: 47, commonEvent: 38, newName: "パラセクト", faceName: "14", faceIndex: 6 },
        48: { level: 31, newJob: 49, commonEvent: 39, newName: "モルフォン", faceName: "19", faceIndex: 0 },
        50: { level: 26, newJob: 51, commonEvent: 40, newName: "ダグトリオ", faceName: "11", faceIndex: 4 },
        52: { level: 28, newJob: 53, commonEvent: 41, newName: "ペルシアン", faceName: "17", faceIndex: 2 },
        54: { level: 33, newJob: 55, commonEvent: 42, newName: "ゴルダック", faceName: "08", faceIndex: 5 },
        56: { level: 28, newJob: 57, commonEvent: 43, newName: "オコリザル", faceName: "04", faceIndex: 3 },
        60: { level: 25, newJob: 61, commonEvent: 45, newName: "ニョロゾ", faceName: "13", faceIndex: 7 },
        63: { level: 16, newJob: 64, commonEvent: 47, newName: "ユンゲラー", faceName: "19", faceIndex: 4 },
        66: { level: 28, newJob: 67, commonEvent: 49, newName: "ゴーリキー", faceName: "08", faceIndex: 6 },
        69: { level: 21, newJob: 70, commonEvent: 51, newName: "ウツドン", faceName: "03", faceIndex: 7 },
        72: { level: 30, newJob: 73, commonEvent: 53, newName: "ドククラゲ", faceName: "12", faceIndex: 3 },
        74: { level: 25, newJob: 75, commonEvent: 54, newName: "ゴローン", faceName: "09", faceIndex: 1 },
        77: { level: 40, newJob: 78, commonEvent: 56, newName: "ギャロップ", faceName: "06", faceIndex: 5 },
        79: { level: 37, newJob: 80, commonEvent: 57, newName: "ヤドラン", faceName: "19", faceIndex: 2 },
        81: { level: 30, newJob: 82, commonEvent: 58, newName: "レアコイル", faceName: "20", faceIndex: 3 },
        84: { level: 31, newJob: 85, commonEvent: 59, newName: "ドードリオ", faceName: "12", faceIndex: 1 },
        86: { level: 34, newJob: 87, commonEvent: 60, newName: "ジュゴン", faceName: "10", faceIndex: 5 },
        88: { level: 38, newJob: 89, commonEvent: 61, newName: "ベトベトン", faceName: "17", faceIndex: 1 },
        92: { level: 25, newJob: 93, commonEvent: 63, newName: "ゴースト", faceName: "08", faceIndex: 0 },
        96: { level: 26, newJob: 97, commonEvent: 65, newName: "スリーパー", faceName: "11", faceIndex: 2 },
        98: { level: 28, newJob: 99, commonEvent: 66, newName: "キングラー", faceName: "06", faceIndex: 7 },
        100: { level: 30, newJob: 101, commonEvent: 67, newName: "マルマイン", faceName: "18", faceIndex: 1 },
        104: { level: 28, newJob: 105, commonEvent: 69, newName: "ガラガラ", faceName: "06", faceIndex: 1 },
        109: { level: 35, newJob: 110, commonEvent: 70, newName: "マタドガス", faceName: "18", faceIndex: 0 },
        111: { level: 42, newJob: 112, commonEvent: 71, newName: "サイドン", faceName: "09", faceIndex: 3 },
        116: { level: 32, newJob: 117, commonEvent: 72, newName: "シードラ", faceName: "10", faceIndex: 2 },
        118: { level: 33, newJob: 119, commonEvent: 73, newName: "アズマオウ", faceName: "03", faceIndex: 2 },
        129: { level: 20, newJob: 130, commonEvent: 75, newName: "ギャラドス", faceName: "06", faceIndex: 4 },
        138: { level: 40, newJob: 139, commonEvent: 79, newName: "オムスター", faceName: "04", faceIndex: 7 },
        140: { level: 40, newJob: 141, commonEvent: 80, newName: "カブトプス", faceName: "05", faceIndex: 6 },
        147: { level: 30, newJob: 148, commonEvent: 81, newName: "ハクリュー", faceName: "14", faceIndex: 3 },
        148: { level: 55, newJob: 149, commonEvent: 82, newName: "カイリュー", faceName: "05", faceIndex: 2 },
    };

    PluginManager.registerCommand("EvolutionSystem", "Check", () => {
        console.log("プラグインコマンド 'Check' が呼び出されました");
        $gameParty.members().forEach(actor => {
            const jobId = actor._classId;
            const rule = evolutionRules[jobId];
            if (rule && actor.level >= rule.level) {
                const currentLevel = actor.level; // レベル保持
                actor.changeClass(rule.newJob, false);
                actor.changeLevel(currentLevel, false); // 進化後も同じレベルを維持
    
                if (rule.newName) {
                    actor.setName(rule.newName);
                }
                if (rule.faceName !== undefined && rule.faceIndex !== undefined) {
                    actor.setFaceImage(rule.faceName, rule.faceIndex);
                }
    
                if (rule.commonEvent) {
                    console.log("コモンイベントを予約: " + rule.commonEvent);
                    $gameTemp.reserveCommonEvent(rule.commonEvent);
                }
            }
        });
    });
})();