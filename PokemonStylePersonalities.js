/*:
 * @target MZ
 * @plugindesc アクターに性格に基づいたステータスの増減を適用するプラグイン
 * @help アクターが仲間になると性格に基づいてステータスが増減します。
 *
 * @param personalities
 * @text 性格設定
 * @type struct<Personality>[]
 * @default []
 */

/*~struct~Personality:
 * @param name
 * @text 性格名
 * @type string
 *
 * @param statChanges
 * @text ステータス変更
 * @type struct<StatChange>[]
 * @default []
 */

/*~struct~StatChange:
 * @param stat
 * @text ステータス
 * @type select
 * @option 攻撃力
 * @value attack
 * @option 防御力
 * @value defense
 * @option 魔法力
 * @value magic
 * @option 魔法防御
 * @value magicDefense
 * @option 速さ
 * @value agility
 * @option 運
 * @value luck
 *
 * @param rate
 * @text 増減率
 * @type number
 * @decimals 2
 * @min 0.1
 * @max 2
 * @desc 1より大きい値で増加、1より小さい値で減少（例: 1.2は20%増、0.8は20%減）
 */

(() => {
    const pluginName = "PokemonStylePersonalities";
    const parameters = PluginManager.parameters(pluginName);

    const personalities = JSON.parse(parameters['personalities'] || '[]').map(p => {
        try {
            const parsedPersonality = JSON.parse(p); // 性格オブジェクトをパース
            const statChanges = JSON.parse(parsedPersonality.statChanges || '[]'); // ステータス変更をパース
            return {
                name: parsedPersonality.name || "不明な性格", // 性格名を取得
                statChanges: statChanges.map(sc => JSON.parse(sc)) // ステータス変更を個別にパース
            };
        } catch (error) {
            console.error(`Error parsing personality data: ${error}`);
            return null;
        }
    }).filter(p => p !== null); // 有効な性格のみ残す

    const _Game_Actor_setup = Game_Actor.prototype.setup;
    Game_Actor.prototype.setup = function(actorId) {
        _Game_Actor_setup.call(this, actorId);
        const personality = personalities[Math.floor(Math.random() * personalities.length)];
        if (personality && Array.isArray(personality.statChanges)) {
            console.log(`Applying personality: ${personality.name}`);
            this.applyPersonality(personality);
        } else {
            console.warn("Personality data is missing or corrupt.");
        }
    };

    // 性格に基づいたステータス変化を適用し、二つ名を変更
    Game_Actor.prototype.applyPersonality = function(personality) {
        this._nickname = personality.name; // 二つ名に性格名を設定
        if (personality.statChanges) {
            personality.statChanges.forEach(change => {
                console.log(`Changing stat: ${change.stat} with rate: ${change.rate}`);
                if (change.stat && change.rate) {
                    this.addStatChange(change.stat, parseFloat(change.rate));
                } else {
                    console.error("Invalid stat change data", change);
                }
            });
        }
    };

    // ステータスの変更を適用する
    Game_Actor.prototype.addStatChange = function(stat, rate) {
        const paramId = this.getParamId(stat);
        if (paramId !== undefined) {
            const baseValue = this.paramBase(paramId); // 元のステータス値を取得
            const newValue = Math.round(baseValue * rate); // 変動率を適用した新しい値（四捨五入）
            this._paramPlus[paramId] += (newValue - baseValue); // 差分を加算
            this.refresh(); // ステータスを更新
            console.log(`Stat: ${stat} has been updated. New value: ${newValue}`);
        } else {
            console.warn(`Invalid stat: ${stat}`); // 無効なステータスの場合
        }
    };

    // ステータス名をIDに変換する
    Game_Actor.prototype.getParamId = function(stat) {
        const paramIdMap = {
            'attack': 2,
            'defense': 3,
            'magic': 4,
            'magicDefense': 5,
            'agility': 6,
            'luck': 7
        };
        return paramIdMap[stat];
    };
})();
