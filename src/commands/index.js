import * as genericHandlers from './genericHandlers';
import * as ut99Handlers from './ut99Handlers';

const handlers = {
  ...genericHandlers,
  ...ut99Handlers,
};

const commands = [
  {
    key: 'registerServer',
    description: '',
    aliases: ['register'],
  },
  {
    key: 'setQueryChannel',
    description: '',
    aliases: ['setquerychannel'],
  },
  {
    key: 'setPugChannel',
    description: '',
    aliases: ['setpugchannel'],
  },
  {
    key: 'addQueryServer',
    description: '',
    aliases: ['addqueryserver'],
  },
  {
    key: 'delQueryServer',
    description: '',
    aliases: ['delqueryserver'],
  },
  {
    key: 'queryUT99Server',
    description: '',
    aliases: ['q', 'query'],
  },
  {
    key: 'servers',
    description: '',
    aliases: ['servers'],
  },
];

export { commands, handlers };
