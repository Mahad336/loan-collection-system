import { Module } from '@nestjs/common';
import { RulesService } from './rules.service';
import { RuleEngineService } from './rule-engine.service';

@Module({
  providers: [RulesService, RuleEngineService],
  exports: [RulesService, RuleEngineService],
})
export class RulesModule {}
