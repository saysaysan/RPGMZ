/*:
 * @target MZ
 * @plugindesc 敵キャラごとに異なる4つのわざを設定するプラグイン
 * @author 
 * 
 * @command SetEnemySkills
 * @text 敵のスキル設定
 * @desc 指定した敵キャラに4つのスキルを設定する
 * 
 * @arg enemyId
 * @type number
 * @text 敵キャラID
 * @desc スキルを設定する敵キャラのID
 * 
 * @arg skill1
 * @type skill
 * @text スキル1
 * @desc 1つ目のスキル
 * 
 * @arg skill2
 * @type skill
 * @text スキル2
 * @desc 2つ目のスキル
 * 
 * @arg skill3
 * @type skill
 * @text スキル3
 * @desc 3つ目のスキル
 * 
 * @arg skill4
 * @type skill
 * @text スキル4
 * @desc 4つ目のスキル
 * 
 * @help
 * このプラグインを使用すると、戦闘前に特定の敵キャラに対して
 * 4つのスキルを設定できます。
 * 
 * 【使用方法】
 * プラグインコマンドで SetEnemySkills を呼び出し、
 * 対象の敵キャラIDとスキルIDを指定してください。
 * 
 * 戦闘開始時に設定されたスキルのみが有効になります。
 */

(() => {
    const pluginName = "EnemyUniqueSkills";
    let enemySkillSets = {};

    PluginManager.registerCommand(pluginName, "SetEnemySkills", args => {
        const enemyId = Number(args.enemyId);
        const skillIds = [
            Number(args.skill1),
            Number(args.skill2),
            Number(args.skill3),
            Number(args.skill4)
        ].filter(id => id > 0); // 無効なスキルを排除
        enemySkillSets[enemyId] = skillIds;
    });

    const _Game_Enemy_setup = Game_Enemy.prototype.setup;
    Game_Enemy.prototype.setup = function(enemyId, x, y) {
        _Game_Enemy_setup.call(this, enemyId, x, y);
        this._uniqueSkills = enemySkillSets[enemyId] || [];
    };

    Game_Enemy.prototype.uniqueSkills = function() {
        return this._uniqueSkills.length > 0 ? this._uniqueSkills : this.enemy().actions.map(action => action.skillId);
    };

    const _Game_Enemy_makeActions = Game_Enemy.prototype.makeActions;
    Game_Enemy.prototype.makeActions = function() {
        _Game_Enemy_makeActions.call(this);
        this._actions.forEach(action => {
            const skillPool = this.uniqueSkills();
            if (skillPool.length > 0) {
                const randomSkill = skillPool[Math.floor(Math.random() * skillPool.length)];
                action.setSkill(randomSkill);
            } else {
                action.setAttack(); // スキルがない場合、通常攻撃を設定
            }
        });
    };
})();