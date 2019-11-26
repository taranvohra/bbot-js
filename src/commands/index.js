import * as genericHandlers from './genericHandlers';
import * as ut99Handlers from './ut99Handlers';
import * as pugHandlers from './pugHandlers';

const emitters = {
  pugEventEmitter: pugHandlers.pugEventEmitter,
};

const handlers = {
  ...genericHandlers,
  ...ut99Handlers,
  ...pugHandlers,
};

const commands = [
  {
    key: 'registerServer',
    description: '',
    aliases: ['register'],
    solo: 1,
  },
  {
    key: 'registerQueryChannel',
    description: '',
    aliases: ['setquerychannel'],
    solo: 1,
  },
  {
    key: 'registerPugChannel',
    description: '',
    aliases: ['setpugchannel'],
    solo: 1,
  },
  {
    key: 'addQueryServer',
    description: '',
    aliases: ['addqueryserver'],
    solo: 0,
  },
  {
    key: 'delQueryServer',
    description: '',
    aliases: ['delqueryserver'],
    solo: 0,
  },
  {
    key: 'queryUT99Server',
    description: '',
    aliases: ['q', 'query'],
    solo: 0,
  },
  {
    key: 'servers',
    description: '',
    aliases: ['servers'],
    solo: 1,
  },
  {
    key: 'addGameType',
    description: '',
    aliases: ['addgametype', 'agm'],
    solo: 0,
  },
  {
    key: 'delGameType',
    description: '',
    aliases: ['delgametype', 'dgm'],
    solo: 0,
  },
  {
    key: 'listGameTypes',
    description: '',
    aliases: ['list', 'ls'],
    solo: 2,
  },
  {
    key: 'listAllCurrentGameTypes',
    description: '',
    aliases: ['lsa'],
    solo: 1,
  },
  {
    key: 'decideDefaultOrJoin',
    description: '',
    aliases: ['j', 'join'],
    solo: 2,
  },
  {
    key: 'leaveGameTypes',
    description: '',
    aliases: ['l', 'leave'],
    solo: 0,
  },
  {
    key: 'leaveAllGameTypes',
    description: '',
    aliases: ['lva'],
    solo: 1,
  },
  {
    key: 'addCaptain',
    description: '',
    aliases: ['captain', 'capt'],
    solo: 1,
  },
  {
    key: 'decidePromoteOrPick',
    description: '',
    aliases: ['p', 'pick', 'promote'],
    solo: 2,
  },
  {
    key: 'pugPicking',
    description: '',
    aliases: ['picking'],
    solo: 1,
  },
  {
    key: 'checkLastPugs',
    description: '',
    aliases: ['last'],
    solo: 2,
    regex(action) {
      return RegExp(`^${action}(\d|t)*`, 'g');
    },
  },
  {
    key: 'resetPug',
    description: '',
    aliases: ['reset'],
    solo: 0,
  },
  {
    key: 'checkStats',
    description: '',
    aliases: ['stats'],
    solo: 2,
  },
  {
    key: 'addOrRemoveTag',
    description: '',
    aliases: ['tag'],
    solo: 2,
  },
  {
    key: 'adminAddPlayer',
    description: '',
    aliases: ['adminadd'],
    solo: 0,
  },
  {
    key: 'adminRemovePlayer',
    description: '',
    aliases: ['adminremove'],
    solo: 0,
  },
  {
    key: 'adminPickPlayer',
    description: '',
    aliases: ['adminpick'],
    solo: 0,
  },
  {
    key: 'blockPlayer',
    description: '',
    aliases: ['block'],
    solo: 0,
  },
  {
    key: 'unblockPlayer',
    description: '',
    aliases: ['unblock'],
    solo: 0,
  },
  {
    key: 'showBlockedUsers',
    description: '',
    aliases: ['showblocked'],
    solo: 1,
  },
  {
    key: 'setDefaultJoin',
    description: '',
    aliases: ['defaultjoin'],
    solo: 0,
  },
  {
    key: 'declareWinner',
    description: '',
    aliases: ['winner'],
    solo: 0,
  },
  {
    key: 'getTop10',
    description: '',
    aliases: ['top10'],
    solo: 0,
  },
  {
    key: 'setPrefix',
    descriptipn: '',
    aliases: ['setprefix'],
    solo: 0,
  },
  {
    key: 'getBottom10',
    description: '',
    aliases: ['bottom10'],
    solo: 0,
  },
  {
    key: 'getTopXY',
    description: '',
    aliases: ['top'],
    solo: 0,
    regex(action) {
      return RegExp(`^${action}\\d*\\d-\\d{2,}`, 'g');
    },
  },
];

export { commands, handlers, emitters };
