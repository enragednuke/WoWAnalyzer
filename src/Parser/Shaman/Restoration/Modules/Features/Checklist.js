import React from 'react';

import SPELLS from 'common/SPELLS';
import ITEMS from 'common/ITEMS';

import SpellLink from 'common/SpellLink';
import SpellIcon from 'common/SpellIcon';
import Wrapper from 'common/Wrapper';

import CoreChecklist, { Rule, Requirement, GenericCastEfficiencyRequirement } from 'Parser/Core/Modules/Features/Checklist';
import CastEfficiency from 'Parser/Core/Modules/CastEfficiency';
import Combatants from 'Parser/Core/Modules/Combatants';
import ManaValues from 'Parser/Core/Modules/ManaValues';
import Velens from 'Parser/Core/Modules/Items/Velens';
import LegendaryUpgradeChecker from 'Parser/Core/Modules/Items/LegendaryUpgradeChecker';
import LegendaryCountChecker from 'Parser/Core/Modules/Items/LegendaryCountChecker';
import PrePotion from 'Parser/Core/Modules/Items/PrePotion';

import MasteryEffectiveness from './MasteryEffectiveness';
import AlwaysBeCasting from './AlwaysBeCasting';
import TidalWaves from './TidalWaves';
import GiftOfTheQueen from '../Spells/GiftOfTheQueen';
import ChainHeal from '../Spells/ChainHeal';
import HealingRain from '../Spells/HealingRain';

class Checklist extends CoreChecklist {
  static dependencies = {
    castEfficiency: CastEfficiency,
    combatants: Combatants,
    masteryEffectiveness: MasteryEffectiveness,
    alwaysBeCasting: AlwaysBeCasting,
    manaValues: ManaValues,
    velens: Velens,
    legendaryUpgradeChecker: LegendaryUpgradeChecker,
    legendaryCountChecker: LegendaryCountChecker,
    prePotion: PrePotion,
    tidalWaves: TidalWaves,
    giftOfTheQueen: GiftOfTheQueen,
    chainHeal: ChainHeal,
    healingRain: HealingRain,
  };

  rules = [
    new Rule({
      name: 'Use core efficient spells on cooldown',
      description: <Wrapper>this</Wrapper>,
      requirements: () => {
        const combatant = this.combatants.selected;
        return [
          new GenericCastEfficiencyRequirement({
            spell: SPELLS.RIPTIDE,
          }),
          new GenericCastEfficiencyRequirement({
            spell: SPELLS.HEALING_RAIN_CAST,
          }),
          new GenericCastEfficiencyRequirement({
            spell: SPELLS.HEALING_STREAM_TOTEM_CAST,
          }),
          new GenericCastEfficiencyRequirement({
            spell: SPELLS.CLOUDBURST_TOTEM_TALENT,
            when: combatant.hasTalent(SPELLS.CLOUDBURST_TOTEM_TALENT.id),
          }),
          new GenericCastEfficiencyRequirement({
            spell: SPELLS.GIFT_OF_THE_QUEEN,
          }),
        ];
      },
    }),
    new Rule({
      name: 'Use cooldowns effectively',
      description: <Wrapper>this</Wrapper>,
      requirements: () => {
        const combatant = this.combatants.selected;
        return [
          new GenericCastEfficiencyRequirement({
            spell: SPELLS.HEALING_TIDE_TOTEM_CAST,
          }),
          new GenericCastEfficiencyRequirement({
            spell: SPELLS.SPIRIT_LINK_TOTEM,
          }),
          
          new GenericCastEfficiencyRequirement({
            spell: SPELLS.ARCANE_TORRENT_MANA,
            when: !!this.castEfficiency.getCastEfficiencyForSpellId(SPELLS.ARCANE_TORRENT_MANA.id),
          }),
          new GenericCastEfficiencyRequirement({
            spell: SPELLS.VELENS_FUTURE_SIGHT_BUFF,
            when: combatant.hasTrinket(ITEMS.VELENS_FUTURE_SIGHT.id),
          }),
        ];
      },
    }),
    new Rule({
      name: 'Maximize Tidal Wave Usage',
      description: "This",
      requirements: () => {
        return [
          new Requirement({
            name: <Wrapper>
              <SpellIcon id={SPELLS.TIDAL_WAVES_BUFF.id} noLink style={{ height: '1.2em', marginTop: '-0.1em' }} /> Unused Tidal Waves
            </Wrapper>,
            check: () => this.tidalWaves.suggestionThresholds,
          }),
        ];
      },

      //Healing Wave/Healing SUrge used without Tidal Wave
    }),
    new Rule({
      name: 'Maximize Ability Synergy',
      description: <Wrapper>this</Wrapper>,
      requirements: () => {
        return [
          new Requirement({
            name: <Wrapper>
              <SpellLink id={SPELLS.GIFT_OF_THE_QUEEN.id} icon /> Fed to <SpellLink id={SPELLS.CLOUDBURST_TOTEM_TALENT.id} icon />
            </Wrapper>,
            check: () => this.giftOfTheQueen.CBTTotemFeedingSuggestionThreshold,
          }),
        ];
      },
    }),
    new Rule({
      name: 'Target AOE spells for maximum effectiveness',
      description: <Wrapper>this</Wrapper>,
      requirements: () => {
        return [
          new Requirement({
            name: <Wrapper>
              <SpellLink id={SPELLS.GIFT_OF_THE_QUEEN.id} icon /> Target Efficiency
            </Wrapper>,
            check: () => this.giftOfTheQueen.giftOfQueenTargetEfficiencySuggestionThreshold,
          }),
          new Requirement({
            name: <Wrapper>
              Average <SpellLink id={SPELLS.CHAIN_HEAL.id} icon/> Targets
            </Wrapper>,
            check: () => this.chainHeal.suggestionThreshold,
          }),
          new Requirement({
            name: <Wrapper>
              Average <SpellLink id={SPELLS.HEALING_RAIN_HEAL.id} icon/> Targets
            </Wrapper>,
            check: () => this.healingRain.suggestionThreshold,
          }),
        ];
      },
    }),
    new Rule({
      name: 'Try to avoid being inactive for a large portion of the fight',
      description: 'While it\'s suboptimal to always be casting as a healer you should still try to always be doing something during the entire fight and high downtime is inexcusable. You can reduce your downtime by reducing the delay between casting spells, anticipating movement, moving during the GCD, and when you\'re not healing try to contribute some damage.',
      requirements: () => {
        return [
          new Requirement({
            name: 'Non healing time',
            check: () => this.alwaysBeCasting.nonHealingTimeSuggestionThresholds,
          }),
          new Requirement({
            name: 'Downtime',
            check: () => this.alwaysBeCasting.downtimeSuggestionThresholds,
          }),
        ];
      },
    }),
    // new Rule({
    //   name: 'Pick the right tools for the fight',
    //   description: <Wrapper>this</Wrapper>,
    //   requirements: () => {
    //     const combatant = this.combatants.selected;
    //     return [
    //     ];
    //   },
    // }),
    new Rule({
      name: 'Use all of your mana effectively',
      description: 'If you have a large amount of mana left at the end of the fight that\'s mana you could have turned into healing. Try to use all your mana during a fight. A good rule of thumb is to try to match your mana level with the boss\'s health.',
      requirements: () => {
        return [
          new Requirement({
            name: 'Mana left',
            check: () => this.manaValues.suggestionThresholds,
          }),
        ];
      },
    }),
    new Rule({
      name: 'Be well prepared',
      description: 'Being well prepared with potions, enchants and legendaries is an easy way to improve your performance.',
      requirements: () => {
        return [
          new Requirement({
            name: 'All legendaries upgraded to max item level',
            check: () => ({
              actual: this.legendaryUpgradeChecker.upgradedLegendaries.length,
              isLessThan: this.legendaryCountChecker.max,
              style: 'number',
            }),
          }),
          new Requirement({
            name: 'Used max possible legendaries',
            check: () => ({
              actual: this.legendaryCountChecker.equipped,
              isLessThan: this.legendaryCountChecker.max,
              style: 'number',
            }),
          }),
          new Requirement({
            name: 'Used a pre-potion',
            check: () => this.prePotion.prePotionSuggestionThresholds,
          }),
          new Requirement({
            name: 'Used a second potion',
            check: () => this.prePotion.secondPotionSuggestionThresholds,
          }),
        ];
      },
    }),
  ];
}

export default Checklist;
