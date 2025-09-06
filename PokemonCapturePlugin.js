/*:
 * @target MZ
 * @plugindesc ポケモン風の捕獲アイテムを実装するプラグイン（スイッチ対応版）
 * @help 
 * ポケモン風の捕獲アイテムを使用して、エネミーをアクターとして追加したり、隠しアイテムを入手できるプラグインです。
 *
 * @param effects
 * @type animation[]
 * @text エフェクトID設定
 * @desc 捕獲時にゆれるごとに再生するエフェクトのIDを設定します。
 * 
 * @param boostStateIds
 * @type state[]
 * @text 捕獲率上昇ステート
 * @desc エネミーに特定のステートが複数付与されていると、捕獲成功確率が10%上昇します。
 *
 * @param trainerBattleSwitchId
 * @type switch
 * @text トレーナーバトルスイッチID
 * @desc 捕獲アイテムが使用できないスイッチIDを設定します。
 */

(() => {
    const pluginName = "PokemonCapturePlugin";

    const parameters = PluginManager.parameters(pluginName);
    const effects = JSON.parse(parameters['effects'] || '[]'); // エフェクトIDを配列として読み込む
    const boostStateIds = JSON.parse(parameters['boostStateIds'] || '[]').map(Number); // 確率上昇ステートIDを配列として取得
    const trainerBattleSwitchId = Number(parameters['trainerBattleSwitchId'] || 1); // トレーナーバトルスイッチID

    // アイテムが使用された時の処理をフック
    const _Game_Action_apply = Game_Action.prototype.apply;
    Game_Action.prototype.apply = function(target) {
        if (this.isCaptureItem() && target.isEnemy()) {
            // 指定したスイッチがオンの時は捕獲アイテムの効果を無効化し、エフェクトも再生しない
            if ($gameSwitches.value(trainerBattleSwitchId)) {
                $gameMessage.add("人のものをとったら泥棒！");
                console.log("トレーナーバトル中に捕獲アイテムが使用されました: 効果なし");
                return; // ここで処理を中断してエフェクトや効果を無効にする
            }

            // 通常の捕獲アイテムの処理
            useCaptureItem(target.enemyId(), this.item().id, target);
        } else {
            // 通常のアイテム処理
            _Game_Action_apply.call(this, target);
        }
    };

    // 捕獲アイテムかどうかを判定
    Game_Action.prototype.isCaptureItem = function() {
        const item = this.item();
        return item && item.meta.captureItem; // アイテムのメモ欄に <captureItem> が設定されている場合
    };

    async function useCaptureItem(enemyId, itemId, target) {
        const enemy = $dataEnemies[enemyId];
        const item = $dataItems[itemId];

        if (!enemy || !item) return;

        // 捕獲成功確率を計算
        const baseCatchRate = getEnemyCatchRate(enemyId);
        const itemCatchBonus = getItemCatchBonus(itemId);
        const hpCatchBonus = calculateHpBonus(target); // HPによるボーナス
        const stateCatchBonus = calculateStateBonus(target); // ステートによるボーナス
        const finalCatchRate = (baseCatchRate + stateCatchBonus) * itemCatchBonus * hpCatchBonus;

        // 捕獲エフェクトと捕獲判定（0～3回）
        const isCaptured = await playCaptureEffectSequence(finalCatchRate, target);

        if (isCaptured) {
            // 指定されたスイッチをONにする
            const switchId = getEnemySwitchId(enemyId);
            if (switchId) {
                $gameSwitches.setValue(switchId, true);
                console.log(`捕獲成功: スイッチID ${switchId} をONにしました。`);
            }

            // 隠しアイテムを入手
            const hiddenItemId = getEnemyHiddenItemId(enemyId);
            if (hiddenItemId) {
                $gameParty.gainItem($dataItems[hiddenItemId], 1);
                console.log(`隠しアイテムID ${hiddenItemId} を入手しました。`);
            }

            $gameMessage.add(`捕獲成功！`);
        } else {
            $gameMessage.add(`捕獲失敗...`);
        }

        // 通常のバトルフェーズに戻す
        BattleManager._phase = "action";
    }

    // エフェクト再生と捕獲判定
    async function playCaptureEffectSequence(finalCatchRate, target) {
        for (let i = 0; i < 3; i++) {
            // エフェクト再生（ターゲットに対して表示）
            const effectId = effects[i];
            if (effectId) {
                $gameTemp.requestAnimation([target], effectId); // ターゲットにアニメーションを再生
                console.log(`エフェクトID ${effectId} をターゲットに再生しました。`);
                await waitFor(40); // 40フレーム待機
            }

            // 捕獲失敗判定を行い、失敗ならその時点で捕獲失敗メッセージを表示して中止
            if (!attemptCapture(finalCatchRate)) {
                return false; // 捕獲失敗時に即座に終了
            }
        }

        // 3回のエフェクト後に捕獲判定が成功している場合のみ捕獲成功を返す
        return true;
    }

    // 捕獲確率の判定
    function attemptCapture(catchRate) {
        const randomValue = Math.random() * 100;
        return randomValue < catchRate;
    }
    
    async function playCaptureEffectSequence(finalCatchRate, target) {
        let captureSuccess = false;
        for (let i = 0; i < 3; i++) {
            const effectId = effects[i];
            if (effectId) {
                $gameTemp.requestAnimation([target], effectId);
                await waitFor(40);
            }
            if (attemptCapture(finalCatchRate)) {
                captureSuccess = true; // 1回でも成功すればOK
            }
        }
        return captureSuccess;
    }
    
    function getEnemyCatchRate(enemyId) {
        const enemy = $dataEnemies[enemyId];
        const match = enemy.note.match(/<catchRate:(\d+)>/);
        return match ? Number(match[1]) : 30; // デフォルトを30%に
    }
    
    function getItemCatchBonus(itemId) {
        const item = $dataItems[itemId];
        const match = item.note.match(/<catchBonus:(\d+)>/);
        return match ? Number(match[1]) / 100 + 1 : 1; // 100%なら倍率2倍
    }
    
    function calculateHpBonus(target) {
        const maxHp = target.mhp;
        const currentHp = target.hp;
        return 1 + (1 - (currentHp / maxHp)); // HPが低いほどボーナス大
    }
    
    function calculateStateBonus(target) {
        let totalBonus = 0;
        boostStateIds.forEach(stateId => {
            if (target.isStateAffected(stateId)) {
                totalBonus += 10;
            }
        });
        return totalBonus;
    }

    function getEnemySwitchId(enemyId) {
        const enemy = $dataEnemies[enemyId];
        const match = enemy.note.match(/<switchId:(\d+)>/); // <switchId:x> 形式でスイッチIDを指定
        return match ? Number(match[1]) : null;
    }

    function getEnemyHiddenItemId(enemyId) {
        const enemy = $dataEnemies[enemyId];
        const match = enemy.note.match(/<hiddenItemId:(\d+)>/);
        return match ? Number(match[1]) : null;
    }

    // ウェイトを行う関数
    function waitFor(frames) {
        return new Promise(resolve => {
            setTimeout(() => resolve(), frames * 16.67); // 1フレーム = 16.67ms
        });
    }

    // 効果なしメッセージを非表示にする
    const _Game_Action_applyItemUserEffect = Game_Action.prototype.applyItemUserEffect;
    Game_Action.prototype.applyItemUserEffect = function(target) {
        if (this.isCaptureItem() && target.isEnemy()) {
            return; // 捕獲アイテムの場合は何も表示しない
        }
        _Game_Action_applyItemUserEffect.call(this, target); // 通常の処理を実行
    };
})();
