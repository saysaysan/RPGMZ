/*:
 * @target MZ
 * @plugindesc 戦闘開始時に敵のHPを全回復するプラグイン
 * @author Your Name
 *
 * @help
 * このプラグインは戦闘開始時に敵のHPを全回復します。
 * プラグインを有効にすると、自動的に戦闘開始時に
 * すべての敵キャラクターのHPが最大値にリセットされます。
 */

(function() {
    // 戦闘開始時に呼ばれる処理
    const _BattleManager_startBattle = BattleManager.startBattle;
    BattleManager.startBattle = function() {
      _BattleManager_startBattle.call(this);
      this.resetEnemiesHP();
    };
  
    // 敵のHPを全回復する関数
    BattleManager.resetEnemiesHP = function() {
      $gameTroop.members().forEach(function(enemy) {
        enemy.setHp(enemy.mhp);  // 敵のHPを最大値に設定
      });
    };
  })();
  