// Ensure Blockly core and all custom blocks are registered for any consumer of this package.
// This avoids "unsupported elements" errors when loading XML from UI stores that only import `load`.
import './blockly';

export {
    load,
    save,
    scrollWorkspace,
    updateWorkspaceName,
    runGroupedEvents,
    runIrreversibleEvents,
} from './utils/index';

export { apollo_bot_list } from './dbot';
