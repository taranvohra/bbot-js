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
    key: 'joinGameTypes',
    description: '',
    aliases: ['j', 'join'],
    solo: 0,
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
    aliases: ['last', 'lastt', 'lasttt'],
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
];

export { commands, handlers, emitters };
