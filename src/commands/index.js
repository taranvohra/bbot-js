import * as genericHandlers from './genericHandlers';
import * as ut99Handlers from './ut99Handlers';
import * as pugHandlers from './pugHandlers';

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
    solo: true,
  },
  {
    key: 'registerQueryChannel',
    description: '',
    aliases: ['setquerychannel'],
    solo: true,
  },
  {
    key: 'registerPugChannel',
    description: '',
    aliases: ['setpugchannel'],
    solo: true,
  },
  {
    key: 'addQueryServer',
    description: '',
    aliases: ['addqueryserver'],
    solo: false,
  },
  {
    key: 'delQueryServer',
    description: '',
    aliases: ['delqueryserver'],
    solo: false,
  },
  {
    key: 'queryUT99Server',
    description: '',
    aliases: ['q', 'query'],
    solo: false,
  },
  {
    key: 'servers',
    description: '',
    aliases: ['servers'],
    solo: true,
  },
  {
    key: 'addGameType',
    description: '',
    aliases: ['addgametype', 'agm'],
    solo: false,
  },
  {
    key: 'delGameType',
    description: '',
    aliases: ['delgametype', 'dgm'],
    solo: false,
  },
  {
    key: 'listGameTypes',
    description: '',
    aliases: ['list', 'ls'],
    solo: true,
  },
  {
    key: 'listAllCurrentGameTypes',
    description: '',
    aliases: ['lsa'],
    solo: true,
  },
  {
    key: 'joinGameTypes',
    description: '',
    aliases: ['j', 'join'],
    solo: false,
  },
  {
    key: 'leaveGameTypes',
    description: '',
    aliases: ['l', 'leave'],
    solo: false,
  },
  {
    key: 'leaveAllGameTypes',
    description: '',
    aliases: ['lva'],
    solo: true,
  },
  {
    key: 'addCaptain',
    description: '',
    aliases: ['captain', 'capt'],
    solo: true,
  },
];

export { commands, handlers };
