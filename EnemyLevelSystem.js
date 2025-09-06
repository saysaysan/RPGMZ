/*:
 * @target MZ
 * @plugindesc 敵のレベルシステムを導入し、職業ベースの成長を適用します。
 * @author 
 *
 * @help EnemyLevelSystem.js
 *
 * 【機能】
 * - 敵のレベルを設定し、職業データを参照してステータスを変更
 * - 敵が仲間になった時のレベルを保持し、複製体にも対応
 * - 獲得経験値をレベルごとに倍増（レベル1:10, レベル5:50, レベル10:100 など）
 * - 獲得金額を10%増加
 * - 戦闘中の敵の名前に「Lv(レベル)」を表示
 * - マップのメモ欄で敵のレベルを設定可能（レベル分散対応）
 * - 指定したレベルでアクターを仲間にするプラグインコマンドを追加
 *
 * 【使用方法】
 * 1. 敵のメモ欄に <ClassId:職業ID> を記述
 * 2. マップのメモ欄に <EnemyLevel:最小-最大> を記述（例: <EnemyLevel:5-10>）
 * 3. 戦闘開始時に敵のレベルを自動設定
 * 4. 敵が仲間になるとき、そのレベルをアクターに適用（プラグインコマンド不要）
 * 5. プラグインコマンドで敵のレベルを変更可能
 * 6. 新しいプラグインコマンド `AddActorWithLevel` を使用して、指定したレベルでアクターを仲間にできる
 *
 * @command SetEnemyLevel
 * @text 敵のレベルを変更
 * @desc 指定した敵のレベルを変更する
 *
 * @arg enemyId
 * @text 敵ID
 * @type enemy
 * @desc レベルを変更する敵のID
 *
 * @arg level
 * @text レベル
 * @type number
 * @min 1
 * @desc 設定するレベル
 *
 * @command AddActorWithLevel
 * @text 指定したレベルでアクターを加入
 * @desc 指定したレベルでアクターを仲間にする
 *
 * @arg actorId
 * @text アクターID
 * @type actor
 * @desc 加入させるアクターのID
 *
 * @arg level
 * @text レベル
 * @type number
 * @min 1
 * @desc 設定するレベル
 *
 */
(() => {
    const pluginName = "EnemyLevelSystem";

    // ゲーム開始時にレベル情報を初期化
    const _Game_System_initialize = Game_System.prototype.initialize;
    Game_System.prototype.initialize = function() {
        _Game_System_initialize.call(this);
        this._enemyLevels = {};
    };

    // 敵のレベルを変更
    PluginManager.registerCommand(pluginName, "SetEnemyLevel", args => {
        const enemyId = Number(args.enemyId);
        const level = Number(args.level);
        const enemy = $gameTroop.members().find(e => e.enemyId() === enemyId);
        if (enemy) {
            enemy._level = level;
            updateEnemyStats(enemy);
        }
    });

    // 指定したレベルでアクターを加入
    PluginManager.registerCommand(pluginName, "AddActorWithLevel", args => {
        const actorId = Number(args.actorId);
        const level = Number(args.level);
        if (!$gameParty.members().includes($gameActors.actor(actorId))) {
            $gameParty.addActor(actorId);
        }
        const actor = $gameActors.actor(actorId);
        if (actor) {
            actor.changeLevel(level, false);
        }
    });

    // マップのメモ欄から敵のレベルを設定
    const _Game_Troop_setup = Game_Troop.prototype.setup;
    Game_Troop.prototype.setup = function(troopId) {
        _Game_Troop_setup.call(this, troopId);
        if ($dataMap && $dataMap.meta && $dataMap.meta["EnemyLevel"]) {
            const [minLevel, maxLevel] = $dataMap.meta["EnemyLevel"].split("-").map(Number);
            $gameSystem._enemyLevels = {};
            this.members().forEach((enemy, index) => {
                enemy._level = Math.floor(Math.random() * (maxLevel - minLevel + 1)) + minLevel;
                $gameSystem._enemyLevels[index] = enemy._level;
                updateEnemyStats(enemy);
            });
        }
    };

    // ステータス更新
    function updateEnemyStats(enemy) {
        const meta = enemy.enemy().meta;
        const classId = Number(meta.ClassId);
        if (!classId || !$dataClasses[classId]) return;

        enemy._level = enemy._level || 1;
        const classData = $dataClasses[classId];
        const growth = classData.params.map(p => p[enemy._level] || 0);

        for (let i = 0; i < 8; i++) {
            enemy.addParam(i, growth[i] - enemy.param(i));
        }
        
        // 経験値をレベルに応じて計算（元の経験値 × レベル）
        enemy._baseExp = enemy.enemy().exp;
        enemy._calculatedExp = enemy._baseExp * enemy._level;
        
        enemy.refresh();
    }

    // 獲得経験値を固定値に変更（毎回掛け算しない）
    Game_Enemy.prototype.exp = function() {
        return this._calculatedExp || this.enemy().exp;
    };

    // 獲得金額を10%増加
    const _Game_Enemy_gold = Game_Enemy.prototype.gold;
    Game_Enemy.prototype.gold = function() {
        return Math.floor(_Game_Enemy_gold.call(this) * 1.1);
    };

    // 敵が仲間になった際にレベルを引き継ぐ
    const _Game_Interpreter_command129 = Game_Interpreter.prototype.command129;
    Game_Interpreter.prototype.command129 = function(params) {
        _Game_Interpreter_command129.call(this, params);
        const actorId = params[0];
        const actor = $gameActors.actor(actorId);
        if (actor) {
            let assignedLevel = 1;
            for (const index in $gameSystem._enemyLevels) {
                assignedLevel = $gameSystem._enemyLevels[index];
                break;
            }
            actor.changeLevel(assignedLevel, false);
        }
        return true;
    };

    // 敵の名前に「Lv(レベル)」を追加
    const _Game_Enemy_name = Game_Enemy.prototype.name;
    Game_Enemy.prototype.name = function() {
        const originalName = _Game_Enemy_name.call(this);
        return `${originalName} Lv${this._level || 1}`;
    };
})();
